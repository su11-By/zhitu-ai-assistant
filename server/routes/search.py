import re
import time
import socket
import html as html_module
from urllib.parse import quote, unquote, urlparse
from flask import Blueprint, request, jsonify
from bs4 import BeautifulSoup
import requests
from lib.limiter import limiter

search_bp = Blueprint('search', __name__)

SEARCH_TIMEOUT = 15
FETCH_TIMEOUT = 10
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

HEADERS = {
    'User-Agent': UA,
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'zh-CN,zh;q=0.9'
}

# 私网地址正则
PRIVATE_PATTERNS = [
    re.compile(r'^127\.'),
    re.compile(r'^10\.'),
    re.compile(r'^172\.(1[6-9]|2\d|3[01])\.'),
    re.compile(r'^192\.168\.'),
    re.compile(r'^169\.254\.'),
    re.compile(r'^0\.'),
    re.compile(r'^localhost$', re.I),
    re.compile(r'^::1$'),
    re.compile(r'^fc'),
    re.compile(r'^fd'),
    re.compile(r'^fe80:'),
]


def _strip_html(s):
    """去除 HTML 标签并转义特殊字符"""
    cleaned = re.sub(r'<[^>]+>', '', re.sub(r'\s+', ' ', str(s))).strip()
    return html_module.escape(cleaned)


def _is_private_host(hostname):
    """检查主机名是否为私网地址"""
    if not hostname:
        return False
    if any(p.match(hostname) for p in PRIVATE_PATTERNS):
        return True
    # DNS 解析后检查
    try:
        resolved_ips = socket.getaddrinfo(hostname, None, socket.AF_UNSPEC)
        for family, _, _, _, sockaddr in resolved_ips:
            ip = sockaddr[0]
            if any(p.match(ip) for p in PRIVATE_PATTERNS):
                return True
    except socket.gaierror:
        pass
    return False


def _safe_get(url, headers, timeout, max_redirects=5):
    """安全的 HTTP GET，手动处理重定向并验证每一跳"""
    visited = set()
    current_url = url

    for _ in range(max_redirects):
        if current_url in visited:
            return None  # 循环重定向
        visited.add(current_url)

        parsed = urlparse(current_url)
        hostname = parsed.hostname or ''

        # 每次重定向都检查私网地址
        if _is_private_host(hostname):
            return None

        resp = requests.get(
            current_url,
            headers=headers,
            timeout=timeout,
            allow_redirects=False
        )

        # 如果是重定向，验证下一跳
        if resp.is_redirect and resp.headers.get('Location'):
            next_url = resp.headers['Location']
            # 处理相对路径
            if next_url.startswith('/'):
                next_url = f'{parsed.scheme}://{parsed.netloc}{next_url}'
            elif not next_url.startswith('http'):
                next_url = f'{parsed.scheme}://{parsed.netloc}/{next_url}'
            current_url = next_url
            continue

        return resp

    return None  # 超过最大重定向次数


def _resolve_url(raw):
    """解析 URL"""
    if not raw:
        return ''
    decoded = raw.strip()
    decoded = decoded.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace('&#39;', "'")
    if decoded.startswith('http://') or decoded.startswith('https://'):
        return decoded
    if decoded.startswith('/link?') or decoded.startswith('/web?'):
        return 'https://www.sogou.com' + decoded
    return ''


def _parse_sogou_results(html, max_results=5):
    """解析搜狗搜索结果"""
    results = []
    soup = BeautifulSoup(html, 'lxml')

    # 第一步：尝试解析 JSON script 标签
    for script in soup.find_all('script', type='application/json'):
        if len(results) >= max_results:
            break
        try:
            import json
            data = json.loads(script.string or '{}')
            if not data.get('url') or not data.get('title'):
                continue
            title = _strip_html(data['title'])
            if len(title) < 3:
                continue
            snippet = re.sub(r'\s+', ' ', data.get('content', '')).strip()
            url = _resolve_url(data['url'])
            if not url:
                continue
            results.append({'title': title, 'snippet': snippet[:500], 'url': url})
        except Exception:
            continue

    # 第二步：尝试 .vrwrap 元素
    if len(results) < max_results:
        for wrap in soup.select('.vrwrap'):
            if len(results) >= max_results:
                break
            h3 = wrap.find('h3')
            if not h3:
                continue
            link = h3.find('a', href=True)
            if not link:
                continue
            raw_href = link.get('href', '')
            url = _resolve_url(raw_href)
            if not url:
                continue
            if 'sogou.com' in url and 'sogou.com/link' not in url:
                continue
            title = re.sub(r'\s+', ' ', link.get_text()).strip()
            if len(title) < 3:
                continue
            snippet = ''
            snippet_el = wrap.select_one('.star-wiki, .space-txt, .str_info, .abstract, .text-layout .fz-mid')
            if snippet_el:
                snippet = re.sub(r'\s+', ' ', snippet_el.get_text()).strip()
            if not snippet or len(snippet) < 15:
                text_layout = wrap.select_one('.text-layout')
                full_text = text_layout.get_text() if text_layout else wrap.get_text()
                snippet = re.sub(r'\s+', ' ', full_text).replace(title, '').strip()
            results.append({'title': title, 'snippet': snippet[:500], 'url': url})

    # 第三步：fallback h3 a[href]
    if not results:
        for link in soup.select('h3 a[href]'):
            if len(results) >= max_results:
                break
            url = _resolve_url(link.get('href', ''))
            if not url:
                continue
            title = re.sub(r'\s+', ' ', link.get_text()).strip()
            if len(title) < 5:
                continue
            parent = link.find_parent(['div', '.vrwrap', '.rb', '.result'])
            parent_text = re.sub(r'\s+', ' ', parent.get_text()).replace(title, '').strip() if parent else ''
            results.append({'title': title, 'snippet': parent_text[:500], 'url': url})

    return results


def _extract_content(html):
    """从 HTML 中提取正文内容"""
    soup = BeautifulSoup(html, 'lxml')

    title = ''
    title_tag = soup.find('title')
    if title_tag:
        title = title_tag.get_text().strip()
    if not title:
        h1 = soup.find('h1')
        if h1:
            title = h1.get_text().strip()
    if not title:
        og = soup.find('meta', property='og:title')
        if og:
            title = og.get('content', '')

    # 移除无关元素
    for tag in soup.select('script, style, nav, header, footer, .sidebar, .nav, .footer, .header, .ad, [role="navigation"], noscript'):
        tag.decompose()

    main = soup.select_one('main, article, .content, .article, #content, [role="main"]')
    source = main if main else soup.find('body')
    text = re.sub(r'\s+', ' ', source.get_text()).strip() if source else ''

    # 去重行
    lines = re.split(r'[.。！？\n]', text)
    seen = set()
    deduped = []
    for line in lines:
        key = line.strip()[:60]
        if not key or key in seen:
            continue
        seen.add(key)
        deduped.append(line)
    return {'title': html_module.escape(title), 'text': html_module.escape('。'.join(deduped))}


@search_bp.route('/api/search/web', methods=['GET'])
@limiter.limit('30/minute')
def web_search():
    query_str = (request.args.get('query') or '').strip()
    if not query_str:
        return jsonify({'error': 'Missing query parameter'}), 400
    if len(query_str) > 200:
        return jsonify({'error': 'Query too long'}), 400

    try:
        resp = requests.get(
            f'https://www.sogou.com/web?query={quote(query_str)}',
            headers=HEADERS,
            timeout=SEARCH_TIMEOUT
        )

        if resp.status_code != 200:
            return jsonify({'error': f'上游搜索返回状态 {resp.status_code}'}), 502

        html = resp.text
        if not html or len(html) < 500:
            return jsonify({'error': '搜索返回内容为空'}), 502

        if '请输入验证码' in html or '异常流量' in html:
            return jsonify({'error': '搜索引擎需要验证，请稍后重试'}), 503

        results = _parse_sogou_results(html, 5)
        if not results:
            return jsonify({'results': [{'title': query_str, 'snippet': '请基于你的知识直接回答这个问题。', 'url': ''}]})

        return jsonify({'results': results})
    except requests.Timeout:
        return jsonify({'error': '搜索请求超时'}), 504
    except Exception as e:
        print(f'[Search Error] {e}')
        return jsonify({'error': '搜索请求失败'}), 500


@search_bp.route('/api/fetch/<path:encoded_url>', methods=['GET'])
@limiter.limit('60/minute')
def fetch_url(encoded_url):
    if not encoded_url:
        return jsonify({'error': 'Missing URL'}), 400

    try:
        target_url = unquote(encoded_url)
        parsed = urlparse(target_url)
        if parsed.scheme not in ('http', 'https'):
            return jsonify({'error': 'Only http/https URLs allowed'}), 400

        # 初始 SSRF 检查
        hostname = parsed.hostname or ''
        if _is_private_host(hostname):
            return jsonify({'error': 'Access to private networks is not allowed'}), 403
    except Exception:
        return jsonify({'error': 'Invalid URL'}), 400

    try:
        # 使用安全的 GET 函数，手动处理重定向并验证每一跳
        resp = _safe_get(target_url, HEADERS, FETCH_TIMEOUT)

        if resp is None:
            return jsonify({'error': 'Access to private networks is not allowed'}), 403

        if resp.status_code != 200:
            return jsonify({'error': f'上游返回状态 {resp.status_code}'}), 502

        content_type = resp.headers.get('content-type', '')
        if 'text/html' not in content_type and 'text/plain' not in content_type:
            return jsonify({'error': 'Unsupported content type'}), 415

        extracted = _extract_content(resp.text)
        return jsonify({
            'title': extracted['title'],
            'text': extracted['text'][:3000],
            'url': target_url
        })
    except requests.Timeout:
        return jsonify({'error': '请求超时'}), 504
    except Exception as e:
        print(f'[Fetch Error] {e}')
        return jsonify({'error': '抓取请求失败'}), 500
