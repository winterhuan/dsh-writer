---
name: story-setup
version: 1.3.6
description: "网文写作工具集基础设施部署与检查。为 DSH / Claude Code / OpenCode / Codex / Google Antigravity / ZCode / OpenClaw / Reasonix 提供内置适配；Web AI / 通用 Agent 可走 skills + AGENTS.md 文件模式。触发方式：/story-setup、$story-setup、「准备写书」「帮我搭一下环境」「配置写作项目」「检查写作环境」。"
metadata: {"openclaw":{"source":"https://github.com/zenstory-ai/oh-story-claudecode"}}
---
# story-setup：写作环境部署与检查

按当前宿主与作者请求选择一条流程。检查只读；作者已要求安装、更新或修复时完成相应流程与验证，不重复询问同一授权。

## 确定宿主与项目

系统提示、实际工具和技能来源表明当前是 DeepSeek Harness（DSH）时，采用 DSH 流程。其他情况按当前宿主处理；无法判断时只问正在使用哪个产品。项目里已有其他宿主目录不改变本次目标。

沿用作者指定的项目根，未指定则使用当前工作目录。当前目录是用户主目录、磁盘根、系统目录或本技能安装/源码目录时，先确认书稿所在目录再写入。

## 选择流程

| 当前宿主与请求 | 必须读取并完成 |
|---|---|
| DSH：`check`、检查部署、诊断助手不可用 | [DSH 诊断](references/diagnostics-dsh.md)；报告实际技能来源与可用能力后结束 |
| DSH：安装、更新或修复项目配置 | [DSH 部署](references/deploy-dsh.md)；完成其中的验证与报告后结束 |
| 其他宿主：只检查 | [其他宿主诊断](references/diagnostics.md)；不执行部署 |
| 其他宿主：安装、更新或修复 | [其他宿主部署流程](references/deploy-other-hosts.md)，再按其中的目标表读取对应部署文件 |

DSH 不部署 Claude Code 的 `.claude/hooks` 或 Codex 的 `.codex/hooks.json`，也不启动独立 Dashboard。只有作者明确要求同时配置其他宿主时，才另读其他宿主部署流程并仅处理点名目标。DSH 的工具与角色可用性以实际运行时为准，不用其他宿主的目录或 `.story-deployed.agents_version` 判定。

## 文件保护与交付

保留书稿、设定、大纲、追踪、`.active-book` 和用户自有配置。受管文件按目标清单更新，共同维护的文件按管理块合并；复制与覆盖前执行所选流程的路径检查与备份规则。不要仅为检查而创建标记、同步技能或执行修复。

完成后先说明现在能做什么、还需作者做什么，再给部署位置、实际变更与未完成项。可以开始写作时指向 `/story-long-write` 或 `/story-short-write`；导入旧稿用 `/story-import`，需要登录态采集时用 `/browser-cdp`。
