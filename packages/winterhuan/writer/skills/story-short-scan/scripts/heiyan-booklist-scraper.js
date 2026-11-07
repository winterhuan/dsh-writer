#!/usr/bin/env node
/**
 * 黑岩官网公开书库采集。默认 Box，可用 --browser ego；无需管理后台账号。
 * node heiyan-booklist-scraper.js --pages 2 [--detail] [--outdir 目录]
 * 书库包含长短篇；序号是采集顺序，总点击不是近期热度。
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { createSession, openRunStore, sleep, safeStr, getArg, localDateStamp, runCli } = require("../../browser-cdp/scripts/browser-session.cjs");

const BOOKLIST_URL = "https://www.heiyan.com/all.html";
const PARSER_REVISION = "2-heiyan-public";
const args = process.argv.slice(2);

// These parsers run inside the selected browser and in local DOM fixtures.
function parseLibrary(doc, url) {
  if (!/^https:\/\/www\.heiyan\.com\/all(?:\.html|\/-1_-1_-1_-1_0_\d+\.html)$/.test(url)) {
    throw new Error("unexpected library URL");
  }
  const body = doc.querySelector("#resultDiv");
  const headers = Array.from(body?.closest("table")?.querySelectorAll("thead th") || [], el => el.textContent.trim());
  if (headers.join("|") !== "序号|书名|作者|字数|总点击|更新时间") throw new Error("library columns changed");
  const number = value => /^\d+$/.test(value.trim()) ? Number(value.trim()) : NaN;
  const rows = Array.from(body.querySelectorAll("tr"), tr => {
    const cells = tr.querySelectorAll("td");
    const link = tr.querySelector("a.title");
    const href = new URL(link?.getAttribute("href") || "", url).href;
    const match = href.match(/^https:\/\/www\.heiyan\.com\/book\/(\d+)$/);
    const name = link?.textContent.trim();
    const userName = tr.querySelector("td.author")?.textContent.trim();
    const words = number(cells[3]?.textContent || "");
    const totalClicks = number(cells[4]?.textContent || "");
    if (!match || !name || !userName || !Number.isSafeInteger(words) || !Number.isSafeInteger(totalClicks)) throw new Error("invalid library row");
    return { id: match[1], name, userName, words, totalClicks, url: href, updateTime: cells[5]?.textContent.trim() || "" };
  });
  const nextLink = Array.from(doc.querySelectorAll("a")).find(a => a.textContent.trim() === "下一页");
  const next = nextLink ? new URL(nextLink.getAttribute("href"), url).href : null;
  const page = Number(url.match(/_(\d+)\.html$/)?.[1] || 1);
  if (next && next !== `https://www.heiyan.com/all/-1_-1_-1_-1_0_${page + 1}.html`) throw new Error("unexpected next page");
  if ((!rows.length && next) || new Set(rows.map(b => b.id)).size !== rows.length) throw new Error("invalid library page");
  return { url, rows, next };
}

function parseDetail(doc, url) {
  const meta = name => doc.querySelector(`meta[property="${name}"]`)?.getAttribute("content")?.trim() || "";
  if (meta("og:url") !== url || !meta("og:novel:book_name")) throw new Error("unexpected book page");
  return {
    typeDesc: meta("og:novel:category"),
    status: meta("og:novel:status"),
    description: meta("og:description"),
    detailOk: true,
  };
}

function fetchBookList(session, url) {
  session.open(url);
  return session.evalJSON(`(${parseLibrary.toString()})(document, location.href)`);
}

function fetchBookDetail(session, bookId) {
  const url = `https://www.heiyan.com/book/${encodeURIComponent(String(bookId))}`;
  return session.evalJSON(`(async()=>{
    const response = await fetch(${safeStr(url)});
    if (!response.ok || response.url !== ${safeStr(url)}) throw new Error('book request failed');
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    return (${parseDetail.toString()})(doc, response.url);
  })()`);
}

function fmtWords(words) {
  const n = Number(String(words).replace(/,/g, ""));
  return Number.isSafeInteger(n) && n >= 0 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "字" : "";
}

function outputFilename(channel, date) {
  if (channel !== "all") throw new Error("黑岩官网书库不提供男频/女频筛选，请去掉 --channel。");
  return `黑岩书库列表_all_${date}.md`;
}

function dataQuality(books, detail) {
  return !detail || books.every(b => b.detailOk) ? "[OK]" : "[部分详情缺失]";
}

function buildAndSave(books, pages, filepath, detail, reasons) {
  const lines = [
    "# 黑岩 · 书库列表", "",
    `- 来源：${BOOKLIST_URL}`,
    `- 抓取时间：${new Date().toISOString()}`,
    `- 已采集：${books.length} 条（${pages} 页）`,
    "- 范围：官网默认书库，包含长短篇；序号是采集顺序，不是热度名次。",
    "- 指标口径：总点击为页面显示的累计值，不代表近期阅读或付费数据。",
    detail ? "- 含详情：官网公开分类、完结状态、简介摘要；不保证完整简介。" : "- 列表模式；加 --detail 获取公开分类、完结状态和简介摘要。",
    `- 数据质量：${reasons.length ? "[部分采集]" : dataQuality(books, detail)}`,
    ...(reasons.length ? [`- 问题摘要：${reasons.join("；")}`] : []),
    ...reasons.map(reason => `- 采集未完成：${reason}`), "", "---", "",
  ];
  books.forEach((book, i) => {
    lines.push(`### #${i + 1} ${book.name}`, `*${[book.userName, book.typeDesc || "未分类", fmtWords(book.words), book.status].filter(Boolean).join(" · ")}*`);
    lines.push(`**总点击：${book.totalClicks}**`);
    if (book.updateTime) lines.push(`**更新：** ${book.updateTime}`);
    if (book.description) lines.push("", `> ${book.description.replace(/\s+/g, " ").slice(0, 200)}${book.description.length > 200 ? "…" : ""}`);
    lines.push("", `[作品页](${book.url})`, "");
  });
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, lines.join("\n"), "utf8");
  console.log(`  ✓ 已保存: ${filepath}`);
}

/** Session, checkpoint and wait injection keep CLI regression tests offline. */
function main(options = {}) {
  const pages = options.pages ?? Number(getArg(args, "--pages") ?? "5");
  if (!Number.isSafeInteger(pages) || pages < 1) throw new Error("--pages 需要正整数。");
  const channel = options.channel ?? getArg(args, "--channel") ?? "all";
  const detail = options.detail ?? args.includes("--detail");
  const wait = options.sleep || sleep;
  const filepath = path.join(options.outdir || getArg(args, "--outdir") || ".", outputFilename(channel, localDateStamp()));
  const run = options.runStore || openRunStore({
    resume: options.resume ?? getArg(args, "--resume"),
    params: { source: BOOKLIST_URL, pages, detail }, parserRevision: PARSER_REVISION,
  });
  const session = options.session || createSession({ spaceName: "writer heiyan scan" });
  const reasons = [];
  const books = [];
  const seen = new Set();
  let completedPages = 0;
  let clean = false;
  let stage = "书库采集";
  try {
    console.log(`→ 采集黑岩官网书库（最多 ${pages} 页）`);
    console.log(`  运行 ${run.runId}（检查点 ${run.dir}；续采加 --resume ${run.runId}）`);
    let url = BOOKLIST_URL;
    for (let p = 1; p <= pages && url; p++) {
      stage = `第${p}页采集`;
      try {
        const key = `page-${p}`;
        const cached = run.get(key);
        if (!cached) wait(800);
        const page = cached || fetchBookList(session, url);
        if (!page || page.url !== url || !Array.isArray(page.rows) || !(page.next === null || page.next === `https://www.heiyan.com/all/-1_-1_-1_-1_0_${p + 1}.html`)) throw new Error("invalid page");
        const ids = page.rows.map(b => b.id);
        if (new Set(ids).size !== ids.length || ids.some(id => seen.has(id))) throw new Error("repeated books");
        if (!cached) run.commit(key, page);
        ids.forEach(id => seen.add(id));
        books.push(...page.rows.map(b => ({ ...b })));
        completedPages++;
        console.log(`  第${p}页: ${page.rows.length} 条（累计 ${books.length}）`);
        url = page.next;
      } catch {
        reasons.push(`${stage}异常，已停止并保留现场；请检查官网页面或验证码`);
        break;
      }
    }
    if (!books.length) {
      if (!reasons.length) reasons.push("未采集到任何书目");
      return { planned: 1, written: 0, failed: 1, partial: false, partialReasons: reasons };
    }
    if (detail && !reasons.length) {
      // Cached lists do not establish a browser origin for page-side detail fetches.
      try { session.open(BOOKLIST_URL); }
      catch { reasons.push("详情页面打开失败，保留已采集书目"); }
      for (let i = 0; i < books.length && !reasons.length; i++) {
        stage = `第${i + 1}本详情采集`;
        try {
          const key = `detail-${books[i].id}`;
          let value = run.get(key);
          if (!value) {
            wait(500);
            value = fetchBookDetail(session, books[i].id);
            if (!value?.detailOk) throw new Error("missing detail");
            run.commit(key, value);
          }
          Object.assign(books[i], value);
        } catch {
          reasons.push(`${stage}异常，已停止详情采集并保留现场`);
          break;
        }
      }
    }
    stage = "报告生成";
    // Partial reruns must not replace a previously complete report.
    buildAndSave(books, completedPages, reasons.length ? filepath.replace(/\.md$/, ".partial.md") : filepath, detail, reasons);
    clean = reasons.length === 0;
    return { planned: 1, written: 1, failed: clean ? 0 : 1, partial: !clean, partialReasons: reasons };
  } catch {
    reasons.push(`${stage}失败，已停止并保留现场`);
    return { planned: 1, written: 0, failed: 1, partial: false, partialReasons: reasons };
  } finally {
    if (!clean) session.uncertain = true;
    session.endAndReport("heiyan");
  }
}

function cliMain(options) {
  const outcome = main(options);
  if (!outcome.written) throw new Error(outcome.partialReasons.join("；") || "未写出报告");
  return outcome;
}

if (require.main === module) runCli(cliMain, "黑岩采集");
module.exports = { main, cliMain, parseLibrary, parseDetail, fetchBookList, fetchBookDetail, fmtWords, outputFilename, dataQuality, buildAndSave };
