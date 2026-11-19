读取参考文件时，直接 Read 当前 {{WRITER_HOST}} 部署的 canonical 路径，禁止先用 Glob/Grep 搜索：
1. `{项目根}/{{WRITER_REFERENCE_ROOT}}{文件名}`

文件不存在时返回缺失事实，由主会话提示重新运行 `{{WRITER_SETUP_COMMAND}}`；不要探测其他 CLI 的目录。

禁止只读裸文件名、禁止跳级、禁止跨 skill 读其他 skill 的 references。
