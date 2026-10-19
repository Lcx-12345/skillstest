# Trae 内置工具 × 文件格式演示说明

> 本文档是由 Write 工具生成的 Markdown 文件，用于演示 .md 格式。

## 一、支持的文件格式

| 类别 | 格式 | 生成方式 |
|------|------|----------|
| 文本 | txt / md / csv / json / yaml / xml / svg / html / py | Write 工具 |
| Office | docx / xlsx / pptx / pdf | office-plugin 技能 |
| 图片 | png / jpg | GenerateImage 工具 |
| 网页幻灯片 | html deck | html-deck 技能 |
| 归档 | zip | 终端命令 |

## 二、内置工具清单（26 个）

- **文件与搜索**：Read、Write、Edit、DeleteFile、Glob、Grep、LS、SearchCodebase
- **终端**：RunCommand、CheckCommandStatus、StopCommand
- **网络**：WebSearch、WebFetch
- **图像**：GenerateImage
- **子智能体**：Task（search / general_purpose_task / browser_use）
- **规划交互**：TodoWrite、AskUserQuestion、NotifyUser、OpenPreview、browser_waiting_for_user_interaction
- **目标**：get_goal、create_goal、update_goal
- **定时**：Schedule
- **扩展**：Skill、run_mcp

## 三、代码块演示

```python
print("Hello from demo!")
```

*最后更新：2026-10-19 13:40 —— 本行已由 Edit 工具成功修改，文件操作链（Read → Edit → DeleteFile → Grep → Glob）演示完毕*
