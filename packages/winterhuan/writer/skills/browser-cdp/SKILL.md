---
name: browser-cdp
description: "Use when writing research or ranking scans need a real browser, including logged-in author pages. Supports Box (default) and Ego Lite (explicit choice) only. Handles backend selection, collector setup, login/CAPTCHA handoff and recovery. Trigger phrases: browser automation, 浏览器操作, 复用登录态, 扫榜需要浏览器, box, ego-browser."
metadata: {"openclaw":{"source":"https://github.com/zenstory-ai/oh-story-claudecode"}}
---
# 写作浏览器：Box / Ego

只支持 **Box** 和 **Ego Lite**。用户未指定时使用 Box；用户说「用 Ego」时使用 Ego。Box 不可用时报告原因，不能静默换后端。不要启动本机普通 Chrome、复制 Profile 或导出登录凭据。

## 选择与检查

采集脚本统一接受 `--browser box|ego`；优先级是命令参数、`WRITER_BROWSER` 环境变量、默认 `box`。Box 名称由 `--box`、`WRITER_BOX`、默认 `main` 依次决定。一个采集任务保持同一后端、同一 Box 和同一页面。

### Box（默认）

- 在执行采集脚本的机器上准备 Node.js 24 和 npm。脚本通过官方 `@simular-ai/box` CLI 的 `rsh` 操作云端浏览器；输出文件与 `.writer/browser-runs/` 检查点留在本地项目。大结果暂存在 Box，分段读回并校验后删除；单次结果上限 64 MiB，超限需缩小采集批次。
- CLI 登录与 Codex / DSH 的 MCP 登录独立。首次运行 `npx -y @simular-ai/box@0.2.0 login`，由用户在浏览器授权；已有 CLI 登录或启动环境中的 `BOX_TOKEN` 可直接使用。不要让用户把密钥粘贴到对话中。
- 默认使用名为 `main` 的 Box；其他名称通过 Box 控制台或 `box_list` 确认后传入 `--box`。Box 内需有 Node.js 24 和厂商的 `cocoonbox-chrome` 启动器。
- 下方探测会唤醒 Box、在其 Chrome 中打开示例页、读取正文，再关闭探测页。现有 Chrome 与登录态保留。

```bash
node {SKILL_DIR}/browser-cdp/scripts/browser-session.cjs probe
```

采集只通过 Box 内的回环 CDP 端口连接厂商 Chrome。启动器不可用、页面被关闭或 Chrome 重启时停止并报告，不寻找其他浏览器代替。当前 Box 采集 CLI 在 macOS 主机连接 Linux Box 上验证。

### Ego（用户选择）

加载官方 `ego-browser` skill，运行 `ego-browser skill` 阅读当前安装版本的指南。用户在 Ego Lite 自己的 Profile 中登录；每次采集拥有一个 TaskSpace。

```bash
node {SKILL_DIR}/browser-cdp/scripts/browser-session.cjs probe --browser ego
```

## 运行采集

先按长篇或短篇扫榜 skill 选择平台与参数。默认 Box，不需要安装 `agent-browser`；显式选择 Ego 时才需要 `ego-browser`。

```bash
# 默认 Box main
node {SKILL_DIR}/story-long-scan/scripts/ciweimao-rank-scraper.js --type all --outdir <目录>
# 显式选择 Ego
node {SKILL_DIR}/story-long-scan/scripts/ciweimao-rank-scraper.js --browser ego --type all --outdir <目录>
```

七个平台共用 `scripts/browser-session.cjs`。现有起点 `--mode cdp` 表示电脑版页面采集，浏览器仍由 `--browser` 决定。无需浏览器的网页请求路径保持不变。检查点绑定后端、Box、采集参数与解析器版本；不匹配时不能续跑。

## 普通浏览与资料研究

- Box 已接入宿主 MCP 时，按实际工具定义使用 `browser_navigate`、`browser_snapshot`、`browser_read`、`browser_click` 等。需要读取长正文时继续读取后续片段，不能把截取结果当成全文。
- 宿主只有终端工具时，可在本地 Node 脚本中加载 `scripts/browser-session.cjs`，使用 `createSession()`、`open(url)`、`evalJSON(js)`、`scroll(times, intervalMs)`。跨调用保留 `spaceId`，用 `createSession({ spaceId })` 接回同一页面，结束时 `endAndReport(tag)`。
- Ego 的通用操作遵循官方 `ego-browser` skill。
- 给 DSH 添加 Box MCP 时遵循 [Box 官方 DSH 插件说明](https://github.com/simular-ai/box-plugin/tree/main/dsh)。MCP 用于通用工具；采集脚本通过 CLI 登录，不会读取 DSH 凭据库。

## 登录、验证码与续接

采集器需要人工操作时会交接并保留页面。Box 在 [控制台](https://box.simular.ai/box)中操作；Ego 在对应 TaskSpace 中操作。用户完成登录或验证码并确认后，保持原命令参数，添加打印出的 `--browser`、`--box`（Box）和 `--space` 续接。交接后不要并发操作同一页面。

```bash
node {SKILL_DIR}/story-long-scan/scripts/qidian-rank-scraper.js --browser box --box main --mode cdp --space <id>
node {SKILL_DIR}/story-long-scan/scripts/qidian-rank-scraper.js --browser ego --mode cdp --space <id>
```

有检查点的任务同时保留 `--resume <runId>`，跳过已提交批次。`--space` 选择浏览器现场，`--resume` 选择本地采集数据，二者不能互相替代。

Token / Cookie 只在目标页面内使用，不得打印、写入采集结果或带入模型上下文。黑岩使用 `https://www.heiyan.com/all.html` 公开书库，无需管理后台账号。Box 与 Ego 的登录态独立，需要分别登录。

## 中断与清理

正常完成只关闭任务创建的页面；交接、超时或结果不明时保留现场，不自动重试或关闭浏览器。

Box 中断后先检查页面和远程会话状态：

```bash
node {SKILL_DIR}/browser-cdp/scripts/browser-session.cjs inspect --box main --space <id>
```

只有确认可以丢弃当前页面中未完成的操作时才运行 `recover`：它会刷新该任务页面，丢弃旧 JavaScript 上下文，再允许原采集命令续跑。恢复不会重新登录，也不会重建已关闭的页面。

```bash
node {SKILL_DIR}/browser-cdp/scripts/browser-session.cjs recover --box main --space <id>
```

Ego 超时按官方指南检查执行是否停止、页面是否响应，再续接同一 Space。Box 报 `SESSION_BUSY` 时先确认远程进程是否仍在执行；不要删锁或重复启动采集来绕过。无法恢复时报告保留的编号与原因，由用户在对应浏览器检查。
