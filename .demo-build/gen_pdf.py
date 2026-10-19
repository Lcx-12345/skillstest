import os
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, KeepTogether
from reportlab.platypus.flowables import Flowable

def register_cjk_font():
    candidates = [
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
        "/usr/share/fonts/opentype/wqy/wqy-zenhei.ttc",
        "/System/Library/Fonts/PingFang.ttc",
        "C:/Windows/Fonts/msyh.ttc",
    ]
    for p in candidates:
        if os.path.exists(p):
            pdfmetrics.registerFont(TTFont("CJKFont", p, subfontIndex=0))
            return p
    return None

font_path = register_cjk_font()
if not font_path:
    raise SystemExit("NO CJK FONT FOUND")
print("CJK font:", font_path)

PRIMARY = HexColor('#1a365d')
ACCENT = HexColor('#2b6cb0')

styles = {
    'title': ParagraphStyle('Title', fontName='CJKFont', fontSize=24, leading=32, textColor=PRIMARY, spaceAfter=14, alignment=1, wordWrap='CJK'),
    'subtitle': ParagraphStyle('Subtitle', fontName='CJKFont', fontSize=12, leading=16, textColor=HexColor('#4a5568'), spaceAfter=24, alignment=1, wordWrap='CJK'),
    'h1': ParagraphStyle('H1', fontName='CJKFont', fontSize=16, leading=22, textColor=PRIMARY, spaceBefore=18, spaceAfter=8, wordWrap='CJK'),
    'body': ParagraphStyle('Body', fontName='CJKFont', fontSize=10.5, leading=17, textColor=HexColor('#2d3748'), spaceAfter=8, wordWrap='CJK'),
    'caption': ParagraphStyle('Caption', fontName='CJKFont', fontSize=9, leading=12, textColor=HexColor('#718096'), alignment=1, spaceBefore=6, spaceAfter=10, wordWrap='CJK'),
}

CONTENT_WIDTH = A4[0] - 1.5 * inch

class ColoredDivider(Flowable):
    def __init__(self, width, height=2, color=ACCENT, space_before=6, space_after=12):
        Flowable.__init__(self)
        self.width, self.height, self.color = width, height, color
        self.spaceAfter, self.spaceBefore = space_after, space_before
    def draw(self):
        self.canv.setFillColor(self.color)
        self.canv.rect(0, 0, self.width, self.height, fill=1, stroke=0)

def styled_table(data, col_widths):
    t = Table(data, colWidths=col_widths)
    t.setStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#FFFFFF')),
        ('FONTNAME', (0, 0), (-1, -1), 'CJKFont'),
        ('FONTSIZE', (0, 0), (-1, 0), 10.5),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#f7fafc'), HexColor('#FFFFFF')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e2e8f0')),
    ])
    return t

doc = SimpleDocTemplate("/workspace/demo-output/summary.pdf", pagesize=A4,
                        leftMargin=0.75*inch, rightMargin=0.75*inch,
                        topMargin=0.75*inch, bottomMargin=0.75*inch)

story = []
story.append(Spacer(1, 1.1*inch))
story.append(Paragraph("Trae 内置工具 × 文件格式全量演示", styles['title']))
story.append(Paragraph("摘要报告 · 2026-10-19 · 由 office-plugin:pdf 技能（reportlab）生成", styles['subtitle']))
story.append(ColoredDivider(CONTENT_WIDTH, height=3, space_after=18))

story.append(Paragraph("一、演示概述", styles['h1']))
story.append(Paragraph("本次演示在 /workspace/demo-output/ 目录中实际生成了 15 种格式的文件，并在一次会话内完整调用了全部 26 个内置工具，覆盖文件操作、终端命令、网络检索、多模态生成、子智能体调度与状态管理等能力面。", styles['body']))

story.append(Paragraph("二、支持的文件格式", styles['h1']))
fmt_rows = [
    ["类别", "格式", "生成方式"],
    ["文本与代码", "txt / md / csv / json / yaml / xml / svg / html / py", "Write 工具"],
    ["Office 文档", "docx / xlsx / pptx / pdf", "office-plugin 技能"],
    ["图片", "jpg / png", "GenerateImage 工具"],
    ["网页幻灯片", "html deck", "html-deck 技能"],
    ["归档", "zip", "RunCommand 终端命令"],
]
story.append(KeepTogether([styled_table(fmt_rows, [1.3*inch, 3.6*inch, 1.6*inch])]))
story.append(Paragraph("注：图片格式由生成器自动决定，本次为 jpg。", styles['caption']))

story.append(Paragraph("三、内置工具清单（26 个）", styles['h1']))
tools_text = (
    "<b>文件与搜索（8）</b>：Read、Write、Edit、DeleteFile、Glob、Grep、LS、SearchCodebase<br/>"
    "<b>终端（3）</b>：RunCommand、CheckCommandStatus、StopCommand　<b>网络（2）</b>：WebSearch、WebFetch<br/>"
    "<b>图像（1）</b>：GenerateImage　<b>子智能体（3 类）</b>：search / general_purpose_task / browser_use<br/>"
    "<b>规划交互（5）</b>：TodoWrite、AskUserQuestion、NotifyUser、OpenPreview、browser_waiting_for_user_interaction<br/>"
    "<b>目标管理（3）</b>：get_goal、create_goal、update_goal　<b>定时任务（1）</b>：Schedule<br/>"
    "<b>技能与扩展（2）</b>：Skill、run_mcp（MCP：integrated_code_mode / Exec）"
)
story.append(Paragraph(tools_text, styles['body']))

story.append(Paragraph("四、产出与预览", styles['h1']))
story.append(Paragraph("全部产物位于 /workspace/demo-output/：文本类 9 件、图片 1 件、Office 文档 4 件、归档 1 件。demo.html 可通过本地 http.server 打开预览；presentation.pptx 已通过布局质检（0 问题）；data.xlsx 公式重算 0 错误；report.docx 已通过 sanitize 质检。", styles['body']))

doc.build(story)
print("summary.pdf built")
