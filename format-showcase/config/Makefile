# AI 研发效能评估产物 · 常用操作
# 用法: make [target]
.PHONY: help verify analyze chart table archive serve clean

PY ?= python3
ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST)))/..)

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

analyze: ## 打印场景汇总表（Python）
	cd $(ROOT)/code && $(PY) analyze.py

chart: ## 导出平均耗时图表 PNG（Python）
	cd $(ROOT)/code && $(PY) analyze.py --chart ../media/chart_avg_minutes.png

table: ## 用 Shell 校验 CSV 口径
	cd $(ROOT)/code && ./script.sh

verify: table analyze ## 同时执行两种口径校验

archive: ## 打包全部产物为 format-showcase.zip
	cd $(ROOT)/.. && zip -qr format-showcase.zip format-showcase -x '*.DS_Store'

serve: ## 本地预览 HTML 报告与演示
	cd $(ROOT) && $(PY) -m http.server 8080

clean: ## 清理可再生成的图表文件
	rm -f $(ROOT)/media/chart_avg_minutes.png $(ROOT)/media/chart_avg_minutes.jpg
