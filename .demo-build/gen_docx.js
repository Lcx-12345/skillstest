const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
        WidthType, ShadingType, PageNumber } = require("docx");

const FONTS = { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" };
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function cell(text, opts = {}) {
  return new TableCell({
    borders,
    width: { size: opts.width || 3000, type: WidthType.DXA },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: !!opts.bold, font: FONTS, size: 21 })] })],
  });
}

const formatRows = [
  ["txt / md / csv / json / yaml / xml / svg / html / py", "文本与代码", "Write 工具"],
  ["docx / xlsx / pptx / pdf", "Office 文档", "office-plugin 技能"],
  ["jpg / png", "图片", "GenerateImage 工具"],
  ["html deck", "网页幻灯片", "html-deck 技能"],
  ["zip", "归档", "RunCommand 终端命令"],
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: FONTS, size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: FONTS, color: "1F3864" },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 0, keepNext: false, keepLines: false } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "第 ", font: FONTS, size: 18 }),
          new TextRun({ children: [PageNumber.CURRENT], font: FONTS, size: 18 }),
          new TextRun({ text: " 页", font: FONTS, size: 18 }),
        ],
      })] }),
    },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1200, after: 300 },
        children: [new TextRun({ text: "Trae 内置工具 × 文件格式全量演示报告", bold: true, size: 40, font: FONTS })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 },
        children: [new TextRun({ text: "生成日期：2026-10-19 ｜ 生成方式：office-plugin:docx 技能（docx-js）", size: 20, color: "666666", font: FONTS })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "一、演示概述", font: FONTS })] }),
      new Paragraph({ spacing: { line: 360 }, children: [new TextRun({ text: "本报告是 \"内置工具 × 文件格式\" 全量演示的产物之一：共调用 26 个内置工具，生成 15 种格式的演示文件，全部输出至 /workspace/demo-output/ 目录。报告本身由 docx-js 生成，并经过 sanitize.py 质量检查。", font: FONTS, size: 22 })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "二、支持的文件格式", font: FONTS })] }),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [4526, 2000, 2500],
        rows: [
          new TableRow({ cantSplit: true, tableHeader: true, children: [
            cell("格式", { bold: true, fill: "D5E8F0", width: 4526 }),
            cell("类别", { bold: true, fill: "D5E8F0", width: 2000 }),
            cell("生成方式", { bold: true, fill: "D5E8F0", width: 2500 }),
          ]}),
          ...formatRows.map(([f, c, t]) => new TableRow({ cantSplit: true, children: [
            cell(f, { width: 4526 }), cell(c, { width: 2000 }), cell(t, { width: 2500 }),
          ]})),
        ],
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "三、内置工具清单（26 个）", font: FONTS })] }),
      ...[
        "文件与搜索：Read、Write、Edit、DeleteFile、Glob、Grep、LS、SearchCodebase",
        "终端：RunCommand、CheckCommandStatus、StopCommand",
        "网络：WebSearch、WebFetch",
        "图像：GenerateImage",
        "子智能体：Task（search / general_purpose_task / browser_use）",
        "规划交互：TodoWrite、AskUserQuestion、NotifyUser、OpenPreview、browser_waiting_for_user_interaction",
        "目标管理：get_goal、create_goal、update_goal",
        "定时任务：Schedule",
        "技能与扩展：Skill、run_mcp（MCP: integrated_code_mode/Exec）",
      ].map(t => new Paragraph({ numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({ text: t, font: FONTS, size: 22 })] })),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "四、总结", font: FONTS })] }),
      new Paragraph({ spacing: { line: 360 }, children: [new TextRun({ text: "26 个内置工具覆盖了文件操作、终端命令、网络检索、多模态生成、子智能体调度、任务规划与状态管理等完整能力面；配合 office-plugin、html-report-presentation、Lark、Seedance/Seedream 等插件，几乎可以产出开发与办公场景中的所有常见文件格式。", font: FONTS, size: 22 })] }),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/workspace/demo-output/report.docx", buffer);
  console.log("report.docx written:", buffer.length, "bytes");
});
