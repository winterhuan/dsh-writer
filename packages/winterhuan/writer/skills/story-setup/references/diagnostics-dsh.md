# DSH 写作环境诊断

只检查并报告，不部署、不同步、不启动工作台服务。

1. 执行 `/writer-skills-status`。如果当前工具无法调用斜杠命令，使用 Host 注入的同一诊断入口：

   ```sh
   node "$DSH_WRITER_SKILLS_STATUS_SCRIPT" --workspace "<当前工作区>" --json
   ```

   PowerShell 使用 `$env:DSH_WRITER_SKILLS_STATUS_SCRIPT`。变量缺失或脚本不存在时请作者从 DSH 对话输入框运行 `/writer-skills-status`，不要猜插件路径。命令读取当前会话实际目录；CLI 按 Writer 挂载配置重新执行 DSH 文件系统技能发现，不能代表其他自定义运行时 provider。
2. 报告 Writer 包版本、oh-story 来源版本、`bundled`/`workspace` 挂载，以及项目副本与包的差异。以每个技能的 `effectivePath` 为准；`bundled` 仍允许项目 `.dsh/skills`、`.agents/skills` 同名副本优先，包更新不等于当前技能已更新。无法读取的副本单列，不推断为一致。
3. 要派助手时，读取 [DSH 子会话说明](dsh-agents.md)，核对 `writer_agent` 是否可见；角色来源以当前生效的 `story-setup` 为准。`.story-deployed` 是项目部署记录，不是角色注册或工具可用证明。
4. 给出与发现相符的处理办法：更新安装包用 DSH 插件页；刷新 `.agents/skills` 用 `/writer-sync-skills`；移出项目副本用 `/writer-unsync-skills`；恢复备份用 `/writer-restore-skills <批次名>`。同步与移出都会保留旧副本，命令返回备份路径。`.dsh/skills` 的副本优先级更高，需要作者决定后单独处理；这几个命令不修改它。

## 运行环境与长篇追踪

实际执行 `node --version`，并按 `python3`、`python`、`py -3` 找到可运行的 Python 3。缺失时说明受影响的写作检查，不自动安装。涉及已有长篇时，按作者指定书目或 `.active-book` 定位书目录，执行当前 `story-long-write/scripts/tracking_commit.py check --project "<书目录>"`，报告状态和派生视图是否一致；不调用 init、commit 或迁移修复。没有书项目时跳过，不作为部署失败。
