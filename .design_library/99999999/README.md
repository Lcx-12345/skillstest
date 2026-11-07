# 99999999 Design System — 轻奢极简风格的电商/品牌设计系统：以象牙白画布、发丝级边框与慷慨留白陈列商品，让奢感来自比例与克制，而非装饰。

## 1. Overview

99999999 是面向电商/轻奢品牌场景的设计系统，性格关键词是轻奢（light-luxury）、极简（minimal）、精致（refined）、内敛（understated）、宁静（serene）。

它的核心信条只有一条：奢侈感来自比例与留白，绝不来自装饰。因此你会看到象牙白/瓷白画布、发丝级 1px 边框、耳语般的投影，以及近黑墨色的文字；唯一的饱和元素是被极度克制使用的香槟金。

需要明确的是：这套系统并非从某个真实产品的 Figma 中提取，而是由「轻奢极简」风格简报（style brief）AI 生成——所有 token 值都是从简报推断出来的（`colors_and_type.css` 中逐项标注了 `/* AI-generated */`），组件变体遵循常见电商模式，而非逆向某个既有站点。请把它当作一份有观点的高保真起点来使用与质疑，而不是不可动摇的事实。

系统按 ecommerce kit 类型组织（kitType: ecommerce），组件覆盖商品陈列、购物车与结算动线。

### What this covers
- Foundations：色彩、字体、间距、圆角、阴影的关键值与设计意图；
- Components：6 个组件（button、card、product-card、cart、navigation、input）；
- Sample kit：`ui_kits/ecommerce/` 电商样例成品。

## 2. Content Fundamentals

### 语气与文案
99999999 的沟通方式是「留白式」的：像精品店的礼宾，话不多，但每个词都经过挑选。文案不制造紧迫感、不喊价、不用感叹号，而是用书面化的敬语词汇（臻品、礼遇、登场、臻选）把商业场景翻译成画廊式的通告。

栏目标题被压缩到 2–4 个字，排版上以拉宽字距的 eyebrow 形式呈现——文字周围的空白本身就是语气的一部分。

克制不等于冷淡：「会员礼遇」「限时臻选」这样的措辞依然在传递被优待感与稀有感，只是始终用低声的方式说。

### 文案示例（取自 uiCopySamples）
- 「新品登场」——新品栏目标题，eyebrow 式呈现；
- 「经典系列」/「臻品推荐」——系列与推荐位命名，不带促销腔；
- 「限时臻选」——稀有感靠「臻选」二字表达；
- 「查看详情」/「加入购物袋」——商品卡上的次级/主级动作；说「购物袋」而非「购物车」，保留门店感、回避仓储感；
- 「会员礼遇」/「结算」——会员权益与购物车动线的终点。

### 文案规则
1. 低音量：禁用感叹号与催促式促销语言；紧迫感只能靠「限时臻选」这类措辞的克制作风表达，而不是倒计时。
2. 每屏只允许一个金色主 CTA（「加入购物袋」「结算」），次级动作一律降级为文字链接（「查看详情」）。
3. 用词书面化、敬语化：臻品、礼遇、登场、臻选属于品牌词库，口语化促销词不入库。
4. 标题短小（2–4 字为宜），其余信息交给排版与留白，而不是形容词堆叠。

## 3. Visual Foundations

以下所有值都直接取自 `colors_and_type.css`——这一节解释的不是「有哪些 token」，而是「为什么是这些值」。

### 色彩
主色是一支香槟金：`--primary = --lux-gold-600 = #A98443`，其上的文字是暖白 `--primary-foreground: #FFFDF8`——注意不是纯白，暖白让金色块面不显荧光廉价。

它的视觉性格是「在场但不抢戏」：低饱和、偏暖、近似哑光金属。在整套象牙白体系里，它是唯一被允许高浓度出现的颜色，因此每一次出现都自带「此处可点」的暗示——这也是 Button 把它作为 CTA 专属色的原因。

色阶共 6 组——gold（金）、warm（暖中性）、success、warning、error、info——每组 10 阶（50–900），统一以 `--lux-*` 前缀命名；语义取色一律取 600 阶。

金色阶从近白的 #FBF7EE 渐进到深褐的 #4E3B20；真正常用的「亮金」区间在 500 阶 `#BC9A5C` 附近（即 `--accent`，hover 深化为 600 阶）。

暖中性阶（warm）是整套系统的隐形骨架：50 阶 #FAF8F4 就是页面背景 `--background`，900 阶 #26221D 就是正文墨色 `--foreground`。它不是纯灰，而是与金色同色温的暖调，因此边框、文字与金色永远和谐。

文字层次全部取自暖中性阶：正文 `--foreground #26221D`、次级 `--foreground-secondary #575146`、弱化 `--muted-foreground #746D5E`；链接取更深的金 `--lux-gold-700 #8C6C36`，保证象牙白底上的可读性。

语义色全部经过降饱和处理：success `#3C7239`（灰调橄榄绿）、warning `#A37125`（琥珀）、error `#A33C2E`（陶土红而非警示正红）、info `#3A5B75`（雾蓝）——即使报错也不打破页面的宁静。留意 warning 与主金同属琥珀族，区分靠上下文而非色相。

整体氛围一句话：象牙白/瓷白画布（背景 `#FAF8F4`、卡片表面 `#FFFDF9`），近黑墨色文字（`#26221D`），香槟金克制地用于 CTA、focus ring（`--ring: #BC9A5C`）与链接 hover。

系统还提供了一层语义别名（`--color-primary`、`--color-surface`、`--color-border` 等）：写组件时优先引用语义别名而非原始色阶，后续校准色值时就不必改组件代码。

暗色模式 `.dark` 完整可用：背景压到 `#1C1915`，主金提亮为 `#C4A97A` 以维持深底对比——沿用同一批 token，切换模式无需重写样式。

### 字体
`@import` 实际引入两个 Google Fonts 家族：**Cormorant Garamond**（权重 400/500/600/700）与 **Jost**（权重 300/400/500/600）。

Cormorant Garamond 是 display/heading 衬线（`--font-display` / `--font-heading`），只出现在标题、字标与价格上；Jost 是正文无衬线（`--font-body`），承担所有需要被安静阅读的界面文字。「衬线的表情 + 无衬线的身体」是轻奢排版的经典分工。

字号体系从 56px 连续压到 11px：display 56、h1 40、h2 32、h3 24、h4 20、lead 18、body 16、caption 12、eyebrow 11，另有 mono 14（`--font-mono` 声明为 JetBrains Mono，见 Caveats）。

权重策略同样克制：display/h1 用 600，h2–h4 退到 500，正文 400，导语 lead 反而用 300——层级靠字号与行高建立，全系统不出现 700 以上的黑体感。

行高策略是「标题紧、正文松」：display 1.1、h1 1.2、h2 1.25、h3 1.3、h4 1.4，正文 1.6、导语 1.7。紧的标题保持优雅块面，松的正文让页面呼吸——与间距的呼吸感互为表里。

display 级别仅做了 `-0.01em` 的负字距微调，其余标题不做任何字距装饰——大字的紧凑感靠行高完成，不靠挤字。

两个签名排版件值得单独记住：`.lux-eyebrow`（11px、权重 500、字距 0.14em、全大写）是所有栏目标题的默认形态；`.lux-price` 用 Cormorant Garamond 渲染价格（1.5rem、600 权重、行高 1.1）并开启 `font-variant-numeric: tabular-nums`——衬线等宽数字让价格「像刻上去的」，而不是超市价签。

由此可得一条日常判断：要「被欣赏」的文字用衬线，要「被使用」的文字用 Jost。

### 间距
基础单位 4px，token 从 `--space-1`（4px）到 `--space-8`（64px），中间依次是 8、12、16、24、32、48。

梯度在 32→48→64 处刻意跳档，把「组件内间距」（≤24px）与「区块级留白」（≥48px）分成两个音区——section 之间永远用 `--space-7` / `--space-8`，不要折中。

这是一套 spacious 密度系统：按钮高度 36/44/52px（sm/md/lg），输入框 48px，图标 16/20/24px——元素偏高偏瘦，四周留白慷慨；建议 sm/md/lg 按钮分别搭配 16/20/24px 图标。

排版时请把空白当材料：宁可删掉一个模块，也不要压缩 section 留白去塞内容——留白减少就是奢感流失，这是本系统最不可妥协的一条。

### 圆角
圆角取值只有 4 个，且几乎全部贴着直角：
- `--radius-none: 0px`：卡片与输入框的默认形态，直角传达「裁切」的精确感；
- `--radius-sm: 2px` / `--radius-md: 4px`：只柔化边角、不显圆润，用于按钮与小容器；
- `--radius-full: 9999px`：全圆仅保留给小元素（徽标、状态点、tag）。

注意语义别名层里 `--radius-lg` 被压到 4px（与 md 相同）：系统刻意不提供「大圆角」这个选项，圆润在本品牌语境里是反气质的。

### 阴影/层次
阴影共 5 层，哲学是 whisper-soft（耳语级）：alpha 全部 ≤ .10，色值统一基于墨色 #26221D（即 rgba(38,34,29,…)），用近乎不可见的投影代替视觉噪音。

层级从 `--shadow-1: 0 1px 2px rgba(38,34,29,.04)`（卡片发丝影）起步，hover 升到 shadow-2（卡片悬停），再往上依次是 shadow-3（dropdown）、shadow-4（modal），顶层是 `--shadow-5: 0 20px 48px rgba(38,34,29,.10)`（overlay）。

hover 的阴影升级只发生在卡片与浮层上；文字与按钮不参与投影游戏。

判断标准：如果一处阴影能被用户明确「看见」，它在这套系统里就已经超标——阴影是气压，不是效果。

### 边框与背景
边框只有一条规则：发丝级 1px hairline，颜色统一 `--border = --lux-warm-200 #E6E1D6`（分割线 `--rule` 与之共用）。要点：
- 卡片不靠阴影堆层次，靠 1px 发丝边框 + 慷慨内边距「呼吸」；
- 购物车行间、表单分组间同样只用 hairline 分隔，禁止粗色块与渐变分隔条；
- 边框永远不与文字争夺注意力——觉得边框显眼时，先怀疑内容层级，而不是加粗边框。

背景只做极轻的白度分层，要点：
- 页面背景 `#FAF8F4`、卡片表面 `#FFFDF9`、次级区块 `--surface-dim #F3F0E9`——三者只差一点白度，层次感交给 hairline 而非色差；
- popover 用纯白 `#FFFFFF`，是白度分层里唯一一次明确「跳档」，让浮层比页面亮半档。

## 4. Component Patterns

6 个组件，注册表见 `components/index.json`，聚合样式见 `components.css`，源文件位于 `components/` 目录下（以 slug 命名）。每行的「关键洞察」是该组件区别于普通电商组件的本质：

| 组件 | 文件 | 关键洞察 |
| --- | --- | --- |
| Button | `components/button` | 香槟金 CTA 是象牙白画布上唯一的饱和元素 |
| Card | `components/card` | 发丝边框 + 慷慨内边距——卡片会呼吸 |
| ProductCard | `components/product-card` | 价格用衬线 tabular 数字；hover 只做透明度渐隐，绝不弹跳 |
| Cart | `components/cart` | 只用发丝分割线；小计用衬线 tabular 数字；金色「结算」是动线的终点 |
| Navigation | `components/navigation` | 居中的衬线字标，配拉宽字距的 caption 菜单 |
| Input | `components/input` | 下划线式输入框保持画布干净；聚焦时发丝线变金 |

变体数量：button 4 个、其余各 3 个——均遵循常见电商模式而非穷举；需要新变体时请从「关键洞察」出发推导，而不是堆样式。

## 5. Index

- `README.md`——本文档（品牌叙事 + Foundations 分析）；
- `SKILL.md`——面向 AI/自动化的系统使用说明；
- `colors_and_type.css`——全部 design tokens（色彩/字体/间距/圆角/阴影）与排版工具类；
- `css.json`——token 的 JSON 版本；
- `components.css` + `components/`——组件聚合样式，以及 6 个组件源文件与 `index.json` 注册表；
- `preview/` + `uikit-plan.json`——预览页与 UI kit 生成计划；
- `ui_kits/ecommerce/`——电商样例 kit 成品（Sample kit）。

## 6. Caveats / known substitutions

- **字体回退**：Cormorant Garamond 与 Jost 依赖 Google Fonts `@import`，离线或加载失败时分别回退到通用 `serif` / `sans-serif`，衬线气质会明显损失；`--font-mono` 声明为 JetBrains Mono 但不在 `@import` 清单里，等宽场景（订单号、编码）会静默落到系统 monospace——介意请自行补引字体。
- **图片是占位**：kit 中的商品图为占位素材。轻奢风格对摄影极其敏感，上线前请替换为白底、暖调布光的真实商品图；图片质量不达标时宁可减图。
- **值是推断出来的**：本系统由「轻奢极简」brief AI 生成，未经真实产品校准，CSS 中每个值都标注 `/* AI-generated */`，品牌置信度为 medium。请当高保真草案引用，不要当测量事实。
- **暗色模式未覆盖语义色**：`.dark` 只反转了 gold/warm 色阶与表面色，success/warning/error/info 未在暗色下重定义——深底上使用语义色时请人工验证对比度。
- **可通过 refine 扩展**：后续可用 refine 流程补充真实截图校准、微调暗色模式语义色、按业务扩展组件变体——扩展时守住三条底线：留白、发丝线、单点金色。
