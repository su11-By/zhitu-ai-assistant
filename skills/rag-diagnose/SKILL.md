---
name: rag-diagnose
description: "Diagnose RAG pipeline issues. Use when retrieval quality is poor, chunks look wrong, embeddings fail, or search returns irrelevant results. Triggers on: rag有问题, 检索不准, 搜索结果不对, 分块有问题, 嵌入失败, diagnose rag, debug retrieval."
user-invocable: true
---

# RAG Pipeline Diagnostics

Systematically diagnose issues in the Retrieval-Augmented Generation pipeline.

---

## Pipeline Overview (this project)

```
文件上传 → parseFile() → chunkDocument() → createEmbedding() → vectorStore.insert()
                                                                          ↓
用户提问 → createEmbedding(query) → vectorStore.search() → queryWithRAG()
                                                                          ↓
                              buildChatMessages() → streamChat() → 回答
```

Key files:
- `src/services/fileParser.js` — PDF/DOCX/TXT/MD parsing
- `src/services/chunker.js` — Text chunking strategy
- `src/services/embeddingService.js` — LM Studio embedding API
- `src/services/vectorStore.js` — Local vector storage & search
- `src/services/ragService.js` — RAG orchestration
- `src/stores/knowledge.js` — Upload & indexing workflow
- `src/stores/chat.js` — Chat + RAG integration

---

## The Job

1. Ask the user what symptom they're seeing
2. Diagnose layer by layer (parsing → chunking → embedding → retrieval → prompt assembly)
3. Identify the root cause
4. Propose a fix and implement if confirmed

---

## Diagnostic Checklist

Walk through these layers in order. Stop at the first layer that shows problems.

### Layer 1: File Parsing

**Check:** Is the raw text extracted correctly?

- Open browser console, upload a file, look for the parsed output
- Or check in IndexedDB (vectorStore uses it): the `documents` store should have `rawText`
- **Symptoms of bad parsing:**
  - Chinese characters garbled (wrong encoding in PDF parser)
  - Missing content (parser doesn't handle this file format well)
  - Extra whitespace/newlines (parser normalization too aggressive)
- **Common fixes:**
  - `pdfParser.js` — check encoding detection
  - `docxParser.js` — check XML parsing
  - `mdParser.js` — check frontmatter handling

### Layer 2: Chunking

**Check:** Are chunks well-formed?

- Read `src/services/chunker.js` to review the current strategy
- **Symptoms of bad chunking:**
  - Chunks too large → exceed embedding model's context window → embedding fails
  - Chunks too small → lack semantic meaning → poor retrieval
  - Chunks split mid-sentence → broken context → irrelevant results
  - All chunks same size regardless of content → paragraphs broken awkwardly
- **What to check in `chunker.js`:**
  - `chunkSize` — typically 500-1000 characters for Chinese text
  - `overlap` — typically 50-200 characters to preserve context across boundaries
  - Splitting strategy — should split on sentence/paragraph boundaries, not fixed length
- **Quick test:** Upload a known document, ask a question about content that spans two chunks. If it fails, overlap is insufficient.

### Layer 3: Embedding

**Check:** Is the embedding model working?

- **Symptoms:**
  - `embeddingService.js` throws errors
  - All chunks fail to index ("所有分块嵌入失败" error in `knowledge.js:107`)
  - Embeddings are all zeros or NaN
- **Diagnose:**
  - Is LM Studio running? Check `src/services/embeddingService.js` for the endpoint URL
  - Is the correct model loaded? (nomic-embed-text-v1.5 per `knowledge.js:107`)
  - Run in console: `fetch('http://localhost:1234/v1/embeddings', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({input: 'test', model: 'nomic-embed-text-v1.5'}) })` — should return a vector
  - Check embedding dimension matches what `cosineSimilarity.js` expects
- **Common fixes:**
  - Start LM Studio and load the embedding model
  - Check port number in `embeddingService.js`
  - Verify API endpoint path

### Layer 4: Vector Search

**Check:** Is retrieval returning relevant chunks?

- **Symptoms:**
  - Search returns 0 results even for content that exists
  - Search returns results but they're irrelevant to the query
  - Same results returned regardless of query
- **Diagnose:**
  - Check `vectorStore.search()` — what similarity threshold is used?
  - Check `cosineSimilarity.js` — is the implementation correct?
  - Are vectors normalized? Cosine similarity assumes normalized vectors for fair comparison
  - Check `topK` value in settings — too low misses relevant chunks; too high adds noise
- **Quick test:** In console, manually call `vectorStore.search()` with a query vector and check the returned scores. Scores below 0.5 are usually noise.
- **Common fixes:**
  - Add a minimum similarity threshold filter
  - Normalize vectors before storing/comparing
  - Increase `topK` if recall is low, decrease if precision is low

### Layer 5: Prompt Assembly

**Check:** Is the retrieved context being used correctly?

- Read `src/stores/chat.js` lines 180-226 (`streamAugmentedResponse`)
- **Symptoms:**
  - Retrieved content is there but model ignores it
  - Model cites sources that don't exist
  - Model says "no relevant information" when context clearly has the answer
- **Diagnose:**
  - Check the system prompt — is it too restrictive? ("严格基于下方参考内容")
  - Check context formatting — are source labels clear?
  - Check `contextWindow` setting — is the context being truncated?
  - Check `buildChatMessages()` in `contextManager.js` — is it cutting off the retrieved context to fit history?
- **Common fixes:**
  - Adjust system prompt to allow fallback when context is partially relevant
  - Place retrieved context at the beginning, before conversation history
  - Increase `contextWindow` or reduce history length
  - Truncate sources to `snippet` (first 300 chars per `ragService.js:24`) — check if this is cutting off the answer

---

## Diagnostic Flow

```
用户: "上传了文档但是AI回答不对"
  ↓
问: 回答是完全不相关，还是部分相关但缺少细节？
  → 完全不相关 → 检查 Layer 4 (检索) 和 Layer 5 (prompt)
  → 缺少细节   → 检查 Layer 2 (分块) 和 Layer 3 (嵌入)

用户: "上传文档时报错"
  ↓
问: 报错在哪一步？上传进度条到百分之几？
  → parsing (0-30%)   → Layer 1 (文件解析)
  → chunking (30%)    → Layer 2 (分块逻辑)
  → indexing (30-90%) → Layer 3 (嵌入模型)
```

---

## Quick Fixes for Common Problems

### "文档上传后搜索不到内容"
```
1. 检查 LM Studio 是否运行并加载了 nomic-embed-text-v1.5
2. 在浏览器控制台检查 IndexedDB 中是否有向量数据
3. 检查 embedding 是否成功（看 network 面板）
```

### "搜索结果不相关"
```
1. 降低 chunkSize，提高 overlap（在 chunker.js 中）
2. 添加相似度阈值过滤（在 vectorStore.search 中）
3. 检查 query 的 embedding 是否正常
```

### "PDF 中文乱码"
```
1. 检查 pdfParser.js 的文本解码方式
2. PDF 可能使用了非标准字体编码，尝试不同的解码策略
```

### "上下文太长，模型报错"
```
1. 减少 topK 值
2. 缩短 chunk 的 snippet 长度
3. 减少传递给模型的历史消息数量（messages.slice(0, -1).slice(-20) 中的 20）
```

---

## Checklist

- [ ] Identified which pipeline layer is failing
- [ ] Read the relevant source file(s)
- [ ] Proposed a specific fix with reasoning
- [ ] User confirmed before implementing changes
- [ ] Tested the fix with a real document and query
