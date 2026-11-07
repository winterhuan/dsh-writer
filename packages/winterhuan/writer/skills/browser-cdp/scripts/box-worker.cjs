/** Runs inside Box through its official rsh command. Only Box's managed Chrome is used. */
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawn } = require("node:child_process");
const { createHash } = require("node:crypto");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function fail(code, message) { throw Object.assign(new Error(message), { code }); }
const stateRoot = () => path.join(os.homedir(), ".local", "state", "dsh-writer", "browser");
const MAX_RESULT_BYTES = 64 * 1024 * 1024;
const INLINE_BYTES = 256 * 1024;
const CHUNK_BYTES = 128 * 1024;

function resultPath(root, id, token) {
  if (!/^[a-f0-9-]{36}$/.test(token)) fail("BAD_RESULT", "Box 结果编号无效。");
  return path.join(root, `${id}.${token}.result`);
}

/** Keep each rsh response small; never repeat page evaluation to retrieve its result. */
function packResult(input, data, root = stateRoot()) {
  if (data === undefined) return { data };
  const bytes = Buffer.from(JSON.stringify(data));
  if (bytes.length > MAX_RESULT_BYTES) fail("RESULT_TOO_LARGE", "Box 结果超过 64 MiB，请缩小采集批次。");
  if (bytes.length <= INLINE_BYTES) return { data };
  const file = resultPath(root, input.id, input.token);
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  fs.writeFileSync(file, bytes, { mode: 0o600, flag: "wx" });
  return { dataFile: { token: input.token, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") } };
}

async function connectChrome() {
  const endpoint = "http://127.0.0.1:9222";
  const version = () => fetch(`${endpoint}/json/version`, { signal: AbortSignal.timeout(2000) }).then(r => r.json());
  let info;
  try { info = await version(); } catch {
    // The vendor launcher owns the profile and port. Never kill Chrome or copy a profile.
    if (process.platform !== "linux" || !fs.existsSync("/usr/local/bin/cocoonbox-chrome")) {
      fail("NOT_BOX", "Box 的 Chrome 启动器不可用；请在 Box 控制台检查环境。");
    }
    const child = spawn("/usr/local/bin/cocoonbox-chrome", [], { detached: true, stdio: "ignore" });
    child.on("error", () => {});
    child.unref();
    for (let i = 0; i < 40; i++) {
      await delay(250);
      try { info = await version(); break; } catch {}
    }
  }
  if (!info) fail("CHROME_UNAVAILABLE", "Box Chrome 的 CDP 未就绪；请在 Box 控制台打开 Chrome 后检查。");
  const socket = new WebSocket(info.webSocketDebuggerUrl);
  const pending = new Map();
  let sequence = 0;
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    const entry = pending.get(message.id);
    if (!entry) return;
    pending.delete(message.id);
    clearTimeout(entry.timer);
    // Protocol errors may include page data. Do not echo them into collector diagnostics.
    if (message.error) entry.reject(Object.assign(new Error("Box CDP 操作失败。"), { code: "CDP_ERROR" }));
    else entry.resolve(message.result);
  });
  const rejectPending = () => {
    for (const entry of pending.values()) {
      clearTimeout(entry.timer);
      entry.reject(Object.assign(new Error("Box Chrome 连接已断开。"), { code: "CONNECTION_CLOSED" }));
    }
    pending.clear();
  };
  socket.addEventListener("close", rejectPending);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { socket.close(); reject(new Error("Box CDP 连接超时。")); }, 10000);
    socket.addEventListener("open", () => { clearTimeout(timer); resolve(); }, { once: true });
    socket.addEventListener("error", () => { clearTimeout(timer); reject(new Error("Box CDP 连接失败。")); }, { once: true });
  });
  return {
    identity: info.webSocketDebuggerUrl,
    async send(method, params = {}, sessionId) {
      const id = ++sequence;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(Object.assign(new Error("Box 页面操作超时；现场已保留。"), { code: "TIMEOUT" }));
        }, 30000);
        pending.set(id, { resolve, reject, timer });
        socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
      });
    },
    close() { socket.close(); rejectPending(); },
  };
}

/** Persistent ownership survives CLI exits; an unfinished operation requires explicit recovery. */
async function boxOperation(input, dependencies = {}) {
  const { id, action, value, resume } = input;
  if (!Number.isSafeInteger(id) || id < 1) fail("BAD_SESSION", "Box 会话编号无效。");
  if (!["open", "evaluate", "inspect", "handoff", "takeover", "recover", "finish", "result-read", "result-delete"].includes(action)) fail("BAD_ACTION", "不支持的 Box 操作。");
  const root = dependencies.root || stateRoot();
  if (action === "result-read" || action === "result-delete") {
    const file = resultPath(root, id, value.token);
    if (action === "result-delete") { fs.unlinkSync(file); return { deleted: true }; }
    if (!Number.isSafeInteger(value.offset) || value.offset < 0 || value.offset >= MAX_RESULT_BYTES) fail("BAD_RESULT", "Box 结果偏移无效。");
    const buffer = Buffer.alloc(CHUNK_BYTES);
    const fd = fs.openSync(file, "r");
    try {
      const size = fs.readSync(fd, buffer, 0, buffer.length, value.offset);
      return { offset: value.offset, chunk: buffer.subarray(0, size).toString("base64") };
    } finally { fs.closeSync(fd); }
  }
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  const file = path.join(root, `${id}.json`);
  const lock = `${file}.lock`;
  try { fs.mkdirSync(lock); } catch { fail("SESSION_BUSY", "Box 会话仍有操作或遗留锁；请检查现场，勿并发续跑。"); }
  let chrome;
  let state;
  const save = () => {
    fs.writeFileSync(`${file}.tmp`, JSON.stringify(state), { mode: 0o600 });
    fs.renameSync(`${file}.tmp`, file);
  };
  try {
    if (fs.existsSync(file)) state = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!state && (resume || action !== "open")) fail("NO_SESSION", "Box 会话不存在；不能用新标签页替代续接现场。");
    if (state?.ended) fail("SESSION_ENDED", "Box 会话已结束。");
    if (state?.inFlight && !["inspect", "recover"].includes(action)) fail("RECOVERY_REQUIRED", "Box 上次操作结果不明；先 inspect，确认后 recover 再续跑。");
    if (state?.handedOff && !["inspect", "takeover"].includes(action)) fail("HANDED_OFF", "Box 页面已交给用户；用户确认后才能用 --space 续接。");
    chrome = await (dependencies.connect || connectChrome)();
    if (!state) {
      state = { browser: chrome.identity, targetId: null, inFlight: true, handedOff: false, ended: false };
      save();
      const created = await chrome.send("Target.createTarget", { url: "about:blank", newWindow: true });
      state.targetId = created.targetId;
      save();
    } else if (state.browser !== chrome.identity) fail("BROWSER_CHANGED", "Box Chrome 已重启；原会话不可续接，请检查后新建采集任务。");
    const { targetInfos } = await chrome.send("Target.getTargets");
    const target = targetInfos.find(t => t.targetId === state.targetId);
    if (!target) fail("PAGE_CLOSED", "Box 采集页面已关闭；不会选择其他用户标签页。");
    const describe = () => ({ spaceId: id, ownership: state.handedOff ? "user" : "agent", uncertain: state.inFlight, pages: [{ label: "p1", url: target.url }] });
    if (action === "inspect") return describe();
    state.inFlight = true;
    save();
    let result;
    if (action === "finish") {
      const closed = await chrome.send("Target.closeTarget", { targetId: state.targetId });
      if (!closed.success) fail("CLOSE_FAILED", "Box 采集页面未能关闭。");
      state.ended = true;
      result = { finished: true };
    } else if (action === "handoff" || action === "takeover") {
      if (action === "handoff") await chrome.send("Target.activateTarget", { targetId: state.targetId });
      state.handedOff = action === "handoff";
      result = { ...describe(), uncertain: false };
    } else {
      const { sessionId } = await chrome.send("Target.attachToTarget", { targetId: state.targetId, flatten: true });
      const send = (method, params) => chrome.send(method, params, sessionId);
      if (action === "evaluate") {
        const evaluated = await send("Runtime.evaluate", { expression: String(value), awaitPromise: true, returnByValue: true });
        if (evaluated.exceptionDetails) fail("PAGE_SCRIPT", "页面脚本执行失败；请检查页面状态，异常正文不写入日志。");
        result = evaluated.result.value;
      } else {
        await send("Page.enable");
        // Reload is an explicit recovery action: it discards the old JavaScript context.
        let previousLoader;
        let expectedLoader;
        if (action === "recover") {
          previousLoader = (await send("Page.getFrameTree")).frameTree.frame.loaderId;
          await send("Page.reload", { ignoreCache: false });
        } else {
          const navigation = await send("Page.navigate", { url: String(value) });
          if (navigation.errorText) fail("NAVIGATION", "Box 页面导航失败；请检查目标网站和 Box 网络。");
          expectedLoader = navigation.loaderId;
        }
        let loaded = false;
        for (let i = 0; i < 150; i++) {
          await delay(100);
          const loader = (await send("Page.getFrameTree")).frameTree.frame.loaderId;
          if ((expectedLoader && loader !== expectedLoader) || (previousLoader && loader === previousLoader)) continue;
          const ready = await send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true });
          // Collectors wait for their own content; advertising requests must not hold DOM navigation open.
          if (["interactive", "complete"].includes(ready.result.value)) { loaded = true; break; }
        }
        if (!loaded) fail("PAGE_LOADING", "Box 页面尚未加载完成；请检查现场后恢复。");
        const page = await send("Runtime.evaluate", { expression: "({url:location.href,title:document.title})", returnByValue: true });
        result = page.result.value;
      }
    }
    state.inFlight = false;
    save();
    return result;
  } finally {
    chrome?.close();
    fs.rmdirSync(lock);
  }
}

module.exports = { boxOperation, packResult };
