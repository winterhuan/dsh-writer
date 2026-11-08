# DSH 写作子会话

在 DSH 上派写手、架构师、角色设计、审稿、查询或研究任务时使用本文件。Writer 不注册这些角色名；角色模板和方法资料由随包 `story-setup` 提供，执行使用 DSH 已有的 `subagent`。

## 检查能力并准备任务

1. 读取当前 `subagent` 工具的实际定义。DSH 0.2.2-rc.1 的必填参数是 `description`、`prompt`，可选 `cwd`；仅当 schema 暴露 `agent_preset` 且选项包含 `writer` 时才传 `writer`。不得把 `narrative-writer` 等模板名当成 `agent_preset`、`agent_type` 或 `subagent_type`。需要不同审稿模型且作者已选定时，只使用工具实际暴露的 `provider`、`model`、`reasoning_effort`；否则沿用当前配置。
2. 已经在子会话中，或缺少 `subagent` 时，按原流程主会话直做并说明实际模式。DSH 不以 `.claude/agents`、`.codex/agents` 或 `.story-deployed.agents_version` 判定可用性，不要求重部署来注册角色。
3. 从当前技能发现结果定位 `story-setup` 的实际目录。角色正文在 `references/templates/agents/<角色>.md`，方法资料在 `references/agent-references/`。支持 `story-architect`、`character-designer`、`narrative-writer`、`consistency-checker`、`story-explorer`、`story-researcher` 和 `chapter-extractor`。先确认目标模板与任务所需资料可读；缺失则报告准确路径并降级，不能假装角色已启动。
4. 将本流程原有 prompt、书目录、明确授权范围、文件路径、输出格式及必要上下文保存到书内 `.story/work/` 的任务文件。写作仍使用章节组装脚本的完整骨架；审稿必须带正文读取范围、文风裁决、rubric 摘要、统一 Findings Schema 和「只读，不改任何文件」。随后执行：

   ```sh
   node "<story-setup目录>/scripts/build-dsh-agent-prompt.mjs" --role narrative-writer --project "<书目录>" --task-file "<任务文件>"
   ```

   使用脚本的完整输出作为 `prompt`，并以书目录作为 `cwd`。脚本移除模板中其他宿主的模型、工具和 hooks 配置，将方法资料路径指向当前技能目录。它只组装文本，不启动子会话。

## 派发与回收

用实际 `subagent` 工具派发，并保存返回的 `subagentId`；这只代表已启动。需要审稿独立上下文时使用 `subagent`，不要换成继承父对话的 `subagent_fork`。后续补充和前后两组写作使用实际 `send_message` 工具及同一个子会话 ID，字段按当前 schema；后端不支持继续会话时把已落盘产物和后续任务交给新子会话，并说明没有延续原上下文。

收到完成事件后核对产物与要求，才报告完成。工具失败、必要能力不可用或角色不能读取资料时，说明原因并转主会话处理。`story-review` 的任一必需 reviewer 失败时，实际模式降为 solo 并重新完成审查；部分结果不能冒充 full/lean。独立子会话只说明上下文独立，不代表模型不同或审查绝对客观。
