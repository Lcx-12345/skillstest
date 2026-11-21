# AI 研发效能评估产物 · 静态服务镜像
# 构建（上下文为 format-showcase 目录）:
#   docker build -f config/Dockerfile -t metrics-showcase .
# 运行:
#   docker run --rm -p 8080:8080 metrics-showcase
FROM python:3.12-slim

LABEL org.opencontainers.image.title="format-showcase" \
      org.opencontainers.image.description="多格式产物演示静态站点"

WORKDIR /srv

COPY web /srv/web
COPY slides /srv/slides
COPY data /srv/data
COPY docs /srv/docs

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
  CMD python -c "import urllib.request;urllib.request.urlopen('http://127.0.0.1:8080/web/index.html').read()" || exit 1

CMD ["python", "-m", "http.server", "8080", "--directory", "/srv"]
