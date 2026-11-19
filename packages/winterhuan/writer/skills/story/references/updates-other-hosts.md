# 其他宿主的版本检查与更新

本文件不用于 DSH。DSH 更新入口由 [story](../SKILL.md#版本更新检查) 说明。

以下步骤仅供其他宿主使用。用户问“有没有新版本”“检查更新”“升级”时执行。**先报告版本；仅问检查时不安装，已明确要求更新时继续执行。**

1. **当前版本**：从当前加载的 `story/SKILL.md` 所在目录读取 `VERSION` 文件；缺失则视为未知。本 skill 在写作项目里（如项目下的 `skills/`、`.agents/skills/`、`.zcode/skills/`）时，读到的是项目副本的版本。
2. **最新版本**：优先 `gh release view --json tagName,name,url -R zenstory-ai/oh-story-claudecode` 取 `tagName`；无 gh 用 `curl -fsS --max-time 5 https://api.github.com/repos/zenstory-ai/oh-story-claudecode/releases/latest` 取 `.tag_name`（jq 或 grep）。查不到 → 告知"暂时拉不到最新版本，可手动看 [Releases](https://github.com/zenstory-ai/oh-story-claudecode/releases)"，不报错。
3. **比较**：当前版本已知时，去掉 `v` 前缀按语义版本比较（major.minor.patch）；未知时只展示最新稳定版，不判定是否已最新。`gh release` 默认取 latest 稳定版，不含 pre-release。
4. **告知**：
   - 已最新 → 「已是最新版 vX.Y.Z」。
   - 有新版或当前版本未知 → 展示已知版本与 [Releases](https://github.com/zenstory-ai/oh-story-claudecode/releases)/[CHANGELOG](https://github.com/zenstory-ai/oh-story-claudecode/blob/main/CHANGELOG.md)，有 release notes 时附更新要点，作者已要求更新时继续；否则用宿主可用的提问方式问「现在更新吗？」。选先不 → 不动，告知随时可再来。
5. **更新**（用户同意后）：按本 skill 目录的位置判断安装方式。
   - 在插件目录里（路径含 `plugins/`）：Claude Code 跑 `claude plugin marketplace update oh-story-skills` 再跑 `claude plugin update oh-story@oh-story-skills`，重启后生效；ZCode 在 Plugin Management 里刷新市场后更新 `oh-story`。
   - 用 `npx skills` 装在全局或当前目录：重跑 `npx skills add zenstory-ai/oh-story-claudecode -y -g`（原来装在当前目录的去掉 `-g`）。
   - 其他安装方式（如 ClawHub）：按原来的方式重装最新版。
   - 本 skill 在写作项目里：先用上面对应的方式更新安装包，再用新装的包在项目根运行 `/story-setup`，项目里的副本才会换成新版；OpenClaw、Reasonix 和通用文件模式下项目里跑的就是这份旧副本，要用新包手动覆盖项目 `skills/` 下的 14 个 skill 目录。

   更新完提示：已部署过的项目在项目根重跑 `/story-setup` 同步 hooks、agents 和参考资料，然后**新开一个会话**，写作助手才会重新加载。
