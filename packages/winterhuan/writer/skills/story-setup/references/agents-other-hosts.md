# 其他宿主的写作助手

仅在 DSH 之外准备派发写作、审稿、查询或分析助手时读取。DSH 使用 [原生子会话](dsh-agents.md)，不执行本文件的部署版本和角色目录检查。

## 版本提示

本包 `agents_version: 39`。读取项目根 `.story-deployed` 的 `agents_version`：等于本包版本时不提示；标记缺失、字段缺失、非整数或版本不同，只提示，不阻断派发。缺失或较旧时建议运行 `/story-setup` 后新开会话，ZCode 先更新或启用插件；项目版本较新时，先更新 oh-story-claudecode，不用本地旧包降级覆盖。

对白用一句话说明助手部署版本待核对；原始版本信息只放报告最末「技术备注：Notice: agents bundle 版本不匹配（项目 {N}，本版 39）」。只有实际工具、角色或调用不可用才降级，版本不同本身不代表助手不可用。

## 检查本端角色与工具

已在子代理中时直接处理当前任务，不再次派发。主会话只核对本次需要的角色和当前宿主提供的工具，不扫描其他宿主目录，也不因为另一个宿主的标记存在而改变调用方式。

| 当前宿主 | 角色来源与必要字段 | 调用 |
|---|---|---|
| Claude Code | `.claude/agents/{role}.md`；可解析 frontmatter，`name` 与角色一致，正文非空 | 当前 Agent/Task 工具的 `subagent_type` |
| OpenCode | `.opencode/agents/{role}.md`；可解析 frontmatter，`mode: subagent`、复数 `permissions` 规则列表；旧单数 `permission` 提示重部署 | `subagent` 的 `agent` |
| Codex | `.codex/agents/{role}.toml`；可解析 TOML，`name` 与角色一致，含 `description`、`developer_instructions` | 当前工具的 `agent_type` |
| Antigravity | `.agents/agents/{role}/agent.md`；可解析 frontmatter，`name` 一致、`mainAgent: false`、`subagent: true`、`tools` 非空 | `invoke_subagent` 的 `TypeName` |
| ZCode | 启用插件注册的同名角色；可读定义有 `name`、`description` 和正文；不可直接读取时以运行时注册为准，不要求 `.zcode/agents` | `Agent` 的实际 schema |
| OpenClaw、Reasonix、通用 Agent / Web AI | 以当前运行时实际暴露的角色和调用能力为准；只有技能文件不代表有原生助手 | 按实际工具 schema；无此能力则主会话处理 |

文件存在只表示定义可读，派发是否成功以调用结果为准。任务需要完整说明目录、授权文件、必要背景与交付要求；审查任务还需明确只读，不继承父对话来代替任务说明。

## 失败与交付

角色缺失、定义异常、工具不可用、返回 unknown agent 或派发失败时，按调用流程转主会话处理。面向作者说明实际原因；技术详情只进报告最后一行，通用回执为 `Fallback: project custom agents unavailable -> solo`，有专用报告模板时按其分类填写。审稿任一必需角色失败时，实际模式降为 solo 并重新审查，部分结果不能冒充 full/lean。

正常由主会话写作无需提示降级；作者明确要助手或流程本来需要委派却不可用时，说明这次由主会话完成。返回启动标识不代表完成；收到结果后核对产物与要求，再交付作者。
