---
description: "为 DSH 增加写作模式：挂载 oh-story 技能，并在侧栏浏览和编辑拆文库、写作项目与扫榜记录。"
kind: "package-bundle"
---

# @winterhuan/dsh-writer

[English](README.md) | 中文

## 概要

本 bundle 为 DSH 增加写作预设、oh-story 技能与工作区侧栏。作者可以编辑文稿并恢复浏览器草稿，查看章节进度和版本化审稿，比较修改差异。技能默认来自插件包；项目同名副本优先。同步和撤销同步把原副本保留为可恢复备份。会话、文件访问和子代理由 DSH 提供，书内文件仍是数据来源。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [延伸阅读](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与待办](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

通过[插件市场](https://winterhuan.github.io/dsh-creative/index.json)安装预构建版本，或在 DSH `0.2.2-rc.1` 中安装以下固定 Git 提交：

```sh
dsh plugin --profile market add 'git+https://github.com/winterhuan/dsh-writer.git#v0.1.9&path:/packages/winterhuan/writer'
```

将 `market` 替换为你已有的 DSH profile 名称。

### 安装到 profile

先构建本仓库，再把本地 bundle 装进 DSH `0.2.2-rc.1` 的 profile。把 `web` 换成你的 profile 名。

```sh
pnpm --filter @winterhuan/dsh-writer build
dsh plugin --profile web add packages/winterhuan/writer
```

安装或重新构建后重启 profile。补丁增加 `writer` Host 行和 `preset-writer` 行。模式 id 是 `writer`，菜单名是写作模式。

### 选择技能挂载

`skillMount` 只能是 `workspace` 或 `bundled`，默认 `bundled`。两种模式不会同时生效。

`bundled` 不会自动拷贝技能。预设里的 skill-filesystem 行把 `bundledSkillDir` 设为包内 `skills` 的绝对路径，用 `createRequire(baseUrl).resolve('@winterhuan/dsh-writer/package.json')` 定位。skill-filesystem 把这个根当作可信宿主目录。另一行 skill-filesystem 被禁用，因此两行不会一起加载。

`workspace` 不设置 `bundledSkillDir`。会话第一次进入写作模式时，Host 把包内每个技能目录拷到 `<项目>/.agents/skills/<name>/`。项目是含 `.git` 的最近祖先；没有时用会话目录。目标目录已存在则不覆盖。技能靠项目根的 `.agents/skills` 被发现。

两种模式都支持 `/writer-skills-status`，显示包与 oh-story 版本、实际生效路径及与包内资源的差异。`/writer-sync-skills` 先暂存包内技能，再把现有 `.agents/skills` 副本移入 `.agents/writer-skill-backups/<批次>` 后替换。`/writer-unsync-skills` 只把包内同名技能移入备份，其它技能保留。`/writer-restore-skills <批次>` 恢复备份，并将被替换的当前副本保存为另一批次。命令返回备份路径，拒绝符号链接目标和自复制。`.dsh/skills` 覆盖只诊断、不修改。修改 `skillMount` 后需要重启。

```yaml
- id: writer
  name: '@winterhuan/dsh-writer'
  config:
    skillMount: workspace
```

`makersApiKeyEnv` 是明确要求朱雀检测时使用的环境变量名，默认 `MAKERS_API_KEY`。`gptImageApiKeyEnv` 是封面生图用的环境变量名，默认 `GPT_IMAGE_API_KEY`。Host 只保存名字，并分别镜像到 `WRITER_ZHUQUE_KEY_ENV` / `WRITER_COVER_KEY_ENV`。安装本 Host 行后，插件页会出现「写作」入口，密钥经 DSH 凭据服务绑定（不写入设置文件）。`story-zhuque` 与 `story-cover`（API 通路）读取对应变量；作者没有明确要求时不运行。 设置页还可保存封面生图的 `gptImageBaseUrl`（普通设置字段；Host 注入 `GPT_IMAGE_BASE_URL`，设置页的值优先于 shell 导出，留空则用 shell 值或默认）。生图模型无需设置：skill 按 `GPT_IMAGE_MODEL` → 默认 `gpt-image-2` 兜底。

### 扫榜、拆文与封面技能

这些随包技能由作者主动触发，不挡写章。

| 技能 | 触发 | 说明 |
|:-----|:-----|:-----|
| `story-long-scan` | `/story-long-scan` | 长篇扫榜。实时榜单默认用 Box；可传 `--browser ego` 选择 Ego（`browser-cdp`）。 |
| `story-short-scan` | `/story-short-scan` | 短篇扫榜。浏览器依赖同上。 |
| `story-long-analyze` | `/story-long-analyze` | 长篇拆文。脚本需要 Python 3。 |
| `story-short-analyze` | `/story-short-analyze` | 短篇拆文。需要 Python 3。 |
| `story-cover` | `/story-cover` | 仅提示词不需要 Key。在 DSH 上要出图时用上面的 GPT Image 凭据。Codex 宿主仍可用 `$imagegen`。 |
| `browser-cdp` | `/browser-cdp` | 浏览器入口：默认 Box、可选 Ego、登录/验证码交接与采集恢复。 |

### 使用侧栏

在 `writer` 会话中打开写作侧栏。拆文库、项目和按日期保存的扫榜记录分别提供 Tab、懒加载目录树和文件名搜索。编辑器支持 `.md`、`.txt`、`.json`、`.yaml`、`.yml`、`.toml`，提供 Markdown 预览、行号、原换行保留，以及相对载入版本的修改对比。Cmd/Ctrl+S 保存；焦点不在对话输入时，Cmd/Ctrl+K 聚焦文件名搜索。

未保存正文及其磁盘基线按工作区和文件路径保存在当前浏览器。收起侧栏保留编辑器，重新打开页面恢复上次文稿和草稿。读取或保存失败保留草稿。存储失败持续提示，带未保存修改离开页面会触发浏览器提醒。另一会话更新了恢复副本时会报告冲突，不覆盖它。恢复仅限当前浏览器源；存储被禁用或已满时可能不可用，不能代替书稿备份。

保存必须携带上次读取的版本号。迟到的读取或保存回包不会更新另一文稿或会话。磁盘变更时保留本地草稿并暂停保存，直到作者重新载入磁盘版本。换文件前询问是否放弃未保存修改。扫榜 Tab 打开日期记录中的结论、聚合表或可读取榜单。

### 章节进度与审稿

在项目视图展开「章节进度与审稿」。选择作品和章节，或打开章节正文来查看。未选正文时，面板使用 `.active-book` 或唯一发现的作品，并默认显示下一未提交章。刷新重新读取文件，不放弃编辑器草稿。

进度来自 `追踪/_tracking-state.json`，包含已提交章号和下一章承诺。`storyctl.py chapter check` 将机械检查写入 `.story/checks/第NNN章.json`，正文或细纲指纹变化使结果过期。记录缺失或不可读不等于通过。可以打开 `.story/work/第NNN章/` 中的未完成材料，再在对话里要求继续该章。

`story-review` 将带引文的意见记录到 `.story/reviews/第NNN章.json`，短篇使用 `正文.json`。记录包含审稿时正文指纹与文本、严重度、行号、引文、解释和建议。侧栏分别显示机械检查与内容审稿，并比较当前文本和审稿版本。正文变化（包括未保存草稿）会将审稿标记为过期，不再把旧的接受或处理结论显示为当前有效。

在对话中要求接受某条意见或重新核对修订。审稿记录器要求当前指纹和每项决定的理由，过期记录必须重新审查。语义意见不增加强制章节提交门禁。版本化审稿最多记录 1 MiB 正文与 100 条意见；超出时应拆分请求或只给报告，不宣称已有版本化记录。

### DSH 写作角色

`story-setup` 识别 DSH 并跳过其他宿主的 hooks，检查模式诊断实际技能来源。写作、研究、拆文和审稿通过组装后的包内角色说明调用 DSH 原生 `subagent`，不要求其它软件的项目角色目录。子会话接收明确的工作区、职责、参考路径和任务。缺少工具或运行失败时如实报告由主会话直接执行。Writer 使用 DSH 侧栏与插件更新流程。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

[cordis.patch.yml](cordis.patch.yml) 插入 Host 和预设。预设包含 persona、说明、时间、shell、文件系统、搜索、jobs、技能、压缩、委派、提问、待办和网页。它不加载 `agent` 入口，也不注册 skill provider。[src/index.ts](src/index.ts) 负责挂载技能、登记 `/writer-sync-skills` 与 `/writer-unsync-skills`，并挂上 `PUT /writer/file`。[src/client/sidebar.tsx](src/client/sidebar.tsx) 登记侧栏类型和正文 slot，只在会话预设为 `writer` 时显示。

</details>

-----

<a id="further-exploration"></a>
## 延伸阅读

- [写作子系统](https://github.com/winterhuan/dsh-creative/blob/upstream-conventions/docs/subsystems/writer.zh.md)
- [右侧栏](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.1/docs/subsystems/sidebar-right.zh.md)
- [文件系统技能](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.1/packages/skill/skill-filesystem/README.zh.md)

-----

<a id="model-experience"></a>
## 模型体验

### 写作预设

#### 模型看到的内容

预设为 `writer` 的会话会看到该预设的 persona，以及 oh-story 技能目录，其中包括 `story`、`story-long-write`、`story-short-write`、`story-deslop`、`story-zhuque`、扫榜/拆文/封面技能和 `browser-cdp`。persona 要求按任务加载对应技能，在 DSH 上跑 `story-setup` 时跳过 Claude Code 与 Codex 的 hooks，并且不要启动 oh-story Dashboard。`story-zhuque` 只用于作者明确提出的朱雀检测。侧栏保存不是模型工具。 DSH 任务技能按需读取原生角色派发说明。角色组装器返回完整提示词文本，调用方将它连同参考路径交给子会话。审稿说明要求分析前取得正文指纹、完成后写入经过校验的记录。技能诊断和恢复命令返回生效路径及备份位置。这些操作只在调用时增加上下文。

#### Token 影响

写作会话的每一轮都会带上 persona 前缀。加载某个技能时，那一轮会加上该技能的说明。其他预设的会话不会带上这段 persona，也不会因此强制拷贝技能。

#### KV Cache 影响

persona 在该预设修订的生命周期内保持稳定。默认 `bundled` 时技能目录来自包内，跨会话保持稳定。`workspace` 模式下第一次进入写作模式时把技能拷进 `.agents/skills`，可能让后面某一轮的技能目录发生变化。`/writer-sync-skills` 或 `/writer-unsync-skills` 同样会改变项目侧发现到的技能。切换 `skillMount` 只在重启后生效，不会改写正在进行的提示。

## 已知限制与待办
<a id="known-limitations-and-deferred-work"></a>

- 不提供文件删除和自动合稿。浏览器草稿不跨设备或浏览器源共享。打开面板、编辑器保存后或手动刷新时更新报告；外部文件修改需要刷新。机械检查和版本指纹不认证文学质量或审稿独立性。项目副本在更新或移出之前仍优先于包内技能。朱雀与封面生图仍须作者明确请求并使用各自配置的凭据。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>给维护者的工作记录——点击展开</summary>

包内技能来自纳入时的 `zenstory-ai/oh-story-claudecode` 最新树，另加本包的 `story-zhuque`。oh-story 许可证在 `skills/LICENSE.oh-story`。

</details>
