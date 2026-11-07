/** Writer browser selection: Box by default, Ego only when explicitly selected. */
"use strict";

const ego = require("./ego-session.cjs");
const { BoxSession } = require("./box-session.cjs");

function selection(args = process.argv.slice(2), env = process.env) {
  for (const flag of ["--browser", "--box", "--space"]) {
    if (args.some(arg => arg === flag || arg.startsWith(`${flag}=`)) && (!ego.getArg(args, flag) || ego.getArg(args, flag).startsWith("--"))) throw new Error(`${flag} 缺少参数。`);
  }
  const browser = ego.getArg(args, "--browser") || env.WRITER_BROWSER || "box";
  if (!["box", "ego"].includes(browser)) throw new Error("--browser 只支持 box 或 ego。");
  const raw = ego.getArg(args, "--space");
  const spaceId = raw === null ? null : Number(raw);
  if (raw !== null && (!Number.isSafeInteger(spaceId) || spaceId < 1)) throw new Error("--space 需要有效的会话编号。");
  return { browser, box: ego.getArg(args, "--box") || env.WRITER_BOX || "main", spaceId };
}

function createSession(options = {}) {
  const selected = { ...selection(), ...options };
  if (!["box", "ego"].includes(selected.browser)) throw new Error("browser 只支持 box 或 ego。");
  const session = selected.browser === "ego" ? ego.createSession(selected) : new BoxSession(selected);
  session.backend = selected.browser;
  if (selected.spaceId != null && options.takeOver !== false) session.takeOver();
  return session;
}

function openRunStore(options = {}) {
  const selected = selection();
  return ego.openRunStore({ ...options, params: { ...options.params, browser: selected.browser, ...(selected.browser === "box" ? { box: selected.box } : {}) } });
}

function runCli(main, label) {
  return ego.runCli(() => { selection(); return main(); }, label);
}

module.exports = { ...ego, createSession, openRunStore, selection, runCli };

if (require.main === module) {
  let session;
  try {
    const action = process.argv[2] || "probe";
    if (!["probe", "inspect", "recover", "finish"].includes(action)) throw new Error("操作仅支持 probe、inspect、recover、finish。");
    if (action !== "probe" && selection().spaceId === null) throw new Error(`${action} 需要 --space。`);
    session = createSession({ takeOver: false });
    if (action === "probe") {
      session.open("https://example.com");
      console.log(JSON.stringify({ browser: session.backend, ...session.evalJSON("({url:location.href,title:document.title,text:document.body.innerText.slice(0,200)})") }));
      const ended = session.endAndReport("probe");
      if (!ended.finished) process.exitCode = 1;
    } else {
      if (action === "recover" && session.backend !== "box") throw new Error("Ego 恢复请按官方 ego-browser skill 检查页面。");
      console.log(JSON.stringify(session[action]()));
    }
  } catch (error) {
    console.error(error.message);
    if (session) session.uncertain = true;
    session?.endAndReport("browser");
    process.exitCode = 1;
  }
}
