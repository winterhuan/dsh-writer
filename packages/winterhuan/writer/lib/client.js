window.__ModuleLoader__.load({
	id: "@winterhuan/dsh-writer",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react = require("react");
		//#region \0dsh-global-css:/Users/winter/dsh-creative/plugins/dsh-writer/packages/winterhuan/writer/src/client/plugin.css.mjs
		const css = ".writer-desk{--writer-border:var(--dsw-alias-border-l2);--writer-accent:var(--dsw-alias-brand-primary);--writer-rail-width:220px;grid-template-columns:var(--writer-rail-width) 5px minmax(0, 1fr);min-width:0;height:100%;min-height:0;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font:13px/1.5 var(--dsw-font-family);grid-template-rows:minmax(0,1fr);display:grid;overflow:hidden}.writer-book-panel{border-bottom:1px solid var(--writer-border);font:inherit;padding:8px 12px}.writer-book-panel summary{cursor:pointer;font-weight:500}.writer-book-content{overflow-wrap:anywhere;max-height:40vh;padding:8px 4px;overflow:auto}.writer-book-controls{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.writer-book-controls input{width:64px}.writer-book-controls select{max-width:160px}.writer-book-panel button,.writer-book-panel select,.writer-book-panel input{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);border:1px solid var(--writer-border);font:inherit;border-radius:6px;padding:4px 8px}.writer-book-report{border-top:1px solid var(--writer-border);margin-top:12px;padding-top:8px}.writer-book-report strong{font-weight:500}.writer-book-report p{margin:6px 0}.writer-book-report blockquote{border-left:2px solid var(--writer-border);margin:8px 0;padding-left:8px}.writer-desk>*{min-width:0}.writer-desk[data-rail-collapsed=true]{grid-template-columns:minmax(0,1fr)}.writer-desk[data-rail-collapsed=true]>.writer-rail,.writer-desk[data-rail-collapsed=true]>.writer-rail-resize{display:none}.writer-rail{box-sizing:border-box;border-right:1px solid var(--writer-border);background:var(--dsw-alias-bg-base);grid-template-rows:34px auto minmax(0,1fr) 30px;width:100%;min-width:0;max-width:100%;min-height:0;display:grid;overflow:hidden}.writer-rail[hidden],.writer-rail-resize[hidden]{display:none}.writer-rail-resize{z-index:2;cursor:col-resize;touch-action:none;user-select:none;background:0 0;border:0;border-left:1px solid #0000;width:5px;margin:0;padding:0;position:relative}.writer-rail-resize:after{content:\"\";background:0 0;border-radius:2px;width:3px;position:absolute;top:0;bottom:0;left:1px}.writer-rail-resize:hover:after,.writer-rail-resize:focus-visible:after{background:var(--writer-accent);opacity:.55}.writer-rail-resize:focus-visible{outline:none}.writer-rail-toggle{box-sizing:border-box;border:1px solid var(--writer-border);background:var(--dsw-alias-bg-base);width:24px;height:24px;color:var(--dsw-alias-label-secondary);font:14px/1 var(--dsw-font-family);cursor:pointer;border-radius:6px;flex:none;margin:0;padding:0}.writer-rail-toggle:hover{color:var(--dsw-alias-label-primary);border-color:var(--writer-accent)}.writer-rail-toggle:focus-visible{outline:2px solid var(--writer-accent);outline-offset:1px}.writer-tabs{border-bottom:1px solid var(--writer-border);grid-template-columns:repeat(3,minmax(0,1fr));min-width:0;padding:0 6px;display:grid}.writer-tab{box-sizing:border-box;min-width:0;height:100%;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border:0;border-radius:0;justify-content:center;align-items:center;gap:4px;padding:0 4px;font-weight:500;display:flex;position:relative}.writer-tab>span{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.writer-tab:after{content:\"\";background:0 0;border-radius:2px;height:2px;position:absolute;bottom:-1px;left:8px;right:8px}.writer-tab:hover,.writer-tab[aria-selected=true]{color:var(--dsw-alias-label-primary)}.writer-tab[aria-selected=true]:after{background:var(--writer-accent)}.writer-badge{font-variant-numeric:tabular-nums;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);border-radius:999px;flex:none;padding:0 5px;font-size:11px;font-weight:600;line-height:1.6;display:inline-block}.writer-search-slot{box-sizing:border-box;align-items:center;min-width:0;margin:6px 8px 2px;display:flex;overflow:hidden}.writer-search-slot input{box-sizing:border-box;border:1px solid var(--writer-border);background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));width:0;min-width:0;max-width:100%;height:28px;color:var(--dsw-alias-label-primary);font:inherit;-webkit-appearance:none;appearance:none;border-radius:6px;flex:1;padding:0 8px}.writer-search-slot input::placeholder{color:var(--dsw-alias-label-secondary)}.writer-search-dir{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-secondary);flex:0 auto;font-size:11px;overflow:hidden}.writer-tree-panel .writer-search-hits mark{color:var(--dsw-alias-link,var(--writer-accent));background:0 0;font-weight:500}.writer-search-hits>li+li{margin-top:2px}.writer-tree-panel{min-width:0;min-height:0;padding:2px 6px 6px 4px;overflow:auto}.writer-rail-note{border-top:1px solid var(--writer-border);color:var(--dsw-alias-label-secondary);align-items:center;gap:8px;margin:0;padding:0 12px;font-size:12px;display:flex}.writer-rail-note p{text-overflow:ellipsis;white-space:nowrap;margin:0;overflow:hidden}.writer-rail-dot{background:var(--writer-accent);opacity:.7;border-radius:50%;flex:none;width:6px;height:6px}.writer-rail-dot[data-health=loading]{opacity:.4}.writer-rail-dot[data-health=partial]{background:var(--dsw-alias-warning-label,var(--writer-accent));opacity:.9}.writer-rail-dot[data-health=failed]{background:var(--dsw-alias-danger-label,var(--writer-accent));opacity:1}.writer-stage{background:var(--dsw-alias-bg-base);flex-direction:column;min-width:0;min-height:0;display:flex;overflow:hidden;container-type:inline-size}.writer-stage-heading{border-bottom:1px solid var(--writer-border);flex-wrap:nowrap;align-items:center;gap:8px;min-height:36px;padding:6px 10px;display:flex}.writer-masthead{flex-wrap:nowrap;flex:auto;align-items:center;gap:10px;min-width:0;display:flex;overflow:hidden}.writer-workspace{text-overflow:ellipsis;white-space:nowrap;max-width:min(40%,18rem);color:var(--dsw-alias-label-primary);flex:0 auto;font-size:13px;font-weight:650;overflow:hidden}.writer-masthead-actions{flex-wrap:nowrap;flex:0 auto;align-items:center;gap:10px;min-width:0;margin-left:auto;display:flex;overflow:hidden}.writer-counts{min-width:0;color:var(--dsw-alias-label-secondary);white-space:nowrap;flex-wrap:nowrap;flex:0 auto;align-items:center;gap:12px;font-size:12px;display:flex;overflow:hidden}.writer-count{text-overflow:ellipsis;white-space:nowrap;flex:0 auto;min-width:0;overflow:hidden}.writer-count b{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;font-weight:650}@container (width<=399px){.writer-counts{display:none}}.writer-connection{height:24px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);white-space:nowrap;border-radius:999px;flex:none;align-items:center;gap:6px;padding:0 8px;font-size:12px;font-weight:550;display:inline-flex}.writer-status-dot{border:1.5px solid var(--writer-border);background:0 0;border-radius:50%;flex:none;width:7px;height:7px}.writer-connection[data-health=ok] .writer-status-dot{background:var(--dsw-alias-success-label,#2f9e44);border-color:var(--dsw-alias-success-label,#2f9e44)}.writer-connection[data-health=partial]{color:var(--dsw-alias-warning-label,var(--dsw-alias-label-primary))}.writer-connection[data-health=partial] .writer-status-dot{background:var(--dsw-alias-warning-label,#d97706);border-color:var(--dsw-alias-warning-label,#d97706)}.writer-connection[data-health=failed]{color:var(--dsw-alias-danger-label,var(--dsw-alias-label-primary))}.writer-connection[data-health=failed] .writer-status-dot{background:var(--dsw-alias-danger-label,var(--writer-accent));border-color:var(--dsw-alias-danger-label,var(--writer-accent))}.writer-connection[data-health=loading]{opacity:.75}.writer-connection-label{text-overflow:ellipsis;max-width:9em;overflow:hidden}.writer-reload{box-sizing:border-box;width:28px;height:28px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-base);border:1px solid var(--writer-border);cursor:pointer;border-radius:8px;flex:none;place-items:center;margin-left:0;padding:0;display:grid}.writer-reload:hover{color:var(--dsw-alias-label-primary);border-color:var(--writer-accent)}.writer-reload:focus-visible{outline:2px solid var(--writer-accent);outline-offset:1px}.writer-reload svg{fill:none;stroke:currentColor;stroke-width:1.7px;stroke-linecap:round;stroke-linejoin:round;width:14px;height:14px}.writer-scan-banner{border:1px solid var(--writer-border);background:var(--dsw-alias-interactive-bg-hover);border-radius:6px;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 8px;padding:8px 10px;display:flex}.writer-scan-banner p{flex:8rem;min-width:0;margin:0}.writer-scan-banner-warn{color:var(--dsw-alias-label-secondary)}.writer-stage-heading button,.writer-editor button,.writer-alert button,.writer-scan-banner button{box-sizing:border-box;font:inherit;color:var(--dsw-alias-label-primary);border:1px solid var(--writer-border);background:var(--dsw-alias-bg-base);cursor:pointer;border-radius:6px;padding:2px 8px}.writer-stage-heading .writer-reload{color:var(--dsw-alias-label-secondary);border-radius:8px;padding:0}.writer-tree-panel button{box-sizing:border-box;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;border:0;border-radius:4px;padding:0}.writer-tree-panel ul,.writer-tree{margin:0;padding:0;list-style:none}.writer-tree-panel li+li{margin-top:1px}.writer-tree-file,.writer-tree-toggle{text-align:left;background:0 0;border-radius:4px;align-items:center;gap:6px;width:100%;min-height:26px;display:flex;padding:2px 6px 2px calc(4px + var(--writer-indent,0px))!important;border:0!important}.writer-tree-file:hover:not(:disabled),.writer-tree-toggle:hover{background:var(--dsw-alias-interactive-bg-hover)}.writer-tree-file[aria-current=true]{background:var(--dsw-alias-interactive-bg-hover);box-shadow:inset 2px 0 0 var(--writer-accent);font-weight:600}.writer-tree-kind{flex:none}.writer-tree-toggle .writer-tree-kind{color:var(--dsw-alias-label-tertiary)}.writer-tree-label{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;overflow:hidden}.writer-tree-ext{text-transform:lowercase;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover);border-radius:4px;flex:none;margin-left:auto;padding:0 5px;font-size:10px;line-height:1.6}.writer-tree-folder>ul{background:0 0;border:0;margin:0;padding:0}.writer-editor{flex-direction:column;flex:1;gap:6px;min-width:0;min-height:0;padding:6px 10px 8px;display:flex;overflow:auto}.writer-editor header{align-items:center;gap:6px;display:flex}.writer-document-identity{flex:auto;align-content:center;gap:3px;min-width:0;display:grid}.writer-breadcrumbs{min-width:0;color:var(--dsw-alias-label-secondary);white-space:nowrap;flex-wrap:nowrap;align-items:center;gap:0;font-size:11px;line-height:1.3;display:flex;overflow:hidden}.writer-breadcrumbs>span{flex:0 auto;align-items:center;min-width:0;max-width:28%;display:inline-flex}.writer-breadcrumbs>span:last-child{flex:0 auto;min-width:4ch;max-width:42%}.writer-breadcrumbs>span>span{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.writer-breadcrumbs i{white-space:pre;color:var(--writer-border);flex:none;margin:0;font-style:normal}.writer-document-title{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-primary);letter-spacing:.01em;margin:0;font-size:15px;font-weight:700;line-height:1.3;overflow:hidden}.writer-editor-actions{flex-wrap:nowrap;flex:none;align-items:center;gap:6px;display:flex}.writer-line-numbers-toggle{flex:none}.writer-line-numbers-toggle[aria-pressed=true]{color:var(--writer-accent);background:var(--dsw-alias-interactive-bg-hover)}.writer-editor-body{border:1px solid var(--writer-border);background:var(--dsw-alias-bg-base);border-radius:6px;flex:1;min-width:0;min-height:160px;display:flex;overflow:hidden}.writer-line-gutter{user-select:none;box-sizing:border-box;border-right:1px solid var(--writer-border);width:48px;height:100%;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;text-align:right;flex:0 0 48px;margin:0;padding:8px 0;font:11px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;overflow:hidden}.writer-editor-body:not(.show-line-numbers) .writer-line-gutter{display:none}.writer-gutter-line{box-sizing:border-box;white-space:nowrap;padding-left:4px;padding-right:8px;overflow:hidden}.writer-gutter-line.active{color:var(--writer-accent);font-weight:600}.writer-line-mirror{visibility:hidden;pointer-events:none;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word;box-sizing:content-box;border:0;margin:0;padding:0;position:absolute;top:0;left:-99999px}.writer-editor-body textarea{resize:none;box-sizing:border-box;width:0;min-width:0;height:100%;min-height:160px;color:var(--dsw-alias-label-primary);font:13px/1.6 var(--dsw-font-family);background:0 0;border:0;border-radius:0;flex:1;padding:8px}.writer-document-meta{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.writer-conflict-reload{color:var(--dsw-alias-danger-label,var(--dsw-alias-label-primary))!important}.writer-empty,.writer-muted,.writer-alert{margin:0}.writer-muted{color:var(--dsw-alias-label-secondary)}.writer-alert{color:var(--dsw-alias-danger-label,var(--dsw-alias-label-primary));flex-wrap:wrap;align-items:center;gap:8px;display:flex}.writer-editor button:disabled{cursor:default;opacity:.55}.writer-tree-file-disabled{opacity:.45;cursor:default}.writer-tree-status,.writer-tree-status-action{color:var(--dsw-alias-label-secondary);min-height:24px;padding:2px 6px 2px calc(4px + var(--writer-indent,0px));align-items:center;font-size:12px;display:flex}.writer-tree-status-action{text-align:left;background:0 0;border-radius:4px;width:100%;border:1px dashed var(--writer-border)!important}.writer-editor-toolbar{flex-wrap:nowrap;justify-content:space-between;align-items:center;gap:10px;min-height:40px;padding:2px 0 4px;display:flex}.writer-editor-toolbar>button,.writer-editor-actions>button{white-space:nowrap;flex:none}.writer-dirty{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover);white-space:nowrap;border-radius:999px;flex:none;padding:0 7px;font-size:11px;line-height:1.7}.writer-dirty[data-state=dirty]{color:var(--dsw-alias-label-primary)}.writer-dirty[data-state=saving]{color:var(--writer-accent)}.writer-mode-switch{background:var(--dsw-alias-interactive-bg-hover);border:0;border-radius:9px;flex:none;gap:2px;padding:2px;display:inline-flex;overflow:hidden}.writer-mode-switch button{height:26px;color:var(--dsw-alias-label-secondary);background:0 0;padding:0 10px;font-size:12px;font-weight:550;border:0!important;border-radius:7px!important}.writer-mode-switch button[aria-pressed=true]{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);box-shadow:0 0 0 1px var(--writer-border);font-weight:650}.writer-preview{box-sizing:border-box;border:1px solid var(--writer-border);background:var(--dsw-alias-bg-base);min-height:160px;color:var(--dsw-alias-label-primary);border-radius:6px;flex:1;padding:12px 14px;line-height:1.65;overflow:auto}.writer-preview>:first-child{margin-top:0}.writer-preview>:last-child{margin-bottom:0}.writer-preview h1,.writer-preview h2,.writer-preview h3,.writer-preview h4{line-height:1.3}.writer-preview-code,.writer-preview pre{background:var(--dsw-alias-interactive-bg-hover);border-radius:6px;padding:8px 10px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;overflow:auto}.writer-preview blockquote{border-left:3px solid var(--writer-border);color:var(--dsw-alias-label-secondary);margin:.6em 0;padding-left:12px}.writer-status{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;flex-wrap:wrap;align-items:center;gap:6px;margin:0;font-size:12px;display:flex}@media (width<=420px){.writer-counts{display:none}}@media (width<=320px){.writer-connection-label{display:none}}";
		const tagId = "@winterhuan/dsh-writer/plugin.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@winterhuan/dsh-writer";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region lib/types/editable.js
		/** Workspace-relative paths the writing sidebar may save. */
		/** File extensions Dashboard and the sidebar treat as editable. */
		const EDITABLE_EXTENSIONS = /* @__PURE__ */ new Set([
			".md",
			".txt",
			".json",
			".yaml",
			".yml",
			".toml"
		]);
		/**
		* Lowercase extension of a basename, including the leading dot.
		* @param name - file basename or relative path.
		* @returns extension such as `.md`, or `''` when none.
		*/
		function writerExtension(name) {
			const base = name.includes("/") ? name.split("/").pop() ?? name : name;
			const index = base.lastIndexOf(".");
			return index >= 0 ? base.slice(index).toLowerCase() : "";
		}
		/**
		* Whether a basename uses an editable extension.
		* @param name - file basename or relative path.
		* @returns true for md / txt / json / yaml / yml / toml.
		*/
		function isEditableWriterName(name) {
			return EDITABLE_EXTENSIONS.has(writerExtension(name));
		}
		/**
		* Accept only a relative path the sidebar is allowed to write.
		* @param path - candidate workspace-relative path.
		* @returns whether a save may target it.
		*/
		function isEditableWriterPath(path) {
			return safeRelative(path) && isEditableWriterName(path);
		}
		/**
		* Reject absolute paths, backslashes, and parent segments.
		* @param path - candidate path.
		* @returns whether every segment stays inside the workspace.
		*/
		function safeRelative(path) {
			if (path === "" || path.startsWith("/") || path.includes("\\") || path.includes("\0")) return false;
			return path.split("/").every((segment) => segment !== "" && segment !== "." && segment !== "..");
		}
		//#endregion
		//#region lib/types/client/locales.js
		const NS = "writerDesk";
		/** Standard line-ending names shown unchanged in either locale. */
		const EOL_NAMES = {
			lf: "LF",
			crlf: "CRLF",
			cr: "CR"
		};
		const zh$1 = {
			draftRecovered: "已恢复此浏览器中的未保存草稿",
			draftStorageError: "无法保存浏览器草稿，请及时保存文件并保持此页面打开",
			draftStorageConflict: "此文件有另一个会话更新的浏览器草稿，当前编辑仍保留在页面中",
			documentLoading: "正在读取文稿",
			retryDocument: "重试读取",
			diffTitle: "修改差异",
			diffUnchanged: "内容没有变化",
			diffWrap: "自动换行",
			diffUnwrap: "取消自动换行",
			diffCopy: "复制差异",
			diffCopied: "已复制",
			diffCollapse: "收起差异",
			diffExpand: "展开其余 {n} 行",
			modeDiff: "对比修改",
			bookPanelTitle: "章节进度与审稿",
			bookPanelBook: "查看作品",
			bookPanelChapter: "章节",
			bookChoose: "选择要查看的作品",
			bookRefresh: "刷新进度",
			bookRecordError: "无法读取记录：{path}",
			bookNoTracking: "尚无长篇追踪记录",
			bookCommitted: "已提交至第 {n} 章",
			bookNext: "下一章：第 {n} 章",
			bookCommitments: "下一章待兑现承诺",
			bookMechanical: "字数与机械检查",
			bookUnchecked: "尚无本章检查记录",
			bookStale: "正文或细纲已修改，需要重新检查",
			checkReady: "机械检查通过",
			checkDecision: "字数需要作者决定",
			checkBlocked: "有问题需要修复",
			checkUnavailable: "检查工具不可用",
			bookWordcount: "检查时 {actual} 字，目标 {target} 字",
			bookOpenCheck: "打开检查记录",
			bookCheckHelp: "在对话中要求检查本章，即可更新此处记录；机械检查不代表文学质量评价",
			bookSemantic: "内容审稿",
			bookUnreviewed: "尚无版本化审稿记录",
			bookStaleReview: "正文已修改，旧审稿意见需要重新核对",
			bookReviewCurrent: "审稿对应当前正文",
			bookOpenReview: "打开审稿记录",
			reviewMust: "必须改",
			reviewSuggestion: "建议改",
			reviewOptional: "可以不改",
			reviewLine: "第 {n} 行",
			reviewAccepted: "作者已接受此处写法",
			reviewResolved: "已核对处理",
			reviewChanges: "查看审稿后的修改",
			reviewResolveHelp: "在对话中说明要接受或修订哪条意见；正文变化后，旧处理结论不会沿用",
			bookUnfinished: "未完成的章节材料",
			bookResumeHelp: "打开材料核对进度，然后在对话中要求继续该章；临时材料存在不代表正文已提交",
			title: "写作",
			description: "拆文库、写作项目与扫榜记录",
			setting: "设定",
			outline: "大纲",
			chapters: "章节",
			tree: "作品文件树",
			workspaceTabs: "工作区视图",
			libraries: "拆文库",
			projects: "项目",
			scans: "扫榜",
			save: "保存",
			reload: "重新扫描",
			saved: "已保存",
			empty: "这里还没有拆文库、写作项目或扫榜记录",
			emptyLibraries: "没有拆文库",
			emptyProjects: "没有写作项目",
			emptyScans: "没有扫榜记录。在对话里运行 story-long-scan 或 story-short-scan，结果会保存在扫榜日期目录中",
			emptyHelp: "在对话里打开 story-long-write 或 story-short-write 开始写",
			emptyDir: "这个文件夹是空的",
			loading: "正在读取…",
			loadDirError: "这一层读失败，点此重试",
			loadMore: "加载更多",
			notEditable: "不可编辑：{path}",
			scanPartial: "有的目录扫不全，树可能不完整",
			conflict: "磁盘上的文件已经更新",
			conflictTitle: "磁盘上的文稿比当前版本更新",
			conflictBody: "为避免覆盖其他程序写入的内容，写作台已暂停保存。你可以保留当前编辑继续比对，或重新载入磁盘版本。",
			conflictKeep: "保留当前编辑",
			conflictReview: "处理保存冲突",
			conflictReload: "重新载入磁盘版本",
			conflictClose: "关闭",
			reloadDisk: "载入磁盘版本",
			book: "作品",
			workspaceBook: "当前目录",
			noWorkspace: "这个会话还没有工作区",
			loadError: "文件暂时读不了",
			saveError: "没有保存",
			truncated: "这一层没有列全",
			editor: "正文",
			localWorkspace: "本地工作区 · 文稿不会上传",
			search: "搜索文件名",
			searchLabel: "按文件名搜索",
			searching: "正在搜索“{query}”…",
			searchEmpty: "没有找到“{query}”",
			searchIncomplete: "搜索未完成，暂时无法确认是否存在“{query}”",
			searchQueryTooLong: "搜索词请控制在 100 个字符以内",
			confirmDiscard: "当前文稿还有未保存的修改。确定放弃并打开另一份文件吗？",
			modeEdit: "编辑",
			modePreview: "预览",
			dirtyPending: "待保存",
			dirtySaved: "已保存",
			dirtySaving: "保存中",
			statusChars: "{n} 字符",
			statusCursor: "第 {line} 行，第 {col} 列",
			statusEncoding: "UTF-8 · {eol}",
			breadcrumbs: "文件路径",
			toggleLineNumbers: "切换行号显示",
			masthead: "工作区概览",
			countsSummary: "拆文库 {libraries} · 写作项目 {projects} · 扫榜 {scans} · 文稿 {files}",
			countLibraries: "拆文库",
			countProjects: "项目",
			countScans: "扫榜",
			countFiles: "文稿",
			localOnly: "仅本机",
			filesOnDemand: "按需",
			filesLoaded: "{n}+",
			filesCountHint: "文稿随目录展开按需加载，不预先遍历整个工作区",
			healthLoading: "扫描中",
			healthOk: "可用",
			healthPartial: "部分失败",
			healthFailed: "扫描失败",
			scanFailed: "工作区扫描失败，点重试再试一次",
			retryScan: "重试",
			collapseRail: "隐藏文件树",
			expandRail: "显示文件树",
			resizeRail: "拖动调整文件树宽度"
		};
		const en$1 = {
			draftRecovered: "Recovered this browser’s unsaved draft",
			draftStorageError: "Browser draft recovery is unavailable. Save the file and keep this page open.",
			draftStorageConflict: "Another session updated this file’s browser draft. Your edits remain open here.",
			documentLoading: "Loading document",
			retryDocument: "Retry reading",
			diffTitle: "Changes",
			diffUnchanged: "No content changes",
			diffWrap: "Wrap lines",
			diffUnwrap: "Unwrap lines",
			diffCopy: "Copy changes",
			diffCopied: "Copied",
			diffCollapse: "Collapse changes",
			diffExpand: "Show {n} more lines",
			modeDiff: "Compare edits",
			bookPanelTitle: "Chapter progress and reviews",
			bookPanelBook: "Book",
			bookPanelChapter: "Chapter",
			bookChoose: "Choose a book",
			bookRefresh: "Refresh progress",
			bookRecordError: "Cannot read record: {path}",
			bookNoTracking: "No serial tracking record",
			bookCommitted: "Committed through chapter {n}",
			bookNext: "Next: chapter {n}",
			bookCommitments: "Commitments for the next chapter",
			bookMechanical: "Length and mechanical checks",
			bookUnchecked: "No check recorded for this chapter",
			bookStale: "The manuscript or outline changed. Check again.",
			checkReady: "Mechanical checks passed",
			checkDecision: "The author needs to decide the length",
			checkBlocked: "Issues need to be fixed",
			checkUnavailable: "Check tools unavailable",
			bookWordcount: "{actual} words at check time; target {target}",
			bookOpenCheck: "Open check record",
			bookCheckHelp: "Ask to check this chapter in the chat to update the record. Mechanical checks do not assess literary quality.",
			bookSemantic: "Content review",
			bookUnreviewed: "No versioned review",
			bookStaleReview: "The manuscript changed. Reassess the previous review.",
			bookReviewCurrent: "Review matches the current manuscript",
			bookOpenReview: "Open review record",
			reviewMust: "Must fix",
			reviewSuggestion: "Suggested",
			reviewOptional: "Optional",
			reviewLine: "Line {n}",
			reviewAccepted: "Accepted by the author",
			reviewResolved: "Resolved",
			reviewChanges: "Changes since review",
			reviewResolveHelp: "Tell the assistant which finding to accept or revise. Decisions expire when the manuscript changes.",
			bookUnfinished: "Unfinished chapter materials",
			bookResumeHelp: "Open the materials, then ask to continue this chapter in the chat. Scratch files do not mean the chapter was committed.",
			title: "Writing",
			description: "Libraries, writing projects, and market scans",
			setting: "Setting",
			outline: "Outline",
			chapters: "Chapters",
			tree: "Workspace file tree",
			workspaceTabs: "Workspace views",
			libraries: "Libraries",
			projects: "Projects",
			scans: "Scans",
			save: "Save",
			reload: "Rescan",
			saved: "Saved",
			empty: "No libraries, writing projects, or market scans yet",
			emptyLibraries: "No libraries",
			emptyProjects: "No writing projects",
			emptyScans: "No market scans. Run story-long-scan or story-short-scan in the chat to save results in a dated scan folder",
			emptyHelp: "Start from story-long-write or story-short-write in the chat",
			emptyDir: "This folder is empty",
			loading: "Loading…",
			loadDirError: "Could not list this folder — retry",
			loadMore: "Load more",
			notEditable: "Not editable: {path}",
			scanPartial: "Some folders could not be scanned; the tree may be incomplete",
			conflict: "The file changed on disk",
			conflictTitle: "The on-disk draft is newer than this editor",
			conflictBody: "Saving is paused so another program's write is not overwritten. Keep your edits to compare, or reload the disk copy.",
			conflictKeep: "Keep current edits",
			conflictReview: "Resolve save conflict",
			conflictReload: "Reload from disk",
			conflictClose: "Close",
			reloadDisk: "Load the disk copy",
			book: "Book",
			workspaceBook: "This folder",
			noWorkspace: "This session has no workspace yet",
			loadError: "The file could not be read",
			saveError: "Not saved",
			truncated: "This folder is only partly listed",
			editor: "Prose",
			localWorkspace: "Local workspace · drafts stay on this machine",
			search: "Search filenames",
			searchLabel: "Search by filename",
			searching: "Searching for “{query}”…",
			searchEmpty: "No files named like “{query}”",
			searchIncomplete: "Search stopped early; “{query}” may still exist",
			searchQueryTooLong: "Keep the search under 100 characters",
			confirmDiscard: "This draft has unsaved changes. Discard them and open another file?",
			modeEdit: "Edit",
			modePreview: "Preview",
			dirtyPending: "Unsaved",
			dirtySaved: "Saved",
			dirtySaving: "Saving",
			statusChars: "{n} characters",
			statusCursor: "Line {line}, column {col}",
			statusEncoding: "UTF-8 · {eol}",
			breadcrumbs: "File path",
			toggleLineNumbers: "Toggle line numbers",
			masthead: "Workspace overview",
			countsSummary: "Libraries {libraries} · Projects {projects} · Scans {scans} · Drafts {files}",
			countLibraries: "Libraries",
			countProjects: "Projects",
			countScans: "Scans",
			countFiles: "Drafts",
			localOnly: "Local only",
			filesOnDemand: "On demand",
			filesLoaded: "{n}+",
			filesCountHint: "Draft counts grow as folders expand; the whole workspace is not walked first",
			healthLoading: "Scanning",
			healthOk: "Ready",
			healthPartial: "Partially failed",
			healthFailed: "Scan failed",
			scanFailed: "Workspace scan failed — retry",
			retryScan: "Retry",
			collapseRail: "Hide file tree",
			expandRail: "Show file tree",
			resizeRail: "Drag to resize the file tree"
		};
		//#endregion
		//#region lib/types/client/eol.js
		/** EOL helpers so textarea stays LF while disk keeps its style. */
		/**
		* Detect the dominant line ending in file text.
		* @param content - raw file bytes decoded as text.
		* @returns CRLF when it outnumbers LF; else LF when present; else CR; else LF.
		*/
		function detectEol(content) {
			let crlf = 0;
			let lf = 0;
			let cr = 0;
			for (let index = 0; index < content.length; index += 1) if (content[index] === "\r") {
				if (content[index + 1] === "\n") {
					crlf += 1;
					index += 1;
				} else cr += 1;
			} else if (content[index] === "\n") lf += 1;
			if (crlf > lf) return "\r\n";
			if (lf > 0) return "\n";
			if (cr > 0) return "\r";
			return "\n";
		}
		/**
		* Normalize disk text to LF for the editor.
		* @param content - raw text.
		* @returns LF-only text.
		*/
		function normalizeEol(content) {
			return content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
		}
		/**
		* Restore the original EOL before writing to disk.
		* @param content - LF editor text.
		* @param eol - style from {@link detectEol}.
		* @returns text ready to save.
		*/
		function applyEol(content, eol) {
			return eol === "\n" ? content : content.replaceAll("\n", eol);
		}
		/**
		* Short label for the status bar.
		* @param eol - detected style.
		* @returns `LF` / `CRLF` / `CR`.
		*/
		function eolLabel(eol) {
			if (eol === "\r\n") return EOL_NAMES.crlf;
			if (eol === "\r") return EOL_NAMES.cr;
			return EOL_NAMES.lf;
		}
		//#endregion
		//#region lib/types/client/editor-shell.js
		/**
		* Format a byte length the way Dashboard `formatBytes` does.
		* @param bytes - non-negative size.
		* @returns a short human label.
		*/
		function formatBytes(bytes) {
			if (bytes < 1024) return `${String(bytes)} B`;
			if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KiB`;
			return `${(bytes / 1048576).toFixed(1)} MiB`;
		}
		/**
		* UTF-8 size of editor text as it would be written with the file EOL.
		* @param content - LF editor text.
		* @param eol - style restored on save.
		* @returns byte length.
		*/
		function editorByteSize(content, eol) {
			return new TextEncoder().encode(applyEol(content, eol)).length;
		}
		/**
		* Uppercase extension label for the status bar (no leading dot).
		* @param name - file basename or relative path.
		* @returns e.g. `MD`, or empty when unknown.
		*/
		function fileExtensionLabel(name) {
			const ext = writerExtension(name);
			return ext === "" ? "" : ext.slice(1).toUpperCase();
		}
		/**
		* Split a relative workspace path into breadcrumb segments.
		* @param path - POSIX-style relative path.
		* @returns non-empty parts; empty path yields `[]`.
		*/
		function breadcrumbSegments(path) {
			return path.split("/").filter((part) => part !== "");
		}
		/**
		* Count file nodes already present in lazy trees (Dashboard `loadedFileCount`).
		* @param nodes - library and/or project roots.
		* @returns unique-path-safe count of loaded file rows.
		*/
		function countLoadedFiles(nodes) {
			const paths = /* @__PURE__ */ new Set();
			const visit = (list) => {
				for (const node of list) {
					if (node.kind === "file") {
						paths.add(node.path);
						continue;
					}
					visit(node.children);
				}
			};
			visit(nodes);
			return paths.size;
		}
		/**
		* Masthead 文稿 label: `按需` until something is expanded, else `N+`.
		* @param count - {@link countLoadedFiles} result.
		* @param onDemand - copy for zero.
		* @param loaded - copy with `{n}` for a positive count.
		* @returns display text.
		*/
		function loadedFilesLabel(count, onDemand, loaded) {
			if (count <= 0) return onDemand;
			return loaded.replace("{n}", String(count));
		}
		//#endregion
		//#region lib/types/client/LineNumbers.js
		/** Toggleable line-number gutter synced to the prose textarea (Dashboard-aligned). */
		/**
		* Render a scroll-synced gutter with wrap-aware row heights and an active line.
		* @param props - editor text, caret, visibility, and the paired textarea.
		* @returns the gutter, or null when hidden.
		*/
		function WriterLineNumbers({ text, caret, show, textareaRef }) {
			const gutterRef = (0, react.useRef)(null);
			const mirrorRef = (0, react.useRef)(null);
			const frameRef = (0, react.useRef)(null);
			(0, react.useLayoutEffect)(() => {
				if (!show) return void 0;
				const input = textareaRef.current;
				const gutter = gutterRef.current;
				if (input === null || gutter === null) return void 0;
				const ensureMirror = () => {
					if (mirrorRef.current !== null) return mirrorRef.current;
					const mirror = document.createElement("div");
					mirror.className = "writer-line-mirror";
					mirror.setAttribute("aria-hidden", "true");
					document.body.appendChild(mirror);
					mirrorRef.current = mirror;
					return mirror;
				};
				const paint = () => {
					const live = textareaRef.current;
					const liveGutter = gutterRef.current;
					if (live === null || liveGutter === null) return;
					const style = window.getComputedStyle(live);
					const mirror = ensureMirror();
					mirror.style.fontFamily = style.fontFamily;
					mirror.style.fontSize = style.fontSize;
					mirror.style.fontWeight = style.fontWeight;
					mirror.style.fontStyle = style.fontStyle;
					const fontSize = Number.parseFloat(style.fontSize) || 13;
					const lineHeightPx = Number.parseFloat(style.lineHeight);
					mirror.style.lineHeight = Number.isFinite(lineHeightPx) ? String(lineHeightPx / fontSize) : style.lineHeight;
					mirror.style.letterSpacing = style.letterSpacing;
					mirror.style.wordSpacing = style.wordSpacing;
					mirror.style.textTransform = style.textTransform;
					mirror.style.textIndent = style.textIndent;
					mirror.style.whiteSpace = "pre-wrap";
					mirror.style.wordBreak = style.wordBreak;
					mirror.style.overflowWrap = "break-word";
					mirror.style.tabSize = style.tabSize || "4";
					const padLeft = Number.parseFloat(style.paddingLeft) || 0;
					const padRight = Number.parseFloat(style.paddingRight) || 0;
					const innerWidth = live.clientWidth - padLeft - padRight;
					if (innerWidth <= 0) return;
					mirror.style.width = `${String(innerWidth)}px`;
					const lines = text.split("\n");
					mirror.innerHTML = lines.map((line) => `<div>${escapeHtml$1(line) || "&#8203;"}</div>`).join("");
					const activeIndex = text.slice(0, Math.max(0, Math.min(caret, text.length))).split("\n").length - 1;
					liveGutter.style.paddingTop = style.paddingTop;
					liveGutter.style.paddingBottom = style.paddingBottom;
					liveGutter.style.lineHeight = style.lineHeight;
					const children = mirror.children;
					const rows = document.createDocumentFragment();
					for (let index = 0; index < lines.length; index += 1) {
						const row = document.createElement("div");
						row.className = index === activeIndex ? "writer-gutter-line active" : "writer-gutter-line";
						row.dataset.line = String(index + 1);
						row.textContent = String(index + 1);
						const measured = children[index];
						if (measured !== void 0) row.style.height = `${String(measured.getBoundingClientRect().height)}px`;
						rows.append(row);
					}
					liveGutter.replaceChildren(rows);
					liveGutter.scrollTop = live.scrollTop;
				};
				const schedule = () => {
					if (frameRef.current !== null) return;
					frameRef.current = window.requestAnimationFrame(() => {
						frameRef.current = null;
						paint();
					});
				};
				paint();
				const onScroll = () => {
					const liveGutter = gutterRef.current;
					if (liveGutter !== null && textareaRef.current !== null) liveGutter.scrollTop = textareaRef.current.scrollTop;
				};
				input.addEventListener("scroll", onScroll, { passive: true });
				const observer = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver(() => {
					schedule();
				});
				observer?.observe(input);
				document.fonts?.ready?.then(() => {
					schedule();
				});
				return () => {
					input.removeEventListener("scroll", onScroll);
					observer?.disconnect();
					if (frameRef.current !== null) {
						window.cancelAnimationFrame(frameRef.current);
						frameRef.current = null;
					}
				};
			}, [
				text,
				caret,
				show,
				textareaRef
			]);
			(0, react.useLayoutEffect)(() => () => {
				mirrorRef.current?.remove();
				mirrorRef.current = null;
			}, []);
			if (!show) return null;
			return (0, react_jsx_runtime.jsx)("div", {
				ref: gutterRef,
				className: "writer-line-gutter",
				"aria-hidden": "true",
				style: {}
			});
		}
		function escapeHtml$1(value) {
			return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;");
		}
		const LONG_PROJECT_DIRECTORY_MARKERS = /* @__PURE__ */ new Set([
			"正文",
			"大纲",
			"设定",
			"追踪"
		]);
		const SHORT_PROJECT_BODY_FILE = "正文.md";
		const SHORT_PROJECT_COMPANION_FILES = /* @__PURE__ */ new Set(["小节大纲.md", "设定.md"]);
		/** Directories Dashboard hides from the tree and discovery walks. */
		const IGNORED_DIRECTORIES = /* @__PURE__ */ new Set([
			".git",
			".omc",
			".omx",
			".claude",
			".codex",
			".opencode",
			".zcode",
			".agents",
			"node_modules",
			"test-results",
			"playwright-report",
			"__pycache__"
		]);
		/**
		* Natural (numeric) name order for folder and file labels.
		* @param left - one display name.
		* @param right - another display name.
		* @returns negative when left sorts before right.
		*/
		function compareWriterNames(left, right) {
			return left.localeCompare(right, "zh-CN", {
				numeric: true,
				sensitivity: "base"
			});
		}
		/**
		* Whether a directory name is hidden from discovery and listing.
		* @param name - basename.
		* @returns true when Dashboard would skip it.
		*/
		function shouldIgnoreDirectory(name) {
			return IGNORED_DIRECTORIES.has(name) || name.startsWith(".") && name !== ".story";
		}
		function joinRel$1(parent, name) {
			return parent === "" || parent === "." ? name : `${parent}/${name}`;
		}
		function isUnderAnyPath(candidate, blockedPaths) {
			return blockedPaths.some((blocked) => {
				if (blocked === "" || blocked === ".") return false;
				return candidate === blocked || candidate.startsWith(`${blocked}/`);
			});
		}
		function compareEntries(left, right) {
			const leftDir = left.type === "directory";
			if (leftDir !== (right.type === "directory")) return leftDir ? -1 : 1;
			return compareWriterNames(left.name, right.name);
		}
		/**
		* Filter ignored directories / non file-dir entries and sort like Dashboard.
		* @param entries - raw listing.
		* @returns visible entries in tree order.
		*/
		function visibleDirectoryEntries(entries) {
			return entries.filter((entry) => {
				if (entry.type === "directory") return !shouldIgnoreDirectory(entry.name);
				return entry.type === "file";
			}).sort(compareEntries);
		}
		/**
		* Map a directory entry into a tree node under its parent path.
		* @param parentPath - workspace-relative parent (empty for workspace root).
		* @param entry - one child.
		* @returns directory shell or file node.
		*/
		function entryToTreeNode(parentPath, entry) {
			const path = joinRel$1(parentPath === "." ? "" : parentPath, entry.name);
			if (entry.type === "directory") return {
				kind: "directory",
				name: entry.name,
				path,
				children: [],
				loaded: false,
				loading: false,
				shown: 0,
				truncated: false
			};
			const editable = isEditableWriterName(entry.name) && (entry.size === void 0 || entry.size <= 2097152);
			return entry.size === void 0 ? {
				kind: "file",
				name: entry.name,
				path,
				editable
			} : {
				kind: "file",
				name: entry.name,
				path,
				editable,
				size: entry.size
			};
		}
		/**
		* Build children for one loaded directory page (or first page).
		* @param parentPath - directory path.
		* @param entries - filtered sorted children.
		* @param shown - how many to expose (page size).
		* @param truncated - whether `workspaceFiles.list` dropped entries.
		* @returns directory node fields for children / shown / truncated.
		*/
		function buildLoadedChildren(parentPath, entries, shown, truncated) {
			const visible = visibleDirectoryEntries(entries);
			const count = Math.min(Math.max(shown, 0), visible.length);
			return {
				children: visible.slice(0, count).map((entry) => entryToTreeNode(parentPath, entry)),
				shown: count,
				truncated
			};
		}
		/**
		* Roots under `拆文库/{书}/` and legacy `拆文库-{书}/`.
		* @param readDir - list one workspace-relative directory (`''` for root).
		* @returns library roots and soft scan errors.
		*/
		async function listLibraryRoots(readDir) {
			const roots = [];
			const scanErrors = [];
			try {
				const standard = await readDir("拆文库");
				for (const entry of standard) {
					if (entry.type !== "directory" || shouldIgnoreDirectory(entry.name)) continue;
					const path = `拆文库/${entry.name}`;
					roots.push({
						path,
						name: entry.name,
						view: "libraries"
					});
				}
			} catch {}
			let rootEntries;
			try {
				rootEntries = await readDir("");
			} catch (error) {
				scanErrors.push(error instanceof Error ? error.message : "workspace_unreadable");
				return {
					roots,
					scanErrors
				};
			}
			for (const entry of rootEntries) {
				if (entry.type !== "directory" || !entry.name.startsWith("拆文库-") || shouldIgnoreDirectory(entry.name)) continue;
				roots.push({
					path: entry.name,
					name: entry.name,
					view: "libraries"
				});
			}
			roots.sort((left, right) => compareWriterNames(left.path, right.path));
			return {
				roots,
				scanErrors
			};
		}
		/**
		* Writing projects deep ≤3 with long/short markers, skipping library paths.
		* @param readDir - list one workspace-relative directory.
		* @param libraryPaths - relative paths of library roots to skip.
		* @param currentPath - path being inspected.
		* @param depth - depth from workspace root.
		* @param projects - accumulator.
		* @param scanErrors - soft errors.
		* @returns project roots.
		*/
		async function findProjectRoots(readDir, libraryPaths, currentPath = "", depth = 0, projects = [], scanErrors = []) {
			if (depth > 3 || isUnderAnyPath(currentPath, libraryPaths)) return projects;
			let entries;
			try {
				entries = await readDir(currentPath);
			} catch (error) {
				scanErrors.push(error instanceof Error ? error.message : `unreadable:${currentPath || "."}`);
				return projects;
			}
			const childDirectoryNames = new Set(entries.filter((entry) => entry.type === "directory").map((entry) => entry.name));
			const childFileNames = new Set(entries.filter((entry) => entry.type === "file").map((entry) => entry.name));
			const isLongProject = [...LONG_PROJECT_DIRECTORY_MARKERS].some((marker) => childDirectoryNames.has(marker));
			const isShortProject = childFileNames.has(SHORT_PROJECT_BODY_FILE) && [...SHORT_PROJECT_COMPANION_FILES].some((marker) => childFileNames.has(marker));
			if (isLongProject || isShortProject) {
				const path = currentPath;
				const name = path === "" ? "." : path.split("/").pop() ?? path;
				projects.push({
					path: path === "" ? "." : path,
					name: name === "." ? "." : name,
					view: "projects"
				});
				return projects;
			}
			for (const entry of entries) {
				if (entry.type !== "directory" || shouldIgnoreDirectory(entry.name)) continue;
				if (currentPath === "" && entry.name === "扫榜") continue;
				await findProjectRoots(readDir, libraryPaths, joinRel$1(currentPath, entry.name), depth + 1, projects, scanErrors);
			}
			return projects;
		}
		/**
		* Discover libraries, writing projects, and dated market scans.
		* @param readDir - list one workspace-relative directory.
		* @returns roots by view and soft scan errors.
		*/
		async function scanWriterWorkspace(readDir) {
			const { roots: libraries, scanErrors } = await listLibraryRoots(readDir);
			const scans = [];
			try {
				if ((await readDir("")).some((entry) => entry.type === "directory" && entry.name === "扫榜")) try {
					for (const entry of await readDir("扫榜")) {
						if (entry.type !== "directory" || !/^\d{8}(?:-[1-9]\d*)?$/u.test(entry.name)) continue;
						scans.push({
							path: `扫榜/${entry.name}`,
							name: entry.name,
							view: "scans"
						});
					}
				} catch (error) {
					scanErrors.push(error instanceof Error ? error.message : "unreadable:扫榜");
				}
			} catch {}
			scans.sort((left, right) => compareWriterNames(right.name, left.name));
			const projects = await findProjectRoots(readDir, libraries.map((root) => root.path), "", 0, [], scanErrors);
			projects.sort((left, right) => compareWriterNames(left.path, right.path));
			return {
				libraries,
				projects,
				scans,
				scanErrors
			};
		}
		/**
		* Prefer a scan conclusion, then its aggregate or first readable Markdown file.
		* @param entries - files in one scan record.
		* @returns the preferred report basename, if available.
		*/
		function preferredScanReport(entries) {
			const files = visibleDirectoryEntries(entries).filter((entry) => entry.type === "file" && entry.name.endsWith(".md") && (entry.size === void 0 || entry.size <= 2097152));
			for (const name of [
				"选题决策.md",
				"短篇扫榜结论.md",
				"扫榜聚合.md"
			]) if (files.some((entry) => entry.name === name)) return name;
			return files[0]?.name;
		}
		/**
		* Unloaded directory shell for a discovered root.
		* @param root - discovered workspace root.
		* @returns directory node ready for lazy expand.
		*/
		function rootToDirectoryNode(root) {
			return {
				kind: "directory",
				name: root.name === "." ? root.path : root.name,
				path: root.path === "." ? "" : root.path,
				children: [],
				loaded: false,
				loading: false,
				shown: 0,
				truncated: false
			};
		}
		/**
		* Whether a folder should start expanded when the user has not toggled it yet.
		* Folders start collapsed; only the chain holding the selection opens, so an
		* active file stays locatable. Explicit session toggles still win over this default.
		* @param path - directory path ('' is the workspace root).
		* @param selected - active file path, if any.
		* @returns default open state.
		*/
		function defaultWriterTreeExpanded(path, selected) {
			if (selected === void 0) return false;
			if (path === "") return selected !== "";
			return selected === path || selected.startsWith(`${path}/`);
		}
		//#endregion
		//#region lib/types/client/markdown.js
		/** Safe Markdown → HTML for the writing preview (Dashboard-aligned, no deps). */
		function escapeHtml(value) {
			return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#039;");
		}
		function inlineMarkdown(value) {
			return value.replace(/`([^`]+)`/gu, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/gu, "<strong>$1</strong>").replace(/__([^_]+)__/gu, "<strong>$1</strong>").replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/gu, "<em>$1</em>");
		}
		/**
		* Convert Markdown to escaped HTML suitable for `dangerouslySetInnerHTML`.
		* Mirrors oh-story Dashboard `markdownToSafeHtml` (headings, lists, code, hr, quote).
		* @param markdown - editor text (LF).
		* @returns HTML string with no unescaped user markup.
		*/
		function markdownToSafeHtml(markdown) {
			const lines = escapeHtml(markdown).replaceAll("\r\n", "\n").split("\n");
			const output = [];
			let inCode = false;
			const codeLines = [];
			let codeStartLine = 1;
			let listType = null;
			const closeList = () => {
				if (listType !== null) output.push(`</${listType}>`);
				listType = null;
			};
			for (let i = 0; i < lines.length; i += 1) {
				const line = lines[i] ?? "";
				const lineNum = i + 1;
				if (line.trim().startsWith("```")) {
					closeList();
					if (inCode) {
						output.push(`<div class="writer-preview-code" data-line="${String(codeStartLine)}"><pre><code>${codeLines.join("\n")}</code></pre></div>`);
						codeLines.length = 0;
					} else codeStartLine = lineNum;
					inCode = !inCode;
					continue;
				}
				if (inCode) {
					codeLines.push(line);
					continue;
				}
				const heading = /^(#{1,4})\s+(.+)$/u.exec(line);
				const unordered = /^\s*[-*+]\s+(.+)$/u.exec(line);
				const ordered = /^\s*\d+[.)]\s+(.+)$/u.exec(line);
				if (heading !== null) {
					closeList();
					const level = heading[1]?.length ?? 1;
					output.push(`<h${String(level)} data-line="${String(lineNum)}">${inlineMarkdown(heading[2] ?? "")}</h${String(level)}>`);
				} else if (unordered !== null || ordered !== null) {
					const nextType = unordered !== null ? "ul" : "ol";
					if (listType !== nextType) {
						closeList();
						listType = nextType;
						output.push(`<${listType}>`);
					}
					const body = (unordered ?? ordered)?.[1] ?? "";
					output.push(`<li data-line="${String(lineNum)}">${inlineMarkdown(body)}</li>`);
				} else if (/^\s*([-*_])(?:\s*\1){2,}\s*$/u.test(line)) {
					closeList();
					output.push(`<hr data-line="${String(lineNum)}">`);
				} else if (line.startsWith("&gt; ")) {
					closeList();
					output.push(`<blockquote data-line="${String(lineNum)}">${inlineMarkdown(line.slice(5))}</blockquote>`);
				} else if (line.trim() !== "") {
					closeList();
					output.push(`<p data-line="${String(lineNum)}">${inlineMarkdown(line)}</p>`);
				} else closeList();
			}
			if (inCode) output.push(`<div class="writer-preview-code" data-line="${String(codeStartLine)}"><pre><code>${codeLines.join("\n")}</code></pre></div>`);
			closeList();
			return output.join("");
		}
		//#endregion
		//#region lib/types/client/read.js
		/**
		* Failure text from a Remote result.
		* @param error - the failed result's error.
		* @param fallback - copy when the error has no message.
		* @returns a short message.
		*/
		function remoteMessage(error, fallback) {
			if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") return error.message;
			return fallback;
		}
		/**
		* Read a whole text file through `workspaceFiles.readBytes`.
		* @param remote - client remote that carries `workspaceFiles`.
		* @param sessionId - session whose workspace owns the file.
		* @param path - absolute or workspace-relative file.
		* @param signal - cancellation.
		* @returns decoded text and the file version.
		*/
		async function readWorkspaceText(remote, sessionId, path, signal) {
			const result = await remote.workspaceFiles.readBytes(sessionId, path, {}, signal);
			if (!result.ok) return result;
			return {
				ok: true,
				value: {
					text: new TextDecoder("utf-8", {
						fatal: true,
						ignoreBOM: true
					}).decode(result.value.data),
					version: result.value.version
				}
			};
		}
		//#endregion
		//#region lib/types/client/draft-storage.js
		function draftKey(cwd, path) {
			return `dsh.writer.draft.v1:${JSON.stringify([cwd, path])}`;
		}
		function selectionKey(cwd) {
			return `dsh.writer.selection.v1:${cwd}`;
		}
		function isDraft(value) {
			return typeof value === "object" && value !== null && "text" in value && typeof value.text === "string" && "baseText" in value && typeof value.baseText === "string" && "baseVersion" in value && typeof value.baseVersion === "string" && "eol" in value && (value.eol === "\n" || value.eol === "\r\n" || value.eol === "\r");
		}
		/**
		* Read and validate a recovery copy without deleting malformed or inaccessible data.
		* @param cwd - session workspace root.
		* @param path - workspace-relative file.
		* @returns the recovery copy and the browser value it came from, or a storage error.
		*/
		function readWriterDraft(cwd, path) {
			let token = null;
			try {
				token = localStorage.getItem(draftKey(cwd, path));
				if (token === null) return { token };
				const value = JSON.parse(token);
				return isDraft(value) ? {
					draft: value,
					token
				} : {
					token,
					error: "unavailable"
				};
			} catch {
				return {
					token,
					error: "unavailable"
				};
			}
		}
		/**
		* Replace only the recovery copy this editor last observed.
		* @param cwd - session workspace root.
		* @param path - workspace-relative file.
		* @param draft - unsaved text, or undefined to remove this editor's recovery copy.
		* @param token - last successfully read or written browser value.
		* @returns the new browser value or the reason recovery could not be updated.
		*/
		function writeWriterDraft(cwd, path, draft, token) {
			try {
				const key = draftKey(cwd, path);
				if (localStorage.getItem(key) !== token) return {
					token,
					error: "changed"
				};
				const next = draft === void 0 ? null : JSON.stringify(draft);
				if (next === null) localStorage.removeItem(key);
				else localStorage.setItem(key, next);
				return { token: next };
			} catch {
				return {
					token,
					error: "unavailable"
				};
			}
		}
		/**
		* Restore the workspace's last open document; storage never authorizes an absolute path.
		* @param cwd - session workspace root.
		* @returns a relative file path, or undefined for a missing or invalid preference.
		*/
		function readWriterSelection(cwd) {
			try {
				const path = localStorage.getItem(selectionKey(cwd));
				if (path === null || path === "" || path.includes("\\") || path.split("/").some((part) => part === "" || part === "." || part === "..")) return void 0;
				return path;
			} catch {
				return;
			}
		}
		/**
		* Remember the open file without making document access depend on browser storage.
		* @param cwd - session workspace root.
		* @param path - workspace-relative file, or undefined to clear the selection.
		* @returns whether the preference was saved.
		*/
		function writeWriterSelection(cwd, path) {
			try {
				if (path === void 0) localStorage.removeItem(selectionKey(cwd));
				else localStorage.setItem(selectionKey(cwd), path);
				return true;
			} catch {
				return false;
			}
		}
		//#endregion
		//#region lib/types/client/save.js
		/**
		* Build the save URL. The host accepts PUT only.
		* @param sessionId - session that owns the workspace.
		* @param path - workspace-relative path.
		* @returns the route URL.
		*/
		function writerFileUrl(sessionId, path) {
			return `/writer/file?${new URLSearchParams({
				sessionId,
				path
			}).toString()}`;
		}
		/**
		* Save text when `baseVersion` still matches the file.
		* @param sessionId - session that owns the workspace.
		* @param path - workspace-relative path.
		* @param content - full new text.
		* @param baseVersion - version from the last read.
		* @param signal - cancellation.
		* @returns the response. Status 412 means the disk copy changed.
		*/
		function saveWriterFile(sessionId, path, content, baseVersion, signal) {
			return fetch(writerFileUrl(sessionId, path), {
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					content,
					baseVersion
				}),
				signal
			});
		}
		//#endregion
		//#region lib/types/client/use-writer-document.js
		/**
		* Keep an editor alive while its sidebar is hidden. Mount separately per session/workspace.
		* @param remote - workspace file reader.
		* @param sessionId - session authorizing file access.
		* @param cwd - workspace root used to isolate recovery copies.
		* @param t - localized operation feedback.
		* @returns document state and actions; late replies cannot update another open file.
		*/
		function useWriterDocument(remote, sessionId, cwd, t) {
			const [documentState, setDocumentState] = (0, react.useState)();
			const [storageError, setStorageError] = (0, react.useState)();
			const current = (0, react.useRef)(void 0);
			const mounted = (0, react.useRef)(true);
			const readController = (0, react.useRef)(void 0);
			const copy = (0, react.useRef)(t);
			copy.current = t;
			const publish = (next) => {
				current.current = next;
				if (mounted.current) setDocumentState(next);
			};
			const update = (owner, change) => {
				const value = current.current;
				if (!mounted.current || value?.owner !== owner) return;
				publish(change(value));
			};
			const persist = (value) => {
				if (value.version === void 0) return value;
				const draft = value.text === value.baseText ? void 0 : {
					text: value.text,
					baseText: value.baseText,
					baseVersion: value.version,
					eol: value.eol
				};
				const result = writeWriterDraft(cwd, value.path, draft, value.storageToken);
				setStorageError(result.error);
				return {
					...value,
					storageToken: result.token
				};
			};
			const discard = () => {
				const value = current.current;
				if (value === void 0) return;
				const result = writeWriterDraft(cwd, value.path, void 0, value.storageToken);
				if (result.error !== void 0) setStorageError(result.error);
			};
			const load = (path, discardOnSuccess = false) => {
				readController.current?.abort();
				const controller = new AbortController();
				readController.current = controller;
				const previous = current.current?.path === path ? current.current : void 0;
				const recovery = previous === void 0 ? readWriterDraft(cwd, path) : void 0;
				if (recovery?.error !== void 0) setStorageError(recovery.error);
				const draft = recovery?.draft;
				const owner = {};
				publish({
					owner,
					path,
					text: previous?.text ?? draft?.text ?? "",
					baseText: previous?.baseText ?? draft?.baseText ?? "",
					version: previous?.version ?? draft?.baseVersion,
					eol: previous?.eol ?? draft?.eol ?? "\n",
					status: "loading",
					busy: false,
					conflict: previous?.conflict ?? false,
					notice: void 0,
					storageToken: previous?.storageToken ?? recovery?.token ?? null
				});
				readWorkspaceText(remote, sessionId, `${cwd.replace(/[/\\]+$/u, "")}/${path}`, controller.signal).then((result) => {
					if (controller.signal.aborted) return;
					update(owner, (value) => {
						if (!result.ok) return {
							...value,
							status: "failed",
							notice: remoteMessage(result.error, copy.current("loadError"))
						};
						const diskText = normalizeEol(result.value.text);
						const unsaved = value.version !== void 0 && value.text !== value.baseText;
						if (!discardOnSuccess && unsaved && value.text !== diskText) return {
							...value,
							status: "ready",
							conflict: value.version !== result.value.version,
							notice: draft === void 0 ? void 0 : copy.current("draftRecovered")
						};
						return persist({
							...value,
							text: diskText,
							baseText: diskText,
							version: result.value.version,
							eol: detectEol(result.value.text),
							status: "ready",
							conflict: false,
							notice: void 0
						});
					});
				}).catch((error) => {
					if (controller.signal.aborted) return;
					update(owner, (value) => ({
						...value,
						status: "failed",
						notice: error instanceof Error ? error.message : copy.current("loadError")
					}));
				});
			};
			(0, react.useEffect)(() => {
				mounted.current = true;
				const path = readWriterSelection(cwd);
				if (path !== void 0) load(path);
				return () => {
					mounted.current = false;
					readController.current?.abort();
				};
			}, []);
			const dirty = documentState !== void 0 && documentState.text !== documentState.baseText;
			(0, react.useEffect)(() => {
				if (!dirty) return void 0;
				const warn = (event) => {
					event.preventDefault();
					event.returnValue = "";
				};
				window.addEventListener("beforeunload", warn);
				return () => {
					window.removeEventListener("beforeunload", warn);
				};
			}, [dirty]);
			const save = () => {
				const value = current.current;
				if (value === void 0 || value.version === void 0 || value.status !== "ready" || value.conflict || value.busy || value.text === value.baseText) return;
				const { owner, path, text, version, eol } = value;
				publish({
					...value,
					busy: true,
					notice: void 0
				});
				saveWriterFile(sessionId, path, applyEol(text, eol), version, new AbortController().signal).then(async (response) => {
					const payload = await response.json();
					update(owner, (latest) => {
						if (response.status === 412) return {
							...latest,
							busy: false,
							conflict: true,
							notice: void 0
						};
						if (!response.ok) return {
							...latest,
							busy: false,
							notice: payload.error ?? copy.current("saveError")
						};
						return persist({
							...latest,
							busy: false,
							baseText: text,
							version: payload.version,
							notice: copy.current("saved")
						});
					});
				}).catch(() => {
					update(owner, (latest) => ({
						...latest,
						busy: false,
						notice: copy.current("saveError")
					}));
				});
			};
			return {
				active: documentState?.path,
				draft: documentState?.text ?? "",
				saved: documentState?.baseText ?? "",
				version: documentState?.version,
				eol: documentState?.eol ?? "\n",
				loading: documentState?.status === "loading",
				ready: documentState?.status === "ready",
				busy: documentState?.busy ?? false,
				dirty,
				conflict: documentState?.conflict ?? false,
				notice: documentState?.notice,
				storageError,
				open: (path) => {
					if (path === current.current?.path) return;
					discard();
					publish(void 0);
					if (!writeWriterSelection(cwd, path)) setStorageError("unavailable");
					load(path);
				},
				close: () => {
					readController.current?.abort();
					discard();
					publish(void 0);
					if (!writeWriterSelection(cwd, void 0)) setStorageError("unavailable");
				},
				reload: (discardOnSuccess = false) => {
					if (current.current !== void 0 && !current.current.busy) load(current.current.path, discardOnSuccess);
				},
				edit: (text) => {
					const value = current.current;
					if (value?.status !== "ready") return;
					publish(persist({
						...value,
						text,
						notice: void 0
					}));
				},
				save
			};
		}
		//#endregion
		//#region lib/types/client/book-status.js
		/** Read chapter progress from the book's authoritative files and versioned reports. */
		function object(value) {
			if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid record");
			return value;
		}
		function text(value) {
			if (typeof value !== "string") throw new Error("expected text");
			return value;
		}
		function integer(value) {
			if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw new Error("expected non-negative integer");
			return value;
		}
		function strings(value) {
			if (!Array.isArray(value)) throw new Error("expected text list");
			return value.map(text);
		}
		function relative(value) {
			const path = text(value);
			if (!safeRelative(path) || /^[a-z][a-z\d+.-]*:/iu.test(path)) throw new Error("expected book-relative path");
			return path;
		}
		function parse(source, path) {
			try {
				return object(JSON.parse(source));
			} catch {
				throw new Error(path);
			}
		}
		/**
		* Compute the raw UTF-8 digest used by the Python chapter and review scripts.
		* @param value - decoded UTF-8 file, preserving its original line endings.
		* @returns lowercase SHA-256.
		*/
		async function manuscriptDigest(value) {
			const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
			return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
		}
		/**
		* Resolve a selected manuscript's chapter number; short stories return null.
		* @param path - book-relative selected file.
		* @returns chapter number, null for 正文.md, or undefined for other files.
		*/
		function selectedChapter(path) {
			if (path === "正文.md") return null;
			if (!path.startsWith("正文/")) return void 0;
			const match = /(?:^|\/)第0*(\d+)章[^/]*\.md$/u.exec(path);
			return match === null ? void 0 : Number(match[1]);
		}
		/**
		* Load current progress and the selected chapter's reports. Missing reports are normal;
		* malformed or inaccessible records reject with the owning path rather than imply a pass.
		* @param files - book-scoped reads and directory listings.
		* @param selected - selected chapter; absent selects the next uncommitted chapter.
		* @returns one bounded chapter snapshot, without mutating project files.
		*/
		async function readBookStatus(files, selected) {
			const statePath = "追踪/_tracking-state.json";
			const source = await files.read(statePath);
			let title = "";
			let lastChapter;
			let commitments = [];
			if (source !== void 0) try {
				const state = parse(source, statePath);
				if (state.schema_version !== 4) throw new Error("unsupported tracking schema");
				title = text(state.book_title);
				lastChapter = integer(state.last_committed_chapter);
				commitments = strings(object(state.context).next_chapter_commitments);
			} catch {
				throw new Error(statePath);
			}
			const chapter = selected !== void 0 ? selected : lastChapter === void 0 ? null : lastChapter + 1;
			const stem = chapter === null ? "正文" : `第${String(chapter).padStart(3, "0")}章`;
			const workDir = `.story/work/${stem}`;
			const [checkSource, reviewSource, workEntries] = await Promise.all([
				chapter === null ? void 0 : files.read(`.story/checks/${stem}.json`),
				files.read(`.story/reviews/${stem}.json`),
				files.list(workDir)
			]);
			let check;
			if (checkSource !== void 0) {
				const path = `.story/checks/${stem}.json`;
				try {
					const record = parse(checkSource, path);
					if (record.schema !== "story-chapter-check/v1" || record.chapter !== chapter) throw new Error("schema");
					const bodyPath = relative(record.body_path);
					const outlinePath = relative(record.outline_path);
					const [body, outline] = await Promise.all([files.read(bodyPath), files.read(outlinePath)]);
					const length = object(record.length);
					const quality = object(record.quality);
					if (!Array.isArray(quality.blocking_findings) || !Array.isArray(quality.tool_errors)) throw new Error("findings");
					check = {
						path,
						bodyPath,
						outlinePath,
						status: text(record.status),
						target: integer(length.target),
						actual: integer(length.actual),
						stale: body === void 0 || outline === void 0 || await manuscriptDigest(body) !== record.body_sha256 || await manuscriptDigest(outline) !== record.outline_sha256,
						findings: [...quality.blocking_findings, ...quality.tool_errors].map((item) => text(object(item).message))
					};
				} catch {
					throw new Error(path);
				}
			}
			let review;
			if (reviewSource !== void 0) {
				const path = `.story/reviews/${stem}.json`;
				try {
					const record = parse(reviewSource, path);
					if (record.schema !== "story-review/v1" || record.chapter !== chapter || !Array.isArray(record.findings)) throw new Error("schema");
					const bodyPath = relative(record.body_path);
					const bodyText = text(record.body_text);
					if (await manuscriptDigest(bodyText) !== record.body_sha256) throw new Error("snapshot");
					const currentText = await files.read(bodyPath);
					const stale = currentText === void 0 || await manuscriptDigest(currentText) !== record.body_sha256;
					const findings = record.findings.map((value) => {
						const item = object(value);
						const severity = item.severity;
						if (severity !== "must" && severity !== "suggestion" && severity !== "optional") throw new Error("severity");
						const line = integer(item.line);
						const quote = text(item.quote);
						if (line < 1 || quote === "" || !(bodyText.split(/\r\n|\r|\n/u)[line - 1] ?? "").includes(quote)) throw new Error("quote");
						let resolution;
						if (!stale && item.resolution !== null && item.resolution !== void 0) {
							const resolved = object(item.resolution);
							if (resolved.body_sha256 !== record.body_sha256 || resolved.kind !== "accepted" && resolved.kind !== "resolved") throw new Error("resolution");
							resolution = resolved.kind;
						}
						return {
							id: text(item.id),
							severity,
							line,
							quote,
							explanation: text(item.explanation),
							suggestion: text(item.suggestion),
							...resolution === void 0 ? {} : { resolution }
						};
					});
					review = {
						path,
						stale,
						summary: text(record.summary),
						bodyPath,
						bodyText,
						currentText: currentText ?? "",
						findings
					};
				} catch {
					throw new Error(path);
				}
			}
			return {
				title,
				...lastChapter === void 0 ? {} : { lastChapter },
				chapter,
				commitments,
				workFiles: workEntries.filter((entry) => entry.type === "file" && safeRelative(entry.name) && !entry.name.includes("/")).slice(0, 20).map((entry) => `${workDir}/${entry.name}`),
				...check === void 0 ? {} : { check },
				...review === void 0 ? {} : { review }
			};
		}
		//#endregion
		//#region lib/types/client/RevisionDiff.js
		/** Reuse DSH's bounded diff renderer for draft and review-version comparisons. */
		/**
		* Render an explicit comparison without changing either version.
		* @param props - source versions and localized chrome.
		* @returns the shared diff, or an unchanged message.
		*/
		function RevisionDiff({ path, before, after, t }) {
			const diffs = (0, react.useMemo)(() => [{
				path,
				oldText: before,
				newText: after
			}], [
				path,
				before,
				after
			]);
			if (before === after) return (0, react_jsx_runtime.jsx)("p", {
				className: "writer-muted",
				children: t("diffUnchanged")
			});
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DiffBlock, {
				diffs,
				labels: {
					codeLabel: t("diffTitle"),
					wrapLabel: t("diffWrap"),
					unwrapLabel: t("diffUnwrap"),
					copy: t("diffCopy"),
					copied: t("diffCopied"),
					collapseAria: t("diffCollapse"),
					collapse: t("diffCollapse"),
					expandAria: (hidden) => t("diffExpand").replace("{n}", String(hidden)),
					expand: (hidden) => t("diffExpand").replace("{n}", String(hidden))
				}
			});
		}
		//#endregion
		//#region lib/types/client/BookPanel.js
		/** On-demand chapter progress and cited reviews inside the existing writing sidebar. */
		function missing(error) {
			return error.code === "workspace-file/not-found";
		}
		const checkLabels = {
			ready: "checkReady",
			needs_decision: "checkDecision",
			blocked: "checkBlocked",
			invalid: "checkBlocked",
			tool_unavailable: "checkUnavailable"
		};
		/**
		* Read a single book's reports when expanded, without running tools or editing tracking files.
		* @param props - workspace identity, current draft, discovered books, and file-selection action.
		* @returns collapsible progress and review details.
		*/
		function BookPanel({ sessionId, cwd, remote, projects, active, draft, dirty, version, visible, onOpen, t }) {
			const [open, setOpen] = (0, react.useState)(false);
			const [bookPick, setBookPick] = (0, react.useState)();
			const [activeBook, setActiveBook] = (0, react.useState)();
			const [chapterPick, setChapterPick] = (0, react.useState)();
			const [chapterInput, setChapterInput] = (0, react.useState)();
			const [status, setStatus] = (0, react.useState)();
			const [error, setError] = (0, react.useState)();
			const [loading, setLoading] = (0, react.useState)(false);
			const [refresh, setRefresh] = (0, react.useState)(0);
			const bookPaths = projects.map((project) => project.path).join("\0");
			const containing = projects.filter((project) => project.path === "" || active?.startsWith(`${project.path}/`)).sort((left, right) => right.path.length - left.path.length)[0]?.path;
			const book = bookPick !== void 0 && projects.some((project) => project.path === bookPick) ? bookPick : containing ?? (activeBook !== void 0 && projects.some((project) => project.path === activeBook) ? activeBook : projects.length === 1 ? projects[0]?.path : void 0);
			const withinBook = active === void 0 || book === void 0 ? void 0 : book === "" ? active : active.startsWith(`${book}/`) ? active.slice(book.length + 1) : void 0;
			const chapter = chapterPick ?? (withinBook === void 0 ? void 0 : selectedChapter(withinBook));
			const joinBook = (path) => book === "" ? path : `${book}/${path}`;
			(0, react.useEffect)(() => {
				setChapterPick(void 0);
				setChapterInput(void 0);
			}, [active, book]);
			(0, react.useEffect)(() => {
				if (!open || !visible) return;
				const controller = new AbortController();
				readWorkspaceText(remote, sessionId, `${cwd}/.active-book`, controller.signal).then((result) => {
					if (controller.signal.aborted || !result.ok) return;
					const path = result.value.text.trim().replace(/\/$/u, "");
					if (path === "." || safeRelative(path)) setActiveBook(path === "." ? "" : path);
				}).catch(() => {});
				return () => {
					controller.abort();
				};
			}, [
				open,
				visible,
				remote,
				sessionId,
				cwd,
				refresh
			]);
			(0, react.useEffect)(() => {
				if (!open || !visible || book === void 0) return;
				const controller = new AbortController();
				const absolute = (path) => `${cwd}/${book === "" ? "" : `${book}/`}${path}`;
				setLoading(true);
				setError(void 0);
				setStatus(void 0);
				readBookStatus({
					read: async (path) => {
						const result = await readWorkspaceText(remote, sessionId, absolute(path), controller.signal);
						if (result.ok) return result.value.text;
						if (missing(result.error)) return void 0;
						throw new Error(`${path}: ${remoteMessage(result.error, t("loadError"))}`);
					},
					list: async (path) => {
						const result = await remote.workspaceFiles.list(sessionId, absolute(path), controller.signal);
						if (result.ok) {
							if (result.value.truncated) throw new Error(`${path}: ${t("truncated")}`);
							return result.value.entries;
						}
						if (missing(result.error)) return [];
						throw new Error(`${path}: ${remoteMessage(result.error, t("loadError"))}`);
					}
				}, chapter).then((value) => {
					if (!controller.signal.aborted) setStatus(value);
				}).catch((cause) => {
					if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : t("loadError"));
				}).finally(() => {
					if (!controller.signal.aborted) setLoading(false);
				});
				return () => {
					controller.abort();
				};
			}, [
				open,
				visible,
				book,
				chapter,
				sessionId,
				cwd,
				remote,
				version,
				refresh,
				bookPaths,
				t
			]);
			if (projects.length === 0) return null;
			const check = status?.check;
			const draftAffectsChapter = dirty && withinBook !== void 0 && (selectedChapter(withinBook) === status?.chapter || withinBook === check?.outlinePath || withinBook === check?.bodyPath);
			const review = status?.review;
			const reviewDraft = review !== void 0 && withinBook === review.bodyPath ? draft : void 0;
			const staleReview = review?.stale === true || review !== void 0 && reviewDraft !== void 0 && normalizeEol(review.bodyText) !== reviewDraft;
			return (0, react_jsx_runtime.jsxs)("details", {
				className: "writer-book-panel",
				open,
				onToggle: (event) => {
					setOpen(event.currentTarget.open);
				},
				children: [(0, react_jsx_runtime.jsx)("summary", { children: t("bookPanelTitle") }), open && (0, react_jsx_runtime.jsxs)("div", {
					className: "writer-book-content",
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: "writer-book-controls",
						children: [
							(0, react_jsx_runtime.jsxs)("label", { children: [
								t("bookPanelBook"),
								" ",
								(0, react_jsx_runtime.jsxs)("select", {
									value: book ?? "__choose__",
									onChange: (event) => {
										setBookPick(event.target.value);
									},
									children: [book === void 0 && (0, react_jsx_runtime.jsx)("option", {
										value: "__choose__",
										children: t("bookChoose")
									}), projects.map((project) => (0, react_jsx_runtime.jsx)("option", {
										value: project.path,
										children: project.name || t("workspaceBook")
									}, project.path))]
								})
							] }),
							book !== void 0 && chapter !== null && status?.chapter !== null && (0, react_jsx_runtime.jsxs)("label", { children: [
								t("bookPanelChapter"),
								" ",
								(0, react_jsx_runtime.jsx)("input", {
									type: "number",
									min: 1,
									value: chapterInput ?? chapterPick ?? status?.chapter ?? 1,
									onChange: (event) => {
										setChapterInput(event.target.value);
									},
									onBlur: (event) => {
										const value = Number(event.target.value);
										if (Number.isSafeInteger(value) && value > 0) setChapterPick(value);
										else setChapterInput(void 0);
									},
									onKeyDown: (event) => {
										if (event.key === "Enter") event.currentTarget.blur();
									}
								})
							] }),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: loading,
								onClick: () => {
									setRefresh((value) => value + 1);
								},
								children: t("bookRefresh")
							})
						]
					}), book === void 0 ? (0, react_jsx_runtime.jsx)("p", { children: t("bookChoose") }) : loading ? (0, react_jsx_runtime.jsx)("p", {
						role: "status",
						children: t("loading")
					}) : error !== void 0 ? (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						children: t("bookRecordError").replace("{path}", error)
					}) : status !== void 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						(0, react_jsx_runtime.jsxs)("p", { children: [
							status.title || projects.find((project) => project.path === book)?.name,
							" · ",
							status.lastChapter === void 0 ? t("bookNoTracking") : t("bookCommitted").replace("{n}", String(status.lastChapter))
						] }),
						status.lastChapter !== void 0 && (0, react_jsx_runtime.jsx)("p", { children: t("bookNext").replace("{n}", String(status.lastChapter + 1)) }),
						status.commitments.length > 0 && (0, react_jsx_runtime.jsxs)("details", { children: [(0, react_jsx_runtime.jsx)("summary", { children: t("bookCommitments") }), (0, react_jsx_runtime.jsx)("ul", { children: status.commitments.map((item, index) => (0, react_jsx_runtime.jsx)("li", { children: item }, index)) })] }),
						(0, react_jsx_runtime.jsxs)("div", {
							className: "writer-book-report",
							children: [
								(0, react_jsx_runtime.jsx)("strong", { children: t("bookMechanical") }),
								(0, react_jsx_runtime.jsx)("p", { children: check === void 0 ? t("bookUnchecked") : check.stale || draftAffectsChapter ? t("bookStale") : t(checkLabels[check.status] ?? "checkUnavailable") }),
								check !== void 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									(0, react_jsx_runtime.jsx)("p", { children: t("bookWordcount").replace("{actual}", String(check.actual)).replace("{target}", String(check.target)) }),
									check.findings.length > 0 && (0, react_jsx_runtime.jsx)("ul", { children: check.findings.map((finding, index) => (0, react_jsx_runtime.jsx)("li", { children: finding }, index)) }),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											onOpen(joinBook(check.path));
										},
										children: t("bookOpenCheck")
									})
								] }),
								(0, react_jsx_runtime.jsx)("p", {
									className: "writer-muted",
									children: t("bookCheckHelp")
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: "writer-book-report",
							children: [
								(0, react_jsx_runtime.jsx)("strong", { children: t("bookSemantic") }),
								(0, react_jsx_runtime.jsx)("p", { children: review === void 0 ? t("bookUnreviewed") : staleReview ? t("bookStaleReview") : t("bookReviewCurrent") }),
								review !== void 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									(0, react_jsx_runtime.jsx)("p", { children: review.summary }),
									(0, react_jsx_runtime.jsx)("ul", { children: review.findings.map((finding) => (0, react_jsx_runtime.jsxs)("li", { children: [
										(0, react_jsx_runtime.jsxs)("span", { children: [
											t(finding.severity === "must" ? "reviewMust" : finding.severity === "suggestion" ? "reviewSuggestion" : "reviewOptional"),
											" · ",
											t("reviewLine").replace("{n}", String(finding.line))
										] }),
										(0, react_jsx_runtime.jsx)("blockquote", { children: finding.quote }),
										(0, react_jsx_runtime.jsx)("p", { children: finding.explanation }),
										(0, react_jsx_runtime.jsx)("p", { children: finding.suggestion }),
										!staleReview && finding.resolution !== void 0 && (0, react_jsx_runtime.jsx)("span", { children: t(finding.resolution === "accepted" ? "reviewAccepted" : "reviewResolved") })
									] }, finding.id)) }),
									(0, react_jsx_runtime.jsxs)("details", { children: [(0, react_jsx_runtime.jsx)("summary", { children: t("reviewChanges") }), (0, react_jsx_runtime.jsx)(RevisionDiff, {
										path: review.bodyPath,
										before: normalizeEol(review.bodyText),
										after: reviewDraft ?? normalizeEol(review.currentText),
										t
									})] }),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											onOpen(joinBook(review.path));
										},
										children: t("bookOpenReview")
									}),
									(0, react_jsx_runtime.jsx)("p", {
										className: "writer-muted",
										children: t("reviewResolveHelp")
									})
								] })
							]
						}),
						status.workFiles.length > 0 && (0, react_jsx_runtime.jsxs)("div", {
							className: "writer-book-report",
							children: [
								(0, react_jsx_runtime.jsx)("strong", { children: t("bookUnfinished") }),
								(0, react_jsx_runtime.jsx)("p", { children: t("bookResumeHelp") }),
								status.workFiles.filter(isEditableWriterPath).map((path) => (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										onOpen(joinBook(path));
									},
									children: path.split("/").pop()
								}, path))
							]
						})
					] })]
				})]
			});
		}
		/** Align with Dashboard `MAX_SEARCH_NODES`. */
		const MAX_SEARCH_NODES = 5e3;
		function joinRel(parent, name) {
			return parent === "" || parent === "." ? name : `${parent}/${name}`;
		}
		/**
		* Walk tab roots and collect files whose basename contains the query (zh-CN case fold).
		* @param roots - workspace-relative root paths for the active tab.
		* @param queryValue - raw search box text.
		* @param listDir - list one directory (same shape as desk `readDir`).
		* @param signal - optional abort.
		* @returns hits, truncation flags, and soft errors.
		*/
		async function searchWriterFilenames(roots, queryValue, listDir, signal) {
			const query = queryValue.trim();
			const limits = {
				maxResults: 100,
				maxNodes: MAX_SEARCH_NODES,
				maxDepth: 20
			};
			const emptyTruncation = {
				byResults: false,
				byNodes: false,
				byDepth: false,
				byReadError: false
			};
			if (query === "" || query.length > 100) return {
				query,
				results: [],
				truncated: false,
				truncation: emptyTruncation,
				scanErrors: [],
				limits
			};
			const normalizedQuery = query.toLocaleLowerCase("zh-CN");
			const results = [];
			const scanErrors = [];
			let nodes = 0;
			let truncatedByResults = false;
			let truncatedByNodes = false;
			let truncatedByDepth = false;
			const visit = async (relativePath, depth) => {
				if (signal?.aborted) return;
				if (results.length >= 100) {
					truncatedByResults = true;
					return;
				}
				if (nodes >= 5e3) {
					truncatedByNodes = true;
					return;
				}
				if (depth > 20) {
					truncatedByDepth = true;
					return;
				}
				nodes += 1;
				let page;
				try {
					page = await listDir(relativePath);
				} catch (error) {
					scanErrors.push(error instanceof Error ? error.message : `unreadable:${relativePath || "."}`);
					return;
				}
				if (signal?.aborted) return;
				for (const entry of visibleDirectoryEntries(page.entries)) {
					if (results.length >= 100) {
						truncatedByResults = true;
						break;
					}
					if (nodes >= 5e3) {
						truncatedByNodes = true;
						break;
					}
					const childPath = joinRel(relativePath === "." ? "" : relativePath, entry.name);
					if (entry.type === "file") {
						if (depth + 1 > 20) {
							truncatedByDepth = true;
							continue;
						}
						nodes += 1;
						if (entry.name.toLocaleLowerCase("zh-CN").includes(normalizedQuery)) {
							const editable = isEditableWriterName(entry.name) && (entry.size === void 0 || entry.size <= 2097152);
							results.push(entry.size === void 0 ? {
								name: entry.name,
								path: childPath,
								editable
							} : {
								name: entry.name,
								path: childPath,
								editable,
								size: entry.size
							});
						}
						continue;
					}
					if (entry.type === "directory") {
						if (shouldIgnoreDirectory(entry.name)) continue;
						await visit(childPath, depth + 1);
					}
				}
				if (page.truncated) truncatedByNodes = true;
			};
			for (const root of roots) {
				if (truncatedByResults || truncatedByNodes) break;
				if (signal?.aborted) break;
				await visit(root === "." ? "" : root, 0);
			}
			results.sort((left, right) => {
				const byName = compareWriterNames(left.name, right.name);
				return byName !== 0 ? byName : compareWriterNames(left.path, right.path);
			});
			const truncation = {
				byResults: truncatedByResults,
				byNodes: truncatedByNodes,
				byDepth: truncatedByDepth,
				byReadError: scanErrors.length > 0
			};
			return {
				query,
				results,
				truncated: truncation.byResults || truncation.byNodes || truncation.byDepth || truncation.byReadError,
				truncation,
				scanErrors,
				limits
			};
		}
		/**
		* Build human truncation hints (Dashboard copy shape).
		* @param truncation - flags from a search.
		* @param limits - numeric caps.
		* @param scanErrors - soft list failures.
		* @param format - number formatter.
		* @returns joined messages, or empty when nothing truncated.
		*/
		function writerSearchTruncationMessage(truncation, limits, scanErrors, format = (value) => value.toLocaleString("zh-CN")) {
			const messages = [];
			if (truncation.byResults) messages.push(`匹配结果超过 ${format(limits.maxResults)} 条，仅显示最先找到的部分，请输入更精确的文件名`);
			if (truncation.byNodes) messages.push(`搜索达到 ${format(limits.maxNodes)} 个节点的扫描上限，后续目录尚未检查，请直接展开目标目录查找`);
			if (truncation.byDepth) messages.push(`部分目录超过 ${format(limits.maxDepth)} 层，更深处未搜索；其他项目已继续搜索`);
			if (truncation.byReadError) {
				const shown = scanErrors.slice(0, 3).join("、") || "部分目录";
				const more = scanErrors.length > 3 ? `等 ${format(scanErrors.length)} 处` : "";
				messages.push(`${shown}${more}无法读取，搜索结果可能不完整`);
			}
			return messages.join("；");
		}
		//#endregion
		//#region lib/types/client/rail-chrome.js
		/** Chrome prefs for the writing left rail: width and collapsed (localStorage only). */
		const WRITER_RAIL_STORAGE_KEY = "writer.rail.chrome";
		/**
		* Clamp a proposed rail width into the usable range.
		* @param width - raw pixel width from drag or storage.
		* @returns integer px within min/max (or the default when not finite).
		*/
		function clampRailWidth(width) {
			if (!Number.isFinite(width)) return 220;
			return Math.min(480, Math.max(180, Math.round(width)));
		}
		/**
		* Cap a preferred rail width so rail + handle (+ stage min when possible) fit
		* inside the desk. The CSS rail track is a *fixed* `var(--writer-rail-width)`
		* (not minmax(0, …)) with `overflow:hidden` on the desk — if the track is
		* wider than the visible desk, the right side of the rail is clipped while
		* the left Tab (`拆文库`) keeps its full layout width (looks like it "won't
		* shrink" while `写作项目` is covered). So this may drop *below*
		* {@link WRITER_RAIL_MIN_WIDTH} on a narrow host: equal Tab columns then
		* ellipsis together instead of mid-glyph clipping. Manual drag still clamps
		* to min via {@link clampRailWidth}.
		* @param preferred - stored or dragged width (will be clamped first).
		* @param deskWidth - `.writer-desk` clientWidth in CSS px.
		* @returns width to apply as `--writer-rail-width` (≤ desk − handle when desk > 0).
		*/
		function fitRailWidth(preferred, deskWidth) {
			const width = clampRailWidth(preferred);
			if (!Number.isFinite(deskWidth) || deskWidth <= 0) return width;
			const maxWithStage = deskWidth - 5 - 160;
			if (maxWithStage > 0) return Math.min(width, Math.round(maxWithStage));
			return Math.max(0, Math.round(deskWidth - 5));
		}
		/**
		* Default chrome when nothing is stored or storage is unusable.
		* @returns default width and expanded rail.
		*/
		function defaultRailChrome() {
			return {
				width: 220,
				collapsed: false
			};
		}
		function safeStorage() {
			try {
				if (typeof globalThis === "undefined") return void 0;
				return globalThis.localStorage;
			} catch {
				return;
			}
		}
		/**
		* Read persisted rail chrome; invalid or missing values fall back to defaults.
		* @param storage - optional storage (tests); defaults to `localStorage`.
		* @returns clamped width and collapsed flag.
		*/
		function readRailChrome(storage = safeStorage()) {
			const fallback = defaultRailChrome();
			if (storage === void 0) return fallback;
			try {
				const raw = storage.getItem(WRITER_RAIL_STORAGE_KEY);
				if (raw === null || raw === "") return fallback;
				const parsed = JSON.parse(raw);
				return {
					width: clampRailWidth(typeof parsed.width === "number" ? parsed.width : fallback.width),
					collapsed: parsed.collapsed === true
				};
			} catch {
				return fallback;
			}
		}
		/**
		* Persist rail chrome (width always clamped).
		* @param chrome - next prefs.
		* @param storage - optional storage (tests); defaults to `localStorage`.
		*/
		function writeRailChrome(chrome, storage = safeStorage()) {
			if (storage === void 0) return;
			const next = {
				width: clampRailWidth(chrome.width),
				collapsed: chrome.collapsed === true
			};
			try {
				storage.setItem(WRITER_RAIL_STORAGE_KEY, JSON.stringify(next));
			} catch {}
		}
		/**
		* Apply a new width while keeping the collapsed flag.
		* @param chrome - current prefs.
		* @param width - proposed width.
		* @returns updated chrome with clamped width.
		*/
		function setRailWidth(chrome, width) {
			return {
				...chrome,
				width: clampRailWidth(width)
			};
		}
		/**
		* Toggle or set collapsed without changing width.
		* @param chrome - current prefs.
		* @param collapsed - next collapsed flag; omit to flip.
		* @returns updated chrome.
		*/
		function setRailCollapsed(chrome, collapsed) {
			return {
				...chrome,
				collapsed: collapsed === void 0 ? !chrome.collapsed : collapsed === true
			};
		}
		//#endregion
		//#region lib/types/client/workspace-status.js
		/** Workspace masthead helpers: short cwd name and scan health. */
		/**
		* Last path segment of a workspace cwd for the masthead.
		* @param cwd - absolute or relative workspace root.
		* @returns a short display name.
		*/
		function workspaceShortName(cwd) {
			if (/^[/\\]+$/u.test(cwd)) return "/";
			const trimmed = cwd.replace(/[/\\]+$/u, "");
			if (trimmed === "" || trimmed === ".") return trimmed === "" ? "." : trimmed;
			const parts = trimmed.split(/[/\\]/u).filter((part) => part !== "");
			return parts[parts.length - 1] ?? trimmed;
		}
		/**
		* Derive listing health from scan progress and soft/hard failures.
		* @param input - scanning flag, hard failure, roots, and soft errors.
		* @returns health for the masthead / rail footnote.
		*/
		function writerScanHealth(input) {
			if (input.scanning) return "loading";
			if (input.hardFailed) return "failed";
			if (input.scanErrors.length > 0 && input.libraryCount === 0 && input.projectCount === 0 && input.scanCount === 0) return "failed";
			if (input.scanErrors.length > 0) return "partial";
			return "ok";
		}
		//#endregion
		//#region lib/types/client/desk.js
		function joinCwd(cwd, relative) {
			const root = cwd.replace(/[/\\]+$/u, "");
			if (relative === "" || relative === ".") return root;
			return `${root}/${relative}`;
		}
		async function readDir(remote, sessionId, cwd, relative, signal) {
			const path = joinCwd(cwd, relative);
			const result = await remote.workspaceFiles.list(sessionId, path, signal);
			if (!result.ok) throw new Error(remoteMessage(result.error, "load"));
			return {
				entries: result.value.entries,
				truncated: result.value.truncated
			};
		}
		function updateDirectoryNode(nodes, path, update) {
			return nodes.map((node) => {
				if (node.kind !== "directory") return node;
				if (node.path === path) return update(node);
				if (!(node.path === "" ? path !== "" : path.startsWith(`${node.path}/`))) return node;
				return {
					...node,
					children: updateDirectoryNode(node.children, path, update)
				};
			});
		}
		function fileStemAndExt(name) {
			const ext = writerExtension(name);
			if (ext === "") return {
				stem: name,
				ext: ""
			};
			return {
				stem: name.slice(0, -ext.length),
				ext: ext.slice(1)
			};
		}
		function countCharacters(content) {
			return [...content.replace(/\s/gu, "")].length;
		}
		function cursorLineCol(content, caret) {
			const lines = content.slice(0, Math.max(0, Math.min(caret, content.length))).split("\n");
			const last = lines[lines.length - 1] ?? "";
			return {
				line: lines.length,
				col: [...last].length + 1
			};
		}
		function isChatComposerTarget(target) {
			if (!(target instanceof HTMLElement)) return false;
			if (target.closest("[data-workbench=\"writer\"]") !== null) return false;
			const tag = target.tagName;
			if (tag !== "TEXTAREA" && tag !== "INPUT" && !target.isContentEditable) return false;
			return true;
		}
		function healthCopy(health, t) {
			if (health === "loading") return t("healthLoading");
			if (health === "partial") return t("healthPartial");
			if (health === "failed") return t("healthFailed");
			return t("healthOk");
		}
		/**
		* Split a filename stem around the first case-insensitive query occurrence.
		* @param stem - the displayed filename stem.
		* @param query - the active search text.
		* @returns the stem with the matched run wrapped in a mark.
		*/
		function highlightStem(stem, query) {
			const needle = query.trim().toLowerCase();
			if (needle === "") return stem;
			const at = stem.toLowerCase().indexOf(needle);
			if (at < 0) return stem;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				stem.slice(0, at),
				(0, react_jsx_runtime.jsx)("mark", { children: stem.slice(at, at + needle.length) }),
				stem.slice(at + needle.length)
			] });
		}
		/**
		* The parent directory of a hit path, for the inline location hint.
		* @param path - the hit's workspace-relative path.
		* @returns the directory part, or '' for root-level hits.
		*/
		function searchHitDir(path) {
			const cut = path.lastIndexOf("/");
			return cut <= 0 ? "" : path.slice(0, cut);
		}
		function TreeNodes({ nodes, depth, expanded, selected, listings, onToggle, onSelect, onLoadMore, onRetry, t }) {
			return nodes.map((node) => {
				const indent = { "--writer-indent": `${String(depth * 12)}px` };
				const childIndent = { "--writer-indent": `${String((depth + 1) * 12)}px` };
				if (node.kind === "file") {
					const { stem, ext } = fileStemAndExt(node.name);
					return (0, react_jsx_runtime.jsx)("li", { children: (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: node.editable ? "writer-tree-file" : "writer-tree-file writer-tree-file-disabled",
						style: indent,
						title: node.editable ? node.path : t("notEditable").replace("{path}", node.path),
						"aria-label": node.name,
						"aria-current": node.path === selected ? "true" : void 0,
						disabled: !node.editable,
						onClick: () => {
							if (node.editable) onSelect(node.path);
						},
						children: [
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
								kind: (0, _deepseek_ai_dsh_client_ui_primitives.classifyFileType)(node.name),
								size: 16,
								className: "writer-tree-kind"
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: "writer-tree-label",
								"aria-hidden": "true",
								children: stem || node.name
							}),
							ext !== "" && ext !== "md" && (0, react_jsx_runtime.jsx)("span", {
								className: "writer-tree-ext",
								"aria-hidden": "true",
								children: ext
							})
						]
					}) }, node.path);
				}
				const key = node.path;
				const open = key in expanded ? expanded[key] === true : defaultWriterTreeExpanded(key, selected);
				const listing = listings[key];
				const total = listing === void 0 ? node.children.length : visibleDirectoryEntries(listing.entries).length;
				const hasMore = listing !== void 0 && node.shown < total;
				const apiTruncated = (listing?.truncated ?? node.truncated) && node.shown >= total && total > 0;
				const folderName = node.name === "" || node.name === "." ? t("workspaceBook") : node.name;
				return (0, react_jsx_runtime.jsxs)("li", {
					className: "writer-tree-folder",
					children: [(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "writer-tree-toggle",
						style: indent,
						"aria-expanded": open,
						"aria-label": folderName,
						onClick: () => {
							onToggle(key, !open);
						},
						children: [open ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpenRegular, {
							className: "writer-tree-kind",
							"aria-hidden": "true"
						}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderCloseRegular, {
							className: "writer-tree-kind",
							"aria-hidden": "true"
						}), (0, react_jsx_runtime.jsx)("span", {
							className: "writer-tree-label",
							children: folderName
						})]
					}), open && (0, react_jsx_runtime.jsxs)("ul", { children: [
						node.loading && (0, react_jsx_runtime.jsx)("li", {
							className: "writer-tree-status",
							style: childIndent,
							children: t("loading")
						}),
						node.loadError !== void 0 && !node.loading && (0, react_jsx_runtime.jsx)("li", { children: (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "writer-tree-status-action",
							style: childIndent,
							onClick: () => {
								onRetry(node.path);
							},
							children: t("loadDirError")
						}) }),
						node.loaded && !node.loading && node.children.length === 0 && node.loadError === void 0 && (0, react_jsx_runtime.jsx)("li", {
							className: "writer-tree-status",
							style: childIndent,
							children: t("emptyDir")
						}),
						TreeNodes({
							nodes: node.children,
							depth: depth + 1,
							expanded,
							selected,
							listings,
							onToggle,
							onSelect,
							onLoadMore,
							onRetry,
							t
						}),
						hasMore && !node.loading && (0, react_jsx_runtime.jsx)("li", { children: (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "writer-tree-status-action",
							style: childIndent,
							onClick: () => {
								onLoadMore(node.path);
							},
							children: t("loadMore")
						}) }),
						apiTruncated && (0, react_jsx_runtime.jsx)("li", {
							className: "writer-tree-status",
							style: childIndent,
							children: t("truncated")
						})
					] })]
				}, key === "" ? "workspace-root" : key);
			});
		}
		function SearchHits({ hits, query, selected, onSelect, t }) {
			return (0, react_jsx_runtime.jsx)("ul", {
				className: "writer-tree writer-search-hits",
				children: hits.map((hit) => {
					const { stem, ext } = fileStemAndExt(hit.name);
					const dir = searchHitDir(hit.path);
					return (0, react_jsx_runtime.jsx)("li", { children: (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: hit.editable ? "writer-tree-file" : "writer-tree-file writer-tree-file-disabled",
						title: hit.editable ? hit.path : t("notEditable").replace("{path}", hit.path),
						"aria-label": hit.name,
						"aria-current": hit.path === selected ? "true" : void 0,
						disabled: !hit.editable,
						onClick: () => {
							if (hit.editable) onSelect(hit.path);
						},
						children: [
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
								kind: (0, _deepseek_ai_dsh_client_ui_primitives.classifyFileType)(hit.name),
								size: 16,
								className: "writer-tree-kind"
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: "writer-tree-label",
								"aria-hidden": "true",
								children: highlightStem(stem || hit.name, query)
							}),
							ext !== "" && ext !== "md" && (0, react_jsx_runtime.jsx)("span", {
								className: "writer-tree-ext",
								"aria-hidden": "true",
								children: ext
							}),
							dir !== "" && (0, react_jsx_runtime.jsx)("span", {
								className: "writer-search-dir",
								"aria-hidden": "true",
								children: dir
							})
						]
					}) }, hit.path);
				})
			});
		}
		/**
		* The writing sidebar body for one session.
		* @param props - session, workspace root, remote, and copy.
		* @returns the desk.
		*/
		function WriterDesk(props) {
			return (0, react_jsx_runtime.jsx)(WriterDeskBody, { ...props }, JSON.stringify([props.sessionId, props.cwd]));
		}
		function WriterDeskBody({ sessionId, cwd, remote, t, visible }) {
			const writerDocument = useWriterDocument(remote, sessionId, cwd, t);
			const { active, draft, saved, version, eol, busy, dirty, conflict } = writerDocument;
			const [viewPick, setViewPick] = (0, react.useState)(void 0);
			const [libraries, setLibraries] = (0, react.useState)([]);
			const [projects, setProjects] = (0, react.useState)([]);
			const [scans, setScans] = (0, react.useState)([]);
			const [listings, setListings] = (0, react.useState)({});
			const [notice, setNotice] = (0, react.useState)(void 0);
			const [conflictOpen, setConflictOpen] = (0, react.useState)(false);
			const [showLineNumbers, setShowLineNumbers] = (0, react.useState)(true);
			const [reloadKey, setReloadKey] = (0, react.useState)(0);
			const [expanded, setExpanded] = (0, react.useState)({});
			const [scanErrors, setScanErrors] = (0, react.useState)([]);
			const [scanning, setScanning] = (0, react.useState)(false);
			const [scanHardFailed, setScanHardFailed] = (0, react.useState)(false);
			const [filter, setFilter] = (0, react.useState)("");
			const [searching, setSearching] = (0, react.useState)(false);
			const [searchResult, setSearchResult] = (0, react.useState)(void 0);
			const [mode, setMode] = (0, react.useState)("edit");
			const [caret, setCaret] = (0, react.useState)(0);
			const searchRef = (0, react.useRef)(null);
			const editorRef = (0, react.useRef)(null);
			const saveRef = (0, react.useRef)(() => {});
			const searchSeq = (0, react.useRef)(0);
			const selectionSeq = (0, react.useRef)(0);
			const selectFileRef = (0, react.useRef)(() => {});
			const [railChrome, setRailChrome] = (0, react.useState)(() => readRailChrome());
			const [deskWidth, setDeskWidth] = (0, react.useState)(0);
			const deskRef = (0, react.useRef)(null);
			const railDrag = (0, react.useRef)(void 0);
			const preferredView = libraries.length > 0 ? "libraries" : projects.length > 0 || scans.length === 0 ? "projects" : "scans";
			const view = viewPick ?? preferredView;
			const roots = view === "libraries" ? libraries : view === "projects" ? projects : scans;
			const rootPathsKey = roots.map((node) => node.path).join("\0");
			const query = filter.trim();
			const showSearch = query !== "";
			const patchDirectory = (path, update) => {
				setLibraries((nodes) => updateDirectoryNode(nodes, path, update));
				setProjects((nodes) => updateDirectoryNode(nodes, path, update));
				setScans((nodes) => updateDirectoryNode(nodes, path, update));
			};
			(0, react.useEffect)(() => {
				selectionSeq.current += 1;
				if (!visible) return void 0;
				const controller = new AbortController();
				const signal = controller.signal;
				setNotice(void 0);
				setScanning(true);
				setScanHardFailed(false);
				(async () => {
					try {
						const scan = await scanWriterWorkspace((relative) => readDir(remote, sessionId, cwd, relative, signal).then((page) => page.entries));
						if (signal.aborted) return;
						setLibraries(scan.libraries.map(rootToDirectoryNode));
						setProjects(scan.projects.map(rootToDirectoryNode));
						setScans(scan.scans.map(rootToDirectoryNode));
						setScanErrors(scan.scanErrors);
						setScanHardFailed(false);
						setListings({});
						setExpanded({});
					} catch (error) {
						if (signal.aborted) return;
						setLibraries([]);
						setProjects([]);
						setScans([]);
						setScanErrors([]);
						setScanHardFailed(true);
						setNotice(error instanceof Error && error.message !== "load" ? error.message : t("loadError"));
					} finally {
						if (!signal.aborted) setScanning(false);
					}
				})();
				return () => {
					controller.abort();
					selectionSeq.current += 1;
				};
			}, [
				visible,
				sessionId,
				cwd,
				remote,
				reloadKey,
				t
			]);
			const loadDirectory = (path, force = false, onLoaded) => {
				const cached = force ? void 0 : listings[path];
				if (cached !== void 0) {
					patchDirectory(path, (node) => {
						const built = buildLoadedChildren(path, cached.entries, Math.max(node.shown, 200), cached.truncated);
						const { loadError: _drop, ...rest } = node;
						return {
							...rest,
							...built,
							loaded: true,
							loading: false
						};
					});
					onLoaded?.(cached.entries);
					return;
				}
				if (force) setListings((current) => {
					const next = { ...current };
					delete next[path];
					return next;
				});
				patchDirectory(path, (node) => {
					const { loadError: _drop, ...rest } = node;
					return {
						...rest,
						loading: true
					};
				});
				readDir(remote, sessionId, cwd, path, new AbortController().signal).then((page) => {
					setListings((current) => ({
						...current,
						[path]: {
							entries: page.entries,
							truncated: page.truncated
						}
					}));
					patchDirectory(path, (node) => {
						const built = buildLoadedChildren(path, page.entries, 200, page.truncated);
						const { loadError: _drop, ...rest } = node;
						return {
							...rest,
							...built,
							loaded: true,
							loading: false
						};
					});
					onLoaded?.(page.entries);
				}).catch((error) => {
					patchDirectory(path, (node) => ({
						...node,
						loading: false,
						loadError: error instanceof Error ? error.message : t("loadError")
					}));
				});
			};
			(0, react.useEffect)(() => {
				if (!visible || showSearch) return;
				for (const root of roots) {
					if (root.kind !== "directory") continue;
					const key = root.path;
					if (!(key in expanded ? expanded[key] === true : defaultWriterTreeExpanded(key, active)) || root.loaded || root.loading || root.loadError !== void 0) continue;
					loadDirectory(key);
				}
			}, [
				visible,
				roots,
				expanded,
				active,
				listings,
				showSearch
			]);
			const onToggle = (path, open) => {
				const sequence = ++selectionSeq.current;
				setExpanded((current) => ({
					...current,
					[path]: open
				}));
				if (!open) return;
				const isScanRoot = view === "scans" && scans.some((root) => root.path === path);
				loadDirectory(path, false, isScanRoot ? (entries) => {
					if (sequence !== selectionSeq.current) return;
					const report = preferredScanReport(entries);
					if (report !== void 0) selectFileRef.current(`${path}/${report}`, true);
				} : void 0);
			};
			const pickView = (next) => {
				selectionSeq.current += 1;
				setViewPick(next);
			};
			const onLoadMore = (path) => {
				const cached = listings[path];
				if (cached === void 0) return;
				patchDirectory(path, (node) => {
					const built = buildLoadedChildren(path, cached.entries, node.shown + 200, cached.truncated);
					return {
						...node,
						...built,
						loaded: true,
						loading: false
					};
				});
			};
			const confirmDiscard = () => !dirty || window.confirm(t("confirmDiscard"));
			const selectFile = (path, preview = false) => {
				selectionSeq.current += 1;
				if (path === active) {
					if (preview) setMode("preview");
					return;
				}
				if (!confirmDiscard()) return;
				if (preview) setMode("preview");
				writerDocument.open(path);
			};
			selectFileRef.current = selectFile;
			const rescan = () => {
				if (!confirmDiscard()) return;
				selectionSeq.current += 1;
				writerDocument.close();
				setReloadKey((value) => value + 1);
			};
			(0, react.useEffect)(() => {
				setConflictOpen(conflict);
			}, [conflict]);
			(0, react.useEffect)(() => {
				setCaret(0);
			}, [active]);
			const save = writerDocument.save;
			saveRef.current = save;
			(0, react.useEffect)(() => {
				if (!visible) return void 0;
				const trimmed = filter.trim();
				if (trimmed === "") {
					searchSeq.current += 1;
					setSearching(false);
					setSearchResult(void 0);
					return;
				}
				if (trimmed.length > 100) {
					searchSeq.current += 1;
					setSearching(false);
					setSearchResult(void 0);
					setNotice(t("searchQueryTooLong"));
					return;
				}
				setSearching(true);
				const sequence = ++searchSeq.current;
				const controller = new AbortController();
				const timer = window.setTimeout(() => {
					searchWriterFilenames(rootPathsKey === "" ? [] : rootPathsKey.split("\0").map((path) => path === "" ? "." : path), trimmed, (relative) => readDir(remote, sessionId, cwd, relative === "." ? "" : relative, controller.signal), controller.signal).then((result) => {
						if (sequence !== searchSeq.current || controller.signal.aborted) return;
						setSearchResult(result);
						setSearching(false);
					}).catch((error) => {
						if (sequence !== searchSeq.current || controller.signal.aborted) return;
						setSearching(false);
						setSearchResult(void 0);
						setNotice(error instanceof Error ? error.message : t("loadError"));
					});
				}, 180);
				return () => {
					window.clearTimeout(timer);
					controller.abort();
				};
			}, [
				visible,
				filter,
				view,
				rootPathsKey,
				remote,
				sessionId,
				cwd,
				t
			]);
			(0, react.useEffect)(() => {
				if (!visible) return void 0;
				const onKey = (event) => {
					if (!(event.metaKey || event.ctrlKey)) return;
					const key = event.key.toLocaleLowerCase();
					if (key === "s") {
						event.preventDefault();
						saveRef.current();
						return;
					}
					if (key === "k") {
						if (isChatComposerTarget(event.target)) return;
						event.preventDefault();
						const input = searchRef.current;
						if (input === null) return;
						input.focus();
						input.select();
					}
				};
				document.addEventListener("keydown", onKey);
				return () => {
					document.removeEventListener("keydown", onKey);
				};
			}, [visible]);
			const dirtyState = busy ? "saving" : dirty ? "dirty" : "saved";
			const dirtyText = writerDocument.loading ? t("documentLoading") : busy ? t("dirtySaving") : dirty ? t("dirtyPending") : t("dirtySaved");
			const documentNotice = writerDocument.notice ?? notice;
			const { line, col } = cursorLineCol(draft, caret);
			const truncationText = searchResult === void 0 ? "" : writerSearchTruncationMessage(searchResult.truncation, searchResult.limits, searchResult.scanErrors);
			const shortName = workspaceShortName(cwd);
			const health = writerScanHealth({
				scanning,
				hardFailed: scanHardFailed,
				libraryCount: libraries.length,
				projectCount: projects.length,
				scanCount: scans.length,
				scanErrors
			});
			const healthText = healthCopy(health, t);
			const filesText = loadedFilesLabel(countLoadedFiles(libraries) + countLoadedFiles(projects) + countLoadedFiles(scans), t("filesOnDemand"), t("filesLoaded"));
			const countsAria = t("countsSummary").replace("{libraries}", String(libraries.length)).replace("{projects}", String(projects.length)).replace("{scans}", String(scans.length)).replace("{files}", filesText);
			const connectionTitle = `${t("localWorkspace")} · ${healthText}`;
			const connectionLabel = health === "ok" || health === "loading" ? t("localOnly") : healthText;
			const crumbs = active === void 0 ? [] : breadcrumbSegments(active);
			const byteLabel = formatBytes(editorByteSize(draft, eol));
			const extLabel = active === void 0 ? "" : fileExtensionLabel(active);
			const encodingText = t("statusEncoding").replace("{eol}", eolLabel(eol));
			const tabPanelId = "writer-workspace-panel";
			const librariesTabId = "writer-tab-libraries";
			const projectsTabId = "writer-tab-projects";
			const scansTabId = "writer-tab-scans";
			const railId = "writer-rail";
			(0, react.useEffect)(() => {
				const node = deskRef.current;
				if (node === null) return;
				const apply = (width) => {
					setDeskWidth((current) => current === width ? current : width);
				};
				apply(node.clientWidth);
				if (typeof ResizeObserver === "undefined") return;
				const observer = new ResizeObserver((entries) => {
					const entry = entries[0];
					if (entry === void 0) return;
					apply(entry.contentRect.width);
				});
				observer.observe(node);
				return () => {
					observer.disconnect();
				};
			}, []);
			const railCollapsed = railChrome.collapsed;
			const railWidth = railChrome.width;
			const fittedRailWidth = railCollapsed ? railWidth : fitRailWidth(railWidth, deskWidth);
			const persistRail = (next) => {
				setRailChrome(next);
				writeRailChrome(next);
			};
			const toggleRail = () => {
				persistRail(setRailCollapsed(railChrome));
			};
			const onRailResizePointerDown = (event) => {
				if (event.button !== 0 || railCollapsed) return;
				event.preventDefault();
				railDrag.current = {
					pointerId: event.pointerId,
					startX: event.clientX,
					startWidth: railWidth
				};
				event.currentTarget.setPointerCapture(event.pointerId);
			};
			const onRailResizePointerMove = (event) => {
				const drag = railDrag.current;
				if (drag === void 0 || drag.pointerId !== event.pointerId) return;
				const delta = event.clientX - drag.startX;
				const nextWidth = clampRailWidth(drag.startWidth + delta);
				setRailChrome((current) => setRailWidth(current, nextWidth));
			};
			const endRailResize = (event) => {
				const drag = railDrag.current;
				if (drag === void 0 || drag.pointerId !== event.pointerId) return;
				railDrag.current = void 0;
				if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
				setRailChrome((current) => {
					writeRailChrome(current);
					return current;
				});
			};
			const onRailResizeKeyDown = (event) => {
				if (railCollapsed) return;
				const step = event.shiftKey ? 32 : 16;
				if (event.key === "ArrowLeft") {
					event.preventDefault();
					persistRail(setRailWidth(railChrome, railWidth - step));
				} else if (event.key === "ArrowRight") {
					event.preventDefault();
					persistRail(setRailWidth(railChrome, railWidth + step));
				} else if (event.key === "Home") {
					event.preventDefault();
					persistRail(setRailWidth(railChrome, 180));
				} else if (event.key === "End") {
					event.preventDefault();
					persistRail(setRailWidth(railChrome, 480));
				} else if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					toggleRail();
				}
			};
			const deskStyle = { ["--writer-rail-width"]: `${String(fittedRailWidth)}px` };
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: deskRef,
				className: "writer-desk",
				"data-workbench": "writer",
				"data-rail-collapsed": railCollapsed ? "true" : void 0,
				style: deskStyle,
				children: [
					(0, react_jsx_runtime.jsxs)("aside", {
						id: railId,
						className: "writer-rail",
						"aria-label": t("tree"),
						hidden: railCollapsed || void 0,
						children: [
							(0, react_jsx_runtime.jsxs)("nav", {
								className: "writer-tabs",
								"aria-label": t("workspaceTabs"),
								role: "tablist",
								children: [
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										id: librariesTabId,
										role: "tab",
										className: "writer-tab",
										"aria-selected": view === "libraries",
										"aria-controls": tabPanelId,
										onClick: () => {
											pickView("libraries");
										},
										children: [(0, react_jsx_runtime.jsx)("span", { children: t("libraries") }), libraries.length > 0 && (0, react_jsx_runtime.jsx)("b", {
											className: "writer-badge",
											children: libraries.length
										})]
									}),
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										id: projectsTabId,
										role: "tab",
										className: "writer-tab",
										"aria-selected": view === "projects",
										"aria-controls": tabPanelId,
										onClick: () => {
											pickView("projects");
										},
										children: [(0, react_jsx_runtime.jsx)("span", { children: t("projects") }), projects.length > 0 && (0, react_jsx_runtime.jsx)("b", {
											className: "writer-badge",
											children: projects.length
										})]
									}),
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										id: scansTabId,
										role: "tab",
										className: "writer-tab",
										"aria-selected": view === "scans",
										"aria-controls": tabPanelId,
										onClick: () => {
											pickView("scans");
										},
										children: [(0, react_jsx_runtime.jsx)("span", { children: t("scans") }), scans.length > 0 && (0, react_jsx_runtime.jsx)("b", {
											className: "writer-badge",
											children: scans.length
										})]
									})
								]
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: "writer-search-slot",
								role: "search",
								children: (0, react_jsx_runtime.jsx)("input", {
									ref: searchRef,
									type: "search",
									value: filter,
									placeholder: t("search"),
									"aria-label": t("searchLabel"),
									onChange: (event) => {
										setFilter(event.target.value);
										setNotice(void 0);
									},
									onKeyDown: (event) => {
										if (event.key === "Escape") {
											event.preventDefault();
											setFilter("");
											setSearchResult(void 0);
											setSearching(false);
										}
									}
								})
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: "writer-tree-panel",
								id: tabPanelId,
								role: "tabpanel",
								"aria-labelledby": view === "libraries" ? librariesTabId : view === "projects" ? projectsTabId : scansTabId,
								"aria-busy": scanning || void 0,
								children: [
									health === "failed" && !showSearch && (0, react_jsx_runtime.jsxs)("div", {
										className: "writer-scan-banner",
										role: "alert",
										children: [(0, react_jsx_runtime.jsx)("p", { children: t("scanFailed") }), (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: rescan,
											children: t("retryScan")
										})]
									}),
									health === "partial" && !showSearch && (0, react_jsx_runtime.jsxs)("div", {
										className: "writer-scan-banner writer-scan-banner-warn",
										role: "status",
										children: [(0, react_jsx_runtime.jsx)("p", { children: t("scanPartial") }), (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: rescan,
											children: t("retryScan")
										})]
									}),
									scanning && !showSearch ? (0, react_jsx_runtime.jsx)("p", {
										className: "writer-empty",
										children: t("healthLoading")
									}) : showSearch ? searching ? (0, react_jsx_runtime.jsx)("p", {
										className: "writer-empty",
										children: t("searching").replace("{query}", query)
									}) : searchResult !== void 0 && searchResult.results.length === 0 ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("p", {
										className: "writer-empty",
										children: (searchResult.truncated ? t("searchIncomplete") : t("searchEmpty")).replace("{query}", query)
									}), truncationText !== "" && (0, react_jsx_runtime.jsx)("p", {
										className: "writer-muted",
										role: "status",
										children: truncationText
									})] }) : searchResult !== void 0 ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(SearchHits, {
										hits: searchResult.results,
										query,
										selected: active,
										onSelect: selectFile,
										t
									}), truncationText !== "" && (0, react_jsx_runtime.jsx)("p", {
										className: "writer-muted",
										role: "status",
										children: truncationText
									})] }) : null : health === "failed" ? null : roots.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
										className: "writer-empty",
										children: view === "libraries" ? t("emptyLibraries") : view === "projects" ? t("emptyProjects") : t("emptyScans")
									}) : (0, react_jsx_runtime.jsx)("nav", {
										"aria-label": t("tree"),
										children: (0, react_jsx_runtime.jsx)("ul", {
											className: "writer-tree",
											children: TreeNodes({
												nodes: roots,
												depth: 0,
												expanded,
												selected: active,
												listings,
												onToggle,
												onSelect: selectFile,
												onLoadMore,
												onRetry: (path) => {
													loadDirectory(path, true);
												},
												t
											})
										})
									})
								]
							}),
							(0, react_jsx_runtime.jsxs)("footer", {
								className: "writer-rail-note",
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: "writer-rail-dot",
									"data-health": health,
									"aria-hidden": "true"
								}), (0, react_jsx_runtime.jsx)("p", {
									title: `${cwd} · ${t("localWorkspace")}`,
									children: health === "ok" || health === "loading" ? t("localWorkspace") : `${healthText} · ${t("localWorkspace")}`
								})]
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: "writer-rail-resize",
						role: "separator",
						tabIndex: railCollapsed ? -1 : 0,
						"aria-orientation": "vertical",
						"aria-label": t("resizeRail"),
						"aria-valuemin": 180,
						"aria-valuemax": 480,
						"aria-valuenow": railWidth,
						"aria-controls": railId,
						hidden: railCollapsed || void 0,
						onPointerDown: onRailResizePointerDown,
						onPointerMove: onRailResizePointerMove,
						onPointerUp: endRailResize,
						onPointerCancel: endRailResize,
						onDoubleClick: (event) => {
							event.preventDefault();
							toggleRail();
						},
						onKeyDown: onRailResizeKeyDown
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: "writer-stage",
						children: [
							(0, react_jsx_runtime.jsxs)("header", {
								className: "writer-stage-heading",
								children: [
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "writer-rail-toggle",
										"aria-expanded": !railCollapsed,
										"aria-controls": railId,
										"aria-label": railCollapsed ? t("expandRail") : t("collapseRail"),
										title: railCollapsed ? t("expandRail") : t("collapseRail"),
										onClick: toggleRail,
										children: railCollapsed ? "›" : "‹"
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: "writer-masthead",
										"aria-label": t("masthead"),
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: "writer-workspace",
											title: cwd,
											children: shortName
										}), (0, react_jsx_runtime.jsxs)("div", {
											className: "writer-masthead-actions",
											children: [(0, react_jsx_runtime.jsxs)("div", {
												className: "writer-counts",
												title: t("filesCountHint"),
												"aria-label": countsAria,
												children: [
													(0, react_jsx_runtime.jsxs)("span", {
														className: "writer-count",
														children: [
															(0, react_jsx_runtime.jsx)("b", { children: libraries.length }),
															" ",
															t("countLibraries")
														]
													}),
													(0, react_jsx_runtime.jsxs)("span", {
														className: "writer-count",
														children: [
															(0, react_jsx_runtime.jsx)("b", { children: projects.length }),
															" ",
															t("countProjects")
														]
													}),
													(0, react_jsx_runtime.jsxs)("span", {
														className: "writer-count",
														children: [
															(0, react_jsx_runtime.jsx)("b", { children: scans.length }),
															" ",
															t("countScans")
														]
													}),
													(0, react_jsx_runtime.jsxs)("span", {
														className: "writer-count",
														children: [
															(0, react_jsx_runtime.jsx)("b", { children: filesText }),
															" ",
															t("countFiles")
														]
													})
												]
											}), (0, react_jsx_runtime.jsxs)("span", {
												className: "writer-connection",
												"data-health": health,
												role: "status",
												title: connectionTitle,
												children: [(0, react_jsx_runtime.jsx)("span", {
													className: "writer-status-dot",
													"aria-hidden": "true"
												}), (0, react_jsx_runtime.jsx)("span", {
													className: "writer-connection-label",
													children: connectionLabel
												})]
											})]
										})]
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "writer-reload",
										title: t("reload"),
										"aria-label": t("reload"),
										onClick: rescan,
										children: (0, react_jsx_runtime.jsxs)("svg", {
											viewBox: "0 0 24 24",
											"aria-hidden": "true",
											children: [(0, react_jsx_runtime.jsx)("path", { d: "M20 6v5h-5" }), (0, react_jsx_runtime.jsx)("path", { d: "M18.2 15.7A7 7 0 1 1 19 9.3L20 11" })]
										})
									})
								]
							}),
							view === "projects" && (0, react_jsx_runtime.jsx)(BookPanel, {
								sessionId,
								cwd,
								remote,
								projects,
								active,
								draft,
								dirty,
								version,
								visible,
								onOpen: selectFile,
								t
							}),
							(0, react_jsx_runtime.jsxs)("main", {
								className: "writer-editor",
								children: [
									active === void 0 && documentNotice === void 0 && (0, react_jsx_runtime.jsx)("p", {
										className: "writer-empty",
										children: t("emptyHelp")
									}),
									writerDocument.storageError !== void 0 && (0, react_jsx_runtime.jsx)("p", {
										role: "alert",
										className: "writer-alert",
										children: t(writerDocument.storageError === "changed" ? "draftStorageConflict" : "draftStorageError")
									}),
									documentNotice !== void 0 && (0, react_jsx_runtime.jsx)("p", {
										role: "alert",
										className: "writer-alert",
										children: documentNotice
									}),
									active !== void 0 && !writerDocument.ready && !writerDocument.loading && (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											writerDocument.reload();
										},
										children: t("retryDocument")
									}),
									conflictOpen && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
										open: true,
										onClose: () => {
											setConflictOpen(false);
										},
										title: t("conflictTitle"),
										description: t("conflictBody"),
										closeLabel: t("conflictClose"),
										footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => {
												setConflictOpen(false);
											},
											children: t("conflictKeep")
										}), (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "writer-conflict-reload",
											onClick: () => {
												setConflictOpen(false);
												writerDocument.reload(true);
											},
											children: t("conflictReload")
										})] })
									}),
									active !== void 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
										(0, react_jsx_runtime.jsxs)("header", {
											className: "writer-editor-toolbar",
											children: [(0, react_jsx_runtime.jsxs)("div", {
												className: "writer-document-identity",
												children: [(0, react_jsx_runtime.jsx)("nav", {
													className: "writer-breadcrumbs",
													"aria-label": t("breadcrumbs"),
													children: crumbs.map((part, index) => (0, react_jsx_runtime.jsxs)("span", { children: [index > 0 && (0, react_jsx_runtime.jsx)("i", {
														"aria-hidden": "true",
														children: " / "
													}), (0, react_jsx_runtime.jsx)("span", { children: part })] }, `${String(index)}-${part}`))
												}), (0, react_jsx_runtime.jsx)("h2", {
													className: "writer-document-title",
													title: active,
													children: crumbs[crumbs.length - 1] ?? active
												})]
											}), (0, react_jsx_runtime.jsxs)("div", {
												className: "writer-editor-actions",
												children: [
													(0, react_jsx_runtime.jsx)("span", {
														className: "writer-dirty",
														"data-state": dirtyState,
														children: dirtyText
													}),
													(0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: "writer-line-numbers-toggle",
														title: t("toggleLineNumbers"),
														"aria-label": t("toggleLineNumbers"),
														"aria-pressed": showLineNumbers,
														onClick: () => {
															setShowLineNumbers((value) => !value);
														},
														children: "#"
													}),
													(0, react_jsx_runtime.jsxs)("div", {
														className: "writer-mode-switch",
														role: "group",
														"aria-label": t("editor"),
														children: [
															(0, react_jsx_runtime.jsx)("button", {
																type: "button",
																"aria-pressed": mode === "edit",
																onClick: () => {
																	setMode("edit");
																},
																children: t("modeEdit")
															}),
															(0, react_jsx_runtime.jsx)("button", {
																type: "button",
																"aria-pressed": mode === "preview",
																onClick: () => {
																	setMode("preview");
																},
																children: t("modePreview")
															}),
															(0, react_jsx_runtime.jsx)("button", {
																type: "button",
																"aria-pressed": mode === "diff",
																onClick: () => {
																	setMode("diff");
																},
																children: t("modeDiff")
															})
														]
													}),
													conflict ? (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														onClick: () => {
															setConflictOpen(true);
														},
														children: t("conflictReview")
													}) : (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														disabled: !writerDocument.ready || busy || version === void 0 || draft === saved,
														onClick: save,
														children: t("save")
													})
												]
											})]
										}),
										mode === "edit" ? (0, react_jsx_runtime.jsxs)("div", {
											className: showLineNumbers ? "writer-editor-body show-line-numbers" : "writer-editor-body",
											children: [(0, react_jsx_runtime.jsx)(WriterLineNumbers, {
												text: draft,
												caret,
												show: showLineNumbers,
												textareaRef: editorRef
											}), (0, react_jsx_runtime.jsx)("textarea", {
												ref: editorRef,
												"aria-label": active,
												value: draft,
												readOnly: !writerDocument.ready,
												"aria-busy": writerDocument.loading,
												onChange: (event) => {
													writerDocument.edit(event.target.value);
													setCaret(event.target.selectionStart);
													setNotice(void 0);
												},
												onSelect: (event) => {
													setCaret(event.currentTarget.selectionStart);
												},
												onKeyUp: (event) => {
													setCaret(event.currentTarget.selectionStart);
												},
												onClick: (event) => {
													setCaret(event.currentTarget.selectionStart);
												}
											})]
										}) : mode === "diff" ? (0, react_jsx_runtime.jsx)("div", {
											className: "writer-preview",
											children: (0, react_jsx_runtime.jsx)(RevisionDiff, {
												path: active,
												before: saved,
												after: draft,
												t
											})
										}) : (0, react_jsx_runtime.jsx)("article", {
											className: "writer-preview",
											"aria-label": `${active} ${t("modePreview")}`,
											dangerouslySetInnerHTML: { __html: markdownToSafeHtml(draft) }
										}),
										(0, react_jsx_runtime.jsxs)("footer", {
											className: "writer-status",
											children: [
												(0, react_jsx_runtime.jsx)("span", { children: t("statusCursor").replace("{line}", String(line)).replace("{col}", String(col)) }),
												(0, react_jsx_runtime.jsx)("span", {
													"aria-hidden": "true",
													children: "·"
												}),
												(0, react_jsx_runtime.jsx)("span", {
													className: "writer-document-meta",
													children: byteLabel
												}),
												(0, react_jsx_runtime.jsx)("span", {
													"aria-hidden": "true",
													children: "·"
												}),
												(0, react_jsx_runtime.jsx)("span", { children: t("statusChars").replace("{n}", String(countCharacters(draft))) }),
												extLabel !== "" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
													"aria-hidden": "true",
													children: "·"
												}), (0, react_jsx_runtime.jsx)("span", { children: extLabel })] }),
												(0, react_jsx_runtime.jsx)("span", {
													"aria-hidden": "true",
													children: "·"
												}),
												(0, react_jsx_runtime.jsx)("span", { children: encodingText })
											]
										})
									] })
								]
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/mode.js
		/**
		* Whether the on-screen session uses the writing preset.
		* @param context - browser session services.
		* @param sessionId - session to inspect.
		* @returns true when the projection says `writer`.
		*/
		function isWriterSession(context, sessionId) {
			return sessionId !== void 0 && context.sessions.list.getSnapshot().byId[sessionId]?.projectionValues?.agentPreset === "writer";
		}
		/**
		* Register the tab type, and show its guide entry only for a writing session.
		* @param context - browser session and sidebar services.
		* @param definition - tab type including its guide entry.
		* @returns a disposer for the subscriptions and the current registration.
		*/
		function registerWriterTab(context, definition) {
			const current = context.uiSession.adapter.current;
			let visible;
			let release;
			const sync = () => {
				const next = isWriterSession(context, current.getSnapshot().key);
				if (next === visible) return;
				visible = next;
				release?.();
				release = context.sidebarRightTabs.register({
					...definition,
					guide: next ? definition.guide ?? [] : []
				});
			};
			const stopCurrent = current.subscribe(sync);
			const stopSessions = context.sessions.list.subscribe(sync);
			sync();
			return () => {
				stopCurrent();
				stopSessions();
				release?.();
			};
		}
		//#endregion
		//#region lib/types/client/sidebar.js
		const name = "writer";
		const inject$1 = [
			"slots",
			"sessions",
			"uiSession",
			"locale",
			"sidebarRightTabs",
			"remote",
			"remote.workspaceFiles"
		];
		const TAB_ID = "@winterhuan/dsh-writer";
		/**
		* Register the writing tab and its body. The guide entry follows the selected preset.
		* @param context - browser services.
		*/
		function apply$1(context) {
			context.effect(() => context.locale.register(NS, {
				zh: zh$1,
				en: en$1
			}), "writer: dictionaries");
			const t = context.locale.bind(NS);
			context.effect(() => registerWriterTab(context, {
				id: TAB_ID,
				kind: "writer",
				title: () => t("title"),
				guide: [{
					id: "writer",
					order: 22,
					title: () => t("title"),
					description: () => t("description"),
					icon: _deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular
				}]
			}), "writer: sidebar type");
			function Sidebar({ sessionId, useTabInfo, useSessions, t: copy }) {
				const preset = useSessions((state) => state.byId[sessionId]?.projectionValues?.agentPreset);
				const cwd = useSessions((state) => state.byId[sessionId]?.cwd);
				const { tab } = useTabInfo();
				(0, react.useEffect)(() => {
					if (typeof preset === "string" && preset !== "writer") tab.actions.close();
				}, [preset, tab.actions]);
				if (preset !== "writer") return null;
				if (cwd === void 0) return (0, react_jsx_runtime.jsx)("p", {
					className: "writer-empty",
					children: copy("noWorkspace")
				});
				return (0, react_jsx_runtime.jsx)(WriterDesk, {
					sessionId,
					cwd,
					remote: context.remote,
					t: copy,
					visible: tab.visible
				});
			}
			context.effect(() => context.slots.inject("sidebar.right.pane.tab", () => context.slots.register({
				name: "sidebar.right.pane.tab",
				key: TAB_ID,
				locale: NS
			}, Sidebar)), "writer: sidebar body");
		}
		//#endregion
		//#region lib/types/client/zhuque-locales.js
		/** Locale bundles for the Writer settings page (Zhuque + cover keys). */
		/** English copy. */
		const en = {
			title: "Writing",
			description: "Zhuque detection and cover image API keys for author-triggered skills.",
			keySet: "A key is configured.",
			keyUnset: "No key is configured.",
			makersKeyLabel: "EdgeOne Makers API key (Zhuque detection)",
			makersKeyHint: "Used by story-zhuque when you ask for a Zhuque check. Stored outside the settings file. Leave blank to keep the current key; a MAKERS_API_KEY exported in the shell that starts dsh also works.",
			makersKeyReadOnlyHint: "The startup environment supplies this key, so it cannot be edited here. Remove the key environment variable from the shell that starts dsh and restart, then save the key here.",
			coverKeyLabel: "GPT Image API key (cover generation)",
			coverKeyHint: "Used by story-cover when you ask for a generated cover image. Prompt-only delivery needs no key. Stored outside the settings file. Leave blank to keep the current key; a GPT_IMAGE_API_KEY exported in the shell that starts dsh also works.",
			coverKeyReadOnlyHint: "The startup environment supplies this key, so it cannot be edited here. Remove the key environment variable from the shell that starts dsh and restart, then save the key here.",
			gptImageBaseUrlPlaceholder: "https://api.openai.com/v1",
			gptImageBaseUrlLabel: "GPT Image API base URL",
			gptImageBaseUrlHint: "Base URL of an OpenAI-compatible endpoint for cover generation. Saved into the settings file; the host injects it as GPT_IMAGE_BASE_URL. Leave blank to use a shell-exported value or the default.",
			overridden: "Overrides the default.",
			reset: "Reset",
			invalidText: "This value is not accepted.",
			readOnly: "This setting is read-only.",
			unavailable: "Writing settings are not available.",
			save: "Save",
			saving: "Saving…",
			discard: "Discard",
			saveFailed: "Could not save. Try again."
		};
		/** Simplified Chinese copy. */
		const zh = {
			title: "写作",
			description: "明确要求朱雀检测或封面生图时使用的密钥。",
			keySet: "已配置密钥。",
			keyUnset: "未配置密钥。",
			makersKeyLabel: "EdgeOne Makers API Key（朱雀检测）",
			makersKeyHint: "供 story-zhuque 在你明确要求朱雀检测时使用。不写入设置文件。留空表示保持当前密钥；在启动 dsh 的 shell 里 export 的 MAKERS_API_KEY 同样有效。",
			makersKeyReadOnlyHint: "当前密钥由启动环境提供，无法在网页修改。请在启动 dsh 的 shell 中取消该密钥环境变量后重启，再在此保存密钥",
			coverKeyLabel: "GPT Image API Key（封面生图）",
			coverKeyHint: "供 story-cover 在你明确要求生成封面图时使用。仅提示词交付不需要密钥。不写入设置文件。留空表示保持当前密钥；在启动 dsh 的 shell 里 export 的 GPT_IMAGE_API_KEY 同样有效。",
			coverKeyReadOnlyHint: "当前密钥由启动环境提供，无法在网页修改。请在启动 dsh 的 shell 中取消该密钥环境变量后重启，再在此保存密钥",
			gptImageBaseUrlPlaceholder: "https://api.openai.com/v1",
			gptImageBaseUrlLabel: "GPT Image API Base URL",
			gptImageBaseUrlHint: "封面生图兼容端点的 Base URL，保存在设置文件里，Host 会注入为 GPT_IMAGE_BASE_URL。留空表示使用 shell 导出的值或默认值。",
			overridden: "覆盖默认值。",
			reset: "重置",
			invalidText: "此值不被接受。",
			readOnly: "此设置只读。",
			unavailable: "写作设置不可用。",
			save: "保存",
			saving: "正在保存…",
			discard: "放弃",
			saveFailed: "未能保存。请再试一次。"
		};
		/**
		* Labels the shared settings form reads from this page's dictionary.
		* @param t - the bound translator.
		* @returns the form chrome labels.
		*/
		function formLabels(t) {
			return {
				unavailable: t("unavailable"),
				readOnly: t("readOnly"),
				saveFailed: t("saveFailed"),
				save: t("save"),
				saving: t("saving")
			};
		}
		//#endregion
		//#region lib/types/client/ZhuqueSettingsCard.js
		/**
		* Render the Writer settings page, or its one-liner when the Plugins page asks for a summary.
		* @param props - the view asked for, locale copy, the page snapshot, and its form actions.
		* @returns the one-liner, or the form.
		*/
		function ZhuqueSettingsCard(props) {
			const { t } = props;
			const state = props.useWriterZhuqueCard((snapshot) => snapshot);
			if (props.view === "summary") return t("description");
			const control = state.key;
			const cover = state.coverKey;
			return (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.SettingsForm, {
				labels: formLabels(t),
				state,
				onSave: props.save,
				onDiscard: props.discard,
				children: [
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsSecretField, {
						id: "plugin-config-writer-makers-key",
						label: t("makersKeyLabel"),
						hint: t(control.writable ? "makersKeyHint" : "makersKeyReadOnlyHint"),
						stateLabel: control.configured ? t("keySet") : t("keyUnset"),
						onEdit: (text) => {
							props.edit("makersApiKey", text);
						},
						disabled: !control.writable,
						text: control.draft.text,
						configured: control.configured
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsSecretField, {
						id: "plugin-config-writer-cover-key",
						label: t("coverKeyLabel"),
						hint: t(cover.writable ? "coverKeyHint" : "coverKeyReadOnlyHint"),
						stateLabel: cover.configured ? t("keySet") : t("keyUnset"),
						onEdit: (text) => {
							props.edit("gptImageApiKey", text);
						},
						disabled: !cover.writable,
						text: cover.draft.text,
						configured: cover.configured
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsValueField, {
						id: "plugin-config-writer-cover-base-url",
						label: t("gptImageBaseUrlLabel"),
						hint: t("gptImageBaseUrlHint"),
						overriddenLabel: t("overridden"),
						resetLabel: t("reset"),
						invalidLabel: t("invalidText"),
						placeholder: t("gptImageBaseUrlPlaceholder"),
						disabled: !state.writable,
						...state.gptImageBaseUrl,
						onEdit: (text) => {
							props.edit("gptImageBaseUrl", text);
						},
						onReset: () => {
							props.resetField("gptImageBaseUrl");
						}
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/zhuque-settings-controller.js
		/**
		* The Writer settings page's staged form over the `writer` namespace.
		* Key literals never ride a response: they write through the credentials
		* domain under the references `makersApiKeyEnv` and `gptImageApiKeyEnv` name.
		*/
		/** Namespace of the writer plugin. Spelled here so the client half does not import Host values. */
		const WRITER_SETTINGS_NS = "writer";
		const FALLBACK_MAKERS_REF = "MAKERS_API_KEY";
		const FALLBACK_COVER_REF = "GPT_IMAGE_API_KEY";
		/** Bridges the `writer` scope and the credentials domain onto Zhuque and cover keys. */
		var WriterZhuqueCardController = class {
			scope;
			ctx;
			form;
			store;
			makersState = {
				ref: "",
				configured: false,
				writable: true
			};
			coverState = {
				ref: "",
				configured: false,
				writable: true
			};
			/**
			* @param scope - the shared configuration form for the `writer` namespace.
			* @param ctx - the page plugin's context.
			*/
			constructor(scope, ctx) {
				this.scope = scope;
				this.ctx = ctx;
				this.form = new _deepseek_ai_dsh_client_ui_primitives.SettingsFormModel(scope, [(0, _deepseek_ai_dsh_client_ui_primitives.settingsTextField)("gptImageBaseUrl")], [{
					field: "makersApiKey",
					write: (text) => this.writeKey("makers", text)
				}, {
					field: "gptImageApiKey",
					write: (text) => this.writeKey("cover", text)
				}]);
				this.store = this.form.bind(() => this.projection());
				scope.subscribe(() => {
					this.readCredentials();
				});
				this.readCredentials();
			}
			projection() {
				return {
					...this.form.shell(),
					key: {
						draft: this.form.field("makersApiKey"),
						configured: this.makersState.configured,
						writable: this.makersState.writable
					},
					coverKey: {
						draft: this.form.field("gptImageApiKey"),
						configured: this.coverState.configured,
						writable: this.coverState.writable
					},
					gptImageBaseUrl: this.form.field("gptImageBaseUrl")
				};
			}
			/** Ask the credentials domain about both references the section names. */
			async readCredentials() {
				const snapshot = this.scope.getSnapshot();
				const makersRef = makersRefOf(snapshot);
				const coverRef = coverRefOf(snapshot);
				let projected = false;
				if (makersRef !== this.makersState.ref) {
					this.makersState = {
						ref: makersRef,
						configured: false,
						writable: true
					};
					projected = true;
				}
				if (coverRef !== this.coverState.ref) {
					this.coverState = {
						ref: coverRef,
						configured: false,
						writable: true
					};
					projected = true;
				}
				if (projected) this.store.set(this.projection());
				const response = await this.ctx.remote.credentials.describe([makersRef, coverRef]);
				if (!response.ok) return;
				const latest = this.scope.getSnapshot();
				if (makersRef !== makersRefOf(latest) || coverRef !== coverRefOf(latest)) return;
				const makersView = response.value[makersRef];
				const coverView = response.value[coverRef];
				const nextMakers = {
					ref: makersRef,
					configured: makersView?.configured ?? false,
					writable: makersView?.writable ?? true
				};
				const nextCover = {
					ref: coverRef,
					configured: coverView?.configured ?? false,
					writable: coverView?.writable ?? true
				};
				const makersSame = nextMakers.configured === this.makersState.configured && nextMakers.writable === this.makersState.writable && nextMakers.ref === this.makersState.ref;
				const coverSame = nextCover.configured === this.coverState.configured && nextCover.writable === this.coverState.writable && nextCover.ref === this.coverState.ref;
				if (makersSame && coverSame) return;
				this.makersState = nextMakers;
				this.coverState = nextCover;
				this.store.set(this.projection());
			}
			/**
			* Re-read after the Host reports a change to a watched reference.
			* @param ref - the reference the Host reports as changed.
			*/
			refreshCredential(ref) {
				if (this.makersState.ref !== ref && this.coverState.ref !== ref) return;
				this.readCredentials();
			}
			/**
			* Build the face the page's slot registration injects.
			* @returns the page snapshot and its form actions.
			*/
			inject() {
				return {
					hooks: { writerZhuqueCard: this.store },
					...this.form.actions()
				};
			}
			/**
			* Write a staged key, then re-read whether the Host now holds one.
			* @param which - Zhuque or cover.
			* @param value - the staged credential literal.
			* @returns whether the Host reports a configured credential afterwards.
			*/
			async writeKey(which, value) {
				const snapshot = this.scope.getSnapshot();
				const ref = which === "makers" ? makersRefOf(snapshot) : coverRefOf(snapshot);
				if (!(await this.ctx.remote.credentials.set(ref, value)).ok) return false;
				await this.readCredentials();
				return which === "makers" ? this.makersState.configured : this.coverState.configured;
			}
			/** Release configuration subscriptions. */
			dispose() {
				this.form.dispose();
			}
		};
		/**
		* The Zhuque credential reference the section names, or MAKERS_API_KEY.
		* @param snapshot - the current scope snapshot.
		* @returns the reference to address.
		*/
		function makersRefOf(snapshot) {
			const declared = snapshot.value?.makersApiKeyEnv;
			return declared !== void 0 && declared.length > 0 ? declared : FALLBACK_MAKERS_REF;
		}
		/**
		* The cover credential reference the section names, or GPT_IMAGE_API_KEY.
		* @param snapshot - the current scope snapshot.
		* @returns the reference to address.
		*/
		function coverRefOf(snapshot) {
			const declared = snapshot.value?.gptImageApiKeyEnv;
			return declared !== void 0 && declared.length > 0 ? declared : FALLBACK_COVER_REF;
		}
		//#endregion
		//#region lib/types/client/zhuque-settings.js
		/**
		* Writer settings page (Zhuque + cover keys), browser half. Registers into the
		* Plugins page's `plugins.item` slot while the Host serves the `writer` namespace.
		*/
		/** Dictionary namespace owned by the Writing settings page. */
		const ZHUQUE_NS = "settings.writer";
		/** Cordis services the Writing settings page needs beyond the sidebar. */
		const zhuqueInject = ["remote.credentials", "configForms"];
		/**
		* Mount the Writing settings page while the Host serves the writer namespace.
		* @param ctx - the browser plugin context.
		*/
		function applyZhuqueSettings(ctx) {
			const t = ctx.locale.bind(ZHUQUE_NS);
			ctx.effect(() => ctx.locale.register(ZHUQUE_NS, {
				zh,
				en
			}), "writer: zhuque dictionaries");
			const card = new WriterZhuqueCardController(ctx.configForms.get(WRITER_SETTINGS_NS), ctx);
			ctx.effect(() => () => {
				card.dispose();
			}, "writer: zhuque form subscription");
			ctx.effect(() => ctx.remote.$on("credentials/reference-updated", (ref) => {
				card.refreshCredential(ref);
			}), "writer: zhuque credential invalidations");
			ctx.effect(() => ctx.configForms.whileServed([WRITER_SETTINGS_NS], () => ctx.slots.inject("plugins.item", () => ctx.slots.register({
				name: "plugins.item",
				id: "writer",
				order: 40,
				label: () => t("title"),
				locale: ZHUQUE_NS,
				inject: () => card.inject()
			}, ZhuqueSettingsCard))), "writer: zhuque settings page");
		}
		//#endregion
		//#region lib/types/client/index.js
		/** Services required by the sidebar and the Writing settings page. */
		const inject = [...inject$1, ...zhuqueInject];
		/**
		* Register the writing sidebar and the Plugins-page Writing credential entry.
		* @param context - browser services.
		*/
		function apply(context) {
			apply$1(context);
			applyZhuqueSettings(context);
		}
		//#endregion
		exports.WRITER_SETTINGS_NS = WRITER_SETTINGS_NS;
		exports.WriterZhuqueCardController = WriterZhuqueCardController;
		exports.ZHUQUE_NS = ZHUQUE_NS;
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map