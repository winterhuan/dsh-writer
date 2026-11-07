/** Local collector adapter. Browser programs travel over Box rsh; checkpoints stay local. */
"use strict";

const { spawnSync } = require("node:child_process");
const { createHash, randomInt, randomUUID } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { parseJSONResult, sleep } = require("./ego-session.cjs");

class BoxSession {
  constructor(options = {}) {
    this.backend = "box";
    this.box = options.box || "main";
    this.spaceId = options.spaceId ?? null;
    this.id = this.spaceId ?? randomInt(1, 2 ** 48 - 1);
    this.resuming = this.spaceId !== null;
    this.launch = options.launch || spawnSync;
    this.timeoutMs = options.timeoutMs || 180000;
    this.handedOff = false;
    this.uncertain = false;
    this.attached = false;
    this.ended = null;
  }

  invoke(action, value) {
    if (this.ended) throw new Error("Box session has ended");
    if (this.handedOff && !["inspect", "takeover"].includes(action)) throw new Error("Box 已交接给用户，请确认后续接。");
    if (this.uncertain && !["inspect", "recover"].includes(action)) throw new Error("Box 操作结果不明，请先检查并恢复。");
    const marker = randomUUID();
    const payload = JSON.stringify({ id: this.id, action, value, resume: this.resuming, token: marker });
    const source = fs.readFileSync(path.join(__dirname, "box-worker.cjs"), "utf8");
    const input = source + `\nfunction emit(result, code) { process.stdout.write(JSON.stringify({marker:${JSON.stringify(marker)},...result}) + "\\n", () => process.exit(code)); }\nboxOperation(${payload}).then(data => emit({ok:true,...packResult(${payload},data)}, 0)).catch(error => emit({ok:false,code:error.code||"BOX_ERROR",message:error.message}, 1));\n`;
    const res = this.launch("npx", ["-y", "@simular-ai/box@0.2.0", "rsh", "--box", this.box, "node"], {
      input, encoding: "utf8", timeout: this.timeoutMs, maxBuffer: 64 * 1024 * 1024,
      windowsHide: true, stdio: ["pipe", "pipe", "pipe"],
    });
    const envelopes = String(res.stdout || "").split("\n").flatMap(line => {
      try { const item = JSON.parse(line); return item?.marker === marker ? [item] : []; } catch { return []; }
    });
    if (res.error || res.signal || envelopes.length !== 1) {
      this.uncertain = true;
      throw new Error(`Box 远程调用未完成（会话 ${this.id}）；请检查 CLI 登录、Box 网络及现场。运行 npx @simular-ai/box@0.2.0 login 可登录 CLI。`);
    }
    const envelope = envelopes[0];
    if (envelope.ok !== true || res.status !== 0) {
      this.uncertain = true;
      throw Object.assign(new Error(envelope.message || "Box 远程操作失败。"), { code: envelope.code });
    }
    this.attached = true;
    this.spaceId = this.id;
    this.resuming = true;
    if (envelope.dataFile) {
      try { return this.readResult(envelope.dataFile, marker); }
      catch (error) { this.uncertain = true; throw error; }
    }
    return envelope.data;
  }

  readResult(ref, marker) {
    if (ref.token !== marker || !Number.isSafeInteger(ref.bytes) || ref.bytes < 1 || ref.bytes > 64 * 1024 * 1024) throw new Error("Box 大结果编号或大小无效。");
    const chunks = [];
    let offset = 0;
    while (offset < ref.bytes) {
      const part = this.invoke("result-read", { token: ref.token, offset });
      if (part.offset !== offset || typeof part.chunk !== "string") throw new Error("Box 大结果分段不匹配。");
      const bytes = Buffer.from(part.chunk, "base64");
      if (!bytes.length || bytes.length > ref.bytes - offset) throw new Error("Box 大结果不完整。");
      chunks.push(bytes);
      offset += bytes.length;
    }
    const bytes = Buffer.concat(chunks);
    if (createHash("sha256").update(bytes).digest("hex") !== ref.sha256) throw new Error("Box 大结果校验失败。");
    const data = JSON.parse(bytes.toString("utf8"));
    this.invoke("result-delete", { token: ref.token });
    return data;
  }

  open(url) { return this.invoke("open", String(url)); }
  evaluate(js) { return this.invoke("evaluate", String(js)); }
  evalJSON(js) { return parseJSONResult(this.evaluate(js)); }
  scroll(times, intervalMs = 0) {
    for (let i = 0; i < times; i++) {
      this.evaluate("window.scrollBy(0, window.innerHeight)");
      if (i < times - 1 && intervalMs) sleep(intervalMs);
    }
  }
  inspect() { return this.invoke("inspect"); }
  handOff() {
    const result = this.invoke("handoff");
    this.handedOff = true;
    console.error(`请在 https://box.simular.ai/box 完成操作；确认后以 --browser box --box ${this.box} --space ${this.id} 续接。`);
    return result;
  }
  takeOver() {
    const result = this.invoke("takeover");
    this.handedOff = false;
    return result;
  }
  recover() {
    const result = this.invoke("recover");
    this.uncertain = false;
    return result;
  }
  finish() { return this.invoke("finish"); }
  end() {
    if (this.ended) return this.ended;
    if (this.handedOff || this.uncertain) return this.ended = { finished: false, retained: true, reason: this.handedOff ? "handed-off" : "uncertain" };
    if (!this.attached) return this.ended = { finished: false, retained: false, reason: "never-attached" };
    try { this.finish(); return this.ended = { finished: true, retained: false }; }
    catch { return this.ended = { finished: false, retained: true, reason: "finish-failed" }; }
  }
  endAndReport(tag) {
    const result = this.end();
    if (result.retained) console.error(`[${tag}] Box 现场已保留（会话 ${this.id}，${result.reason}）；检查后用 --browser box --box ${this.box} --space ${this.id} 续接。`);
    return result;
  }
}

module.exports = { BoxSession };
