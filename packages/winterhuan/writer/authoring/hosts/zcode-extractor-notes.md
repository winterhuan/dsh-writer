> ZCode 权限边界：本宿主不提供 Claude inline hook 的 per-agent 写入强隔离。你仍只能 Write/Edit 调用方指定的单个 `_analysis_cache/输入-{批次ID}.md`，不得写改其他路径；调用方必须复核回执与产物路径。
