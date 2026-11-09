# DSH 写作子会话

在 DSH 上派写手、架构师、角色设计、审稿、查询或研究任务时使用 `writer_agent`。角色是可复用定义，每次调用创建一个独立 Agent 实例；多个角色共享当前 Writer Preset。

## 准备与派发

1. 按本流程选择 `role`：`story-architect`、`character-designer`、`narrative-writer`、`consistency-checker`、`story-explorer`、`story-researcher` 或 `chapter-extractor`。角色是否可用由工具检查；不检查其他宿主的角色目录或 `.story-deployed.agents_version`。
2. 把完整任务要求传给 `prompt`，包括书目录、授权文件范围、参考路径、必要背景和交付格式；`description` 写简短任务名，`cwd` 指向书目录。写作仍需按章节组装流程填写完整骨架，不能用一句概括代替。审稿必须带正文读取范围、文风裁决、rubric 摘要、统一 Findings Schema 和「只读，不改任何文件」。任务文件可以继续保存在 `.story/work/`。
3. 调用 `writer_agent`。插件从当前会话生效的 `story-setup` 加载角色，保留项目技能覆盖，将角色正文和任务一起交给 DSH 原生 `subagent`。主会话不用运行角色组装脚本，也不用转抄角色正文。其他宿主的模型、工具和 hooks 配置不用于 DSH；只读要求是任务约束，不代表新增的只读沙箱。
4. 默认沿用原生子会话的模型配置。作者已明确指定其他模型时，按实际工具 schema 传 `provider`、`model` 和可选 `reasoning_effort`；DSH 的模型选择策略仍会检查这些参数。

## 续接与新建

主会话使用返回的 `subagentId` 关联本次任务、续接和中断，无需作者保存或传递 ID，也不把角色永久绑定到该 ID。

- 同一任务的后续步骤、补充要求或修订刚交的稿件：用原生 `send_message` 续接，字段按当前 schema。同一章分前后两组交付时，主会话把前组字数检查结果和后组要求交回同一个 ID。
- 新的独立任务或需要独立上下文的审稿：调用 `writer_agent` 创建新实例，不因角色相同而复用旧 ID；独立审稿不使用继承父对话的 `subagent_fork`。

`list_agents` 查看可继续子级，`interrupt_agent` 请求中断。派发返回 ID 只表示已启动，`send_message` 返回只表示消息已投递；两者都不代表任务已完成。

收到完成事件后核对产物与要求，才报告完成。已经在子会话中时不要再派子代理。工具缺失、角色或资料不可读、派发或续接失败时说明原因，由主会话按技能流程处理；不得假装角色已经启动或原上下文已经恢复。`story-review` 的任一必需 reviewer 失败时，实际模式降为 solo 并重新完成审查，部分结果不能冒充 full/lean。独立子会话不代表模型不同或审查绝对客观。
