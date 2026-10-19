#!/usr/bin/env python3
"""演示代码文件（.py）：读取 config.json 并打印摘要，由 RunCommand 工具执行。"""
import json
from pathlib import Path

HERE = Path(__file__).parent
data = json.loads((HERE / "config.json").read_text(encoding="utf-8"))["demo"]

print("=" * 50)
print("标题:", data["title"])
print("日期:", data["date"], " 内置工具数:", data["tool_count"])
print("=" * 50)
rows = [
    ("txt", "文本", "Write"),
    ("md", "文本", "Write"),
    ("csv", "文本", "Write"),
    ("json", "数据", "Write"),
    ("yaml", "数据", "Write"),
    ("xml", "数据", "Write"),
    ("svg", "矢量图", "Write"),
    ("html", "网页", "Write"),
    ("py", "代码", "Write"),
    ("jpg", "图片", "GenerateImage"),
    ("docx", "Office", "Skill: office-plugin"),
    ("xlsx", "Office", "Skill: office-plugin"),
    ("pptx", "Office", "Skill: office-plugin"),
    ("pdf", "Office", "Skill: office-plugin"),
    ("zip", "归档", "RunCommand"),
]
for fmt, cat, tool in rows:
    print(f"  {fmt:6} | {cat:6} | {tool}")
print("-" * 50)
print(f"共 {len(data['formats'])} 种格式 × {data['tool_count']} 个内置工具")
