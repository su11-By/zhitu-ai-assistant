FROM python:3.10-slim

WORKDIR /app

# 安装依赖
COPY server/requirements.txt ./server/
RUN cd server && pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY server/ ./server/
COPY dist/ ./server/dist/

# 暴露端口
EXPOSE $PORT

# 启动应用
CMD ["sh", "-c", "cd server && gunicorn app:app --bind 0.0.0.0:${PORT:-3001} --workers 2"]
