---
name: story-review
version: 1.1.1
description: "多视角对抗式审查。full/lean 模式在已部署 reviewer agents 时并行 spawn；缺失/异常 agents 或 spawn 失败时自动降级 solo，参考文件不可读时使用内置 rubric fallback。触发方式：/story-review、/审查、「审查一下」「帮我审一下」。"
metadata: {"openclaw":{"source":"https://github.com/zenstory-ai/oh-story-claudecode"}}
---
# story-review：多视角对抗式审查

**需要助手时**：DSH 先读 [原生子会话](../story-setup/references/dsh-agents.md)，使用 `writer_agent`；其他宿主先读 [角色兼容说明](../story-setup/references/agents-other-hosts.md)。只执行当前宿主的检查与派发规则，缺少能力时按本流程处理。

你负责协调审查，找出小说的结构、角色、文字与设定问题，给出有原文依据的修改建议。

**执行铁律：审查是找问题，不是验证正确性。**

**文风裁决**：先读 [references/style-resolution.md](references/style-resolution.md)，加载本书文风，复用调用方的 `style_resolution` 与作者偏好；单独调用时按当前请求与本书文风裁决。同一裁决交给后续执行者。

## 作者偏好边界

只接收调用方已有的作者偏好，不查询或记录作者记忆；独立调用时不加载记忆文件。偏好只能帮助解释意图和组织报告，不能降低 rubric 严重度、把事实冲突判为无问题或跳过平台门禁；当前请求仍优先。

---

## Review Mode 选择

- `/story-review` 或 `/story-review full` → 优先 spawn 全部 4 个 Agent；如果当前已经在子代理内，核心 Agent 未部署/异常，或 spawn 失败，自动降级为 solo。
- `/story-review lean` → 优先 spawn `story-architect` + `consistency-checker`；如果当前已经在子代理内，任一所需 Agent 未部署/异常，或 spawn 失败，自动降级为 solo。
- `/story-review solo` → 不 spawn Agent，由当前会话执行基础审查。

---

## Phase 0：预检与降级（必须先执行）

1. **确定请求模式**：解析用户输入中的 `full`、`lean`、`solo`；未指定时目标模式为 `full`。
2. **确认是否允许 spawn**：如果当前已经在子代理/Agent 内执行，不再递归 spawn，直接降级为 `solo`。
3. **确定必需角色**：full 需要 `story-architect`、`character-designer`、`narrative-writer`、`consistency-checker`；lean 需要 `story-architect`、`consistency-checker`。solo 跳过角色与派发检查。
4. **按宿主检查**：DSH 按顶部的原生子会话说明检查 `writer_agent`，角色由工具从当前生效的 `story-setup` 加载；不检查其他宿主目录或部署版本。其他宿主按角色兼容说明核对上述必需角色；缺失、定义异常或工具不可用则降级 solo，报告原因与问题角色。
5. **运行时失败降级**：任一必需角色派发失败或未完成审查时，停止继续派发，改用 solo 重新审查。部分成功结果不能当成 full/lean 结论；技术备注写 `Fallback: spawn failed -> solo` 与失败角色。已在子代理中则记 `subagent recursion guard -> solo`。
6. **确定实际模式**：请求模式、实际模式与降级原因写进报告末尾的技术备注行。

---

## 审查基准与参考资料规则（必须遵守）

参考文件补充审查标准；不可读时使用下方内置基准包。

### 报告面向作者（必须遵守）

报告写给作者：审了什么、哪里要改、为什么（用读者感受和故事后果说，附原文引用）、要作者拍板的事、下一步。reviewer 名、S1–S4、Gate、检测器类别名、脚本名、PASS/FAIL、文件字段名不进正文；位置写「第 N 章「引文」」或「第 N 章第 M 段」。优先级换成白话（小节标题照模板）：S1、S2 → **必须改**，S3 → **建议改**，S4 → **可以不改**。执行路径只写在报告最后一行，格式固定：

```text
技术备注：Mode {请求}→{实际} · Fallback {none | project custom agents unavailable -> solo | missing agents -> solo | malformed agents -> solo | agent tool unavailable -> solo | spawn failed -> solo | subagent recursion guard -> solo} · Rubric {fanqie | qidian | zhihu | generic} ({file | embedded})[ · Files {缺失或异常的 agent 文件}][ · Notice {版本不匹配原文}]
```

### 参考资料解析顺序

DSH 从当前加载的 `story-review/SKILL.md` 所在目录读取 `references/` 与 `scripts/`，包括项目覆盖后的目录；不向其他宿主目录搜索旧副本。其他宿主按 [资料路径](references/resource-paths.md) 解析。所需资料不可读时使用下方内置基准，并如实标注缺失项。

规范路径如下；禁止只写裸文件名，禁止跨 skill 误读其他 skill 的 references：

| 用途 | 规范路径 |
|---|---|
| 通用内容评分 rubric | `story-review/references/quality-rubric.md` |
| 去 AI 味方法 | `story-review/references/expression.md` · `story-review/references/narrative-focus.md` · `story-review/references/story-logic.md` |
| 词句信号索引 | `story-review/references/banned-words.md` |
| 平台 rubric | `story-review/references/rubrics/{fanqie,qidian,zhihu}.md` |
| 标点预检脚本 | `story-review/scripts/normalize-punctuation.js` |
| AI句式预检脚本 | `story-review/scripts/check-ai-patterns.js` |

### 内置审查基准包（路径不可读时必用）

如果上述参考文件在当前项目中不可读，**不要把审查降级为无 rubric，也不要在报告里说“无法加载具体 rubric”后停止使用标准**。必须使用本节内置基准包，技术备注行的 Rubric 来源写 `embedded`。

通用网文内容 rubric：
- 核心卖点：本章是否围绕明确卖点推进；看不出卖点至少 S2。
- 冲突推进：本章是否有阻碍、选择、代价或关系变化；只解释/闲聊/总结至少 S2。
- 任务卡点：角色办事被卡住时，是否卡出信息、关系、代价、选择或伏笔变化；卡点只剩流程细节、删掉不影响故事至少 S3。
- 情绪曲线：是否有铺垫、升温、释放或反转；情绪平直或突兀至少 S2/S3。
- 钩子与期待：开头或结尾是否制造后续问题；没有悬念或未完成期待至少 S2。
- 开头新鲜度（仅开篇/前 3 章）：开局有具体人物/处境切口，还是同题材默认套路（能整体换到任意同类书）？"有钩子/非天气开场"不豁免同质化；套路化开局即使有钩子也至少 S3，整体撞同题材模板 S2。
- 角色动机：行为是否符合目标、性格、处境和关系压力；为剧情服务而失真是 S1/S2。
- 对话质量：是否有潜台词、信息控制、角色差异；说明书式对话至少 S2。
- 设定一致性：不违背已写规则、时间线、角色属性；明确事实冲突通常 S1。
- 文字自然度：具体、可感、动作承载信息；AI 腔、陈词滥调、总结体按影响定 S2/S3。
- 句长节奏：按本书文风、语义承接与场景功能判断；机械碎句、动作清单或臃肿长句按影响定 S3/S2，不按统一字数或句长模板验收。
- 标点节奏：标点是否服务语气/人物声线；通篇句号化、随机堆砌问号/感叹号，或残留 `……`/`——` 硬造停顿，按影响定 S3/S2。
- 具体字数表达校验：正文用“这五个字 / 短短四字 / 三个字一落 / 八个字砸下去”等具体字数表达评价台词、题字、信件、念头或弹幕时，必须能确认统计口径、机器核对结果和叙事必要；不能确保字数计算正确时，按文字自然度问题处理，建议改成“这句话一落”“那几个字”“话音落下”等非具体数字表达。
- 格式可读性：段落短、对话独立、无多余空行；格式阻碍阅读按 S3，严重混乱按 S2。
- 剧情循环：目标 → 阻碍 → 行动 → 代价/反馈 → 新期待；缺少目标/阻碍/反馈通常至少 S2。
- 高潮构建：检查蓄能、情绪落差与兑现；强反转可用蓄能 → 假胜 → 崩解 → 反转/兑现，缺铺垫或兑现通常 S2/S3。
- 关系进展：互动尺度必须匹配当前关系阶段；越界亲密、突然信任、突然敌对都需要铺垫，否则按影响定 S1/S2。
- 伏笔状态：伏笔状态需可追踪；伏笔密度只作为结构风险提示，除非直接造成理解混乱，否则不升级到 S2+。

三层去味 fallback 速查：
- 表达：套词、总结句、工整句式是否机械复现或重复意思？词语本身只是线索，直写情绪、纠错对比与文风允许的叙述可保留。
- 用笔：关键交锋或决定是否被概括，次要流程是否过详？压缩、展开均应保住人物体验和必要承接。
- 故事：行动有什么来由、解决依据从何而来、前后改变了什么？安静场景可承载关系与认知变化，不强求冲突。
- 处理原则：有原文证据才输出 finding，指出阅读损失、最小建议与资料限制；只报告，不落改，不默认拆短、加动作或新增剧情。

平台 fallback 摘要（叠加在通用 rubric 上）：
- 番茄长篇：强开局、强冲突、高频爽点/情绪反馈、低理解门槛。
- 起点长篇：设定自洽、升级路径、长线期待、世界观承载力。
- 短篇：开头钩子、反转有铺垫、情绪兑现、信息差推进。

---

## Phase 1：收集待审查内容

1. **确定审查范围**：
   - 用户指定了章节/文件 → 只审查指定内容。
   - 用户未指定 → 项目是 git 仓库时审 `git diff --name-only` 里的正文/设定/大纲文件；否则长篇审 `正文/` 下最近修改的章，短篇审 `正文.md`。报告开头写明审了哪些。
2. **范围传递策略**：
   - 优先把文件路径、章节名、行号范围传给 reviewer，不要把整本或大量章节完整复制进每个 prompt。
   - 单文件或短片段可附 300-1200 字关键摘录。
   - 多章/整卷/整本审查必须分批：按章节或文件组拆分，每批输出独立 findings，再综合；分批前先完整读 [references/batch-review.md](references/batch-review.md)（跨批状态、连续性、乱序提醒）。
3. **固定正文版本并读取支撑材料**：本地正文先按 [审稿记录](references/review-record.md) 计算原始字节摘要，保存后再读稿或派 reviewer；报告与记录使用该摘要。solo 和分批审查时由你读正文、相关设定、角色档案、大纲、`追踪/上下文.md` 与伏笔文件；full/lean 只读定范围、定平台和分批开放项要用的文件，其余由 reviewer 按路径自己读。缺材料时在报告里标为证据不足。
4. **识别篇幅与目标平台，加载 rubric**：
   - 通用 rubric 每次都加载：读 `story-review/references/quality-rubric.md`，不可读时用内置通用网文内容 rubric。平台表叠加在通用 rubric 上，不替代它。
   - 篇幅：书目录下有 `正文/` 或 `设定/` 子目录的是长篇，有 `正文.md` 或 `设定.md` 文件的是短篇（与 `/story` 路由同一口径）。
   - 平台：用户这次指定的优先；其次长篇读 `设定/题材定位.md`、短篇读 `设定.md` 的「目标平台」。`.active-book` 只用来定位书目录，不当平台来源。
   - 按下表叠加平台表，文件不可读时用内置平台 fallback 摘要：

     | 篇幅 | 目标平台 | 叠加的平台表 |
     |---|---|---|
     | 长篇 | 起点 | `story-review/references/rubrics/qidian.md` |
     | 长篇 | 番茄 | `story-review/references/rubrics/fanqie.md` |
     | 长篇 | 晋江、其他、未定、没写 | 不叠加 |
     | 短篇 | 知乎盐言（也写作盐选）、番茄、七猫、黑岩、红果、小程序、未定、没写 | `story-review/references/rubrics/zhihu.md` |

   - 短篇另按 `设定.md`「平台基调」核对格式、引号和导语。
   - 技术备注行的 Rubric 写叠加的平台表（`fanqie | qidian | zhihu`），不叠加写 `generic`；括号里文件可读写 `file`，用了内置摘要写 `embedded`。
5. **形成审查基准包摘要**：把已加载的文件内容或内置 fallback 摘要压缩为 5-12 条审查标准，后续 solo 和子 Agent 都必须使用这份摘要。审查提示词要各保留一条剧情循环、高潮构建和关系进展的判断，审第 1-3 章时再加开头新鲜度。句长节奏统一按本书文风、语义承接与场景功能判断；机械碎句、动作清单与臃肿长句都须指出具体阅读损失，不以句子长短或统一模板判错。资料可读与使用内置基准时采用同一口径。
6. **确定性预检（只报告，不修改）**：当审查范围包含本地正文文件路径时，运行本 skill 自带脚本：
   ```bash
   node scripts/normalize-punctuation.js --check <正文文件...>
   node scripts/check-ai-patterns.js --check --fail-on=blocking <正文文件...>
   node scripts/check-degeneration.js --check <正文文件...>
   ```
   - 将 `ellipsis`、`double-hyphen`、`markdown-divider` 结果作为 `format` findings 合并进报告。`em-dash` 破折号只采用 `check-ai-patterns.js` 的语义改写建议（见下条）；`normalize-punctuation.js` 报的同一位置 `em-dash` 在合并时去重丢弃，避免同处出现「机械替换」与「按功能改写」两条相互冲突的 finding。另外人工检查标点节奏是否通篇句号化或随机堆砌，脚本不替代语气判断。
   - `check-ai-patterns.js` 的 blocking / advisory 都先作为 `prose` 候选，按 `style_resolution`、原文功能及三层方法逐条复核；确认造成具体阅读损失后，按下方严重度定义定级。功能性纠错、叙述与停顿保留，不把脚本级别直接换成必须修改的 finding。检测器改法仅作参考，不覆盖文风与事实边界。完整语义复核见 `expression.md`、`narrative-focus.md`、`story-logic.md`，只报告问题与建议，不落改。
   - `check-degeneration.js` 报告模型退化（逐字复读/截断/占位符/工程词泄漏），每条带 `severity: blocking|advisory`：blocking（复读/截断/tier1 工程词）作为 S1/S2 `prose` findings，修复建议是「重新生成该段，不是改写」；advisory（tier2 章节/歧义词）作为 S3。
   - 这三个预检脚本只读；`story-review` **不修改正文、设定或大纲文件**，需要自动修复正文时建议转 `/story-deslop`。full / lean 模式只有下方「追踪文件维护」允许修改 `追踪/`；分批审查的所有模式都可按 batch-review.md 写 **.story-review/state.md**，所有模式都可按 [审稿记录](references/review-record.md) 写 `.story/reviews/` 与书内工作目录；solo 不写其他项目内容。
   - 默认 `--quote-mode keep`，不把知乎盐言短篇的 `「」` 当作问题；只有项目明确指定引号风格时才检查对应转换建议。

---

## 统一 Findings Schema（所有模式必须使用）

所有 reviewer（包括 solo）先按统一结构整理问题，再按 Phase 4 或 solo 模板转写给作者；内部字段用于合并、排序，不原样贴进作者报告。`location` 必须使用工具读取结果显示的原始文件行号；不要删除空行后重新编号。

对 `consistency` / `factual` / `causal` / `rule_boundary` 类 finding，`fix` 字段只写事实统一方向（例如“统一为左臂旧伤，并同步正文/设定中冲突处”或“需在 A/B 时间线中裁定一个来源”），不要写文学创作建议。

```yaml
- severity: S1 | S2 | S3 | S4
  category: structure | character | prose | consistency | platform | factual | format | causal | rule_boundary
  location: 文件路径:行号 或 章节/段落描述
  evidence: "引用原文或具体证据"
  issue: "问题描述"
  fix: "可执行修改建议"
```

严重度定义：S1–S4 的级别与长篇写作、检测器相同；审稿报告的小节标题按级别写，S1、S2 归「必须改」，S3 归「建议改」，S4 归「可以不改」：
- **S1**：会破坏主线、角色动机、世界规则或读者信任，需优先修。
- **S2**：明显影响章节效果、留存、节奏、人物可信度，本轮要修。
- **S3**：局部质量问题，如措辞、轻微格式、局部节奏，可排期修。
- **S4**：建议项或风格微调，不阻塞发布。

---

## Phase 2：并行 Spawn Agent（full/lean 模式）

执行 Phase 0 后实际模式仍是 full/lean 时，读 [references/agent-prompts.md](references/agent-prompts.md) 按其中的调用规则与四个 prompt 并行 spawn，综合裁决与报告模板也在其中；不 spawn 缺失的 Agent。每个 Agent 不继承父对话上下文，prompt 自包含路径、范围与统一 Findings Schema。

## Phase 3：综合裁决（full / lean 模式）

收齐 reviewer 结果后按 agent-prompts.md「综合裁决」合并、去重、呈现分歧。

## Phase 4：输出报告（full / lean 模式）

实际模式确为 full/lean 时用 agent-prompts.md 的报告模板；降级 solo 时改用 solo.md 模板。

---

## solo 模式

降级或指定 solo 时读 [references/solo.md](references/solo.md)，按其中流程与输出格式执行。

## 保存审稿记录

本地正文完成 full、lean 或 solo 审查后，主会话按 [审稿记录](references/review-record.md) 验证并保存 findings 与实际模式；报告给出已保存记录的路径。审稿记录不代替下方追踪修订。

## 追踪文件维护

有 `追踪/_tracking-state.json` 的长篇工程且实际模式是 full/lean 时，收尾读 [references/review-tracking.md](references/review-tracking.md) 修订追踪；solo 不改 `追踪/`，按 solo.md 第 5 步写进报告。

## 流程衔接

**流水线：** 通用
**位置：** 审查（写作之后）

| 时机 | 跳转到 | 命令 |
|---|---|---|
| 要修改查出的问题 | story-long-write / story-short-write | 返回对应写作 skill 修改 |
| 发现 AI 味需清理 | story-deslop | `/story-deslop` |
