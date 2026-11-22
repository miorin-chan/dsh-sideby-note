window.__ModuleLoader__.load({ id: "dsh-sideby-note", factory: (require) => {

var module = { exports: {} }; var exports = module.exports;
// \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) {
				__defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
		}
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

let react = require("react");
react = __toESM(react, 1);
let react_dom_client = require("react-dom/client");
react_dom_client = __toESM(react_dom_client, 1);
let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
_deepseek_ai_dsh_client_ui_primitives = __toESM(_deepseek_ai_dsh_client_ui_primitives, 1);
let react_jsx_runtime = require("react/jsx-runtime");

// \0dsh-css:src/client/styles/panel.css.mjs
var panel_css_default = "/*\n * Panel, composer dock, header entry and toast styles.\n *\n * Only DSH semantic aliases and the shared scale are used here — no palette of\n * its own. The entry point injects this sheet once for the whole frame, because\n * the dock mounts outside the panel tree.\n */\n/* ── 1 令牌 · 只映射 DSH 语义别名与共享尺度，不新建调色板 ─────────── */\nbody{--an-space-1:4px;--an-space-2:8px;--an-space-3:12px;--an-space-4:16px;--an-space-5:24px;--an-space-6:32px;--an-radius-pill:999px;--an-fs-caption:12px;--an-lh-caption:20px;--an-fs-row:13px;--an-lh-row:20px;--an-fs-title:14px;--an-lh-title:20px;--an-hover:var(--dsw-alias-interactive-bg-hover);--an-active:var(--dsw-alias-interactive-bg-active);--an-field:var(--dsw-alias-bg-layer-1);--an-divider:var(--dsw-alias-border-l2);--an-dur-fast:var(--ds-transition-duration-fast);--an-dur-base:var(--ds-transition-duration);--an-dur-spin:700ms;--an-ease:var(--ds-ease-in-out);--an-transition:background-color var(--an-dur-fast) var(--an-ease),border-color var(--an-dur-fast) var(--an-ease),color var(--an-dur-fast) var(--an-ease),opacity var(--an-dur-fast) var(--an-ease),transform var(--an-dur-fast) var(--an-ease),box-shadow var(--an-dur-fast) var(--an-ease)}\n\n/* ── 2 浮层 · 菜单材质 + 三层阴影，边框为 0（发丝线在阴影第一层） ── */\n.dsh-an-popover{position:fixed;z-index:1000;box-sizing:border-box;display:flex;flex-direction:column;gap:var(--an-space-3);min-height:0;padding:var(--an-space-4);border:0;border-radius:var(--dsw-radius-panel);background:var(--dsh-an-panelSurface);box-shadow:var(--dsw-elevation-panel);color:var(--dsw-alias-label-primary);font-size:var(--an-fs-row);line-height:var(--an-lh-row);--dsw-elevation-stroke-color:var(--dsw-alias-border-l2);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2,var(--an-divider));--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2,var(--dsw-alias-scrollbar-bg-l2,var(--an-divider)));--dsh-an-panelSurface:var(--dsw-alias-bg-layer-2);--dsh-an-listGutter:var(--an-space-4);--dsh-an-scrollRail:9px;--dsh-an-scrollInset:2px;overflow:hidden;animation:dsh-an-pop-in var(--an-dur-base) var(--an-ease) both}\n.dsh-an-popoverRight{padding-left:var(--an-space-4)}\n\n/* ── 3 面板头 · 标题与计数同一行，动作收在右侧 ───────────────────── */\n.dsh-an-popHead{display:flex;align-items:center;justify-content:space-between;gap:var(--an-space-3);min-width:0}\n.dsh-an-popTitleLine{display:flex;align-items:center;gap:var(--an-space-3);flex:1 1 auto;min-width:0}\n.dsh-an-popTitle{flex:none;font-size:var(--an-fs-title);line-height:var(--an-lh-title);font-weight:500;color:var(--dsw-alias-label-primary);white-space:nowrap}\n.dsh-an-popActions{display:flex;align-items:center;flex:none;gap:var(--an-space-2)}\n.dsh-an-popClose{display:grid;place-items:center;flex:none;width:24px;height:24px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-popClose:active{background:var(--an-active)}\n/* The list-scope switch sits at the far right of the title line. */\n.dsh-an-scope{display:inline-flex;align-items:center;min-width:0;box-sizing:border-box;height:24px;padding:1px;margin-inline-start:auto;border:0.5px solid var(--dsw-alias-border-l2);border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-bg-layer-1)}\n.dsh-an-scopeBtn,.dsh-an-scopeSummaryContent,.dsh-an-scopePending{display:inline-flex;align-items:center;gap:var(--an-space-1);flex:none;white-space:nowrap;color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--an-fs-caption);line-height:16px}\n.dsh-an-scopeBtn{height:20px;padding:0 var(--an-space-2);border:0;border-radius:var(--an-radius-pill);corner-shape:round;background:transparent;font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-scopeBtn[aria-pressed=\"true\"]{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}\n.dsh-an-scopeWorkspace{flex:0 1 auto;min-width:0}\n.dsh-an-scopeIcon{display:grid;place-items:center;flex:none;width:14px;height:14px}\n.dsh-an-scopeName{min-width:0;overflow:hidden;text-overflow:ellipsis}\n.dsh-an-scopeCount{flex:none;color:var(--dsw-alias-label-secondary);font-size:var(--an-fs-caption);line-height:16px;font-weight:400;font-variant-numeric:tabular-nums}\n.dsh-an-scopeSummary{margin-inline-start:auto}\n.dsh-an-scope>.dsh-an-scopeSummaryContent,.dsh-an-scopePending{padding:0 var(--an-space-2)}\n.dsh-an-srOnly{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}\n.dsh-an-scopeBtn:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-label-primary));outline-offset:1px}\n\n/* ── 4 添加区 · 嵌套表单组 R16，字段 0.5px 发丝线 ──────────────────── */\n.dsh-an-add{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:var(--an-space-2);padding:var(--an-space-3);border:0.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill);transition:var(--an-transition)}\n.dsh-an-add:focus-within,.dsh-an-add[data-file-drag]{border-color:var(--dsw-alias-state-business-primary)}\n.dsh-an-composerTools{display:flex;align-items:center;gap:var(--an-space-1)}\n.dsh-an-attachBtn{display:grid;place-items:center;width:28px;height:28px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}\n.dsh-an-attachBtn:disabled{cursor:not-allowed;opacity:.55}\n.dsh-an-destination,.dsh-an-attachmentStatus{grid-column:1/-1;color:var(--dsw-alias-label-secondary);font-size:var(--an-fs-caption);line-height:var(--an-lh-caption)}\n.dsh-an-attachments{min-width:0;container-type:inline-size}\n.dsh-an-add>.dsh-an-attachments{grid-column:1/-1}\n.dsh-an-text+.dsh-an-attachments{margin-top:var(--an-space-1)}\n.dsh-an-attachmentCards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),240px));gap:var(--an-space-2);padding:0;margin:0;list-style:none}\n.dsh-an-attachment{position:relative;width:fit-content;max-width:100%}\n.dsh-an-attachmentBody{position:absolute;inset-block:2px;inset-inline:2px var(--an-space-6);display:flex;align-items:center;justify-content:flex-end;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}\n.dsh-an-attachmentBody>span{display:flex}\n.dsh-an-attachmentBody[aria-expanded='true']>span{transform:rotate(90deg)}\n.dsh-an-attachment .dsh-an-attachmentAction{position:absolute;inset-inline-end:var(--an-space-1);bottom:var(--an-space-1);text-decoration:none}\n.dsh-an-attachmentPreviewRow{grid-column:1/-1;min-width:0}\n.dsh-an-attachments[data-draft]>.dsh-an-attachmentPreview{margin-top:var(--an-space-1)}\n.dsh-an-attachmentPreview{display:grid;grid-template-columns:minmax(0,1fr);justify-items:start;padding:var(--an-space-2);border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:var(--an-fs-caption)}\n.dsh-an-attachmentPreview img,.dsh-an-attachmentPreview video{display:block;max-width:100%;max-height:160px;object-fit:contain}\n.dsh-an-attachments[data-draft] .dsh-an-attachmentPreview img,.dsh-an-attachments[data-draft] .dsh-an-attachmentPreview video{max-height:96px}\n.dsh-an-attachmentPreview audio{width:100%;min-width:0}\n.dsh-an-rowBody{min-width:0}\n.dsh-an-rowWorkspace{grid-area:2/2;margin-top:2px;color:var(--dsw-alias-label-secondary);font-size:var(--an-fs-caption);line-height:var(--an-lh-row)}\n.dsh-an-workspaceJump{display:flex;align-items:center;gap:var(--an-space-1);max-width:100%;min-height:24px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-workspaceJump:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:1px}\n.dsh-an-workspaceJump[aria-current]{cursor:default}\n.dsh-an-workspaceJump:not([aria-current]):active{color:var(--dsw-alias-label-primary);background:var(--an-active)}\n.dsh-an-workspaceGlyph{flex:none}\n.dsh-an-workspaceName{display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dsh-an-input{display:block;align-self:center;width:100%;min-width:0;box-sizing:border-box;min-height:var(--an-lh-row);max-height:120px;padding:0;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-row);line-height:var(--an-lh-row);resize:none;overflow-y:auto;overflow-x:hidden}\n.dsh-an-input::placeholder{color:var(--dsw-alias-label-secondary)}\n.dsh-an-addBtn{display:grid;place-items:center;width:28px;height:28px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;transition:var(--an-transition)}\n.dsh-an-addBtn:focus-visible,.dsh-an-attachBtn:focus-visible,.dsh-an-attachmentBody:focus-visible,.dsh-an-attachmentAction:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:1px}\n.dsh-an-addBtn:active:not(:disabled){background:var(--an-active)}\n.dsh-an-addBtn:disabled{color:var(--dsw-alias-label-secondary);cursor:not-allowed}\n\n/* ── 5 分区与列表 · 9px 轨道内嵌 2px，底部羽化只盖内容不盖滚动条 ──── */\n/* The viewport grows into the popover padding so the 9px rail does not steal from the cards; the list pays the padding back minus the rail, so cards and the add field keep one content width at every panel size. */\n.dsh-an-listViewport{position:relative;display:flex;flex-direction:column;flex:1 1 auto;min-height:0;margin-right:calc(var(--dsh-an-listGutter) * -1)}\n/* Bottom edge treatment: a viewport-fixed alpha mask over the scroller itself, exactly like the DSH scroll areas. The first gradient fades the last 48px to transparent; the second keeps the 9px scrollbar rail opaque so the thumb stays crisp. There is no backdrop-filter layer, so there is no hard compositing edge to see. */\n.dsh-an-listViewport[data-bottom=\"true\"] .dsh-an-listArea{--dsh-an-fadeHeight:calc(var(--an-space-6) + var(--an-space-4));-webkit-mask-image:linear-gradient(to bottom,currentColor 0,currentColor calc(100% - var(--dsh-an-fadeHeight)),transparent 100%),linear-gradient(to right,transparent calc(100% - var(--dsh-an-scrollRail)),currentColor calc(100% - var(--dsh-an-scrollRail)));mask-image:linear-gradient(to bottom,currentColor 0,currentColor calc(100% - var(--dsh-an-fadeHeight)),transparent 100%),linear-gradient(to right,transparent calc(100% - var(--dsh-an-scrollRail)),currentColor calc(100% - var(--dsh-an-scrollRail)));-webkit-mask-composite:source-over;mask-composite:add}\n/* Geometry only: the shared DSH skin paints the thumb, so the plugin declares no scrollbar pseudo-elements. The popover already binds the l2 thumb pair for the menu material. */\n.dsh-an-listArea{--dsh-scrollbar-width:var(--dsh-an-scrollRail);--dsh-scrollbar-thumb-border:var(--dsh-an-scrollInset);display:flex;flex-direction:column;flex:1 1 auto;min-height:0;padding-right:calc(var(--dsh-an-listGutter) - var(--dsh-an-scrollRail));overflow-x:hidden;overflow-y:auto;scrollbar-gutter:stable}\n.dsh-an-listSection{display:flex;flex-direction:column;gap:var(--an-space-2);min-width:0}\n.dsh-an-listSection+.dsh-an-listSection{margin-top:var(--an-space-2)}\n.dsh-an-sectionHead,.dsh-an-doneHead{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:var(--an-space-3);min-height:28px;margin:0;padding:var(--an-space-1) 0;background:transparent;transition:background-color var(--an-dur-fast) var(--an-ease)}\n.dsh-an-sectionHead[data-stuck],.dsh-an-doneHead[data-stuck]{background:var(--dsh-an-panelSurface,var(--dsw-alias-bg-layer-2))}\n.dsh-an-doneToggle{display:flex;align-items:center;gap:var(--an-space-2);flex:none;min-width:0;margin:0;padding:var(--an-space-1) var(--an-space-2) var(--an-space-1) 0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;text-align:left;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-doneToggle:active{background:var(--an-active)}\n.dsh-an-doneToggle[disabled]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}\n.dsh-an-chevron{display:flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;color:var(--dsw-alias-label-secondary);transition:transform var(--an-dur-fast) var(--an-ease)}\n.dsh-an-chevron[data-open=\"true\"]{transform:rotate(90deg)}\n.dsh-an-sectionCount{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 var(--an-space-1);border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary);font-size:var(--an-fs-caption);line-height:16px;font-weight:500;font-variant-numeric:tabular-nums}\n.dsh-an-clear{display:inline-flex;align-items:center;flex:none;height:24px;margin-left:auto;padding:0 var(--an-space-2);border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-clear:active{background:var(--an-active);color:var(--dsw-alias-label-primary)}\n.dsh-an-clearConfirm{display:flex;align-items:center;justify-content:space-between;gap:var(--an-space-2);min-width:0;margin-top:var(--an-space-1);padding:var(--an-space-2);border:0.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill)}\n.dsh-an-clearConfirmText{flex:1 1 auto;min-width:0;margin:0;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-primary);overflow-wrap:anywhere}\n.dsh-an-clearConfirmActions{display:flex;align-items:center;flex:none;gap:var(--an-space-1)}\n.dsh-an-doneRows{margin-top:var(--an-space-2)}\n.dsh-an-rows{list-style:none;display:flex;flex-direction:column;gap:2px;margin:0;padding:0}\n/* The leading column keeps both sections aligned with the section label. */\n.dsh-an-row{position:relative;display:grid;grid-template-columns:16px minmax(0,1fr) auto;align-items:start;column-gap:var(--an-space-1);padding:var(--an-space-1);border-radius:var(--dsw-radius-sm);transition:var(--an-transition)}\n\n/* ── 6 一行便笺 · 左侧填入，正文 13/20，尾格静置显示时间、悬停换成操作 ── */\n.dsh-an-leading{display:flex;justify-content:center;margin:-2px 0 0}\n.dsh-an-leading>.dsh-an-insert{flex:none}\n.dsh-an-row[data-sortable]{cursor:grab}\n/* Reserve the body for direct touch dragging and leave the side columns available for scrolling. */\n.dsh-an-row[data-sortable] .dsh-an-rowBody{touch-action:none}\n.dsh-an-row[data-sortable] .dsh-an-text{user-select:none;-webkit-user-select:none}\n.dsh-an-text{display:block;min-width:0;margin:0;padding:0;color:var(--dsw-alias-label-primary);font-size:var(--an-fs-row);line-height:var(--an-lh-row);white-space:pre-wrap;overflow-wrap:anywhere;user-select:text;-webkit-user-select:text}\n.dsh-an-rowArchived .dsh-an-text{color:var(--dsw-alias-label-secondary)}\n/* Age and actions share one grid cell, so the swap never reflows the text. */\n.dsh-an-trail{display:grid;align-items:center;justify-items:end;min-height:24px;margin:-2px 0 0}\n.dsh-an-trail>*{grid-area:1/1}\n.dsh-an-meta{padding:0 var(--an-space-1);font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;white-space:nowrap;opacity:0;transition:opacity var(--an-dur-fast) var(--an-ease)}\n\n/* ── 7 行操作 · 图标按钮 H24/R8，触摸端常显 ────────────────────────── */\n.dsh-an-actions{display:flex;flex:none;gap:2px;transition:opacity var(--an-dur-fast) var(--an-ease)}\n.dsh-an-iconBtn{position:relative;display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-iconBtn:active{background:var(--an-active);color:var(--dsw-alias-label-primary);transform:scale(.94)}\n.dsh-an-iconBtn:disabled,.dsh-an-iconBtn[disabled]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}\n.dsh-an-glyphFlip{transform:scaleX(-1)}\n\n/* ── 7b 拖拽排序 · 抬起的行跟手，其余行用 transform 让位 ─────────────── */\n.dsh-an-rows[data-dragging=\"true\"],.dsh-an-rows[data-dragging=\"true\"] .dsh-an-row{cursor:grabbing}\n.dsh-an-row[data-dragging=\"true\"]{z-index:1;background:var(--dsh-an-panelSurface);box-shadow:var(--dsw-elevation-prominent);transition:none}\n/* During a drag, show ages and keep row actions out of the way. */\n.dsh-an-rows[data-dragging=\"true\"] .dsh-an-row :is(.dsh-an-actions,.dsh-an-insert){opacity:0;pointer-events:none}\n.dsh-an-rows[data-dragging=\"true\"] .dsh-an-row .dsh-an-meta{opacity:1}\n\n/* ── 8 紧凑文字按钮 · 清空确认 ─────────────────────────────────── */\n.dsh-an-mini{display:inline-flex;align-items:center;justify-content:center;flex:none;height:24px;padding:0 var(--an-space-2);border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-mini:active{background:var(--an-active)}\n.dsh-an-mini[disabled]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}\n.dsh-an-miniDanger{border-color:transparent;background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-foreground)}\n.dsh-an-miniDanger:active{background:var(--dsw-alias-state-error-primary)}\n\n/* ── 9 空态 · 虚线 1px，说明 12/次级墨色 ──────────────────────────── */\n.dsh-an-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--an-space-2);padding:var(--an-space-5) var(--an-space-4);border:1px dashed var(--an-divider);border-radius:var(--dsw-radius-lg);text-align:center}\n.dsh-an-emptyIcon{display:flex;align-items:center;justify-content:center;width:32px;height:32px;margin:0 0 var(--an-space-1);border-radius:var(--dsw-radius-md);background:var(--an-hover);color:var(--dsw-alias-label-secondary)}\n.dsh-an-emptyTitle{font-size:var(--an-fs-row);line-height:var(--an-lh-row);font-weight:500;color:var(--dsw-alias-label-primary)}\n.dsh-an-emptyBody{max-width:36ch;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}\n.dsh-an-listStatus{margin:0;color:var(--dsw-alias-label-secondary);font-size:var(--an-fs-caption);line-height:var(--an-lh-caption)}\n\n/* ── 10 存储详情与更新 ─────────────────────────────────────────── */\n.dsh-an-storageBlock{display:flex;flex-direction:column;gap:var(--an-space-2);min-width:0}\n.dsh-an-storagePathRow{display:flex;flex-direction:column;gap:var(--an-space-1);min-width:0}\n.dsh-an-storagePath{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;user-select:all}\n.dsh-an-storageActions{display:flex;flex-wrap:wrap;gap:var(--an-space-1)}\n/* 更新中心：检查入口、可展开的更新说明与更新动作，全部走共享令牌 */\n.dsh-an-updateCheck{flex:none;height:24px;padding:0 var(--an-space-2);border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-updateCheck:active{background:var(--an-active)}\n.dsh-an-updateCheck[aria-disabled=\"true\"]{color:var(--dsw-alias-label-secondary);cursor:default}\n.dsh-an-updateCheck:focus-visible{outline-offset:2px}\n.dsh-an-updateHint{margin:0;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}\n.dsh-an-updateHintError{color:var(--dsw-alias-state-error-primary)}\n.dsh-an-updateCard{display:flex;flex-direction:column;gap:var(--an-space-2);margin-top:var(--an-space-1);padding:var(--an-space-2);border:0.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1)}\n.dsh-an-updateTitle{font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;color:var(--dsw-alias-label-primary)}\n.dsh-an-updateFull:focus-visible,.dsh-an-updateLinkBtn:focus-visible{text-decoration:underline;text-decoration-style:dotted;text-decoration-thickness:1px;text-underline-offset:3px}\n.dsh-an-updateFull{flex:none;color:var(--dsw-alias-link);font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;text-decoration:none;transition:var(--an-transition)}\n.dsh-an-updateNotes{display:flex;flex-direction:column;gap:var(--an-space-2);max-height:220px;overflow-y:auto;padding-right:0;overscroll-behavior:contain;--dsh-scrollbar-width:var(--dsh-an-scrollRail);--dsh-scrollbar-thumb-border:var(--dsh-an-scrollInset);scrollbar-gutter:stable}\n.dsh-an-updateNotes[data-fade=\"true\"]{--dsh-an-fadeHeight:var(--an-space-5);-webkit-mask-image:linear-gradient(to bottom,currentColor 0,currentColor calc(100% - var(--dsh-an-fadeHeight)),transparent 100%),linear-gradient(to right,transparent calc(100% - var(--dsh-an-scrollRail)),currentColor calc(100% - var(--dsh-an-scrollRail)));mask-image:linear-gradient(to bottom,currentColor 0,currentColor calc(100% - var(--dsh-an-fadeHeight)),transparent 100%),linear-gradient(to right,transparent calc(100% - var(--dsh-an-scrollRail)),currentColor calc(100% - var(--dsh-an-scrollRail)));-webkit-mask-composite:source-over;mask-composite:add}\n.dsh-an-updateVersions{display:flex;flex-direction:column;gap:var(--an-space-1);min-width:0}\n.dsh-an-updateVersion{display:flex;flex-direction:column;gap:var(--an-space-1);min-width:0}\n.dsh-an-updateVersion+.dsh-an-updateVersion{padding-top:var(--an-space-1);border-top:0.5px solid var(--an-divider)}\n.dsh-an-updateVersionHead{display:flex;align-items:center;gap:var(--an-space-1);width:100%;padding:2px 0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;text-align:left;cursor:pointer}\n.dsh-an-updateVersionHead:active{background:var(--an-active)}\n.dsh-an-updateVersionHead:focus-visible{text-decoration:underline;text-decoration-style:dotted;text-decoration-thickness:1px;text-underline-offset:3px}\n.dsh-an-updateChevron{display:flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;color:var(--dsw-alias-label-secondary);font-size:var(--an-fs-caption);transition:transform var(--an-dur-fast) var(--an-ease)}\n.dsh-an-updateChevron[data-open=\"true\"]{transform:rotate(90deg)}\n.dsh-an-updateVersionLabel{font-variant-numeric:tabular-nums}\n.dsh-an-updateLatest{display:inline-flex;align-items:center;justify-content:center;flex:none;min-width:18px;height:18px;padding:0 var(--an-space-1);border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary);font-size:var(--an-fs-caption);line-height:16px;font-weight:500}\n.dsh-an-updateVersionBody{display:flex;flex-direction:column;gap:var(--an-space-2);padding-left:var(--an-space-4);min-width:0}\n.dsh-an-updateGroup{display:flex;flex-direction:column;gap:var(--an-space-1);min-width:0}\n.dsh-an-updateGroupTitle{font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;color:var(--dsw-alias-label-secondary)}\n.dsh-an-updateItems{display:flex;flex-direction:column;gap:var(--an-space-1);margin:0;padding-left:var(--an-space-4);color:var(--dsw-alias-label-primary)}\n.dsh-an-updateItem{font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);overflow-wrap:anywhere}\n.dsh-an-updateItem strong{font-weight:500}\n.dsh-an-updateActions{display:flex;align-items:center;gap:var(--an-space-2);flex-wrap:wrap;min-width:0}\n.dsh-an-updatePrimary{display:inline-flex;align-items:center;justify-content:center;flex:none;height:24px;padding:0 var(--an-space-3);border:0;border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-updatePrimary:active{background:var(--dsw-alias-button-primary-dimmed)}\n.dsh-an-updatePrimary:disabled{opacity:.55;cursor:default}\n.dsh-an-updatePrimary:focus-visible{outline-offset:2px}\n.dsh-an-updateDone{display:flex;align-items:center;gap:var(--an-space-2);flex-wrap:wrap;min-width:0}\n.dsh-an-updateErrorRow{display:flex;align-items:baseline;gap:var(--an-space-2);flex-wrap:wrap;min-width:0}\n.dsh-an-updateError{flex:1 1 auto;min-width:0;margin:0;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-state-error-primary);overflow-wrap:anywhere}\n.dsh-an-updateLinkBtn{padding:0;border:0;background:transparent;color:var(--dsw-alias-link);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer}\n.dsh-an-updateFallback{display:flex;align-items:center;gap:var(--an-space-2);flex-wrap:wrap;min-width:0;padding-top:var(--an-space-1);border-top:0.5px solid var(--an-divider)}\n.dsh-an-updateFallback .dsh-an-updateHint{flex:1 1 100%;min-width:0}\n.dsh-an-updateCopy{flex:none;height:24px;padding:0 var(--an-space-2);border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-updateCopy:active{background:var(--an-active)}\n.dsh-an-updateCopy:focus-visible{outline-offset:2px}\n\n/* ── 11 存储异常与面板底部入口 ─────────────────────────────────── */\n.dsh-an-storageStatus{display:flex;align-items:flex-start;flex-wrap:wrap;gap:var(--an-space-2);padding:var(--an-space-2);border:0.5px solid var(--an-divider);border-radius:var(--dsw-radius-md);font-size:var(--an-fs-caption);overflow-wrap:anywhere}\n.dsh-an-storageStatus>div{flex:1 1 135px;min-width:0}\n.dsh-an-storageStatus p,.dsh-an-footerBody p{margin:0}\n.dsh-an-storageFailure{color:var(--dsw-alias-label-secondary)}\n.dsh-an-reconnect[aria-disabled=\"true\"]{color:var(--dsw-alias-label-secondary);cursor:progress}\n.dsh-an-popFoot{flex:0 1 auto;min-height:24px;max-height:40dvh;margin:0;padding:2px;overflow:auto;overscroll-behavior:contain;--dsh-scrollbar-width:var(--dsh-an-scrollRail);--dsh-scrollbar-thumb-border:var(--dsh-an-scrollInset);font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary)}\n.dsh-an-storageToggle,.dsh-an-updateToggle{width:fit-content;padding:2px var(--an-space-1);border-radius:var(--dsw-radius-sm);cursor:pointer}\n.dsh-an-storageToggle{display:block;list-style:none;text-decoration:underline;text-decoration-color:var(--dsw-alias-label-tertiary);text-decoration-thickness:1px;text-underline-offset:3px}\n.dsh-an-storageToggle::-webkit-details-marker{display:none}\n.dsh-an-storageToggle:focus-visible,.dsh-an-updateToggle:focus-visible{outline:2px solid var(--dsw-alias-label-primary)}\n.dsh-an-updateToggle{font-weight:500;color:var(--dsw-alias-label-primary)}\n.dsh-an-footerBody{display:grid;gap:var(--an-space-2);margin-top:var(--an-space-1);padding:var(--an-space-2);border:0.5px solid var(--an-divider);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1)}\n.dsh-an-versionRow{display:flex;align-items:center;flex-wrap:wrap;gap:var(--an-space-2)}\n.dsh-an-versionRow>span:empty{position:absolute}\n/* Keep controls reachable when errors or disclosures add more than the panel can fit. */\n.dsh-an-popover:has(.dsh-an-storageStatus,.dsh-an-popFoot details[open]){overflow:auto;overscroll-behavior:contain;--dsh-scrollbar-width:var(--dsh-an-scrollRail);--dsh-scrollbar-thumb-border:var(--dsh-an-scrollInset)}\n.dsh-an-popover:has(.dsh-an-storageStatus,.dsh-an-popFoot details[open]) .dsh-an-listViewport{min-height:48px}\n.dsh-an-popover:has(.dsh-an-storageStatus,.dsh-an-popFoot details[open]) .dsh-an-popFoot{flex-shrink:0}\n.dsh-an-error{color:var(--dsw-alias-state-error-primary)}\n\n/* ── 12 会话顶部入口 · H28/R8，计数徽标为胶囊 ──────────────────────── */\n.dsh-an-headerBtn{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-headerBtn:active{background:var(--an-active);color:var(--dsw-alias-label-primary)}\n.dsh-an-headerBtn[data-active=\"true\"]{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-headerBtn[data-disabled=\"true\"]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}\n.dsh-an-headerIcon{display:flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;color:currentColor}\n.dsh-an-headerCount{position:absolute;top:-2px;right:-2px;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 var(--an-space-1);border:0.5px solid var(--dsw-alias-bg-base);border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-secondary);font-size:var(--an-fs-caption);line-height:14px;font-weight:500;font-variant-numeric:tabular-nums}\n\n/* ── 13 拖拽把手 · 8px 命中带，3px 视觉条 ─────────────────────────── */\n.dsh-an-resizeHandle{position:absolute;left:0;top:0;bottom:0;z-index:2;display:flex;align-items:center;justify-content:center;width:var(--an-space-2);cursor:ew-resize;touch-action:none;outline:0}\n.dsh-an-resizeHandle::before{content:\"\";width:3px;height:var(--an-space-6);border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-border-l4);transition:transform var(--an-dur-fast) var(--an-ease),background-color var(--an-dur-fast) var(--an-ease)}\n.dsh-an-resizeHandle:focus-visible::before{background:var(--dsw-alias-label-secondary)}\n.dsh-an-resizeHandle:focus-visible{outline-offset:-2px;border-radius:var(--dsw-radius-sm)}\n.dsh-an-resizeHandleBottom{position:absolute;left:50%;bottom:0;z-index:2;display:flex;align-items:center;justify-content:center;width:var(--an-space-6);height:var(--an-space-3);transform:translateX(-50%);cursor:ns-resize;touch-action:none;outline:0}\n.dsh-an-resizeHandleBottom::before{content:\"\";width:var(--an-space-5);height:3px;border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-border-l4);transition:transform var(--an-dur-fast) var(--an-ease),background-color var(--an-dur-fast) var(--an-ease)}\n.dsh-an-resizeHandleBottom:focus-visible::before{background:var(--dsw-alias-label-secondary)}\n.dsh-an-resizeHandleBottom:focus-visible{outline-offset:-2px;border-radius:var(--dsw-radius-sm)}\n\n/* ── 14 加载 · 控件内 12px 环，文字隐藏，不报\"进行中\" ──────────────── */\n[data-loading=\"true\"]{position:relative;color:transparent!important;pointer-events:none;cursor:progress}\n[data-loading=\"true\"]>*{visibility:hidden}\n[data-loading=\"true\"]::after{content:\"\";position:absolute;left:50%;top:50%;box-sizing:border-box;width:12px;height:12px;margin:-6px 0 0 -6px;border:1.5px solid var(--dsw-alias-label-secondary);border-top-color:transparent;border-radius:var(--an-radius-pill);corner-shape:round;animation:dsh-an-spin var(--an-dur-spin) linear infinite}\n\n/* ── 15 悬停 · 只在支持 hover 的设备上启用（触摸端常显操作） ────────── */\n@media (hover:hover){\n  button.dsh-an-attachmentBody:hover{background:var(--an-hover)}\n.dsh-an-row:hover{background:var(--an-hover)}\n.dsh-an-meta{opacity:1}\n.dsh-an-actions{opacity:0;pointer-events:none}\n.dsh-an-row:hover .dsh-an-actions,.dsh-an-row:focus-within .dsh-an-actions{opacity:1;pointer-events:auto}\n.dsh-an-row:hover .dsh-an-meta,.dsh-an-row:focus-within .dsh-an-meta{opacity:0}\n.dsh-an-iconBtn:hover{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-workspaceJump:not([aria-current]):hover .dsh-an-workspaceName{text-decoration:underline;text-underline-offset:2px}\n.dsh-an-popClose:hover{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-scope[role=\"group\"]:hover{background-color:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 70%,var(--dsw-alias-interactive-bg-hover-solid))}\n.dsh-an-scopeBtn:hover{color:var(--dsw-alias-label-primary)}\n.dsh-an-addBtn:hover:not(:disabled,:active),.dsh-an-attachBtn:hover:not(:disabled){background:var(--an-hover)}\n.dsh-an-mini:hover:not([disabled]){background:var(--an-hover)}\n.dsh-an-miniDanger:hover:not([disabled]){background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}\n.dsh-an-clear:hover{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-doneToggle:hover,.dsh-an-storageToggle:hover,.dsh-an-updateToggle:hover{background:var(--an-hover)}\n.dsh-an-updatePrimary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}\n.dsh-an-headerBtn:hover{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-resizeHandle:hover::before{transform:scaleY(1.4);background:var(--dsw-alias-label-secondary)}\n.dsh-an-resizeHandleBottom:hover::before{transform:scaleX(1.4);background:var(--dsw-alias-label-secondary)}\n}\n\n/* ── 16 动效 · 只动 opacity/transform，错峰出场封顶 ─────────────────── */\n@media (prefers-reduced-motion:no-preference){\n.dsh-an-rows>.dsh-an-row{animation:dsh-an-row-in var(--an-dur-base) var(--an-ease) backwards}\n.dsh-an-rows>.dsh-an-row:nth-child(2){animation-delay:var(--an-space-1)}\n.dsh-an-rows>.dsh-an-row:nth-child(3){animation-delay:var(--an-space-2)}\n.dsh-an-rows>.dsh-an-row:nth-child(4){animation-delay:calc(var(--an-space-2) + var(--an-space-1))}\n.dsh-an-rows>.dsh-an-row:nth-child(n+5){animation-delay:var(--an-space-3)}\n}\n@keyframes dsh-an-pop-in{from{opacity:0}to{opacity:1}}\n@keyframes dsh-an-row-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}\n@keyframes dsh-an-spin{to{transform:rotate(360deg)}}\n@media (prefers-reduced-motion:reduce){\n.dsh-an-popover,.dsh-an-rows>.dsh-an-row,.dsh-an-chevron,[data-loading=\"true\"]::after{animation:none}\n.dsh-an-popover,.dsh-an-row,.dsh-an-meta,.dsh-an-actions,.dsh-an-iconBtn{transition-duration:1ms}\n}\n\n/* ── 17 窄视口 · 390 基准下收紧内边距，主操作全部可达 ──────────────── */\n@media (max-width:480px){\n.dsh-an-popover{padding:var(--an-space-3);--dsh-an-listGutter:var(--an-space-3)}\n.dsh-an-popoverRight{padding-left:var(--an-space-4)}\n.dsh-an-popHead,.dsh-an-popTitleLine{gap:var(--an-space-2)}\n.dsh-an-add{padding:var(--an-space-2) var(--an-space-3)}\n.dsh-an-sectionHead,.dsh-an-doneHead{min-height:24px}\n}\n\n";

// node_modules/clsx/dist/clsx.mjs
function r(e) {
	var t, f, n = "";
	if ("string" == typeof e || "number" == typeof e) n += e;
	else if ("object" == typeof e) if (Array.isArray(e)) {
		var o = e.length;
		for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
	} else for (f in e) e[f] && (n && (n += " "), n += f);
	return n;
}
function clsx() {
	for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
	return n;
}

// \0dsh-css:node_modules/@deepseek-ai/dsh-client-ui-attachment/src/AttachmentRail.module.css.mjs
var AttachmentRail_module_css_default = {
	"arrow": "dsh-an-official-AttachmentRail-module-arrow",
	"arrowLeft": "dsh-an-official-AttachmentRail-module-arrowLeft",
	"arrowRight": "dsh-an-official-AttachmentRail-module-arrowRight",
	"item": "dsh-an-official-AttachmentRail-module-item",
	"rail": "dsh-an-official-AttachmentRail-module-rail",
	"remove": "dsh-an-official-AttachmentRail-module-remove",
	"root": "dsh-an-official-AttachmentRail-module-root",
	"thumbnail": "dsh-an-official-AttachmentRail-module-thumbnail"
};
const stylesheet$2 = ".dsh-an-official-AttachmentRail-module-root {\n  min-width: 0;\n  position: relative;\n}\n\n.dsh-an-official-AttachmentRail-module-rail {\n  scrollbar-width: none;\n  --dsh-scrollbar-thumb: var(--dsw-alias-scrollbar-bg-l2);\n  --dsh-scrollbar-thumb-hover: var(--dsw-alias-scrollbar-hover-l2);\n  align-items: stretch;\n  gap: 10px;\n  display: flex;\n  overflow: auto hidden;\n}\n\n.dsh-an-official-AttachmentRail-module-rail::-webkit-scrollbar {\n  display: none;\n}\n\n.dsh-an-official-AttachmentRail-module-item {\n  flex: none;\n  height: 64px;\n}\n\n.dsh-an-official-AttachmentRail-module-thumbnail {\n  border: .5px solid var(--dsw-alias-border-l2-darkmode-thin);\n  border-radius: var(--dsw-radius-xl);\n  background: var(--dsw-alias-interactive-bg-hover);\n  cursor: zoom-in;\n  width: 64px;\n  height: 64px;\n  padding: 0;\n  overflow: hidden;\n}\n\n.dsh-an-official-AttachmentRail-module-thumbnail img {\n  object-fit: cover;\n  width: 100%;\n  height: 100%;\n  display: block;\n}\n\n.dsh-an-official-AttachmentRail-module-remove {\n  z-index: 1;\n  corner-shape: round;\n  background: var(--dsw-alias-button-contrast-fill);\n  width: 18px;\n  height: 18px;\n  color: var(--dsw-alias-label-primary-inverted);\n  cursor: pointer;\n  opacity: 0;\n  border: none;\n  border-radius: 50%;\n  place-items: center;\n  padding: 0;\n  transition: opacity .2s ease-in-out;\n  display: grid;\n  position: absolute;\n  top: 4px;\n  right: 4px;\n}\n\n.dsh-an-official-AttachmentRail-module-remove:focus-visible {\n  opacity: 1;\n}\n\n@media (hover: hover) {\n  .dsh-an-official-AttachmentRail-module-item:hover .dsh-an-official-AttachmentRail-module-remove {\n    opacity: 1;\n  }\n}\n\n@media (hover: none), (pointer: coarse) {\n  .dsh-an-official-AttachmentRail-module-remove {\n    opacity: 1;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .dsh-an-official-AttachmentRail-module-remove {\n    transition: none;\n  }\n}\n\n.dsh-an-official-AttachmentRail-module-arrow {\n  z-index: 2;\n  --dsw-elevation-stroke-color: var(--dsw-alias-border-l2-darkmode-thin);\n  corner-shape: round;\n  background: var(--dsw-specific-input-major);\n  width: 24px;\n  height: 24px;\n  color: var(--dsw-alias-label-secondary);\n  box-shadow: var(--dsw-elevation-panel);\n  cursor: pointer;\n  border: 0;\n  border-radius: 999px;\n  place-items: center;\n  padding: 0;\n  display: grid;\n  position: absolute;\n  top: 50%;\n  transform: translateY(-50%);\n}\n\n@media (hover: hover) {\n  .dsh-an-official-AttachmentRail-module-arrow:hover {\n    background: var(--dsw-alias-interactive-bg-hover-solid);\n  }\n}\n\n.dsh-an-official-AttachmentRail-module-arrowLeft {\n  left: 4px;\n}\n\n.dsh-an-official-AttachmentRail-module-arrowRight {\n  right: 4px;\n}\n";

// node_modules/@deepseek-ai/dsh-client-ui-attachment/src/AttachmentRail.tsx
/** Draft-attachment rail: scrollbar-less horizontal overflow paged by edge arrows. */
/** Approximate pixels per wheel step for `deltaMode` LINE deltas (Firefox
* notch wheels report lines, not pixels). */
const WHEEL_LINE_PX = 16;
/** Smooth paging unless the user asked for reduced motion. */
function pageBehavior() {
	const matchMedia = window.matchMedia;
	return matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}
/**
* Horizontal rail over the caller's ordered draft attachments.
*
* The rail scrolls with its scrollbar hidden; overflow is announced by edge
* arrows recomputed from scroll geometry on scroll, item-count changes, and
* rail size changes (a ResizeObserver on the rail element, so sidebar or
* panel resizes count, not only window resizes). A vertical wheel pans the
* rail horizontally and is consumed exclusively (non-passive listener), a
* newly added item is revealed at the rail's end while a rail that mounts
* over an existing draft keeps its start position. The owner renders each
* item and decides mounting; it renders the rail only while items exist.
*
* @param props.items - attachments in draft order.
* @param props.labels - rail-level strings (group name and paging arrows).
* @param props.renderItem - render one attachment card in draft order.
* @returns the rail group with its paging arrows.
*/
function AttachmentRail({ items, labels, renderItem }) {
	const railRef = (0, react.useRef)(null);
	const countRef = (0, react.useRef)(null);
	const [edges, setEdges] = (0, react.useState)({
		left: false,
		right: false
	});
	const updateEdges = (0, react.useCallback)(() => {
		const el = railRef.current;
		/* v8 ignore next -- defensive: every caller runs while the rail element is mounted. */
		if (el === null) return;
		const left = el.scrollLeft > 1;
		const right = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;
		setEdges((prev) => prev.left === left && prev.right === right ? prev : {
			left,
			right
		});
	}, []);
	(0, react.useLayoutEffect)(() => {
		const grew = countRef.current !== null && items.length > countRef.current;
		countRef.current = items.length;
		const el = railRef.current;
		/* v8 ignore next -- defensive: the rail div renders unconditionally, so the layout effect always finds it. */
		if (el === null) return;
		if (grew) el.scrollLeft = el.scrollWidth - el.clientWidth;
		updateEdges();
	}, [items.length, updateEdges]);
	(0, react.useEffect)(() => {
		const el = railRef.current;
		/* v8 ignore next -- defensive: the rail div renders unconditionally, so the mount effect always finds it. */
		if (el === null) return;
		let disconnect = () => {};
		if (typeof ResizeObserver !== "undefined") {
			const observer = new ResizeObserver(updateEdges);
			observer.observe(el);
			disconnect = () => {
				observer.disconnect();
			};
		}
		const onWheel = (event) => {
			if (event.deltaY === 0) return;
			const scale = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? WHEEL_LINE_PX : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? el.clientWidth : 1;
			event.preventDefault();
			el.scrollBy({
				left: event.deltaX !== 0 ? event.deltaX * scale : Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY) * scale, 60),
				behavior: "auto"
			});
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => {
			disconnect();
			el.removeEventListener("wheel", onWheel);
		};
	}, [updateEdges]);
	const page = (direction) => {
		const el = railRef.current;
		/* v8 ignore next -- defensive: the arrows render only while the rail is mounted, so a click cannot find a null ref. */
		if (el === null) return;
		el.scrollBy({
			left: direction * Math.max(el.clientWidth - 64, 200),
			behavior: pageBehavior()
		});
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: AttachmentRail_module_css_default.root,
		children: [
			edges.left && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: clsx(AttachmentRail_module_css_default.arrow, AttachmentRail_module_css_default.arrowLeft),
				"aria-label": labels.scrollLeft,
				onClick: () => {
					page(-1);
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutlineRegular, {})
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref: railRef,
				className: AttachmentRail_module_css_default.rail,
				role: "group",
				"aria-label": labels.group,
				onScroll: updateEdges,
				children: items.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: AttachmentRail_module_css_default.item,
					children: renderItem(item)
				}, item.id))
			}),
			edges.right && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: clsx(AttachmentRail_module_css_default.arrow, AttachmentRail_module_css_default.arrowRight),
				"aria-label": labels.scrollRight,
				onClick: () => {
					page(1);
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {})
			})
		]
	});
}

// \0dsh-css:node_modules/@deepseek-ai/dsh-client-ui-attachment/src/FileCard.module.css.mjs
var FileCard_module_css_default = {
	"body": "dsh-an-official-FileCard-module-body",
	"card": "dsh-an-official-FileCard-module-card",
	"failed": "dsh-an-official-FileCard-module-failed",
	"file-card-progress": "dsh-an-official-FileCard-module-file-card-progress",
	"file-card-spin": "dsh-an-official-FileCard-module-file-card-spin",
	"icon": "dsh-an-official-FileCard-module-icon",
	"meta": "dsh-an-official-FileCard-module-meta",
	"metaFailed": "dsh-an-official-FileCard-module-metaFailed",
	"name": "dsh-an-official-FileCard-module-name",
	"progressBar": "dsh-an-official-FileCard-module-progressBar",
	"progressTrack": "dsh-an-official-FileCard-module-progressTrack",
	"remove": "dsh-an-official-FileCard-module-remove",
	"removeFailed": "dsh-an-official-FileCard-module-removeFailed",
	"retry": "dsh-an-official-FileCard-module-retry",
	"spinner": "dsh-an-official-FileCard-module-spinner"
};
const stylesheet$1 = ".dsh-an-official-FileCard-module-card {\n  border: .5px solid var(--dsw-alias-border-l2);\n  border-radius: var(--dsw-radius-lg);\n  background: var(--dsw-specific-input-major, transparent);\n  box-sizing: border-box;\n  text-align: left;\n  align-items: center;\n  gap: 10px;\n  width: 240px;\n  height: 64px;\n  padding: 0 12px;\n  display: inline-flex;\n  position: relative;\n}\n\n.dsh-an-official-FileCard-module-failed {\n  border-color: var(--dsw-alias-state-error-primary);\n}\n\n.dsh-an-official-FileCard-module-icon {\n  flex: none;\n  justify-content: center;\n  align-items: center;\n  width: 28px;\n  height: 28px;\n  display: inline-flex;\n}\n\n.dsh-an-official-FileCard-module-spinner {\n  corner-shape: round;\n  border: 2px solid;\n  border-top-color: #0000;\n  border-radius: 50%;\n  width: 20px;\n  height: 20px;\n  animation: .8s linear infinite dsh-an-official-FileCard-module-file-card-spin;\n}\n\n@keyframes dsh-an-official-FileCard-module-file-card-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n.dsh-an-official-FileCard-module-body {\n  flex-direction: column;\n  flex: 1;\n  min-width: 0;\n  padding: 8px 0;\n  display: flex;\n}\n\n.dsh-an-official-FileCard-module-retry {\n  color: inherit;\n  font: inherit;\n  text-align: left;\n  cursor: pointer;\n  background: none;\n  border: 0;\n  padding: 0;\n}\n\n.dsh-an-official-FileCard-module-name {\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  color: var(--dsw-alias-label-primary);\n  font-size: 14px;\n  font-weight: 500;\n  line-height: 22px;\n  overflow: hidden;\n}\n\n.dsh-an-official-FileCard-module-meta {\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12px;\n  line-height: 15px;\n  overflow: hidden;\n}\n\n.dsh-an-official-FileCard-module-metaFailed {\n  color: var(--dsw-alias-state-error-primary);\n}\n\n.dsh-an-official-FileCard-module-remove {\n  corner-shape: round;\n  background: var(--dsw-alias-button-contrast-fill);\n  width: 18px;\n  height: 18px;\n  color: var(--dsw-alias-label-primary-inverted);\n  opacity: 0;\n  cursor: pointer;\n  border: none;\n  border-radius: 50%;\n  justify-content: center;\n  align-items: center;\n  padding: 0;\n  transition: opacity .2s ease-in-out;\n  display: inline-flex;\n  position: absolute;\n  top: 6px;\n  right: 6px;\n}\n\n.dsh-an-official-FileCard-module-remove:focus-visible {\n  opacity: 1;\n}\n\n@media (hover: hover) {\n  .dsh-an-official-FileCard-module-card:hover .dsh-an-official-FileCard-module-remove {\n    opacity: 1;\n  }\n}\n\n@media (hover: none), (pointer: coarse) {\n  .dsh-an-official-FileCard-module-remove {\n    opacity: 1;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .dsh-an-official-FileCard-module-remove {\n    transition: none;\n  }\n}\n\n.dsh-an-official-FileCard-module-card:focus-within .dsh-an-official-FileCard-module-name {\n  padding-right: 18px;\n}\n\n@media (hover: hover) {\n  .dsh-an-official-FileCard-module-card:hover .dsh-an-official-FileCard-module-name {\n    padding-right: 18px;\n  }\n}\n\n.dsh-an-official-FileCard-module-removeFailed {\n  background: var(--dsw-alias-state-error-primary);\n  color: var(--dsw-alias-label-on-color);\n  opacity: 1;\n}\n\n.dsh-an-official-FileCard-module-progressTrack {\n  background: var(--dsw-specific-file-upload-track);\n  border-radius: 1px;\n  height: 2px;\n  position: absolute;\n  bottom: 5px;\n  left: 12px;\n  right: 12px;\n  overflow: hidden;\n}\n\n.dsh-an-official-FileCard-module-progressBar {\n  border-radius: inherit;\n  background: var(--dsw-alias-brand-primary);\n  width: 35%;\n  height: 100%;\n  animation: 1.2s ease-in-out infinite alternate dsh-an-official-FileCard-module-file-card-progress;\n  display: block;\n}\n\n.dsh-an-official-FileCard-module-progressBar[style] {\n  animation: none;\n}\n\n@keyframes dsh-an-official-FileCard-module-file-card-progress {\n  from {\n    transform: translateX(-70%);\n  }\n\n  to {\n    transform: translateX(220%);\n  }\n}\n\n@media (hover: none), (pointer: coarse) {\n  .dsh-an-official-FileCard-module-remove {\n    opacity: 1;\n  }\n}\n";

// node_modules/@deepseek-ai/dsh-client-ui-attachment/src/FileCard.tsx
/** One pending file card: type glyph, name, size or upload status, remove, retry. */
function FileCard({ name, bytes, state, progress, labels, onRemove, onRetry }) {
	const extension = (0, _deepseek_ai_dsh_client_ui_primitives.fileExtension)(name).toUpperCase().slice(0, 8);
	const meta = state === "uploading" ? labels.uploading : state === "error" ? labels.failed : [extension, (0, _deepseek_ai_dsh_client_ui_primitives.fileSizeText)(bytes)].filter((part) => part !== "").join(" ");
	const retryable = state === "error";
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: `${FileCard_module_css_default.card}${retryable ? ` ${FileCard_module_css_default.failed}` : ""}`,
		title: name,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: FileCard_module_css_default.icon,
				"aria-hidden": true,
				children: state === "uploading" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: FileCard_module_css_default.spinner }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, { path: name })
			}),
			retryable ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: `${FileCard_module_css_default.body} ${FileCard_module_css_default.retry}`,
				"aria-label": labels.retry,
				onClick: onRetry,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: FileCard_module_css_default.name,
					children: name
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: `${FileCard_module_css_default.meta} ${FileCard_module_css_default.metaFailed}`,
					children: meta
				})]
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: FileCard_module_css_default.body,
				"aria-label": labels.label,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: FileCard_module_css_default.name,
					children: name
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: FileCard_module_css_default.meta,
					children: meta
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: retryable ? `${FileCard_module_css_default.remove} ${FileCard_module_css_default.removeFailed}` : FileCard_module_css_default.remove,
				"aria-label": labels.remove,
				onClick: onRemove,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseFillRegular, { size: 12 })
			}),
			state === "uploading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: FileCard_module_css_default.progressTrack,
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: FileCard_module_css_default.progressBar,
					style: progress === void 0 ? void 0 : { width: `${String(Math.min(1, Math.max(0, progress)) * 100)}%` }
				})
			})
		]
	});
}

// \0dsh-css:node_modules/@deepseek-ai/dsh-client-ui-attachment/src/client/ComposerAttachments.module.css.mjs
var ComposerAttachments_module_css_default = {
	"failureGlyph": "dsh-an-official-ComposerAttachments-module-failureGlyph",
	"image-upload-progress": "dsh-an-official-ComposerAttachments-module-image-upload-progress",
	"imageItem": "dsh-an-official-ComposerAttachments-module-imageItem",
	"progressBar": "dsh-an-official-ComposerAttachments-module-progressBar",
	"progressTrack": "dsh-an-official-ComposerAttachments-module-progressTrack",
	"rail": "dsh-an-official-ComposerAttachments-module-rail",
	"remove": "dsh-an-official-ComposerAttachments-module-remove",
	"thumbnail": "dsh-an-official-ComposerAttachments-module-thumbnail",
	"thumbnailFailed": "dsh-an-official-ComposerAttachments-module-thumbnailFailed",
	"thumbnailRefused": "dsh-an-official-ComposerAttachments-module-thumbnailRefused"
};
const stylesheet = ".dsh-an-official-ComposerAttachments-module-rail {\n  min-width: 0;\n  margin-bottom: -6px;\n  padding: 2px 10px 0;\n}\n\n.dsh-an-official-ComposerAttachments-module-imageItem {\n  width: 64px;\n  height: 64px;\n  position: relative;\n}\n\n.dsh-an-official-ComposerAttachments-module-thumbnail {\n  border: .5px solid var(--dsw-alias-border-l2-darkmode-thin);\n  border-radius: var(--dsw-radius-xl);\n  background: var(--dsw-alias-interactive-bg-hover);\n  cursor: zoom-in;\n  width: 64px;\n  height: 64px;\n  padding: 0;\n  overflow: hidden;\n}\n\n.dsh-an-official-ComposerAttachments-module-thumbnail img {\n  object-fit: cover;\n  width: 100%;\n  height: 100%;\n  display: block;\n}\n\n.dsh-an-official-ComposerAttachments-module-thumbnailFailed {\n  border-color: var(--dsw-alias-state-error-primary);\n  cursor: pointer;\n}\n\n.dsh-an-official-ComposerAttachments-module-thumbnailFailed img {\n  opacity: .4;\n}\n\n.dsh-an-official-ComposerAttachments-module-thumbnailRefused {\n  cursor: default;\n}\n\n.dsh-an-official-ComposerAttachments-module-failureGlyph {\n  color: var(--dsw-alias-state-error-primary);\n  place-items: center;\n  display: grid;\n  position: absolute;\n  inset: 0;\n}\n\n.dsh-an-official-ComposerAttachments-module-progressTrack {\n  background: var(--dsw-specific-file-upload-track);\n  pointer-events: none;\n  border-radius: 1px;\n  height: 2px;\n  position: absolute;\n  bottom: 6px;\n  left: 8px;\n  right: 8px;\n  overflow: hidden;\n}\n\n.dsh-an-official-ComposerAttachments-module-progressBar {\n  border-radius: inherit;\n  background: var(--dsw-alias-brand-primary);\n  width: 35%;\n  height: 100%;\n  animation: 1.2s ease-in-out infinite alternate dsh-an-official-ComposerAttachments-module-image-upload-progress;\n  display: block;\n}\n\n.dsh-an-official-ComposerAttachments-module-progressBar[style] {\n  animation: none;\n}\n\n@keyframes dsh-an-official-ComposerAttachments-module-image-upload-progress {\n  from {\n    transform: translateX(-70%);\n  }\n\n  to {\n    transform: translateX(220%);\n  }\n}\n\n.dsh-an-official-ComposerAttachments-module-remove {\n  z-index: 1;\n  corner-shape: round;\n  background: var(--dsw-alias-button-contrast-fill);\n  width: 18px;\n  height: 18px;\n  color: var(--dsw-alias-label-primary-inverted);\n  cursor: pointer;\n  opacity: 0;\n  border: none;\n  border-radius: 50%;\n  place-items: center;\n  padding: 0;\n  transition: opacity .2s ease-in-out;\n  display: grid;\n  position: absolute;\n  top: 4px;\n  right: 4px;\n}\n\n.dsh-an-official-ComposerAttachments-module-remove:focus-visible {\n  opacity: 1;\n}\n\n@media (hover: hover) {\n  .dsh-an-official-ComposerAttachments-module-imageItem:hover .dsh-an-official-ComposerAttachments-module-remove {\n    opacity: 1;\n  }\n}\n\n@media (hover: none), (pointer: coarse) {\n  .dsh-an-official-ComposerAttachments-module-remove {\n    opacity: 1;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .dsh-an-official-ComposerAttachments-module-remove {\n    transition: none;\n  }\n\n  .dsh-an-official-ComposerAttachments-module-progressBar {\n    animation: none;\n  }\n}\n";

// host/attachment-metadata.ts
const MAX_ATTACHMENT_BYTES = 26214400;
const MAX_ATTACHMENTS = 10;
const MAX_ATTACHMENT_NAME = 255;
const MAX_ATTACHMENT_MIME = 127;
const ATTACHMENT_ID = /^[a-f0-9]{64}$/;
const ATTACHMENT_MIME = /^(?:[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*)?$/;
function normalizeAttachment(raw) {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
	const { id, name, type, size } = raw;
	if (typeof id !== "string" || !ATTACHMENT_ID.test(id)) return;
	if (typeof name !== "string" || !name || name.length > 255) return;
	if (typeof type !== "string" || type.length > 127 || !ATTACHMENT_MIME.test(type)) return;
	if (typeof size !== "number" || !Number.isInteger(size) || size < 1 || size > 26214400) return;
	return {
		id,
		name,
		type,
		size
	};
}
function normalizeAttachments(raw) {
	if (!Array.isArray(raw)) return [];
	const attachments = [];
	for (const candidate of raw) {
		const attachment = normalizeAttachment(candidate);
		if (attachment) attachments.push(attachment);
		if (attachments.length === 10) break;
	}
	return attachments;
}

// src/client/domain/attachments.ts
const ATTACHMENT_PATH = "/dsh-sideby-note/attachments";
async function uploadAttachment(file, signal) {
	const response = await fetch(ATTACHMENT_PATH, {
		method: "POST",
		headers: { "Content-Type": "application/octet-stream" },
		body: file,
		signal
	});
	if (!response.ok) throw new Error("Attachment upload failed");
	const result = await response.json();
	if (!result || typeof result !== "object" || !("ok" in result) || result.ok !== true || !("id" in result)) throw new Error("Invalid attachment upload response");
	const type = file.type.toLowerCase();
	const [attachment] = normalizeAttachments([{
		id: result.id,
		name: file.name.slice(0, 255),
		type: type.length <= 127 && ATTACHMENT_MIME.test(type) ? type : "",
		size: file.size
	}]);
	if (!attachment) throw new Error("Invalid attachment metadata");
	return attachment;
}
function attachmentUrl(attachment) {
	const query = new URLSearchParams({
		id: attachment.id,
		name: attachment.name
	});
	return `${ATTACHMENT_PATH}?${query}`;
}
async function readAttachment(attachment, signal) {
	const response = await fetch(attachmentUrl(attachment), { signal });
	if (!response.ok) throw new Error("Attachment download failed");
	const blob = await response.blob();
	if (blob.size !== attachment.size) throw new Error("Attachment size mismatch");
	return blob.slice(0, blob.size, attachment.type);
}
const imageTypes = /* @__PURE__ */ new Set([
	"image/png",
	"image/jpeg",
	"image/webp",
	"image/gif",
	"image/avif",
	"image/bmp"
]);
const audioTypes = /* @__PURE__ */ new Set([
	"audio/aac",
	"audio/flac",
	"audio/mp4",
	"audio/mpeg",
	"audio/ogg",
	"audio/wav",
	"audio/webm",
	"audio/x-wav",
	"audio/x-m4a"
]);
const videoTypes = /* @__PURE__ */ new Set([
	"video/mp4",
	"video/ogg",
	"video/quicktime",
	"video/webm"
]);
function previewKind(type) {
	if (imageTypes.has(type)) return "img";
	if (audioTypes.has(type)) return "audio";
	if (videoTypes.has(type)) return "video";
	return null;
}

// src/client/ui/primitives.ts
/**
* Shared glyphs and the tooltip wrapper.
*
* Glyphs come from the product icon set; this plugin draws none of its own, so
* stroke weight, optical size and currentColor stay consistent with the shell.
* Tooltip and Toast are the seeded primitives — the bundle keeps them external.
*/
const h$13 = react.default.createElement;
const PRIMITIVES = _deepseek_ai_dsh_client_ui_primitives;
const Tooltip = typeof PRIMITIVES.Tooltip === "function" ? PRIMITIVES.Tooltip : null;
const Toast = typeof PRIMITIVES.Toast === "function" ? PRIMITIVES.Toast : null;
const icon = (name) => typeof PRIMITIVES[name] === "function" ? PRIMITIVES[name] : null;
/**
* Glyphs come from the shared product icon set; this plugin draws none of
* its own, so stroke weight, optical size and currentColor stay consistent
* with the surrounding shell.
*/
function Glyph(props) {
	const Component = icon(props.name);
	if (!Component) return null;
	return h$13(Component, {
		size: props.size,
		className: props.className
	});
}
const IconCopy = () => h$13(Glyph, {
	name: "IconCopyOutlineRegular",
	size: 14
});
const IconInsert = () => h$13(Glyph, {
	name: "IconListPenOutlineRegular",
	size: 14
});
/**
* Rewind is the product refresh arc mirrored to run counter-clockwise (↺):
* the set has no undo glyph, and flipping keeps the shell's stroke and size.
*/
const IconRewind = () => h$13(Glyph, {
	name: "IconRefreshOutlineRegular",
	size: 14,
	className: "dsh-an-glyphFlip"
});
const IconChevron = () => h$13(Glyph, {
	name: "IconChevronRightOutlineRegular",
	size: 12
});
const IconEmpty = () => h$13(Glyph, {
	name: "IconChecklistOutlineRegular",
	size: 18
});
const IconClose = () => h$13(Glyph, {
	name: "IconCloseOutlineRegular",
	size: 14
});
/** Wrap one icon-only control in the shared tooltip; a bare button when absent. */
function withTooltip(label, node) {
	if (!Tooltip) return node;
	return h$13(Tooltip, {
		label,
		side: "top",
		portal: true,
		gap: 6
	}, node);
}

// src/client/ui/AttachmentList.tsx
/** @jsxRuntime classic */
const officialAttachmentCSS = `${stylesheet$2}\n${stylesheet$1}\n${stylesheet}
.dsh-an-imageDownload.${ComposerAttachments_module_css_default.remove}{inset:auto 4px 4px auto;opacity:1;text-decoration:none}
.dsh-an-imageLoading{display:grid;place-items:center;cursor:default}
.${AttachmentRail_module_css_default.item}:has(>.dsh-an-imageFallback){height:auto}
.dsh-an-imageFallback{width:min(240px,100cqi)}
.dsh-an-attachment[data-remove-disabled] .${FileCard_module_css_default.remove}{display:none}
.dsh-an-attachment > .${FileCard_module_css_default.card}{max-width:100%;width:min(240px,100cqi);padding-inline-end:var(--an-space-6);vertical-align:top}
.dsh-an-attachment[data-previewable] > .${FileCard_module_css_default.card}{padding-inline-end:calc(var(--an-space-6) + var(--an-space-4))}
@media (hover:hover){.dsh-an-attachment:hover .${FileCard_module_css_default.remove}{opacity:1}}`;
function useAttachmentPreview(attachment, enabled = true) {
	const { id: attachmentId, name, size, type } = attachment;
	const [preview, setPreview] = react.default.useState({});
	react.default.useEffect(() => {
		if (!enabled) return;
		const controller = new AbortController();
		let url;
		readAttachment({
			id: attachmentId,
			name,
			size,
			type
		}, controller.signal).then((blob) => {
			if (controller.signal.aborted) return;
			url = URL.createObjectURL(blob);
			setPreview({ url });
		}).catch(() => {
			if (!controller.signal.aborted) setPreview({ failed: true });
		});
		return () => {
			controller.abort();
			if (url) URL.revokeObjectURL(url);
		};
	}, [
		attachmentId,
		name,
		size,
		type,
		enabled
	]);
	return {
		...preview,
		fail: () => setPreview({ failed: true })
	};
}
function AttachmentPreview({ attachment, id, say }) {
	const preview = useAttachmentPreview(attachment);
	const kind = previewKind(attachment.type);
	const { name } = attachment;
	const { fail } = preview;
	return /* @__PURE__ */ react.default.createElement("div", {
		id,
		className: "dsh-an-attachmentPreview"
	}, preview.failed ? /* @__PURE__ */ react.default.createElement("span", { role: "status" }, say("attachment.previewFailed")) : !preview.url ? /* @__PURE__ */ react.default.createElement("span", { role: "status" }, say("attachment.loading")) : kind === "img" ? /* @__PURE__ */ react.default.createElement("img", {
		src: preview.url,
		alt: name,
		onError: fail
	}) : kind && react.default.createElement(kind, {
		src: preview.url,
		controls: true,
		preload: "metadata",
		"aria-label": name,
		onError: fail
	}));
}
function DraftImage({ attachment, say, disabled, onRemove, fallback }) {
	const { name } = attachment;
	const itemRef = react.default.useRef(null);
	const triggerRef = react.default.useRef(null);
	const [visible, setVisible] = react.default.useState(typeof IntersectionObserver === "undefined");
	const [decoded, setDecoded] = react.default.useState(false);
	const [open, setOpen] = react.default.useState(false);
	const { url, failed, fail } = useAttachmentPreview(attachment, visible);
	react.default.useEffect(() => {
		if (visible || !itemRef.current) return;
		const observer = new IntersectionObserver((entries) => {
			if (!entries.some((entry) => entry.isIntersecting)) return;
			observer.disconnect();
			setVisible(true);
		});
		observer.observe(itemRef.current);
		return () => observer.disconnect();
	}, [visible]);
	const previewLabel = say("attachment.preview", { name });
	const download = say("attachment.download", { name });
	if (failed) return /* @__PURE__ */ react.default.createElement("div", { className: "dsh-an-imageFallback" }, fallback, /* @__PURE__ */ react.default.createElement("div", {
		className: "dsh-an-attachmentStatus",
		role: "status"
	}, say("attachment.previewFailed")));
	return /* @__PURE__ */ react.default.createElement("div", {
		ref: itemRef,
		className: `dsh-an-attachment ${ComposerAttachments_module_css_default.imageItem}`,
		"data-image-preview-open": open ? "" : void 0
	}, /* @__PURE__ */ react.default.createElement("button", {
		ref: triggerRef,
		type: "button",
		className: decoded ? ComposerAttachments_module_css_default.thumbnail : `${ComposerAttachments_module_css_default.thumbnail} dsh-an-imageLoading`,
		title: decoded ? previewLabel : name,
		"aria-label": previewLabel,
		"aria-haspopup": "dialog",
		disabled: !decoded,
		onClick: () => setOpen(true)
	}, url ? /* @__PURE__ */ react.default.createElement("img", {
		src: url,
		alt: "",
		onLoad: () => setDecoded(true),
		onError: fail
	}) : /* @__PURE__ */ react.default.createElement(Glyph, {
		name: "IconImageOutlineRegular",
		size: 16
	})), !decoded && /* @__PURE__ */ react.default.createElement("span", {
		className: "dsh-an-srOnly",
		role: "status"
	}, say("attachment.loading")), /* @__PURE__ */ react.default.createElement("button", {
		type: "button",
		className: ComposerAttachments_module_css_default.remove,
		"aria-label": say("attachment.remove", { name }),
		disabled,
		onClick: onRemove
	}, /* @__PURE__ */ react.default.createElement(_deepseek_ai_dsh_client_ui_primitives.IconCloseFillRegular, { size: 12 })), withTooltip(download, /* @__PURE__ */ react.default.createElement("a", {
		className: `${ComposerAttachments_module_css_default.remove} dsh-an-imageDownload`,
		"aria-label": download,
		href: attachmentUrl(attachment),
		download: name
	}, icon("IconDownloadOutlineRegular") ? /* @__PURE__ */ react.default.createElement(Glyph, {
		name: "IconDownloadOutlineRegular",
		size: 12
	}) : /* @__PURE__ */ react.default.createElement("span", { "aria-hidden": "true" }, "↓"))), open && url && /* @__PURE__ */ react.default.createElement(_deepseek_ai_dsh_client_ui_primitives.ImageLightbox, {
		src: url,
		alt: name,
		labels: {
			dialog: previewLabel,
			close: say("attachment.closePreview")
		},
		onClose: () => {
			setOpen(false);
			triggerRef.current?.focus();
		}
	}));
}
function AttachmentList({ attachments, say, onRemove, disabled }) {
	const [openKey, setOpenKey] = react.default.useState();
	const previewId = react.default.useId();
	const occurrences = /* @__PURE__ */ new Map();
	const entries = attachments.map((attachment, index) => {
		const identity = JSON.stringify([
			attachment.id,
			attachment.name,
			attachment.type,
			attachment.size
		]);
		const occurrence = occurrences.get(identity) ?? 0;
		occurrences.set(identity, occurrence + 1);
		return {
			attachment,
			id: `${identity}:${occurrence}`,
			index
		};
	});
	const selected = entries.find((entry) => entry.id === openKey);
	react.default.useEffect(() => {
		if (openKey && !selected) setOpenKey(void 0);
	}, [openKey, selected]);
	if (!entries.length) return null;
	const preview = selected && /* @__PURE__ */ react.default.createElement(AttachmentPreview, {
		key: selected.id,
		attachment: selected.attachment,
		id: previewId,
		say
	});
	const renderCard = ({ attachment, id, index }, previewUnavailable = false) => {
		const { name, size, type } = attachment;
		const open = id === openKey;
		const download = say("attachment.download", { name });
		const previewLabel = say("attachment.preview", { name });
		const canPreview = !previewUnavailable && previewKind(type) !== null;
		return /* @__PURE__ */ react.default.createElement("div", {
			className: "dsh-an-attachment",
			"data-previewable": canPreview ? "" : void 0,
			"data-remove-disabled": !onRemove || disabled ? "" : void 0
		}, /* @__PURE__ */ react.default.createElement(FileCard, {
			name,
			bytes: size,
			state: "ready",
			labels: {
				label: name,
				remove: say("attachment.remove", { name }),
				uploading: "",
				failed: "",
				retry: ""
			},
			onRemove: () => {
				if (!onRemove || disabled) return;
				if (open) setOpenKey(void 0);
				onRemove(index);
			},
			onRetry: () => {}
		}), canPreview && withTooltip(previewLabel, /* @__PURE__ */ react.default.createElement("button", {
			type: "button",
			className: "dsh-an-attachmentBody",
			"aria-label": previewLabel,
			"aria-expanded": open,
			"aria-controls": open ? previewId : void 0,
			onClick: () => setOpenKey(open ? void 0 : id)
		}, /* @__PURE__ */ react.default.createElement("span", { "aria-hidden": "true" }, /* @__PURE__ */ react.default.createElement(Glyph, {
			name: "IconChevronRightOutlineRegular",
			size: 12
		})))), withTooltip(download, /* @__PURE__ */ react.default.createElement("a", {
			className: "dsh-an-iconBtn dsh-an-attachmentAction",
			href: attachmentUrl(attachment),
			download: name,
			"aria-label": download
		}, icon("IconDownloadOutlineRegular") ? /* @__PURE__ */ react.default.createElement(Glyph, {
			name: "IconDownloadOutlineRegular",
			size: 14
		}) : /* @__PURE__ */ react.default.createElement("span", { "aria-hidden": "true" }, "↓"))));
	};
	return /* @__PURE__ */ react.default.createElement("div", {
		className: "dsh-an-attachments",
		"data-draft": onRemove ? "" : void 0
	}, onRemove ? /* @__PURE__ */ react.default.createElement(AttachmentRail, {
		items: entries,
		renderItem: (entry) => previewKind(entry.attachment.type) === "img" && _deepseek_ai_dsh_client_ui_primitives.ImageLightbox ? /* @__PURE__ */ react.default.createElement(DraftImage, {
			attachment: entry.attachment,
			say,
			disabled,
			onRemove: () => onRemove(entry.index),
			fallback: renderCard(entry, true)
		}) : renderCard(entry),
		labels: {
			group: say("attachment.list"),
			scrollLeft: say("attachment.scrollLeft"),
			scrollRight: say("attachment.scrollRight")
		}
	}) : /* @__PURE__ */ react.default.createElement("ul", {
		className: "dsh-an-attachmentCards",
		"aria-label": say("attachment.list")
	}, entries.map((entry) => /* @__PURE__ */ react.default.createElement(react.default.Fragment, { key: entry.id }, /* @__PURE__ */ react.default.createElement("li", null, renderCard(entry)), selected === entry && /* @__PURE__ */ react.default.createElement("li", { className: "dsh-an-attachmentPreviewRow" }, preview)))), onRemove && preview);
}

// src/client/constants.ts
/**
* Plugin identity, storage keys, limits and platform helpers.
*
* Everything whose value is part of the on-disk contract lives here; the
* storage modules and the panel import it instead of repeating literals.
*/
/** Locale namespace of this plugin's copy (also binds the renderer's `t` prop). */
const NS = "dsh-sideby-note";
/** Sidebar launcher id and the main panel key it addresses. */
const PANEL_ID = "dsh-sideby-note";
/** Session-scoped memo store used by the popover and the session-header entry. */
const SESSION_STORAGE_KEY = "dsh.aside-note";
/** Notes shared by every session of one workspace; kept beside the session key. */
const WORKSPACE_STORAGE_KEY = "dsh.aside-note.workspaces";
/** Unsaved composer drafts, restored when the panel is reopened. */
const DRAFT_STORAGE_KEY = "dsh.aside-note.drafts";
/** Shown in the panel footer; keep in sync with package.json. */
const PLUGIN_VERSION = "0.1.0";
const PLUGIN_REPO_URL = "https://github.com/LighghtEeloo/dsh-sideby-note";
/** Last chosen list scope: the workspace list or the session list. */
const SCOPE_MODE_KEY = "dsh.aside-note.scope-mode";
const SCOPE_MODE_DEFAULT = "workspace";
/** Remembered expand/collapse state of the open/archived sections. */
const SECTION_STATE_KEY = "dsh.aside-note.sections";
const SECTION_STATE_DEFAULT = {
	open: true,
	done: false
};
/** How long the inline clear-completed confirmation waits before it dismisses itself. */
const CLEAR_CONFIRM_MS = 5e3;
/** Persisted width of the experimental right-side panel. */
const PANEL_WIDTH_KEY = "dsh.aside-note.panel-width";
/** Persisted height of the experimental right-side panel; 0 means content-sized. */
const PANEL_HEIGHT_KEY = "dsh.aside-note.panel-height";
/** Same-origin host endpoint owned by this package (keep in sync with host/store-route.js). */
const HOST_STORE_PATH = "/dsh-sideby-note/store";
/** Absolute path of the host file, for storage details. */
const HOST_STORE_LOCATION_PATH = "/dsh-sideby-note/store/location";
/** Ask the host to reveal the store file in its file manager. */
const HOST_STORE_REVEAL_PATH = "/dsh-sideby-note/store/reveal";
/** Browser-side marker: written only after the one-way switch to host storage succeeded. */
const STORAGE_MODE_KEY = "dsh.aside-note.storage-mode";
/** Browser-side notice dedupe record: { code, at }. */
const STORAGE_NOTICE_KEY = "dsh.aside-note.storage-notice";
/** Hydration/notice dedupe window for repeated failures. */
const STORAGE_NOTICE_MS = 864e5;
/** A snapshot is small; anything slower than this is a broken host, not a busy disk. */
const HOST_READ_TIMEOUT_MS = 4e3;
/** A durable write includes fsync; allow a slow disk but never hang the panel. */
const HOST_WRITE_TIMEOUT_MS = 1e4;

// src/client/i18n/de.ts
/** German copy; a missing key fails the typecheck rather than falling back at runtime. */
const de = {
	"nav.label": "Sideby Note",
	"title": "Sideby Note",
	"popover.title": "Sideby Note",
	"popover.close": "Sideby Note schließen",
	"popover.archived": "Archiviert",
	"popover.clearCancel": "Abbrechen",
	"popover.clearConfirm": "{n} archivierte Notizen löschen?",
	"popover.clearConfirmAction": "Löschen",
	"popover.clearArchived": "Archivierte löschen",
	"scope.label": "Notizen filtern",
	"scope.global": "Global",
	"scope.workspace": "Arbeitsbereich",
	"scope.globalHint": "Notizen aus allen Arbeitsbereichen anzeigen",
	"scope.workspaceHint": "Notizen aus dem aktuellen Arbeitsbereich anzeigen",
	"scope.loading": "Arbeitsbereich wird ermittelt",
	"scope.unassigned": "Nicht zugeordnet",
	"add.destination": "Zu {workspace} hinzufügen",
	"popover.clearGlobalConfirm": "Diese {n} archivierten Notizen aus allen Arbeitsbereichen löschen?",
	"popover.empty.title": "Noch keine Notizen",
	"popover.empty.body": "Ideen entwerfen, während der Agent arbeitet",
	"shortcut.toggle": "Sideby Note ein- oder ausblenden",
	"add.placeholder": "Eine notieren",
	"add.action": "Hinzufügen",
	"attachment.add": "Anhänge hinzufügen",
	"attachment.list": "Anhänge",
	"attachment.scrollLeft": "Anhänge nach links scrollen",
	"attachment.scrollRight": "Anhänge nach rechts scrollen",
	"attachment.preview": "Vorschau für {name}",
	"attachment.closePreview": "Vorschau schließen",
	"attachment.download": "{name} herunterladen",
	"attachment.remove": "{name} entfernen",
	"attachment.uploading": "Wird hochgeladen…",
	"attachment.loading": "Vorschau wird geladen…",
	"attachment.previewFailed": "Vorschau nicht verfügbar. Die Originaldatei kann heruntergeladen werden.",
	"attachment.limit": "Bis zu 10 Anhänge pro Notiz. Jede Datei muss Inhalt haben und darf höchstens 25 MiB groß sein.",
	"attachment.unavailable": "Anhänge benötigen DSH-Hostspeicher.",
	"attachment.uploadFailed": "Upload fehlgeschlagen. Bitte erneut versuchen.",
	"attachment.busy": "Warte, bis der aktuelle Vorgang abgeschlossen ist, bevor du Dateien hinzufügst.",
	"attachment.draftChanged": "Die Anhänge des Entwurfs wurden geändert. Prüfe sie und versuche es erneut.",
	"attachment.textInserted": "Text eingefügt. Lade die Anhänge aus dem Archiv herunter und füge sie der Unterhaltung hinzu.",
	"attachment.insertText": "Nur Text einfügen und archivieren",
	"attachment.archive": "Notiz archivieren",
	"attachment.archived": "Notiz archiviert",
	"list.open": "Offen",
	"list.allArchived.title": "Nichts mehr offen",
	"list.allArchived.body": "Noch eine Notiz hinzufügen oder unten das Archiv aufklappen",
	"item.copy": "Kopieren",
	"item.recall": "Zurückholen",
	"item.insert": "Einfügen",
	"item.openWorkspace": "Neue Sitzung in {workspace} starten",
	"item.currentWorkspace": "Aktueller Arbeitsbereich: {workspace}",
	"item.reorder": "Zum Sortieren ziehen oder ↑ / ↓ nutzen",
	"time.now": "gerade eben",
	"time.minutes": "vor {n} Min.",
	"time.hours": "vor {n} Std.",
	"time.days": "vor {n} T.",
	"time.createdArchived": "Geschrieben {created} · Archiviert {completed}",
	"storage.failed": "Lokaler Speicher ist nicht verfügbar; Änderungen werden möglicherweise nicht gespeichert",
	"storage.whereHost": "Notizen werden in einer lokalen DSH-Datei gespeichert",
	"storage.loading": "Notizen werden gelesen…",
	"storage.details": "Speicher und Updates",
	"storage.failure": "Letzter Fehler: {code}",
	"storage.migrated": "{n} Notizen aus diesem Browser in die lokale DSH-Datei verschoben",
	"storage.keptLocal": "Host-Notizen werden verwendet; ältere Notizen dieses Browsers wurden nicht zusammengeführt",
	"storage.notSwitched": "Host-Speicher ist nicht verfügbar; Notizen bleiben in diesem Browser und werden beim nächsten Start erneut versucht",
	"storage.hostError": "Notizspeicher ist nicht verfügbar",
	"storage.inUse": "AsideNote verwendet den Notizspeicher. Deaktiviere AsideNote und stelle die Verbindung erneut her.",
	"storage.retry": "Erneut verbinden",
	"storage.reconnecting": "Verbindung wird hergestellt…",
	"storage.copyPath": "Pfad kopieren",
	"storage.reveal": "Im Ordner zeigen",
	"storage.pathLoading": "Speicherort wird gelesen…",
	"storage.pathUnavailable": "Speicherdatei nicht auffindbar (Backend ohne Dateipfad)",
	"storage.pathMissing": "Datei noch nicht erstellt; sie entsteht beim ersten Speichern",
	"resize.width": "Breite von Sideby Note ändern",
	"resize.height": "Höhe von Sideby Note ändern",
	"resize.hint": "Zum Ändern ziehen, zum Zurücksetzen doppelklicken",
	"dock.open": "Sideby Note öffnen",
	"dock.count": "{n} offen",
	"toast.copied": "Kopiert",
	"toast.copyFailed": "Kopieren fehlgeschlagen — erneut versuchen",
	"toast.pathCopied": "Pfad kopiert",
	"toast.revealFailed": "Dateimanager konnte nicht geöffnet werden",
	"toast.inserted": "In den Chat gegeben",
	"toast.insertFailed": "Kein Chat-Eingabefeld gefunden — die Notiz bleibt unverändert",
	"toast.archiveFailed": "An den Chat übergeben, aber das Archiv konnte nicht gespeichert werden",
	"toast.recalled": "Zurück in das Eingabefeld geholt",
	"toast.recallBlocked": "Im Eingabefeld steht bereits Text – zuerst senden oder leeren",
	"toast.clearPartial": "Einige archivierte Notizen wurden gelöscht. Erneut versuchen, um die übrigen zu löschen",
	"toast.cleared": "Archiv geleert",
	"toast.saveFailed": "Speichern fehlgeschlagen. Bitte erneut versuchen",
	"update.version": "Version",
	"update.label": "Update verfügbar",
	"update.check": "Nach Updates suchen",
	"update.checking": "Prüfen…",
	"update.retryCheck": "Prüfung wiederholen",
	"update.current": "Sie sind auf dem neuesten Stand",
	"update.checkFailed": "Prüfung fehlgeschlagen — später erneut versuchen",
	"update.available": "Version {version} ist verfügbar",
	"update.notesTitle": "Versionshinweise",
	"update.notesLoading": "Versionshinweise werden geladen…",
	"update.notesMissing": "Für diese Version gibt es noch keine Versionshinweise",
	"update.historyCount": "{n} Versionen enthalten",
	"update.latest": "Neueste",
	"update.olderNotes": "Frühere Versionen stehen in den vollständigen Versionshinweisen",
	"update.notesFailed": "Versionshinweise konnten nicht geladen werden — vollständige Hinweise öffnen",
	"update.full": "Vollständige Versionshinweise",
	"update.now": "Jetzt aktualisieren",
	"update.starting": "Update wird vorbereitet…",
	"update.updating": "Wird aktualisiert…",
	"update.updated": "Auf {version} aktualisiert",
	"update.refresh": "Seite neu laden",
	"update.restartHint": "DSH manuell neu starten, um das Update abzuschließen",
	"update.failed": "Update fehlgeschlagen: {reason}",
	"update.notInstalled": "Dieses Plugin ist im aktuellen Profil nicht installiert und kann daher nicht in der App aktualisiert werden",
	"update.forbidden": "Das automatische Update hat diese Anfrage abgelehnt",
	"update.rejected": "Das automatische Update wurde nicht ausgeführt; ein verlinkter Checkout aktualisiert sich aus seinem eigenen Verzeichnis",
	"update.busy": "Ein anderes Update läuft bereits — gleich erneut versuchen",
	"update.timeout": "Zeitüberschreitung beim Warten auf das Update-Ergebnis — später erneut versuchen",
	"update.bundleInUse": "Dieses Plugin wird verwendet und Desktop entfernt es nicht zuerst; die Host-Route installiert darüber — falls das weiterhin fehlschlägt, den Befehl unten ausführen",
	"update.alreadyInstalled": "Dieses DSH ersetzt ein Paket erst nach dem Entfernen, daher kann es nicht über die aktuelle Kopie installieren; den Befehl unten ausführen",
	"update.managementRequired": "Dieses Profil wird von der Desktop-App verwaltet, das automatische Update kann es nicht ändern; den Befehl unten ausführen",
	"update.notRemovable": "Die Desktop-App verwaltet dieses Plugin und das automatische Update kann es nicht entfernen; den Befehl unten ausführen",
	"update.stopProfile": "Zum Entfernen muss dieses Profil zuerst gestoppt werden; den Befehl unten ausführen",
	"update.incompatible": "Diese Version ist nicht mit dem laufenden DSH kompatibel, daher hat der Host sie abgelehnt",
	"update.versionMismatch": "Die installierte Version ist nicht die angeforderte — ein Spiegel oder die Altersgrenze für Releases hat sie möglicherweise ersetzt; später erneut versuchen oder manuell installieren",
	"update.downgrade": "Abgelehnt: Die Zielversion ist älter als die installierte",
	"update.autoUnavailable": "Dieser Host bietet keine automatische Update-Route; den Befehl unten ausführen",
	"update.manualHint": "Oder direkt aktualisieren: {command} in einem Terminal ausführen oder auf der Plugins-Seite aktualisieren und dann neu laden",
	"update.copyPrompt": "Update-Prompt kopieren",
	"update.prompt": "Aktualisiere das DSH-Plugin Sideby Note auf {version} mit: {command}. Lade die Seite neu, wenn es fertig ist."
};

// src/client/i18n/en.ts
/** English copy; a missing key fails the typecheck rather than falling back at runtime. */
const en = {
	"nav.label": "Sideby Note",
	"title": "Sideby Note",
	"popover.title": "Sideby Note",
	"popover.close": "Close Sideby Note",
	"popover.archived": "Archived",
	"popover.clearCancel": "Cancel",
	"popover.clearConfirm": "Clear {n} archived notes?",
	"popover.clearConfirmAction": "Clear",
	"popover.clearArchived": "Clear archived",
	"scope.label": "Filter notes",
	"scope.global": "Global",
	"scope.workspace": "Workspace",
	"scope.globalHint": "Show notes from all workspaces",
	"scope.workspaceHint": "Show notes from the current workspace",
	"scope.loading": "Finding the current workspace",
	"scope.unassigned": "Unassigned",
	"add.destination": "Add to {workspace}",
	"popover.clearGlobalConfirm": "Clear these {n} archived notes across workspaces?",
	"popover.empty.title": "No notes yet",
	"popover.empty.body": "Asynchronously draft your ideas while the agent is working",
	"shortcut.toggle": "Toggle Sideby Note",
	"add.placeholder": "Jot one down",
	"add.action": "Add",
	"attachment.add": "Add attachments",
	"attachment.list": "Attachments",
	"attachment.scrollLeft": "Scroll attachments left",
	"attachment.scrollRight": "Scroll attachments right",
	"attachment.preview": "Preview {name}",
	"attachment.closePreview": "Close preview",
	"attachment.download": "Download {name}",
	"attachment.remove": "Remove {name}",
	"attachment.uploading": "Uploading…",
	"attachment.loading": "Loading preview…",
	"attachment.previewFailed": "Preview unavailable. Download the original file.",
	"attachment.limit": "Add up to 10 attachments per note. Each file must be nonempty and at most 25 MiB.",
	"attachment.unavailable": "Attachments require DSH host storage.",
	"attachment.uploadFailed": "Upload failed. Please try again.",
	"attachment.busy": "Wait for the current action to finish before adding files.",
	"attachment.draftChanged": "The draft attachments changed. Review them and try again.",
	"attachment.textInserted": "Text inserted. Download the attachments from Archived and add them to the conversation.",
	"attachment.insertText": "Insert text only and archive",
	"attachment.archive": "Archive note",
	"attachment.archived": "Note archived",
	"list.open": "Open",
	"list.allArchived.title": "Nothing left open",
	"list.allArchived.body": "Add another, or expand archived to look back",
	"item.copy": "Copy",
	"item.recall": "Rewind",
	"item.insert": "Insert",
	"item.openWorkspace": "Start a new session in {workspace}",
	"item.currentWorkspace": "Current workspace: {workspace}",
	"item.reorder": "Drag to reorder, or use ↑ / ↓",
	"time.now": "just now",
	"time.minutes": "{n} min ago",
	"time.hours": "{n} hr ago",
	"time.days": "{n} d ago",
	"time.createdArchived": "Written {created} · Archived {completed}",
	"storage.failed": "Local storage is unavailable; changes may not persist",
	"storage.whereHost": "Notes are saved in a DSH local file",
	"storage.loading": "Reading notes…",
	"storage.details": "Storage & updates",
	"storage.failure": "Last failure: {code}",
	"storage.migrated": "Moved {n} notes from this browser into the DSH local file",
	"storage.keptLocal": "Using host notes; this browser's older notes were left unmerged",
	"storage.notSwitched": "Host storage is unavailable, so notes stay in this browser and will be retried on next start",
	"storage.hostError": "Notes storage is unavailable",
	"storage.inUse": "AsideNote is using the notes store. Disable AsideNote, then reconnect.",
	"storage.retry": "Reconnect",
	"storage.reconnecting": "Reconnecting…",
	"storage.copyPath": "Copy path",
	"storage.reveal": "Show in folder",
	"storage.pathLoading": "Reading storage location…",
	"storage.pathUnavailable": "Cannot locate the store file (the backend has no file path)",
	"storage.pathMissing": "The file is not created yet; it appears after the first save",
	"resize.width": "Resize Sideby Note width",
	"resize.height": "Resize Sideby Note height",
	"resize.hint": "Drag to resize, double-click to reset",
	"dock.open": "Open Sideby Note",
	"dock.count": "{n} open",
	"toast.copied": "Copied",
	"toast.copyFailed": "Copy failed — try again",
	"toast.pathCopied": "Path copied",
	"toast.revealFailed": "Could not open the file manager",
	"toast.inserted": "Inserted into the chat input",
	"toast.insertFailed": "No chat composer found — the note is untouched",
	"toast.archiveFailed": "Inserted into the chat input, but the archive could not be saved",
	"toast.recalled": "Moved back to the input",
	"toast.recallBlocked": "The input already has text — send or clear it first",
	"toast.clearPartial": "Some archived notes were cleared. Retry to clear the rest",
	"toast.cleared": "Archive cleared",
	"toast.saveFailed": "Could not save. Please retry",
	"update.version": "Version",
	"update.label": "Update available",
	"update.check": "Check for updates",
	"update.checking": "Checking…",
	"update.retryCheck": "Retry check",
	"update.current": "You're up to date",
	"update.checkFailed": "Check failed — try again later",
	"update.available": "Version {version} is available",
	"update.notesTitle": "Release notes",
	"update.notesLoading": "Loading release notes…",
	"update.notesMissing": "No release notes to show for this version yet",
	"update.historyCount": "{n} releases included",
	"update.latest": "Latest",
	"update.olderNotes": "Earlier releases are in the full release notes",
	"update.notesFailed": "Could not load the release notes — open the full notes",
	"update.full": "Full release notes",
	"update.now": "Update now",
	"update.starting": "Preparing the update…",
	"update.updating": "Updating…",
	"update.updated": "Updated to {version}",
	"update.refresh": "Refresh page",
	"update.restartHint": "Restart DSH manually to finish the update",
	"update.failed": "Update failed: {reason}",
	"update.notInstalled": "This plugin is not installed in the current profile, so it cannot be updated in-app",
	"update.forbidden": "The automatic update refused this request",
	"update.rejected": "The automatic update did not run; a linked checkout updates from its own directory",
	"update.busy": "Another update is already running — try again shortly",
	"update.timeout": "Timed out waiting for the update result — try again later",
	"update.bundleInUse": "This plugin is in use, and Desktop will not remove it first; the host route installs over it — if that still fails, run the command below",
	"update.alreadyInstalled": "This DSH only replaces a package after removing it, so it cannot install over the current copy; run the command below",
	"update.managementRequired": "This profile is managed by the desktop app, so the automatic update cannot change it; run the command below",
	"update.notRemovable": "The desktop app manages this plugin and the automatic update cannot remove it; run the command below",
	"update.stopProfile": "Removing it requires stopping this profile first; run the command below",
	"update.incompatible": "This version is not compatible with the running DSH, so the host refused it",
	"update.versionMismatch": "The installed version is not the one requested — a mirror or the release-age hold may have substituted it; retry later or install manually",
	"update.downgrade": "Refused: the target version is older than the installed one",
	"update.autoUnavailable": "This host offers no automatic update route; run the command below",
	"update.manualHint": "Or update directly: run {command} in a terminal, or update from the Plugins page, then reload",
	"update.copyPrompt": "Copy update prompt",
	"update.prompt": "Update the DSH plugin Sideby Note to {version} by running: {command}. Reload the page when it finishes."
};

// src/client/i18n/es.ts
/** Spanish copy; a missing key fails the typecheck rather than falling back at runtime. */
const es = {
	"nav.label": "Sideby Note",
	"title": "Sideby Note",
	"popover.title": "Sideby Note",
	"popover.close": "Cerrar Sideby Note",
	"popover.archived": "Archivadas",
	"popover.clearCancel": "Cancelar",
	"popover.clearConfirm": "¿Borrar {n} notas archivadas?",
	"popover.clearConfirmAction": "Borrar",
	"popover.clearArchived": "Borrar archivadas",
	"scope.label": "Filtrar notas",
	"scope.global": "Global",
	"scope.workspace": "Espacio de trabajo",
	"scope.globalHint": "Mostrar notas de todos los espacios de trabajo",
	"scope.workspaceHint": "Mostrar notas del espacio de trabajo actual",
	"scope.loading": "Comprobando el espacio de trabajo actual",
	"scope.unassigned": "Sin asignar",
	"add.destination": "Añadir a {workspace}",
	"popover.clearGlobalConfirm": "¿Borrar estas {n} notas archivadas de todos los espacios de trabajo?",
	"popover.empty.title": "Aún no hay notas",
	"popover.empty.body": "Esboza tus ideas de forma asíncrona mientras el agente trabaja",
	"shortcut.toggle": "Mostrar u ocultar Sideby Note",
	"add.placeholder": "Anota una",
	"add.action": "Añadir",
	"attachment.add": "Añadir adjuntos",
	"attachment.list": "Adjuntos",
	"attachment.scrollLeft": "Desplazar adjuntos a la izquierda",
	"attachment.scrollRight": "Desplazar adjuntos a la derecha",
	"attachment.preview": "Vista previa de {name}",
	"attachment.closePreview": "Cerrar vista previa",
	"attachment.download": "Descargar {name}",
	"attachment.remove": "Quitar {name}",
	"attachment.uploading": "Subiendo…",
	"attachment.loading": "Cargando vista previa…",
	"attachment.previewFailed": "Vista previa no disponible. Descarga el archivo original.",
	"attachment.limit": "Hasta 10 adjuntos por nota. Cada archivo debe tener contenido y pesar como máximo 25 MiB.",
	"attachment.unavailable": "Los adjuntos requieren el almacenamiento del host de DSH.",
	"attachment.uploadFailed": "La subida falló. Vuelve a intentarlo.",
	"attachment.busy": "Espera a que termine la operación actual para añadir archivos.",
	"attachment.draftChanged": "Los adjuntos del borrador han cambiado. Revísalos y vuelve a intentarlo.",
	"attachment.textInserted": "Se insertó el texto. Descarga los adjuntos del archivo y añádelos a la conversación.",
	"attachment.insertText": "Insertar solo el texto y archivar",
	"attachment.archive": "Archivar nota",
	"attachment.archived": "Nota archivada",
	"list.open": "Abiertas",
	"list.allArchived.title": "No queda nada abierto",
	"list.allArchived.body": "Añade otra o despliega las archivadas para revisarlas",
	"item.copy": "Copiar",
	"item.recall": "Devolver",
	"item.insert": "Insertar",
	"item.openWorkspace": "Iniciar una sesión nueva en {workspace}",
	"item.currentWorkspace": "Espacio de trabajo actual: {workspace}",
	"item.reorder": "Arrastra para ordenar o usa ↑ / ↓",
	"time.now": "ahora mismo",
	"time.minutes": "hace {n} min",
	"time.hours": "hace {n} h",
	"time.days": "hace {n} d",
	"time.createdArchived": "Escrita {created} · Archivada {completed}",
	"storage.failed": "El almacenamiento local no está disponible; es posible que los cambios no se guarden",
	"storage.whereHost": "Las notas se guardan en un archivo local de DSH",
	"storage.loading": "Leyendo notas…",
	"storage.details": "Almacenamiento y actualizaciones",
	"storage.failure": "Último fallo: {code}",
	"storage.migrated": "Se movieron {n} notas de este navegador al archivo local de DSH",
	"storage.keptLocal": "Se usan las notas del host; las notas antiguas de este navegador quedaron sin combinar",
	"storage.notSwitched": "El almacenamiento del host no está disponible; las notas siguen en este navegador y se reintentará al iniciar",
	"storage.hostError": "El almacenamiento de notas no está disponible",
	"storage.inUse": "AsideNote está usando el almacén de notas. Desactiva AsideNote y vuelve a conectar.",
	"storage.retry": "Volver a conectar",
	"storage.reconnecting": "Volviendo a conectar…",
	"storage.copyPath": "Copiar ruta",
	"storage.reveal": "Mostrar en carpeta",
	"storage.pathLoading": "Leyendo la ubicación…",
	"storage.pathUnavailable": "No se puede localizar el archivo (el backend no usa archivo)",
	"storage.pathMissing": "El archivo aún no existe; se crea al guardar",
	"resize.width": "Cambiar el ancho de Sideby Note",
	"resize.height": "Cambiar la altura de Sideby Note",
	"resize.hint": "Arrastra para cambiar el tamaño, doble clic para restablecer",
	"dock.open": "Abrir Sideby Note",
	"dock.count": "{n} abiertas",
	"toast.copied": "Copiado",
	"toast.copyFailed": "Error al copiar — inténtalo de nuevo",
	"toast.pathCopied": "Ruta copiada",
	"toast.revealFailed": "No se pudo abrir el gestor de archivos",
	"toast.inserted": "Pasada al chat",
	"toast.insertFailed": "No hay campo de chat — la nota sigue igual",
	"toast.archiveFailed": "La nota se pasó al chat, pero no se pudo archivar",
	"toast.recalled": "Devuelta al cuadro de texto",
	"toast.recallBlocked": "El cuadro de texto ya tiene contenido; envíalo o bórralo primero",
	"toast.clearPartial": "Se borraron algunas notas archivadas. Vuelve a intentarlo para borrar las demás",
	"toast.cleared": "Archivo borrado",
	"toast.saveFailed": "No se pudo guardar. Inténtalo de nuevo",
	"update.version": "Versión",
	"update.label": "Actualización disponible",
	"update.check": "Buscar actualizaciones",
	"update.checking": "Comprobando…",
	"update.retryCheck": "Reintentar comprobación",
	"update.current": "Estás al día",
	"update.checkFailed": "Error en la comprobación — inténtalo más tarde",
	"update.available": "La versión {version} está disponible",
	"update.notesTitle": "Notas de la versión",
	"update.notesLoading": "Cargando notas de la versión…",
	"update.notesMissing": "Aún no hay notas de la versión para esta versión",
	"update.historyCount": "{n} versiones incluidas",
	"update.latest": "Más reciente",
	"update.olderNotes": "Las versiones anteriores están en las notas completas",
	"update.notesFailed": "No se pudieron cargar las notas de la versión — abre las notas completas",
	"update.full": "Notas completas de la versión",
	"update.now": "Actualizar ahora",
	"update.starting": "Preparando la actualización…",
	"update.updating": "Actualizando…",
	"update.updated": "Actualizado a {version}",
	"update.refresh": "Recargar página",
	"update.restartHint": "Reinicia DSH manualmente para finalizar la actualización",
	"update.failed": "Error en la actualización: {reason}",
	"update.notInstalled": "Este complemento no está instalado en el perfil actual, por lo que no se puede actualizar desde la aplicación",
	"update.forbidden": "La actualización automática rechazó esta solicitud",
	"update.rejected": "La actualización automática no se ejecutó; una copia vinculada se actualiza desde su propio directorio",
	"update.busy": "Ya hay otra actualización en curso — inténtalo de nuevo en breve",
	"update.timeout": "Se agotó el tiempo de espera del resultado — inténtalo más tarde",
	"update.bundleInUse": "Este complemento está en uso y Desktop no lo eliminará primero; la ruta del host instala encima — si sigue fallando, ejecuta el comando de abajo",
	"update.alreadyInstalled": "Este DSH solo reemplaza un paquete tras eliminarlo, así que no puede instalar sobre la copia actual; ejecuta el comando de abajo",
	"update.managementRequired": "La aplicación de escritorio gestiona este perfil, así que la actualización automática no puede cambiarlo; ejecuta el comando de abajo",
	"update.notRemovable": "La aplicación de escritorio gestiona este complemento y la actualización automática no puede eliminarlo; ejecuta el comando de abajo",
	"update.stopProfile": "Para eliminarlo primero hay que detener este perfil; ejecuta el comando de abajo",
	"update.incompatible": "Esta versión no es compatible con el DSH en ejecución, así que el host la rechazó",
	"update.versionMismatch": "La versión instalada no es la solicitada — un espejo o la retención por antigüedad de la versión puede haberla sustituido; reinténtalo más tarde o instala manualmente",
	"update.downgrade": "Rechazado: la versión de destino es anterior a la instalada",
	"update.autoUnavailable": "Este host no ofrece una ruta de actualización automática; ejecuta el comando de abajo",
	"update.manualHint": "O actualiza directamente: ejecuta {command} en un terminal, o actualiza desde la página de Complementos y recarga",
	"update.copyPrompt": "Copiar prompt de actualización",
	"update.prompt": "Actualiza el complemento DSH Sideby Note a {version} ejecutando: {command}. Recarga la página cuando termine."
};

// src/client/i18n/fr.ts
/** French copy; a missing key fails the typecheck rather than falling back at runtime. */
const fr = {
	"nav.label": "Sideby Note",
	"title": "Sideby Note",
	"popover.title": "Sideby Note",
	"popover.close": "Fermer Sideby Note",
	"popover.archived": "Archivées",
	"popover.clearCancel": "Annuler",
	"popover.clearConfirm": "Effacer {n} notes archivées ?",
	"popover.clearConfirmAction": "Effacer",
	"popover.clearArchived": "Effacer les archivées",
	"scope.label": "Filtrer les notes",
	"scope.global": "Global",
	"scope.workspace": "Espace de travail",
	"scope.globalHint": "Afficher les notes de tous les espaces de travail",
	"scope.workspaceHint": "Afficher les notes de l’espace de travail actuel",
	"scope.loading": "Recherche de l’espace de travail actuel",
	"scope.unassigned": "Non attribué",
	"add.destination": "Ajouter à {workspace}",
	"popover.clearGlobalConfirm": "Effacer ces {n} notes archivées dans tous les espaces de travail ?",
	"popover.empty.title": "Aucune note pour l'instant",
	"popover.empty.body": "Rédigez vos idées de façon asynchrone pendant que l'agent travaille",
	"shortcut.toggle": "Afficher ou masquer Sideby Note",
	"add.placeholder": "Notez-en une",
	"add.action": "Ajouter",
	"attachment.add": "Joindre des fichiers",
	"attachment.list": "Pièces jointes",
	"attachment.scrollLeft": "Faire défiler les pièces jointes vers la gauche",
	"attachment.scrollRight": "Faire défiler les pièces jointes vers la droite",
	"attachment.preview": "Aperçu de {name}",
	"attachment.closePreview": "Fermer l’aperçu",
	"attachment.download": "Télécharger {name}",
	"attachment.remove": "Retirer {name}",
	"attachment.uploading": "Envoi en cours…",
	"attachment.loading": "Chargement de l’aperçu…",
	"attachment.previewFailed": "Aperçu indisponible. Téléchargez le fichier d’origine.",
	"attachment.limit": "Jusqu’à 10 pièces jointes par note. Chaque fichier doit être non vide et peser au plus 25 Mio.",
	"attachment.unavailable": "Les pièces jointes nécessitent le stockage de l’hôte DSH.",
	"attachment.uploadFailed": "Échec de l’envoi. Réessayez.",
	"attachment.busy": "Attendez la fin de l’opération en cours avant de joindre des fichiers.",
	"attachment.draftChanged": "Les pièces jointes du brouillon ont changé. Vérifiez-les et réessayez.",
	"attachment.textInserted": "Texte inséré. Téléchargez les pièces jointes depuis les archives et ajoutez-les à la conversation.",
	"attachment.insertText": "Insérer le texte seul et archiver",
	"attachment.archive": "Archiver la note",
	"attachment.archived": "Note archivée",
	"list.open": "Ouvertes",
	"list.allArchived.title": "Plus rien d'ouvert",
	"list.allArchived.body": "Ajoutez-en une autre ou dépliez les archivées pour les revoir",
	"item.copy": "Copier",
	"item.recall": "Renvoyer",
	"item.insert": "Insérer",
	"item.openWorkspace": "Démarrer une nouvelle session dans {workspace}",
	"item.currentWorkspace": "Espace de travail actuel : {workspace}",
	"item.reorder": "Glisser pour réordonner, ou ↑ / ↓",
	"time.now": "à l'instant",
	"time.minutes": "il y a {n} min",
	"time.hours": "il y a {n} h",
	"time.days": "il y a {n} j",
	"time.createdArchived": "Écrite {created} · Archivée {completed}",
	"storage.failed": "Le stockage local n'est pas disponible ; les modifications peuvent ne pas être conservées",
	"storage.whereHost": "Les notes sont enregistrées dans un fichier local DSH",
	"storage.loading": "Lecture des notes…",
	"storage.details": "Stockage et mises à jour",
	"storage.failure": "Dernier échec : {code}",
	"storage.migrated": "{n} notes de ce navigateur ont été déplacées vers le fichier local DSH",
	"storage.keptLocal": "Notes de l'hôte utilisées ; les anciennes notes de ce navigateur n'ont pas été fusionnées",
	"storage.notSwitched": "Le stockage de l'hôte est indisponible ; les notes restent dans ce navigateur et seront réessayées au prochain démarrage",
	"storage.hostError": "Le stockage des notes est indisponible",
	"storage.inUse": "AsideNote utilise le stockage des notes. Désactivez AsideNote, puis reconnectez-vous.",
	"storage.retry": "Se reconnecter",
	"storage.reconnecting": "Reconnexion…",
	"storage.copyPath": "Copier le chemin",
	"storage.reveal": "Afficher dans le dossier",
	"storage.pathLoading": "Lecture de l'emplacement…",
	"storage.pathUnavailable": "Impossible de localiser le fichier (backend sans chemin)",
	"storage.pathMissing": "Le fichier n'existe pas encore ; il apparaît après le premier enregistrement",
	"resize.width": "Redimensionner la largeur d'Sideby Note",
	"resize.height": "Redimensionner la hauteur d'Sideby Note",
	"resize.hint": "Faites glisser pour redimensionner, double-cliquez pour réinitialiser",
	"dock.open": "Ouvrir Sideby Note",
	"dock.count": "{n} ouvertes",
	"toast.copied": "Copié",
	"toast.copyFailed": "Échec de la copie — réessayez",
	"toast.pathCopied": "Chemin copié",
	"toast.revealFailed": "Impossible d'ouvrir le gestionnaire de fichiers",
	"toast.inserted": "Passée au chat",
	"toast.insertFailed": "Aucune zone de saisie — la note reste en place",
	"toast.archiveFailed": "Note transmise au chat, mais son archivage a échoué",
	"toast.recalled": "Renvoyée dans la zone de saisie",
	"toast.recallBlocked": "La zone de saisie contient déjà du texte ; envoyez-le ou effacez-le d'abord",
	"toast.clearPartial": "Certaines notes archivées ont été effacées. Réessayez pour effacer les autres",
	"toast.cleared": "Archive effacée",
	"toast.saveFailed": "Échec de l’enregistrement. Veuillez réessayer",
	"update.version": "Version",
	"update.label": "Mise à jour disponible",
	"update.check": "Rechercher des mises à jour",
	"update.checking": "Vérification…",
	"update.retryCheck": "Réessayer la vérification",
	"update.current": "Vous êtes à jour",
	"update.checkFailed": "Échec de la vérification — réessayez plus tard",
	"update.available": "La version {version} est disponible",
	"update.notesTitle": "Notes de version",
	"update.notesLoading": "Chargement des notes de version…",
	"update.notesMissing": "Aucune note de version à afficher pour le moment",
	"update.historyCount": "{n} versions incluses",
	"update.latest": "Dernière",
	"update.olderNotes": "Les versions précédentes figurent dans les notes complètes",
	"update.notesFailed": "Impossible de charger les notes de version — ouvrez les notes complètes",
	"update.full": "Notes de version complètes",
	"update.now": "Mettre à jour maintenant",
	"update.starting": "Préparation de la mise à jour…",
	"update.updating": "Mise à jour…",
	"update.updated": "Mis à jour vers {version}",
	"update.refresh": "Actualiser la page",
	"update.restartHint": "Redémarrez DSH manuellement pour terminer la mise à jour",
	"update.failed": "Échec de la mise à jour : {reason}",
	"update.notInstalled": "Ce plugin n'est pas installé dans le profil actuel, il ne peut donc pas être mis à jour depuis l'application",
	"update.forbidden": "La mise à jour automatique a refusé cette demande",
	"update.rejected": "La mise à jour automatique ne s'est pas exécutée ; un checkout lié se met à jour depuis son propre répertoire",
	"update.busy": "Une autre mise à jour est déjà en cours — réessayez bientôt",
	"update.timeout": "Délai d'attente du résultat dépassé — réessayez plus tard",
	"update.bundleInUse": "Ce plugin est en cours d'utilisation et Desktop ne le supprimera pas d'abord ; la route de l'hôte installe par-dessus — si cela échoue encore, exécutez la commande ci-dessous",
	"update.alreadyInstalled": "Ce DSH ne remplace un paquet qu'après l'avoir supprimé, il ne peut donc pas s'installer par-dessus la copie actuelle ; exécutez la commande ci-dessous",
	"update.managementRequired": "Ce profil est géré par l'application de bureau, la mise à jour automatique ne peut donc pas le modifier ; exécutez la commande ci-dessous",
	"update.notRemovable": "L'application de bureau gère ce plugin et la mise à jour automatique ne peut pas le supprimer ; exécutez la commande ci-dessous",
	"update.stopProfile": "Pour le supprimer, il faut d'abord arrêter ce profil ; exécutez la commande ci-dessous",
	"update.incompatible": "Cette version n'est pas compatible avec le DSH en cours d'exécution, l'hôte l'a donc refusée",
	"update.versionMismatch": "La version installée n'est pas celle demandée — un miroir ou la rétention liée à l'ancienneté a pu la remplacer ; réessayez plus tard ou installez manuellement",
	"update.downgrade": "Refusé : la version cible est plus ancienne que celle installée",
	"update.autoUnavailable": "Cet hôte ne propose pas de route de mise à jour automatique ; exécutez la commande ci-dessous",
	"update.manualHint": "Ou mettez à jour directement : exécutez {command} dans un terminal, ou mettez à jour depuis la page Plugins, puis rechargez",
	"update.copyPrompt": "Copier l'invite de mise à jour",
	"update.prompt": "Mettez à jour le plugin DSH Sideby Note vers {version} en exécutant : {command}. Rechargez la page une fois terminé."
};

// src/client/i18n/ja.ts
/** Japanese copy; a missing key fails the typecheck rather than falling back at runtime. */
const ja = {
	"nav.label": "Sideby Note",
	"title": "Sideby Note",
	"popover.title": "Sideby Note",
	"popover.close": "Sideby Noteを閉じる",
	"popover.archived": "アーカイブ",
	"popover.clearCancel": "キャンセル",
	"popover.clearConfirm": "アーカイブのメモ {n} 件を削除しますか？",
	"popover.clearConfirmAction": "削除",
	"popover.clearArchived": "アーカイブを削除",
	"scope.label": "メモの絞り込み",
	"scope.global": "全体",
	"scope.workspace": "ワークスペース",
	"scope.globalHint": "すべてのワークスペースのメモを表示",
	"scope.workspaceHint": "現在のワークスペースのメモを表示",
	"scope.loading": "現在のワークスペースを確認中",
	"scope.unassigned": "未割り当て",
	"add.destination": "{workspace} に追加",
	"popover.clearGlobalConfirm": "すべてのワークスペースでこの {n} 件のアーカイブ済みメモを削除しますか？",
	"popover.empty.title": "メモはまだありません",
	"popover.empty.body": "エージェントが作業している間に、アイデアを非同期で書き留める",
	"shortcut.toggle": "Sideby Note の表示を切り替え",
	"add.placeholder": "ひとつメモする",
	"add.action": "追加",
	"attachment.add": "添付ファイルを追加",
	"attachment.list": "添付ファイル",
	"attachment.scrollLeft": "添付ファイルを左にスクロール",
	"attachment.scrollRight": "添付ファイルを右にスクロール",
	"attachment.preview": "{name} をプレビュー",
	"attachment.closePreview": "プレビューを閉じる",
	"attachment.download": "{name} をダウンロード",
	"attachment.remove": "{name} を削除",
	"attachment.uploading": "アップロード中…",
	"attachment.loading": "プレビューを読み込み中…",
	"attachment.previewFailed": "プレビューできません。元のファイルをダウンロードできます。",
	"attachment.limit": "添付はメモごとに10件までです。空でない25 MiB以下のファイルを選んでください。",
	"attachment.unavailable": "添付ファイルには DSH ホストのストレージが必要です。",
	"attachment.uploadFailed": "アップロードに失敗しました。再試行してください。",
	"attachment.busy": "現在の操作が終わってからファイルを添付してください。",
	"attachment.draftChanged": "下書きの添付が更新されました。確認してから再試行してください。",
	"attachment.textInserted": "本文を入力しました。添付はアーカイブからダウンロードして会話に追加できます。",
	"attachment.insertText": "本文のみ入力してアーカイブ",
	"attachment.archive": "メモをアーカイブ",
	"attachment.archived": "アーカイブしました",
	"list.open": "書きかけ",
	"list.allArchived.title": "書きかけのメモはありません",
	"list.allArchived.body": "さらに書き足すか、アーカイブを開いて振り返れます",
	"item.copy": "コピー",
	"item.recall": "戻す",
	"item.insert": "挿入",
	"item.openWorkspace": "{workspace} で新しいセッションを開始",
	"item.currentWorkspace": "現在のワークスペース：{workspace}",
	"item.reorder": "ドラッグか ↑↓ で並べ替え",
	"time.now": "たった今",
	"time.minutes": "{n} 分前",
	"time.hours": "{n} 時間前",
	"time.days": "{n} 日前",
	"time.createdArchived": "記入 {created} · アーカイブ {completed}",
	"storage.failed": "ローカルストレージを利用できません。変更は保存されない可能性があります",
	"storage.whereHost": "メモは DSH のローカルファイルに保存されます",
	"storage.loading": "メモを読み込み中…",
	"storage.details": "保存先と更新",
	"storage.failure": "前回の失敗：{code}",
	"storage.migrated": "このブラウザのメモ {n} 件を DSH ローカルファイルに移行しました",
	"storage.keptLocal": "ホストのメモを使用中です。このブラウザの古いメモは統合していません",
	"storage.notSwitched": "ホストのストレージを利用できないため、メモはこのブラウザに保存され、次回起動時に再試行します",
	"storage.hostError": "メモのストレージを利用できません",
	"storage.inUse": "AsideNote がメモの保存先を使用しています。AsideNote を無効にしてから再接続してください。",
	"storage.retry": "再接続",
	"storage.reconnecting": "再接続中…",
	"storage.copyPath": "パスをコピー",
	"storage.reveal": "フォルダで表示",
	"storage.pathLoading": "保存先を読み込み中…",
	"storage.pathUnavailable": "保存ファイルを特定できません（このバックエンドはファイルパス非対応）",
	"storage.pathMissing": "ファイルは未作成です。最初の保存後に生成されます",
	"resize.width": "Sideby Note の幅を変更",
	"resize.height": "Sideby Note の高さを変更",
	"resize.hint": "ドラッグでサイズ変更、ダブルクリックでリセット",
	"dock.open": "Sideby Note を開く",
	"dock.count": "{n} 件書きかけ",
	"toast.copied": "コピーしました",
	"toast.copyFailed": "コピーに失敗しました — もう一度お試しください",
	"toast.pathCopied": "パスをコピーしました",
	"toast.revealFailed": "ファイルマネージャーを開けません",
	"toast.inserted": "チャットへ渡しました",
	"toast.insertFailed": "チャットの入力欄が見つかりません — メモはそのままです",
	"toast.archiveFailed": "チャットに渡しましたが、アーカイブを保存できませんでした",
	"toast.recalled": "入力欄に戻しました",
	"toast.recallBlocked": "入力欄に文字があります。送信するかクリアしてください",
	"toast.clearPartial": "一部のアーカイブ済みメモを削除しました。残りを削除するには再試行してください",
	"toast.cleared": "アーカイブを削除しました",
	"toast.saveFailed": "保存できませんでした。再試行してください",
	"update.version": "バージョン",
	"update.label": "更新があります",
	"update.check": "更新を確認",
	"update.checking": "確認中…",
	"update.retryCheck": "確認を再試行",
	"update.current": "最新バージョンです",
	"update.checkFailed": "確認に失敗しました — 後でもう一度お試しください",
	"update.available": "バージョン {version} が利用可能です",
	"update.notesTitle": "リリースノート",
	"update.notesLoading": "リリースノートを読み込み中…",
	"update.notesMissing": "このバージョンのリリースノートはまだありません",
	"update.historyCount": "{n} 件のリリースを掲載",
	"update.latest": "最新",
	"update.olderNotes": "以前のリリースは完全なリリースノートにあります",
	"update.notesFailed": "リリースノートを読み込めませんでした — 完全なノートを開いてください",
	"update.full": "完全なリリースノート",
	"update.now": "今すぐ更新",
	"update.starting": "更新を準備しています…",
	"update.updating": "更新中…",
	"update.updated": "{version} に更新しました",
	"update.refresh": "ページを再読み込み",
	"update.restartHint": "更新を完了するには DSH を手動で再起動してください",
	"update.failed": "更新に失敗しました：{reason}",
	"update.notInstalled": "このプラグインは現在のプロファイルにインストールされていないため、アプリ内で更新できません",
	"update.forbidden": "自動更新がこのリクエストを拒否しました",
	"update.rejected": "自動更新は実行されませんでした。リンクされたチェックアウトはそのディレクトリから更新されます",
	"update.busy": "別の更新が実行中です — しばらくしてからお試しください",
	"update.timeout": "更新結果の待機がタイムアウトしました — 後でもう一度お試しください",
	"update.bundleInUse": "このプラグインは使用中で、Desktop は先に削除しません。ホスト経由のインストールで上書きします — それでも失敗する場合は下のコマンドを実行してください",
	"update.alreadyInstalled": "この DSH はパッケージを削除してからでないと置き換えられないため、現在のコピーに上書きインストールできません。下のコマンドを実行してください",
	"update.managementRequired": "このプロファイルはデスクトップアプリが管理しているため、自動更新では変更できません。下のコマンドを実行してください",
	"update.notRemovable": "デスクトップアプリがこのプラグインを管理しており、自動更新では削除できません。下のコマンドを実行してください",
	"update.stopProfile": "削除するには先にこのプロファイルを停止する必要があります。下のコマンドを実行してください",
	"update.incompatible": "このバージョンは実行中の DSH と互換性がないため、ホストが拒否しました",
	"update.versionMismatch": "インストールされたバージョンが要求したものと異なります — ミラーまたはリリース時期の制限が置き換えた可能性があります。後で再試行するか手動でインストールしてください",
	"update.downgrade": "拒否されました：対象バージョンがインストール済みより古いです",
	"update.autoUnavailable": "このホストは自動更新ルートを提供していません。下のコマンドを実行してください",
	"update.manualHint": "または直接更新：ターミナルで {command} を実行するか、プラグインページから更新してから再読み込みしてください",
	"update.copyPrompt": "更新プロンプトをコピー",
	"update.prompt": "DSH プラグイン Sideby Note を {version} に更新するには、次を実行してください：{command}。完了したらページを再読み込みしてください。"
};

// src/client/i18n/pt.ts
/** Brazilian Portuguese copy; a missing key fails the typecheck rather than falling back at runtime. */
const pt = {
	"nav.label": "Sideby Note",
	"title": "Sideby Note",
	"popover.title": "Sideby Note",
	"popover.close": "Fechar Sideby Note",
	"popover.archived": "Arquivadas",
	"popover.clearCancel": "Cancelar",
	"popover.clearConfirm": "Limpar {n} notas arquivadas?",
	"popover.clearConfirmAction": "Limpar",
	"popover.clearArchived": "Limpar arquivadas",
	"scope.label": "Filtrar notas",
	"scope.global": "Global",
	"scope.workspace": "Espaço de trabalho",
	"scope.globalHint": "Mostrar notas de todos os espaços de trabalho",
	"scope.workspaceHint": "Mostrar notas do espaço de trabalho atual",
	"scope.loading": "Verificando o espaço de trabalho atual",
	"scope.unassigned": "Sem atribuição",
	"add.destination": "Adicionar a {workspace}",
	"popover.clearGlobalConfirm": "Limpar estas {n} notas arquivadas em todos os espaços de trabalho?",
	"popover.empty.title": "Nenhuma nota ainda",
	"popover.empty.body": "Esboce suas ideias de forma assíncrona enquanto o agente trabalha",
	"shortcut.toggle": "Mostrar ou ocultar Sideby Note",
	"add.placeholder": "Anote uma",
	"add.action": "Adicionar",
	"attachment.add": "Adicionar anexos",
	"attachment.list": "Anexos",
	"attachment.scrollLeft": "Rolar anexos para a esquerda",
	"attachment.scrollRight": "Rolar anexos para a direita",
	"attachment.preview": "Prévia de {name}",
	"attachment.closePreview": "Fechar prévia",
	"attachment.download": "Baixar {name}",
	"attachment.remove": "Remover {name}",
	"attachment.uploading": "Enviando…",
	"attachment.loading": "Carregando prévia…",
	"attachment.previewFailed": "Prévia indisponível. Baixe o arquivo original.",
	"attachment.limit": "Até 10 anexos por nota. Cada arquivo deve ter conteúdo e no máximo 25 MiB.",
	"attachment.unavailable": "Os anexos precisam do armazenamento do host do DSH.",
	"attachment.uploadFailed": "Falha no envio. Tente novamente.",
	"attachment.busy": "Aguarde a operação atual terminar antes de adicionar arquivos.",
	"attachment.draftChanged": "Os anexos do rascunho mudaram. Revise-os e tente novamente.",
	"attachment.textInserted": "Texto inserido. Baixe os anexos dos arquivados e adicione-os à conversa.",
	"attachment.insertText": "Inserir apenas o texto e arquivar",
	"attachment.archive": "Arquivar nota",
	"attachment.archived": "Nota arquivada",
	"list.open": "Abertas",
	"list.allArchived.title": "Nada mais em aberto",
	"list.allArchived.body": "Adicione outra ou expanda as arquivadas para revisar",
	"item.copy": "Copiar",
	"item.recall": "Devolver",
	"item.insert": "Inserir",
	"item.openWorkspace": "Iniciar nova sessão em {workspace}",
	"item.currentWorkspace": "Espaço de trabalho atual: {workspace}",
	"item.reorder": "Arraste para ordenar ou use ↑ / ↓",
	"time.now": "agora mesmo",
	"time.minutes": "há {n} min",
	"time.hours": "há {n} h",
	"time.days": "há {n} d",
	"time.createdArchived": "Escrita {created} · Arquivada {completed}",
	"storage.failed": "O armazenamento local não está disponível; as alterações podem não ser salvas",
	"storage.whereHost": "As notas são salvas em um arquivo local do DSH",
	"storage.loading": "Lendo notas…",
	"storage.details": "Armazenamento e atualizações",
	"storage.failure": "Última falha: {code}",
	"storage.migrated": "{n} notas deste navegador foram movidas para o arquivo local do DSH",
	"storage.keptLocal": "Usando as notas do host; as notas antigas deste navegador não foram mescladas",
	"storage.notSwitched": "O armazenamento do host está indisponível; as notas ficam neste navegador e serão tentadas novamente na próxima inicialização",
	"storage.hostError": "O armazenamento de notas está indisponível",
	"storage.inUse": "O AsideNote está usando o armazenamento de notas. Desative o AsideNote e reconecte.",
	"storage.retry": "Reconectar",
	"storage.reconnecting": "Reconectando…",
	"storage.copyPath": "Copiar caminho",
	"storage.reveal": "Mostrar na pasta",
	"storage.pathLoading": "Lendo o local…",
	"storage.pathUnavailable": "Não foi possível localizar o arquivo (backend sem caminho)",
	"storage.pathMissing": "O arquivo ainda não existe; será criado ao salvar",
	"resize.width": "Redimensionar a largura do Sideby Note",
	"resize.height": "Redimensionar a altura do Sideby Note",
	"resize.hint": "Arraste para redimensionar, clique duas vezes para redefinir",
	"dock.open": "Abrir Sideby Note",
	"dock.count": "{n} abertas",
	"toast.copied": "Copiado",
	"toast.copyFailed": "Falha ao copiar — tente novamente",
	"toast.pathCopied": "Caminho copiado",
	"toast.revealFailed": "Não foi possível abrir o gerenciador de arquivos",
	"toast.inserted": "Passada para o chat",
	"toast.insertFailed": "Nenhum campo do chat — a nota fica como está",
	"toast.archiveFailed": "A nota foi enviada para o chat, mas não pôde ser arquivada",
	"toast.recalled": "Devolvida para a caixa de texto",
	"toast.recallBlocked": "A caixa de texto já tem conteúdo; envie ou limpe primeiro",
	"toast.clearPartial": "Algumas notas arquivadas foram limpas. Tente novamente para limpar as demais",
	"toast.cleared": "Arquivo limpo",
	"toast.saveFailed": "Não foi possível salvar. Tente novamente",
	"update.version": "Versão",
	"update.label": "Atualização disponível",
	"update.check": "Verificar atualizações",
	"update.checking": "Verificando…",
	"update.retryCheck": "Tentar verificação novamente",
	"update.current": "Você está na versão mais recente",
	"update.checkFailed": "Falha na verificação — tente mais tarde",
	"update.available": "A versão {version} está disponível",
	"update.notesTitle": "Notas da versão",
	"update.notesLoading": "Carregando notas da versão…",
	"update.notesMissing": "Ainda não há notas da versão para esta versão",
	"update.historyCount": "{n} versões incluídas",
	"update.latest": "Mais recente",
	"update.olderNotes": "As versões anteriores estão nas notas completas",
	"update.notesFailed": "Não foi possível carregar as notas da versão — abra as notas completas",
	"update.full": "Notas completas da versão",
	"update.now": "Atualizar agora",
	"update.starting": "Preparando a atualização…",
	"update.updating": "Atualizando…",
	"update.updated": "Atualizado para {version}",
	"update.refresh": "Atualizar página",
	"update.restartHint": "Reinicie o DSH manualmente para concluir a atualização",
	"update.failed": "Falha na atualização: {reason}",
	"update.notInstalled": "Este plugin não está instalado no perfil atual, então não pode ser atualizado no aplicativo",
	"update.forbidden": "A atualização automática recusou esta solicitação",
	"update.rejected": "A atualização automática não foi executada; uma cópia vinculada é atualizada a partir do próprio diretório",
	"update.busy": "Outra atualização já está em andamento — tente novamente em breve",
	"update.timeout": "Tempo esgotado aguardando o resultado da atualização — tente mais tarde",
	"update.bundleInUse": "Este plugin está em uso e o Desktop não o removerá primeiro; a rota do host instala por cima — se ainda falhar, execute o comando abaixo",
	"update.alreadyInstalled": "Este DSH só substitui um pacote depois de removê-lo, então não pode instalar sobre a cópia atual; execute o comando abaixo",
	"update.managementRequired": "Este perfil é gerenciado pelo aplicativo desktop, então a atualização automática não pode alterá-lo; execute o comando abaixo",
	"update.notRemovable": "O aplicativo desktop gerencia este plugin e a atualização automática não pode removê-lo; execute o comando abaixo",
	"update.stopProfile": "Para removê-lo é preciso parar este perfil primeiro; execute o comando abaixo",
	"update.incompatible": "Esta versão não é compatível com o DSH em execução, então o host a recusou",
	"update.versionMismatch": "A versão instalada não é a solicitada — um espelho ou a retenção por idade da versão pode tê-la substituído; tente mais tarde ou instale manualmente",
	"update.downgrade": "Recusado: a versão de destino é mais antiga que a instalada",
	"update.autoUnavailable": "Este host não oferece rota de atualização automática; execute o comando abaixo",
	"update.manualHint": "Ou atualize diretamente: execute {command} em um terminal, ou atualize na página de Plugins e recarregue",
	"update.copyPrompt": "Copiar prompt de atualização",
	"update.prompt": "Atualize o plugin DSH Sideby Note para {version} executando: {command}. Recarregue a página quando terminar."
};

// src/client/i18n/ru.ts
/** Russian copy; a missing key fails the typecheck rather than falling back at runtime. */
const ru = {
	"nav.label": "Sideby Note",
	"title": "Sideby Note",
	"popover.title": "Sideby Note",
	"popover.close": "Закрыть Sideby Note",
	"popover.archived": "В архиве",
	"popover.clearCancel": "Отмена",
	"popover.clearConfirm": "Очистить архивные заметки ({n})?",
	"popover.clearConfirmAction": "Очистить",
	"popover.clearArchived": "Очистить архив",
	"scope.label": "Фильтр заметок",
	"scope.global": "Все",
	"scope.workspace": "Рабочая область",
	"scope.globalHint": "Показать заметки всех рабочих областей",
	"scope.workspaceHint": "Показать заметки текущей рабочей области",
	"scope.loading": "Определяется текущая рабочая область",
	"scope.unassigned": "Без рабочей области",
	"add.destination": "Добавить в {workspace}",
	"popover.clearGlobalConfirm": "Удалить эти архивные заметки во всех рабочих областях ({n})?",
	"popover.empty.title": "Заметок пока нет",
	"popover.empty.body": "Набрасывайте идеи асинхронно, пока агент работает",
	"shortcut.toggle": "Показать или скрыть Sideby Note",
	"add.placeholder": "Записать",
	"add.action": "Добавить",
	"attachment.add": "Прикрепить файлы",
	"attachment.list": "Вложения",
	"attachment.scrollLeft": "Прокрутить вложения влево",
	"attachment.scrollRight": "Прокрутить вложения вправо",
	"attachment.preview": "Предпросмотр: {name}",
	"attachment.closePreview": "Закрыть предпросмотр",
	"attachment.download": "Скачать {name}",
	"attachment.remove": "Удалить {name}",
	"attachment.uploading": "Отправка…",
	"attachment.loading": "Загрузка предпросмотра…",
	"attachment.previewFailed": "Предпросмотр недоступен. Скачайте исходный файл.",
	"attachment.limit": "До 10 вложений на заметку. Каждый файл должен быть непустым и не больше 25 МиБ.",
	"attachment.unavailable": "Для вложений нужно хранилище хоста DSH.",
	"attachment.uploadFailed": "Не удалось загрузить файлы. Попробуйте ещё раз.",
	"attachment.busy": "Дождитесь завершения текущего действия, чтобы добавить файлы.",
	"attachment.draftChanged": "Вложения черновика изменились. Проверьте их и повторите попытку.",
	"attachment.textInserted": "Текст вставлен. Скачайте вложения из архива и добавьте их в беседу.",
	"attachment.insertText": "Вставить только текст и архивировать",
	"attachment.archive": "Архивировать заметку",
	"attachment.archived": "Заметка в архиве",
	"list.open": "Открыто",
	"list.allArchived.title": "Открытых заметок нет",
	"list.allArchived.body": "Добавьте заметку или раскройте архив, чтобы вспомнить",
	"item.copy": "Копировать",
	"item.recall": "Вернуть",
	"item.insert": "Вставить",
	"item.openWorkspace": "Начать новый сеанс в пространстве «{workspace}»",
	"item.currentWorkspace": "Текущее рабочее пространство: {workspace}",
	"item.reorder": "Перетащите или нажмите ↑ / ↓",
	"time.now": "только что",
	"time.minutes": "{n} мин назад",
	"time.hours": "{n} ч назад",
	"time.days": "{n} дн. назад",
	"time.createdArchived": "Записано {created} · В архиве {completed}",
	"storage.failed": "Локальное хранилище недоступно; изменения могут не сохраниться",
	"storage.whereHost": "Заметки сохраняются в локальном файле DSH",
	"storage.loading": "Чтение заметок…",
	"storage.details": "Хранилище и обновления",
	"storage.failure": "Последняя ошибка: {code}",
	"storage.migrated": "Заметки этого браузера ({n}) перенесены в локальный файл DSH",
	"storage.keptLocal": "Используются заметки хоста; старые заметки этого браузера не объединены",
	"storage.notSwitched": "Хранилище хоста недоступно; заметки остаются в этом браузере, повтор при следующем запуске",
	"storage.hostError": "Хранилище заметок недоступно",
	"storage.inUse": "AsideNote использует хранилище заметок. Отключите AsideNote, затем подключитесь снова.",
	"storage.retry": "Подключиться снова",
	"storage.reconnecting": "Повторное подключение…",
	"storage.copyPath": "Скопировать путь",
	"storage.reveal": "Показать в папке",
	"storage.pathLoading": "Чтение расположения…",
	"storage.pathUnavailable": "Не удалось найти файл (бэкенд без пути)",
	"storage.pathMissing": "Файл ещё не создан; появится после первого сохранения",
	"resize.width": "Изменить ширину Sideby Note",
	"resize.height": "Изменить высоту Sideby Note",
	"resize.hint": "Перетащите для изменения размера, двойной щелчок для сброса",
	"dock.open": "Открыть Sideby Note",
	"dock.count": "{n} открыто",
	"toast.copied": "Скопировано",
	"toast.copyFailed": "Не удалось скопировать — повторите попытку",
	"toast.pathCopied": "Путь скопирован",
	"toast.revealFailed": "Не удалось открыть файловый менеджер",
	"toast.inserted": "Передано в чат",
	"toast.insertFailed": "Поле чата не найдено — заметка не тронута",
	"toast.archiveFailed": "Заметка передана в чат, но сохранить её в архиве не удалось",
	"toast.recalled": "Возвращено в поле ввода",
	"toast.recallBlocked": "В поле ввода уже есть текст — сначала отправьте или очистите его",
	"toast.clearPartial": "Часть архивных заметок удалена. Повторите попытку, чтобы удалить остальные",
	"toast.cleared": "Архив очищен",
	"toast.saveFailed": "Не удалось сохранить. Повторите попытку",
	"update.version": "Версия",
	"update.label": "Доступно обновление",
	"update.check": "Проверить обновления",
	"update.checking": "Проверка…",
	"update.retryCheck": "Повторить проверку",
	"update.current": "У вас последняя версия",
	"update.checkFailed": "Проверка не удалась — повторите позже",
	"update.available": "Доступна версия {version}",
	"update.notesTitle": "Примечания к выпуску",
	"update.notesLoading": "Загрузка примечаний к выпуску…",
	"update.notesMissing": "Для этой версии пока нет примечаний к выпуску",
	"update.historyCount": "Включено выпусков: {n}",
	"update.latest": "Последний",
	"update.olderNotes": "Предыдущие выпуски — в полных примечаниях",
	"update.notesFailed": "Не удалось загрузить примечания к выпуску — откройте полные примечания",
	"update.full": "Полные примечания к выпуску",
	"update.now": "Обновить сейчас",
	"update.starting": "Подготовка обновления…",
	"update.updating": "Обновление…",
	"update.updated": "Обновлено до {version}",
	"update.refresh": "Обновить страницу",
	"update.restartHint": "Перезапустите DSH вручную, чтобы завершить обновление",
	"update.failed": "Ошибка обновления: {reason}",
	"update.notInstalled": "Этот плагин не установлен в текущем профиле, поэтому его нельзя обновить из приложения",
	"update.forbidden": "Автоматическое обновление отклонило этот запрос",
	"update.rejected": "Автоматическое обновление не запустилось; связанная копия обновляется из своего каталога",
	"update.busy": "Другое обновление уже выполняется — повторите чуть позже",
	"update.timeout": "Истекло время ожидания результата обновления — повторите позже",
	"update.bundleInUse": "Плагин используется, и Desktop не станет удалять его первым; маршрут хоста устанавливает поверх — если это не сработает, выполните команду ниже",
	"update.alreadyInstalled": "Этот DSH заменяет пакет только после удаления, поэтому не может установиться поверх текущей копии; выполните команду ниже",
	"update.managementRequired": "Этот профиль управляется приложением Desktop, поэтому автоматическое обновление не может его изменить; выполните команду ниже",
	"update.notRemovable": "Плагин управляется приложением Desktop, и автоматическое обновление не может его удалить; выполните команду ниже",
	"update.stopProfile": "Для удаления сначала нужно остановить этот профиль; выполните команду ниже",
	"update.incompatible": "Эта версия несовместима с запущенным DSH, поэтому хост отклонил её",
	"update.versionMismatch": "Установленная версия не совпадает с запрошенной — зеркало или ограничение по возрасту релиза могли её подменить; повторите позже или установите вручную",
	"update.downgrade": "Отклонено: целевая версия старше установленной",
	"update.autoUnavailable": "Этот хост не предлагает автоматическое обновление; выполните команду ниже",
	"update.manualHint": "Или обновитесь напрямую: выполните {command} в терминале либо обновитесь со страницы плагинов и перезагрузите",
	"update.copyPrompt": "Скопировать запрос на обновление",
	"update.prompt": "Обновите плагин DSH Sideby Note до {version}, выполнив: {command}. Перезагрузите страницу по завершении."
};

// src/client/i18n/zh.ts
/** Chinese copy — the single source of truth for the message keys. */
const zh = {
	"nav.label": "边记部",
	"title": "边记部",
	"popover.title": "边记部",
	"popover.close": "关闭边记部",
	"popover.archived": "归档",
	"popover.clearCancel": "取消",
	"popover.clearConfirm": "清空归档中的 {n} 条？",
	"popover.clearConfirmAction": "清空",
	"popover.clearArchived": "清空归档",
	"scope.label": "便笺筛选",
	"scope.global": "全局",
	"scope.workspace": "工作区",
	"scope.globalHint": "查看所有工作区的便笺",
	"scope.workspaceHint": "只看当前工作区的便笺",
	"scope.loading": "正在确认工作区归属",
	"scope.unassigned": "未归属",
	"add.destination": "记到 {workspace}",
	"popover.clearGlobalConfirm": "清空所有工作区中这 {n} 条归档便笺？",
	"popover.empty.title": "边记摸鱼中..",
	"popover.empty.body": "趁 agent 工作时，异步记下你的想法",
	"shortcut.toggle": "打开或收起边记部",
	"add.placeholder": "随手记一条",
	"add.action": "添加",
	"attachment.add": "添加附件",
	"attachment.list": "附件",
	"attachment.scrollLeft": "向左滚动附件",
	"attachment.scrollRight": "向右滚动附件",
	"attachment.preview": "预览 {name}",
	"attachment.closePreview": "关闭预览",
	"attachment.download": "下载 {name}",
	"attachment.remove": "移除 {name}",
	"attachment.uploading": "上传中…",
	"attachment.loading": "正在加载预览…",
	"attachment.previewFailed": "无法预览，可下载原文件",
	"attachment.limit": "每条便笺最多 10 个附件，每个文件须大于 0 字节且不超过 25 MiB",
	"attachment.unavailable": "附件需要 DSH 宿主存储",
	"attachment.uploadFailed": "附件上传失败，请重试",
	"attachment.busy": "操作进行中，请稍后再添加附件",
	"attachment.draftChanged": "附件草稿已更新，请确认后重试",
	"attachment.textInserted": "正文已填入。附件可在归档中下载，再添加到对话",
	"attachment.insertText": "仅填入正文并归档",
	"attachment.archive": "归档便笺",
	"attachment.archived": "已归档",
	"list.open": "待续",
	"list.allArchived.title": "案头已空",
	"list.allArchived.body": "再添一笔，或展开归档回看",
	"item.copy": "复制",
	"item.recall": "退回",
	"item.insert": "填入",
	"item.openWorkspace": "在 {workspace} 打开新会话",
	"item.currentWorkspace": "当前工作区：{workspace}",
	"item.reorder": "拖动排序，↑↓ 亦可",
	"time.now": "刚刚",
	"time.minutes": "{n} 分钟前",
	"time.hours": "{n} 小时前",
	"time.days": "{n} 天前",
	"time.createdArchived": "写于 {created} · 归档于 {completed}",
	"storage.failed": "本地存储不可用，改动不会保留",
	"storage.whereHost": "便笺保存在 DSH 本地文件",
	"storage.loading": "正在读取便笺…",
	"storage.details": "存储与更新",
	"storage.failure": "最近失败：{code}",
	"storage.migrated": "已把本浏览器的 {n} 条便笺迁入 DSH 本地文件",
	"storage.keptLocal": "已使用宿主便笺；本浏览器的旧便笺未合并",
	"storage.notSwitched": "宿主存储暂不可用，便笺仍保存在本浏览器，下次启动会重试",
	"storage.hostError": "便笺存储暂不可用",
	"storage.inUse": "旁边记（AsideNote）正在使用便笺存储。请停用旁边记，再重新连接",
	"storage.retry": "重新连接",
	"storage.reconnecting": "正在重新连接…",
	"storage.copyPath": "拷贝路径",
	"storage.reveal": "在文件夹中显示",
	"storage.pathLoading": "正在读取存储位置…",
	"storage.pathUnavailable": "无法定位存储文件（当前存储后端不支持）",
	"storage.pathMissing": "文件尚未创建，首次写入后生成",
	"resize.width": "调整边记部宽度",
	"resize.height": "调整边记部高度",
	"resize.hint": "拖动调整，双击复位",
	"dock.open": "打开边记部",
	"dock.count": "{n} 条待续",
	"toast.copied": "已复制",
	"toast.copyFailed": "复制失败，请重试",
	"toast.pathCopied": "已复制路径",
	"toast.revealFailed": "无法打开文件管理器",
	"toast.inserted": "已填入",
	"toast.insertFailed": "找不到对话输入框，便笺未动",
	"toast.archiveFailed": "便笺已填入对话输入框，但存档未能保存",
	"toast.recalled": "已退回输入框",
	"toast.recallBlocked": "输入框已有内容，请先发送或清空",
	"toast.clearPartial": "部分归档已清空，可以重试清除剩余便笺",
	"toast.cleared": "归档已清空",
	"toast.saveFailed": "保存失败，请重试",
	"update.version": "版本",
	"update.label": "有新版本",
	"update.check": "检查更新",
	"update.checking": "正在检查…",
	"update.retryCheck": "重试检查",
	"update.current": "已是最新版本",
	"update.checkFailed": "检查失败，请稍后重试",
	"update.available": "有新版本 {version}",
	"update.notesTitle": "更新说明",
	"update.notesLoading": "正在读取更新说明…",
	"update.notesMissing": "这个版本还没有可显示的更新说明",
	"update.historyCount": "本次更新包含 {n} 个版本",
	"update.latest": "最新",
	"update.olderNotes": "更早的版本请见完整更新说明",
	"update.notesFailed": "更新说明读取失败，可打开完整更新说明查看",
	"update.full": "完整更新说明",
	"update.now": "立即更新",
	"update.starting": "正在准备更新…",
	"update.updating": "正在更新…",
	"update.updated": "已更新到 {version}",
	"update.refresh": "刷新页面",
	"update.restartHint": "请手动重启 DSH 以完成更新",
	"update.failed": "更新失败：{reason}",
	"update.notInstalled": "当前 profile 中没有安装这个插件，无法在应用内更新",
	"update.forbidden": "自动更新被拒绝，这次请求没有执行",
	"update.rejected": "自动更新没有执行；link 安装的插件需要在 checkout 中更新后刷新",
	"update.busy": "更新正在执行另一个任务，请稍后再试",
	"update.timeout": "等待更新结果超时，请稍后再试",
	"update.bundleInUse": "这个插件正被当前 DSH 使用中，桌面端不允许先移除再安装；宿主通道会就地覆盖，若仍失败请用下面的命令",
	"update.alreadyInstalled": "这个 DSH 只支持先移除再安装，无法原地覆盖；请用下面的命令",
	"update.managementRequired": "这个 profile 由桌面端自己管理，自动更新无法改动它；请用下面的命令",
	"update.notRemovable": "这个插件由桌面端管理，自动更新不能移除它；请用下面的命令",
	"update.stopProfile": "移除它需要先停止这个 profile；请用下面的命令",
	"update.incompatible": "这个版本与当前 DSH 不兼容，宿主拒绝了安装",
	"update.versionMismatch": "装到的版本与目标不一致（可能被镜像或发布保护替换）；可稍后重试或手动安装",
	"update.downgrade": "拒绝降级：目标版本低于当前已装版本",
	"update.autoUnavailable": "这台宿主没有可用的自动更新通道；请用下面的命令",
	"update.manualHint": "也可以直接更新：在终端执行 {command}，或到「插件」页更新，装好后刷新页面即可",
	"update.copyPrompt": "拷贝更新提示词",
	"update.prompt": "帮我更新 DSH 插件 Sideby Note（边记部）到 {version}：在终端执行 {command}，装好后刷新页面。"
};

// src/client/i18n/index.ts
/** Every DSH-official locale, in the shape `locale.register` expects. */
const DICT = {
	zh,
	en,
	ja,
	es,
	fr,
	de,
	ru,
	pt
};
/** Interpolate `{name}` placeholders; an absent value leaves the placeholder alone. */
function fill(template, vars) {
	return String(template).replace(/\{(\w+)\}/g, (match, name) => {
		return vars && vars[name] !== void 0 && vars[name] !== null ? String(vars[name]) : match;
	});
}
/**
* Translate through the locale service, falling back to the bundled copy.
*
* `say` stays string-keyed for now: the panel passes keys through props and
* literal objects, so a stricter key type waits until those call sites settle.
*/
function makeSay(ctx, getLocaleId) {
	let boundService;
	let bound = null;
	let hasSynced = false;
	/**
	* Bind lazily and re-bind when the service identity changes: a client-plugin
	* reload can replace the locale service after this closure was created, and a
	* binding captured from the old one would silently stop translating.
	*/
	const translate = () => {
		let locale;
		try {
			locale = ctx.get("locale");
		} catch {
			return null;
		}
		if (hasSynced && locale === boundService) return bound;
		hasSynced = true;
		boundService = locale;
		bound = locale && typeof locale.bind === "function" ? locale.bind(NS) : null;
		return bound;
	};
	return (key) => {
		const boundTranslate = translate();
		if (boundTranslate) try {
			const value = boundTranslate(key);
			if (typeof value === "string" && value && value !== key) return value;
		} catch {}
		const language = String(getLocaleId()).split("-")[0].toLowerCase();
		return (DICT[language] || DICT.en)[key] || DICT.en[key] || key;
	};
}

// src/client/scope.ts
const UNASSIGNED_WORKSPACE = "sideby-note:unassigned";
let binding = {
	sessionId: "",
	workspace: null,
	ready: true,
	catalogReady: false
};
let workspaces = [];
function bindWorkspace(sessionId, workspace, ready, catalog) {
	binding = {
		sessionId,
		workspace,
		ready,
		catalogReady: catalog !== null
	};
	workspaces = catalog ?? [];
}
function workspaceForSession(sessionId) {
	return binding.sessionId === sessionId ? binding.workspace : null;
}
function workspaceCatalogReady() {
	return binding.catalogReady;
}
function workspaceById(workspaceId) {
	return workspaces.find((workspace) => workspace.workspaceId === workspaceId);
}
function sessionReadyFor(sessionId) {
	return binding.sessionId !== sessionId || binding.ready;
}
function draftKeyForSession(sessionId) {
	const workspace = workspaceForSession(sessionId);
	return workspace ? `ws:${workspace.workspaceId}` : sessionId;
}

// src/client/domain/forward.ts
/** Append one note to the conversation composer (Lexical contenteditable or textarea). */
/** Session whose conversation is on screen; the dock keeps this current. */
let targetSessionId = "";
/** Point forwarding at the conversation the user currently has open. */
function setForwardTarget(sessionId) {
	targetSessionId = sessionId ? String(sessionId) : "";
}
/** The visible conversation root of the target session, when the host marks one. */
function conversationRoot() {
	if (!targetSessionId) return null;
	for (const node of document.querySelectorAll("[data-conversation-session]")) if (node.getAttribute("data-conversation-session") === targetSessionId) return node;
	return null;
}
function appendToConversation(text) {
	const note = String(text || "").replace(/^\s+|\s+$/g, "");
	if (!note) return false;
	const visible = (node) => {
		const rect = node.getBoundingClientRect();
		return rect.width > 0 && rect.height > 0;
	};
	const root = conversationRoot() || document;
	const specific = [...root.querySelectorAll("[data-composer-input]")].filter(visible);
	const editor = (specific.length ? specific : [...root.querySelectorAll("[contenteditable=\"true\"][role=\"textbox\"], textarea[role=\"textbox\"]")].filter(visible))[0];
	if (!editor) return false;
	/** Payload for a composer whose current plain text is `current`. */
	const payloadFor = (current) => {
		const value = typeof current === "string" ? current : "";
		if (!value.trim()) return note;
		return value.endsWith("\n") ? note : `\n${note}`;
	};
	if (editor.tagName === "TEXTAREA") {
		const textarea = editor;
		const current = textarea.value;
		const payload = payloadFor(current);
		Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(textarea, `${current}${payload}`);
		textarea.dispatchEvent(new Event("input", { bubbles: true }));
		textarea.focus();
		const end = textarea.value.length;
		textarea.setSelectionRange(end, end);
		return true;
	}
	const payload = payloadFor(typeof editor.innerText === "string" ? editor.innerText : "");
	editor.focus();
	try {
		const range = document.createRange();
		range.selectNodeContents(editor);
		range.collapse(false);
		const selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	} catch {}
	try {
		const data = new DataTransfer();
		data.setData("text/plain", payload);
		const event = new ClipboardEvent("paste", {
			bubbles: true,
			cancelable: true,
			clipboardData: data
		});
		if (!editor.dispatchEvent(event)) return true;
	} catch {}
	try {
		return document.execCommand("insertText", false, payload);
	} catch {
		return false;
	}
}

// src/client/storage/host-client.ts
/**
* The host store as the browser sees it.
*
* One same-origin endpoint, two calls: GET hydrates, POST applies a mutation.
* Nothing here throws a raw network error to the UI: every branch becomes a
* `HostRequestError` carrying the stable `code` the route documented, so the
* boot logic can distinguish "this host cannot store" from "this write failed".
*/
/** A storage request that did not succeed, with the route's stable code. */
var HostRequestError = class extends Error {
	code;
	status;
	retryable;
	constructor(code, message, status = 0, retryable = false) {
		super(message);
		this.name = "HostRequestError";
		this.code = code;
		this.status = status;
		this.retryable = retryable;
	}
};
const RETRY_MS = 250;
const sleep$1 = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function abortSignal(timeoutMs) {
	if (typeof AbortController !== "function") return { done: () => {} };
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	return {
		signal: controller.signal,
		done: () => clearTimeout(timer)
	};
}
function failureOf$1(response, body) {
	const code = typeof body?.code === "string" ? body.code : "";
	const message = typeof body?.message === "string" ? body.message : `host answered ${response.status}`;
	if (response.status === 404) return new HostRequestError("STORE_ROUTE_MISSING", "this host has no note-store route", 404);
	if (response.status === 403) return new HostRequestError("STORE_FORBIDDEN", "the host refused this page", 403);
	if (response.status === 405) return new HostRequestError("STORE_METHOD", "the host rejected the method", 405);
	if (response.status === 413) return new HostRequestError("STORE_TOO_LARGE", message, 413);
	if (response.status === 400) return new HostRequestError(code || "STORE_BAD_REQUEST", message, 400);
	if (response.status === 503) return new HostRequestError(code || "STORE_UNAVAILABLE", message, 503, true);
	return new HostRequestError(code || "STORE_FAILED", message, response.status, response.status >= 500);
}
async function readJson(response) {
	try {
		return await response.json();
	} catch {
		return;
	}
}
async function request(path, init, options) {
	let last;
	for (let attempt = 0; attempt < options.attempts; attempt += 1) {
		const abort = abortSignal(options.timeoutMs);
		let response;
		try {
			response = await fetch(path, {
				...init,
				...abort.signal === void 0 ? {} : { signal: abort.signal }
			});
		} catch (error) {
			abort.done();
			last = new HostRequestError(error?.name === "AbortError" ? "STORE_TIMEOUT" : "STORE_UNREACHABLE", error instanceof Error ? error.message : "the host did not answer", 0, true);
			if (attempt + 1 < options.attempts) {
				await sleep$1(RETRY_MS);
				continue;
			}
			throw last;
		} finally {
			abort.done();
		}
		const body = await readJson(response);
		if (response.ok && body?.ok === true) return body;
		if (response.ok) throw new HostRequestError("STORE_FAILED", "the host returned an unexpected body", response.status);
		last = failureOf$1(response, body);
		if (!last.retryable || attempt + 1 >= options.attempts) throw last;
		await sleep$1(RETRY_MS);
	}
	throw last ?? new HostRequestError("STORE_FAILED", "the host did not answer");
}
/** Read the authoritative snapshot; retries one transient failure. */
async function fetchSnapshot() {
	const body = await request(HOST_STORE_PATH, {
		method: "GET",
		headers: { accept: "application/json" }
	}, {
		timeoutMs: HOST_READ_TIMEOUT_MS,
		attempts: 2
	});
	const data = body?.data;
	if (!data || typeof data !== "object") throw new HostRequestError("STORE_FAILED", "the host snapshot has no data", 200);
	return {
		rev: Number.isFinite(body.rev) ? body.rev : 0,
		empty: body.empty === true,
		data: {
			sessions: data.sessions && typeof data.sessions === "object" ? data.sessions : {},
			workspaces: data.workspaces && typeof data.workspaces === "object" ? data.workspaces : {},
			prefs: data.prefs && typeof data.prefs === "object" ? data.prefs : {}
		}
	};
}
/** Apply one mutation; retries once because every operation is idempotent. */
async function postOp(op) {
	return request(HOST_STORE_PATH, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			accept: "application/json"
		},
		body: JSON.stringify(op)
	}, {
		timeoutMs: HOST_WRITE_TIMEOUT_MS,
		attempts: 2
	});
}
/** Read the durable file path; null when the host has no such route. */
async function fetchStoreLocation() {
	try {
		const body = await request(HOST_STORE_LOCATION_PATH, {
			method: "GET",
			headers: { accept: "application/json" }
		}, {
			timeoutMs: HOST_READ_TIMEOUT_MS,
			attempts: 1
		});
		return {
			path: typeof body.path === "string" && body.path ? body.path : null,
			exists: body.exists === true,
			backend: typeof body.backend === "string" ? body.backend : null,
			...typeof body.reason === "string" ? { reason: body.reason } : {}
		};
	} catch {
		return null;
	}
}
/** Ask the host to show the store file (or its folder) in the OS file manager. */
async function revealStoreFile() {
	try {
		return (await request(HOST_STORE_REVEAL_PATH, {
			method: "POST",
			headers: { accept: "application/json" }
		}, {
			timeoutMs: HOST_WRITE_TIMEOUT_MS,
			attempts: 1
		}))?.ok === true;
	} catch {
		return false;
	}
}

// src/client/storage/events.ts
/**
* Same-tab change bus plus storage lifecycle notifications.
*
* The `storage` event only crosses tabs, so a write here wakes the readers in
* this tab — the header count and an open panel. Host-backed storage has no
* `storage` event at all, so the host cache notifies through the same bus and
* adds two lifecycle channels: "the mode is decided / data hydrated" and
* "a storage operation failed".
*/
/** Same-tab subscribers, so the composer dock's count follows panel edits. */
const TODO_LISTENERS = /* @__PURE__ */ new Set();
/** Listeners told once the storage mode is decided (host hydrated, or local chosen). */
const STORE_READY_LISTENERS = /* @__PURE__ */ new Set();
/** Listeners told about a failed host read or write worth surfacing as a Toast. */
const STORE_ERROR_LISTENERS = /* @__PURE__ */ new Set();
/** Listeners told about a completed or refused switch (translated by the UI). */
const STORE_NOTICE_LISTENERS = /* @__PURE__ */ new Set();
/** Notify same-tab readers after a successful write (storage events only cross tabs). */
function notifyTodoChange() {
	for (const listener of TODO_LISTENERS) try {
		listener();
	} catch (error) {
		console.error("dsh-sideby-note: listener failed", error);
	}
}
/** Announce that the storage mode is decided and the cache is usable. */
function notifyStoreReady() {
	for (const listener of STORE_READY_LISTENERS) try {
		listener();
	} catch (error) {
		console.error("dsh-sideby-note: ready listener failed", error);
	}
}
/** Announce a switch outcome; the panel turns it into a Toast. */
function notifyStoreNotice(notice) {
	for (const listener of STORE_NOTICE_LISTENERS) try {
		listener(notice);
	} catch (error) {
		console.error("dsh-sideby-note: notice listener failed", error);
	}
}
/** Announce a failed storage operation; the panel turns it into a Toast. */
function notifyStoreError(failure) {
	for (const listener of STORE_ERROR_LISTENERS) try {
		listener(failure);
	} catch (error) {
		console.error("dsh-sideby-note: error listener failed", error);
	}
}

// src/client/storage/state.ts
/**
* Browser-side storage state shared by the facade modules.
*
* Two sources coexist by design: `localStorage` (the device-local state and
* the pre-switch fallback) and the in-memory host snapshot. Reads stay
* synchronous, so the UI keeps its current shape; this module is the single
* place that answers "which one is authoritative right now".
*/
let mode = "probing";
let data = null;
let failure = null;
let pendingWrites = 0;
let refreshRequested = false;
let refreshing = false;
let channel = null;
let listening = false;
/** Current mode; `probing` means boot has not decided yet. */
function storageMode() {
	return mode;
}
/** True while the host is (or must be) the only source: `host` and the error state after it. */
function hostAuthoritative() {
	return mode === "host" || mode === "error";
}
function setStorageMode(next) {
	mode = next;
	if (next === "host") refreshHost();
}
/** The last host failure, for in-panel diagnostics. */
function storageFailure() {
	return failure;
}
function setStorageFailure(next) {
	failure = next;
}
/** Connection failures are actionable even while the last host snapshot is readable. */
function isHostConnectionFailure(value) {
	return value != null && (value.code === "STORE_UNREACHABLE" || value.code === "STORE_TIMEOUT" || value.code === "STORE_IN_USE" || value.status === 403 || value.status === 404 || value.status === 503);
}
/** Replace the cache with a fresh host snapshot. */
function hydrateHost(next) {
	data = next;
}
/** One host table, or an empty map. */
function hostTable(name) {
	return data?.[name] ?? {};
}
/** One host record, or undefined. */
function hostRecord(name, key) {
	if (!key) return void 0;
	return hostTable(name)[key];
}
/** Host preferences (user intent that travels with the notes). */
function hostPrefs() {
	return data?.prefs ?? {};
}
/** Merge one record into the cache and wake same-tab readers. */
function applyHostRecord(name, key, value) {
	if (!data || !key) return;
	if (value === void 0) delete data[name][key];
	else data[name][key] = value;
	notifyTodoChange();
}
/** Replace cached preferences and wake readers. */
function applyHostPrefs(prefs) {
	if (!data) return;
	data.prefs = prefs && typeof prefs === "object" ? prefs : {};
	notifyTodoChange();
}
/** Include the local cache update or rollback in the lifetime of a write. */
function beginPending() {
	pendingWrites += 1;
	if (refreshing) refreshRequested = true;
}
function endPending() {
	pendingWrites -= 1;
	refreshHost();
}
async function refreshHost() {
	if (mode !== "host" || pendingWrites !== 0 || refreshing || !refreshRequested) return;
	refreshing = true;
	refreshRequested = false;
	const previousFailure = failure;
	try {
		const { data: snapshot } = await fetchSnapshot();
		if (mode === "host" && !refreshRequested) {
			hydrateHost(snapshot);
			if (failure === previousFailure && isHostConnectionFailure(failure)) setStorageFailure(null);
			notifyTodoChange();
		}
	} catch (error) {
		if (mode === "host" && !refreshRequested && error instanceof HostRequestError && isHostConnectionFailure(error)) {
			setStorageFailure(error);
			notifyTodoChange();
		}
	} finally {
		refreshing = false;
		if (refreshRequested) refreshHost();
	}
}
function ensureChannel() {
	if (channel) return channel;
	if (typeof BroadcastChannel !== "function") return null;
	try {
		channel = new BroadcastChannel("dsh-aside-note");
	} catch {
		channel = null;
	}
	return channel;
}
/** Older tabs consume the payload. Sideby Note treats it as a signal to refetch. */
function broadcastHostChange(change) {
	ensureChannel()?.postMessage(change);
}
/** Schedule a fresh read without racing pending writes. */
function requestHostRefresh() {
	refreshRequested = true;
	refreshHost();
}
/**
* Listen for same-browser tab updates once. BroadcastChannel is optional (jsdom
* and older runtimes), so a missing implementation only loses that nicety.
*/
function startCrossTabSync() {
	if (listening) return;
	const bus = ensureChannel();
	if (!bus) return;
	listening = true;
	bus.onmessage = (event) => {
		const message = event?.data;
		if (mode === "local" || message?.kind !== "prefs" && message?.kind !== "record") return;
		requestHostRefresh();
	};
}

// src/client/storage/ops.ts
const chains = /* @__PURE__ */ new Map();
function serialize(key, task) {
	const run = (chains.get(key) ?? Promise.resolve()).then(task, task);
	chains.set(key, run.then(() => void 0, () => void 0));
	beginPending();
	return run.finally(endPending);
}
function report(error) {
	const failure = {
		code: typeof error?.code === "string" ? error.code : "STORE_FAILED",
		message: error instanceof Error ? error.message : String(error)
	};
	const detail = {
		...failure,
		status: error?.status
	};
	setStorageFailure(detail);
	if (isHostConnectionFailure(detail)) notifyTodoChange();
	notifyStoreError(failure);
}
function sameJson(a, b) {
	return JSON.stringify(a) === JSON.stringify(b);
}
function toItems(record) {
	return record && Array.isArray(record.items) ? record.items : [];
}
/**
* Persist the next ordered list for one scope.
* @returns true when the host accepted (or nothing changed)
*/
async function commitList(listKey, nextItems) {
	if (!listKey) return false;
	const table = "workspaces";
	const base = toItems(hostRecord(table, listKey));
	const baseById = new Map(base.map((item) => [item.id, item]));
	const nextById = new Map(nextItems.map((item) => [item.id, item]));
	const upserts = nextItems.filter((item) => {
		const previous = baseById.get(item.id);
		return previous === void 0 || !sameJson(previous, item);
	});
	const deletes = [...baseById.keys()].filter((id) => !nextById.has(id));
	const order = nextItems.map((item) => item.id);
	const sameOrder = order.length === base.length && base.every((item, index) => item.id === order[index]);
	if (upserts.length === 0 && deletes.length === 0 && sameOrder) return true;
	try {
		await serialize(`${table}:${listKey}`, async () => {
			const previousFailure = storageFailure();
			const result = await postOp({
				op: "list.patch",
				kind: "workspace",
				listKey,
				order,
				upserts,
				deletes
			});
			if (storageFailure() === previousFailure && isHostConnectionFailure(previousFailure)) setStorageFailure(null);
			applyHostRecord(table, listKey, result.record);
			broadcastHostChange({
				kind: "record",
				name: table,
				key: listKey,
				value: result.record,
				rev: result.rev
			});
		});
		return true;
	} catch (error) {
		const detail = {
			code: typeof error?.code === "string" ? error.code : "STORE_FAILED",
			message: error instanceof Error ? error.message : String(error),
			status: error?.status
		};
		setStorageFailure(detail);
		if (isHostConnectionFailure(detail)) notifyTodoChange();
		return false;
	}
}
/** Fold member sessions into a workspace list once, on the host. */
async function ensureWorkspace(workspaceId, sessionIds) {
	if (!workspaceId) return false;
	try {
		await serialize(`workspaces:${workspaceId}`, async () => {
			if (!sessionIds.some((id) => hostRecord("sessions", id))) return;
			const result = await postOp({
				op: "list.ensure",
				workspaceId,
				sessionIds
			});
			for (const id of result.migratedSessionIds ?? []) applyHostRecord("sessions", id, void 0);
			requestHostRefresh();
			applyHostRecord("workspaces", workspaceId, result.record);
			broadcastHostChange({
				kind: "record",
				name: "workspaces",
				key: workspaceId,
				value: result.record,
				rev: result.rev
			});
		});
		return true;
	} catch (error) {
		report(error);
		return false;
	}
}
let pendingScopeWrite;
function pendingHostScopeMode() {
	return pendingScopeWrite?.scopeMode;
}
/** Keep the latest selection visible while older writes update the durable snapshot. */
function setHostScopeMode(scopeMode) {
	const patch = { scopeMode };
	pendingScopeWrite = patch;
	serialize("prefs", async () => {
		const previousFailure = storageFailure();
		try {
			const result = await postOp({
				op: "prefs.set",
				patch
			});
			if (pendingScopeWrite === patch) pendingScopeWrite = void 0;
			if (storageFailure() === previousFailure && isHostConnectionFailure(previousFailure)) setStorageFailure(null);
			applyHostPrefs(result.prefs);
			broadcastHostChange({
				kind: "prefs",
				prefs: result.prefs,
				rev: result.rev
			});
		} catch (error) {
			if (pendingScopeWrite !== patch) return;
			pendingScopeWrite = void 0;
			notifyTodoChange();
			report(error);
		}
	});
	notifyTodoChange();
}
/** Upload the pre-switch browser store; safe to re-run after an interruption. */
async function migrate(snapshot) {
	return postOp({
		op: "migrate",
		snapshot,
		source: "localStorage"
	});
}

// src/client/storage/codec.ts
/** The browser store, or null when storage is blocked. */
function storage() {
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
/** Suffix appended to a store key when its payload could not be read. */
const CORRUPT_SUFFIX = ".corrupt";
/**
* Keep an unreadable payload beside its key before anything overwrites it.
*
* Notes only exist in this browser, so a bad parse must not be allowed to turn
* into silent data loss: the raw string is parked under `<key>.corrupt` and the
* store continues from empty. Best effort — when storage itself is blocked or
* full there is nowhere to keep the copy.
*
* Repeated reads of the same damage do not rewrite the backup.
*/
function setAsideUnreadable(key, raw) {
	const ls = storage();
	if (!ls) return false;
	try {
		const backupKey = `${key}${CORRUPT_SUFFIX}`;
		const previous = ls.getItem(backupKey);
		if (previous) try {
			const parsed = JSON.parse(previous);
			if (parsed && parsed.raw === raw) return true;
		} catch {}
		ls.setItem(backupKey, JSON.stringify({
			at: Date.now(),
			raw
		}));
		return true;
	} catch {
		return false;
	}
}

// src/client/storage/legacy.ts
/**
* The pre-switch browser store: migration payload and mode markers.
*
* Once the switch succeeds this data is never read as authority again; it is
* kept untouched as the recovery source. The parser mirrors the old modules so
* a hand-edited or older shape migrates as far as it can instead of failing.
*/
const FORWARDED_STORAGE_KEY = "dsh.aside-note.forwarded";
const SEND_SHORTCUT_KEY = "dsh.aside-note.send-shortcut";
const FORWARD_PREFIX_STORAGE_KEY = "dsh.aside-note.forward-prefix";
const bucket$2 = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
function parse(raw) {
	if (!raw) return void 0;
	try {
		return JSON.parse(raw);
	} catch {
		return;
	}
}
function readItem(key) {
	const ls = storage();
	if (!ls) return null;
	try {
		return ls.getItem(key);
	} catch {
		return null;
	}
}
function writeItem(key, value) {
	const ls = storage();
	if (!ls) return false;
	try {
		ls.setItem(key, value);
		return true;
	} catch {
		return false;
	}
}
/** Read everything a one-time migration needs, in the old on-disk shapes. */
function readLegacySnapshot() {
	const sessionStore = parse(readItem(SESSION_STORAGE_KEY));
	const workspaceStore = parse(readItem(WORKSPACE_STORAGE_KEY));
	const forwardedStore = parse(readItem(FORWARDED_STORAGE_KEY));
	const prefs = {};
	const scope = readItem(SCOPE_MODE_KEY);
	if (scope === "workspace" || scope === "global") prefs.scopeMode = scope;
	const shortcut = readItem(SEND_SHORTCUT_KEY);
	if (shortcut === "enter" || shortcut === "ctrl-enter") prefs.sendShortcut = shortcut;
	const prefix = readItem(FORWARD_PREFIX_STORAGE_KEY);
	if (typeof prefix === "string") prefs.forwardPrefix = prefix.slice(0, 80);
	const pendingCleanup = new Set(Array.isArray(workspaceStore?.pendingSessionCleanup) ? workspaceStore.pendingSessionCleanup : []);
	return {
		sessions: Object.fromEntries(Object.entries(bucket$2(sessionStore?.sessions)).filter(([id]) => !pendingCleanup.has(id))),
		workspaces: bucket$2(workspaceStore?.workspaces),
		forwarded: bucket$2(forwardedStore?.sessions),
		prefs
	};
}
/** Number of notes the migration would carry, for the success notice. */
function legacyNoteCount(snapshot) {
	let count = 0;
	for (const record of Object.values(snapshot.sessions)) if (Array.isArray(record?.items)) count += record.items.length;
	for (const record of Object.values(snapshot.workspaces)) if (Array.isArray(record?.items)) count += record.items.length;
	return count;
}
/** True when the browser holds anything worth migrating. */
function hasLegacyData(snapshot) {
	return legacyNoteCount(snapshot) > 0 || Object.keys(snapshot.forwarded).length > 0 || Object.keys(snapshot.prefs).length > 0;
}
/** Whether this browser already switched to host storage. */
function hostModeMarked() {
	return readItem(STORAGE_MODE_KEY) === "host";
}
/** Remember the one-way switch. Best effort: clearing site data loses it. */
function markHostMode() {
	return writeItem(STORAGE_MODE_KEY, "host");
}
/**
* Whether a failure notice should surface now. The same reason is throttled to
* once per day so a broken host does not toast on every reload.
*/
function shouldNoticeStorage(code) {
	const saved = parse(readItem(STORAGE_NOTICE_KEY));
	if (!saved || typeof saved !== "object") return true;
	if (saved.code !== code) return true;
	const at = Number(saved.at);
	return !Number.isFinite(at) || Date.now() - at >= 864e5;
}
function rememberStorageNotice(code) {
	writeItem(STORAGE_NOTICE_KEY, JSON.stringify({
		code,
		at: Date.now()
	}));
}

// src/client/storage/boot.ts
/**
* The one-time decision: switch this browser's notes to host storage or stay
* on localStorage.
*
* Rules (docs/design/host-storage-migration.md §7.1/§7.5):
* - probe before deciding; an unavailable host means "don't switch", keep
*   working locally, notify, and retry on the next load;
* - migrate only after a successful open, and write the one-way marker only
*   after the data is durable;
* - after the switch the host is authoritative: a later outage is an error
*   state, never a silent fallback that would fork the data.
*/
let booting = null;
let inFlight = false;
function failureOf(error) {
	return {
		code: typeof error?.code === "string" ? error.code : "STORE_FAILED",
		message: error instanceof Error ? error.message : String(error),
		status: error?.status
	};
}
function refuse(failure) {
	const readOnly = storageMode() === "error" || hostModeMarked() || failure.code === "STORE_IN_USE";
	const mode = readOnly ? "error" : "local";
	setStorageFailure(failure);
	setStorageMode(mode);
	notifyStoreReady();
	if (shouldNoticeStorage(failure.code)) {
		rememberStorageNotice(failure.code);
		if (readOnly) notifyStoreError({
			code: failure.code,
			message: failure.message
		});
		else notifyStoreNotice({
			kind: "notSwitched",
			code: failure.code
		});
	}
	return mode;
}
async function runBoot() {
	startCrossTabSync();
	if (hostModeMarked()) try {
		const snapshot = await fetchSnapshot();
		hydrateHost(snapshot.data);
		setStorageFailure(null);
		setStorageMode("host");
		notifyStoreReady();
		return "host";
	} catch (error) {
		return refuse(failureOf(error));
	}
	let snapshot;
	try {
		snapshot = await fetchSnapshot();
	} catch (error) {
		return refuse(failureOf(error));
	}
	const legacy = readLegacySnapshot();
	const incomplete = snapshot.data.prefs?.migration?.complete === false;
	const localNoteCount = legacyNoteCount(legacy);
	try {
		if (incomplete || snapshot.empty) {
			if (hasLegacyData(legacy)) {
				const result = await migrate(legacy);
				snapshot = await fetchSnapshot();
				if (result.keptLocal && localNoteCount > 0) notifyStoreNotice({ kind: "keptLocal" });
				else if (!result.alreadyComplete && result.notesMigrated > 0) notifyStoreNotice({
					kind: "migrated",
					count: result.notesMigrated
				});
			}
		} else if (localNoteCount > 0) notifyStoreNotice({ kind: "keptLocal" });
	} catch (error) {
		return refuse(failureOf(error));
	}
	hydrateHost(snapshot.data);
	markHostMode();
	setStorageFailure(null);
	setStorageMode("host");
	notifyStoreReady();
	return "host";
}
/** Decide once per page load; later callers share the same promise. */
function bootStorage() {
	if (!booting) return startBoot();
	return booting;
}
/** Force a new probe from the panel's reconnect action. */
function retryStorage() {
	if (inFlight) return bootStorage();
	if (storageMode() === "local") setStorageMode("probing");
	return startBoot();
}
function startBoot() {
	inFlight = true;
	booting = runBoot().catch((error) => refuse(failureOf(error))).finally(() => {
		inFlight = false;
	});
	return booting;
}

// src/client/storage/drafts.ts
/**
* The unsaved composer draft, so closing the panel never loses text.
*
* Records are keyed by draft scope, not by conversation: inside a workspace
* every member session shares one buffer (`ws:<workspaceId>`), so switching
* conversations or filters never strands half-typed text.
* A session outside a workspace keeps its own key. Recalled notes remember
* their original workspace. The map field stays `sessions` so the existing
* store keeps its shape.
*/
const keyOf = (value) => value ? String(value) : "";
const attachmentChanges = /* @__PURE__ */ new Set();
function notifyDraftAttachments(key) {
	for (const listener of attachmentChanges) listener(key);
}
function subscribeDraftAttachments(listener) {
	const onStorage = (event) => {
		if (event.key === "dsh.aside-note.drafts" || event.key === null) listener("");
	};
	attachmentChanges.add(listener);
	window.addEventListener("storage", onStorage);
	return () => {
		attachmentChanges.delete(listener);
		window.removeEventListener("storage", onStorage);
	};
}
/** Empty unsaved-draft store. */
function emptyDraftStore() {
	return {
		version: 1,
		sessions: {}
	};
}
/**
* Read the unsaved composer drafts; corrupt or unavailable reads as empty.
* An unreadable payload is parked under `<key>.corrupt` first, so half-typed
* text is never destroyed by the next write.
*/
function readDraftStore() {
	const ls = storage();
	if (!ls) return emptyDraftStore();
	let raw;
	try {
		raw = ls.getItem(DRAFT_STORAGE_KEY);
	} catch {
		return emptyDraftStore();
	}
	if (!raw) return emptyDraftStore();
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		setAsideUnreadable(DRAFT_STORAGE_KEY, raw);
		return emptyDraftStore();
	}
	const sessions = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed.sessions : void 0;
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || sessions !== void 0 && (!sessions || typeof sessions !== "object" || Array.isArray(sessions))) {
		setAsideUnreadable(DRAFT_STORAGE_KEY, raw);
		return emptyDraftStore();
	}
	return {
		version: 1,
		sessions: bucketOf(sessions)
	};
}
/** The stored map, or an empty one when the field is absent. */
function bucketOf(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function writeDraftStore(store) {
	const ls = storage();
	if (!ls) return false;
	try {
		ls.setItem(DRAFT_STORAGE_KEY, JSON.stringify(store));
		return true;
	} catch {
		return false;
	}
}
/** The unsaved composer draft of one scope (a workspace or a lone session). */
function readScopeDrafts(key) {
	const id = keyOf(key);
	const record = id ? readDraftStore().sessions[id] : null;
	return {
		add: typeof record?.add === "string" ? record.add : "",
		attachments: normalizeAttachments(record?.attachments),
		workspaceId: typeof record?.workspaceId === "string" ? record.workspaceId : void 0
	};
}
function pruneDraftScope(store, key) {
	const record = store.sessions[key];
	if (!record) return;
	if (!(typeof record.add === "string" && record.add.length > 0) && normalizeAttachments(record.attachments).length === 0) delete store.sessions[key];
}
function saveAddDraft(key, text, attachments, workspaceId) {
	const id = keyOf(key);
	if (!id) return false;
	const store = readDraftStore();
	const record = store.sessions[id] || {};
	const value = String(text || "").slice(0, 280);
	if (value) record.add = value;
	else delete record.add;
	if (attachments?.length) record.attachments = attachments;
	else if (attachments) delete record.attachments;
	if (workspaceId) record.workspaceId = workspaceId;
	else if (workspaceId === null) delete record.workspaceId;
	delete record.edits;
	store.sessions[id] = record;
	pruneDraftScope(store, id);
	const written = writeDraftStore(store);
	if (written && attachments) notifyDraftAttachments(id);
	return written;
}
function clearAddDraft(key) {
	return saveAddDraft(key, "", [], null);
}
/**
* Move a conversation's pre-workspace draft under the shared workspace key.
*
* Runs once per workspace: the draft the user is looking at becomes the shared
* buffer, and the workspace members' per-session copies are retired so that
* clearing the buffer cannot resurrect them. A no-op outside a workspace, once
* the shared key exists, or when the legacy record holds no text.
*/
function ensureDraftScope(key, sessionId, sessionIds) {
	const target = keyOf(key);
	const source = keyOf(sessionId);
	if (!target || !source || target === source) return false;
	const members = (Array.isArray(sessionIds) ? sessionIds : []).map(keyOf).filter(Boolean);
	const store = readDraftStore();
	if (store.sessions[target]) return false;
	const legacy = store.sessions[source];
	if (!legacy || typeof legacy !== "object" || Array.isArray(legacy)) return false;
	const add = typeof legacy.add === "string" ? legacy.add.slice(0, 280) : "";
	const attachments = normalizeAttachments(legacy.attachments);
	if (!add && attachments.length === 0) return false;
	store.sessions[target] = {
		...add ? { add } : {},
		...attachments.length ? { attachments } : {},
		...legacy.workspaceId ? { workspaceId: legacy.workspaceId } : {}
	};
	for (const member of members) delete store.sessions[member];
	delete store.sessions[source];
	return writeDraftStore(store);
}

// src/client/domain/id.ts
/** Stable ids for notes and drafts. */
function uid() {
	try {
		if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") return globalThis.crypto.randomUUID();
	} catch {}
	return `todo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// src/client/domain/items.ts
/** Note shape, ordering and relative time copy. */
/**
* Stable id for a legacy record that never had one.
*
* A random id here would change on every read, so a write could merge the same
* note twice under two ids. Hashing the authored fields keeps the id identical
* across reads; genuinely identical duplicates are resolved by the caller's
* `seen` check.
*/
function legacyId(text, createdAt, updatedAt) {
	let hash = 5381;
	const source = `${text}\u0000${createdAt}\u0000${updatedAt}`;
	for (let index = 0; index < source.length; index += 1) hash = (hash << 5) + hash + source.charCodeAt(index) | 0;
	return `legacy-${(hash >>> 0).toString(36)}`;
}
/**
* Sanitize one session's notes. The store is user-editable, so treat
* every field defensively and preserve the authored order.
*/
function normalizeItems(items) {
	if (!Array.isArray(items)) return [];
	const seen = /* @__PURE__ */ new Set();
	const normalized = [];
	for (const raw of items) {
		if (!raw || typeof raw !== "object") continue;
		const text = String(raw.text || "").trim().slice(0, 280);
		const attachments = normalizeAttachments(raw.attachments);
		if (!text && attachments.length === 0) continue;
		let id = typeof raw.id === "string" && raw.id ? raw.id : legacyId(text, raw.createdAt, raw.updatedAt);
		if (seen.has(id)) id = legacyId(text, raw.createdAt, raw.updatedAt);
		if (seen.has(id)) id = uid();
		seen.add(id);
		const done = raw.done === true;
		const createdAt = Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now();
		const updatedAt = Number.isFinite(raw.updatedAt) ? raw.updatedAt : createdAt;
		normalized.push({
			id,
			text,
			...attachments.length ? { attachments } : {},
			done,
			createdAt,
			updatedAt,
			...done && Number.isFinite(raw.completedAt) ? { completedAt: raw.completedAt } : {}
		});
	}
	return normalized;
}
/** Relative age copy for a note's creation stamp. */
function ageLabel(time, say, localeId) {
	const stamp = Number.isFinite(time) ? time : Date.now();
	const elapsed = Math.max(0, Date.now() - stamp);
	if (elapsed < 6e4) return say("time.now");
	const minutes = Math.floor(elapsed / 6e4);
	if (minutes < 60) return say("time.minutes", { n: minutes });
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return say("time.hours", { n: hours });
	const days = Math.floor(hours / 24);
	if (days < 7) return say("time.days", { n: days });
	try {
		return new Intl.DateTimeFormat(localeId, {
			month: "short",
			day: "numeric"
		}).format(stamp);
	} catch {
		return "";
	}
}
/**
* Best-known archive stamp for an archived note (stored as `done` with
* `completedAt`, the on-disk names kept from the checkbox era). Older records
* only have `updatedAt`, so fall back in order until a finite time is found.
* Returns 0 when the item has no usable stamp.
*/
function completedStamp(item) {
	if (!item) return 0;
	const candidates = [
		item.completedAt,
		item.updatedAt,
		item.createdAt
	];
	for (const time of candidates) if (Number.isFinite(time)) return time;
	return 0;
}
/** Newest archive first; updatedAt then createdAt keep equal stamps stable. */
function compareDoneItems(a, b) {
	const byCompletion = completedStamp(b) - completedStamp(a);
	if (byCompletion) return byCompletion;
	const aUpdated = Number.isFinite(a && a.updatedAt) ? a.updatedAt : 0;
	const bUpdated = Number.isFinite(b && b.updatedAt) ? b.updatedAt : 0;
	if (aUpdated !== bUpdated) return bUpdated - aUpdated;
	const aCreated = Number.isFinite(a && a.createdAt) ? a.createdAt : 0;
	return (Number.isFinite(b && b.createdAt) ? b.createdAt : 0) - aCreated;
}
/**
* The age a row shows at rest: an open note counts from its creation, an
* archived one from the moment it was archived (the order of its section).
*/
function rowAge(item, say, localeId) {
	if (!item || item.done !== true) return ageLabel(item && item.createdAt, say, localeId);
	return ageLabel(completedStamp(item) || item.createdAt, say, localeId);
}
/** Full stamp for the row's hover title: archived notes name both moments. */
function metaLabel(item, say, localeId) {
	const created = ageLabel(item && item.createdAt, say, localeId);
	if (!item || item.done !== true) return created;
	return say("time.createdArchived", {
		created,
		completed: ageLabel(completedStamp(item) || (item ? item.createdAt : 0), say, localeId)
	});
}
/**
* Move one open note to `toIndex` among the open notes.
*
* Only open notes have an authored order; archived notes sort by archive time,
* so they keep their slots in the stored array and the open notes are poured
* back into the open slots in their new order. Returns the input untouched
* when the move is a no-op or names a note that is not open.
*/
function moveOpenItem(items, itemId, toIndex) {
	if (!Array.isArray(items)) return items;
	const open = items.filter((item) => item && item.done !== true);
	const from = open.findIndex((item) => item.id === itemId);
	if (from < 0) return items;
	const target = Math.max(0, Math.min(open.length - 1, Math.trunc(Number(toIndex) || 0)));
	if (target === from) return items;
	const order = open.slice();
	const [moved] = order.splice(from, 1);
	order.splice(target, 0, moved);
	let next = 0;
	return items.map((item) => item && item.done !== true ? order[next++] : item);
}

// src/client/storage/merge.ts
/**
* Merge the note list another tab may have written with the one this tab holds.
*
* A whole-record write would otherwise overwrite whatever the other tab added
* while this one was typing: two tabs, two additions, one survivor. Writes now
* read the latest record first and union it with the incoming list:
*
*   - both sides keep their additions;
*   - for the same id, the newer `updatedAt` wins;
*   - ids this tab removed since its last read (`base`) stay removed.
*
* A deletion made in another tab is not observable from here, so a concurrent
* write can bring that note back. Losing a note is worse than reviving one.
*
* The incoming list supplies the authored order. Notes unseen by this tab
* remain present in their existing relative order.
*/
const stampOf = (item) => {
	if (item && Number.isFinite(item.updatedAt)) return item.updatedAt;
	if (item && Number.isFinite(item.createdAt)) return item.createdAt;
	return 0;
};
/** Union two lists by id, honouring this tab's removals. */
function mergeItems(existing, incoming, base = null) {
	const incomingIds = new Set(incoming.map((item) => item && item.id).filter(Boolean));
	const removed = /* @__PURE__ */ new Set();
	if (Array.isArray(base)) {
		for (const item of base) if (item && item.id && !incomingIds.has(item.id)) removed.add(item.id);
	}
	const byId = /* @__PURE__ */ new Map();
	for (const item of existing) if (item && item.id) byId.set(item.id, item);
	for (const item of incoming) {
		if (!item || !item.id) continue;
		const other = byId.get(item.id);
		if (!other || stampOf(item) >= stampOf(other)) byId.set(item.id, item);
	}
	for (const id of removed) byId.delete(id);
	const ordered = [];
	for (const id of incomingIds) {
		const item = byId.get(id);
		if (!item) continue;
		ordered.push(item);
		byId.delete(id);
	}
	return [...ordered, ...byId.values()];
}

// src/client/storage/session.ts
/** Read and retire legacy session records during workspace migration. */
/** Empty note store. */
function emptySessionStore() {
	return {
		version: 1,
		sessions: {}
	};
}
const bucket$1 = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
/**
* Read the browser store; corrupt or unavailable reads as empty.
* An unreadable payload is parked under `<key>.corrupt` first, so the next
* write cannot destroy the only copy of a user's notes.
*/
function readLocalStore$1() {
	const ls = storage();
	if (!ls) return emptySessionStore();
	let raw;
	try {
		raw = ls.getItem(SESSION_STORAGE_KEY);
	} catch {
		return emptySessionStore();
	}
	if (!raw) return emptySessionStore();
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		setAsideUnreadable(SESSION_STORAGE_KEY, raw);
		return emptySessionStore();
	}
	const sessions = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed.sessions : void 0;
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || sessions !== void 0 && (!sessions || typeof sessions !== "object" || Array.isArray(sessions))) {
		setAsideUnreadable(SESSION_STORAGE_KEY, raw);
		return emptySessionStore();
	}
	return {
		version: 1,
		sessions: bucket$1(sessions)
	};
}
/** Read the whole note store from whichever medium is authoritative now. */
function readSessionStore() {
	if (hostAuthoritative()) return {
		version: 1,
		sessions: { ...hostTable("sessions") }
	};
	return readLocalStore$1();
}
/** Persist the whole browser store; the single writer for the legacy key. */
function writeSessionStore(store) {
	const ls = storage();
	if (!ls) return false;
	try {
		ls.setItem(SESSION_STORAGE_KEY, JSON.stringify({
			version: 1,
			sessions: bucket$1(store && store.sessions)
		}));
		notifyTodoChange();
		return true;
	} catch {
		return false;
	}
}

// src/client/storage/workspace.ts
/** Workspace note lists and migration of the browser's legacy session lists. */
const text$1 = (value) => value ? String(value) : "";
const bucket = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
function seededOf(record) {
	const raw = record && record.seededSessionIds;
	if (!Array.isArray(raw)) return [];
	const seen = /* @__PURE__ */ new Set();
	const next = [];
	for (const value of raw) {
		const id = text$1(value);
		if (!id || seen.has(id)) continue;
		seen.add(id);
		next.push(id);
	}
	return next;
}
/** Empty workspace-note store. */
function emptyWorkspaceStore() {
	return {
		version: 1,
		workspaces: {},
		pendingSessionCleanup: []
	};
}
/**
* Read the browser workspace store; corrupt or unavailable reads as empty.
* An unreadable payload is parked under `<key>.corrupt` before any write.
*/
function readLocalStore() {
	const ls = storage();
	if (!ls) return emptyWorkspaceStore();
	let raw;
	try {
		raw = ls.getItem(WORKSPACE_STORAGE_KEY);
	} catch {
		return emptyWorkspaceStore();
	}
	if (!raw) return emptyWorkspaceStore();
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		setAsideUnreadable(WORKSPACE_STORAGE_KEY, raw);
		return emptyWorkspaceStore();
	}
	const workspaces = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed.workspaces : void 0;
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || workspaces !== void 0 && (!workspaces || typeof workspaces !== "object" || Array.isArray(workspaces))) {
		setAsideUnreadable(WORKSPACE_STORAGE_KEY, raw);
		return emptyWorkspaceStore();
	}
	return {
		version: 1,
		workspaces: bucket(workspaces),
		pendingSessionCleanup: Array.isArray(parsed.pendingSessionCleanup) ? parsed.pendingSessionCleanup.filter((id) => typeof id === "string") : []
	};
}
/** Read the workspace-note store from the authoritative medium. */
function readWorkspaceStore() {
	if (hostAuthoritative()) return {
		version: 1,
		workspaces: { ...hostTable("workspaces") }
	};
	return readLocalStore();
}
/** Persist the whole browser workspace store. */
function writeWorkspaceStore(store) {
	const ls = storage();
	if (!ls) return false;
	try {
		ls.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify({
			version: 1,
			workspaces: bucket(store && store.workspaces),
			...store.pendingSessionCleanup?.length ? { pendingSessionCleanup: store.pendingSessionCleanup } : {}
		}));
		notifyTodoChange();
		return true;
	} catch {
		return false;
	}
}
/** One workspace's memo record. */
function readWorkspaceRecord(workspaceId) {
	const key = text$1(workspaceId);
	if (!key) return {
		items: [],
		updatedAt: 0,
		seededSessionIds: []
	};
	if (hostAuthoritative()) {
		const record = hostRecord("workspaces", key);
		return {
			items: normalizeItems(record && record.items),
			updatedAt: record && Number.isFinite(record.updatedAt) ? record.updatedAt : 0,
			seededSessionIds: seededOf(record)
		};
	}
	const record = readLocalStore().workspaces[key];
	return {
		items: normalizeItems(record && record.items),
		updatedAt: record && Number.isFinite(record.updatedAt) ? record.updatedAt : 0,
		seededSessionIds: seededOf(record)
	};
}
/**
* Persist one workspace's memo record.
*
* Host mode sends only the changed notes; the host merges them atomically.
* Local mode reads the latest stored record and merges by id, keeping this
* tab's deletions (`base`) from being resurrected by a concurrent writer.
*
* @returns resolution with whether the write was accepted/durable
*/
async function writeWorkspaceRecord(workspaceId, record, base = null) {
	const key = text$1(workspaceId);
	if (!key) return false;
	const mode = storageMode();
	if (mode === "probing" || mode === "error") return false;
	if (mode === "host") return commitList(key, normalizeItems(record && record.items));
	const store = readLocalStore();
	const previous = store.workspaces[key];
	const seededSource = Array.isArray(record.seededSessionIds) ? record : previous;
	store.workspaces[key] = {
		workspaceId: key,
		updatedAt: Math.max(record.updatedAt || 0, previous && Number.isFinite(previous.updatedAt) ? previous.updatedAt : 0) || Date.now(),
		items: mergeItems(normalizeItems(previous && previous.items), normalizeItems(record.items), base),
		seededSessionIds: seededOf(seededSource)
	};
	return writeWorkspaceStore(store);
}
/** Migrate known memberships, with a recovery bucket for unassigned browser notes. */
async function migrateWorkspaceNotes(workspaces) {
	if (storageMode() === "probing" || storageMode() === "error") return;
	const sessions = readSessionStore();
	if (Object.keys(sessions.sessions).length === 0) return;
	const owners = new Map(workspaces.flatMap((workspace) => workspace.sessionIds.map((id) => [id, workspace.workspaceId])));
	if (storageMode() === "host") {
		const membersByWorkspace = /* @__PURE__ */ new Map();
		for (const id of Object.keys(sessions.sessions)) {
			const owner = owners.get(id) ?? "sideby-note:unassigned";
			const members = membersByWorkspace.get(owner);
			if (members) members.push(id);
			else membersByWorkspace.set(owner, [id]);
		}
		for (const [workspaceId, members] of membersByWorkspace) await ensureWorkspace(workspaceId, members);
		return;
	}
	if (storageMode() === "local") moveBrowserSessions(sessions, owners);
}
function moveBrowserSessions(sessions, owners) {
	const store = readLocalStore();
	const moved = new Set(store.pendingSessionCleanup);
	for (const [sessionId, source] of Object.entries(sessions.sessions)) {
		if (moved.has(sessionId)) continue;
		const workspaceId = owners.get(sessionId) ?? "sideby-note:unassigned";
		const record = store.workspaces[workspaceId];
		const items = normalizeItems(record?.items);
		const seen = new Set(items.map((item) => item.id));
		for (const item of normalizeItems(source?.items)) {
			if (seen.has(item.id)) continue;
			seen.add(item.id);
			items.push(item);
		}
		store.workspaces[workspaceId] = {
			workspaceId,
			updatedAt: Math.max(record?.updatedAt || 0, source?.updatedAt || 0),
			items,
			seededSessionIds: [.../* @__PURE__ */ new Set([...seededOf(record), sessionId])]
		};
		moved.add(sessionId);
	}
	if (writeWorkspaceStore({
		...store,
		pendingSessionCleanup: [...moved]
	}) && writeSessionStore({ sessions: {} })) writeWorkspaceStore({
		...store,
		pendingSessionCleanup: []
	});
}
/** Project the workspace filter or the aggregate view from the same records. */
function readVisibleNotes(workspaceId) {
	return (workspaceId ? [[workspaceId, readWorkspaceRecord(workspaceId)]] : Object.entries(readWorkspaceStore().workspaces)).flatMap(([owner, record]) => normalizeItems(record?.items).map((item) => ({
		...item,
		id: workspaceId ? item.id : JSON.stringify([owner, item.id]),
		noteId: item.id,
		workspaceId: owner
	})));
}

// src/client/ui/toastSeat.ts
/** Frame-wide toast seat: one notice at a time, dismissed when it fades. */
const h$12 = react.default.createElement;
const TOAST_COPY = {
	copied: {
		key: "toast.copied",
		tone: "success"
	},
	inserted: {
		key: "toast.inserted",
		tone: "success"
	},
	archived: {
		key: "attachment.archived",
		tone: "success"
	},
	attachmentLimit: { key: "attachment.limit" },
	attachmentBusy: { key: "attachment.busy" },
	attachmentDraftChanged: { key: "attachment.draftChanged" },
	attachmentTextInserted: {
		key: "attachment.textInserted",
		tone: "success"
	},
	attachmentUnavailable: { key: "attachment.unavailable" },
	attachmentUploadFailed: { key: "attachment.uploadFailed" },
	recalled: {
		key: "toast.recalled",
		tone: "success"
	},
	recallBlocked: { key: "toast.recallBlocked" },
	cleared: {
		key: "toast.cleared",
		tone: "success"
	},
	clearPartial: { key: "toast.clearPartial" },
	copyFailed: { key: "toast.copyFailed" },
	insertFailed: { key: "toast.insertFailed" },
	archiveFailed: { key: "toast.archiveFailed" },
	pathCopied: {
		key: "toast.pathCopied",
		tone: "success"
	},
	revealFailed: { key: "toast.revealFailed" },
	saveFailed: { key: "toast.saveFailed" }
};
const WarningIcon = icon("IconWarningOutlineRegular");
/**
* Settled outcomes (copy, insert, recall, write failure) live in the frame,
* not inside the panel: the panel unmounts on close, the banner must not.
*/
function createToastSeat(tr) {
	const source = (() => {
		let notice = null;
		let sequence = 0;
		const listeners = /* @__PURE__ */ new Set();
		const publish = (next) => {
			notice = next;
			for (const listener of listeners) listener();
		};
		return {
			hooks: { notice: {
				getSnapshot: () => notice,
				subscribe: (listener) => {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				}
			} },
			show(kind) {
				sequence += 1;
				publish({
					kind,
					sequence
				});
			},
			/** Localized text chosen at call time (storage notices carry variables). */
			showText(text, tone = "success") {
				sequence += 1;
				publish({
					text,
					tone,
					sequence
				});
			},
			dismiss() {
				publish(null);
			}
		};
	})();
	/** The slot the layout mounts once; it owns the only visible notice. */
	function ToastHost(props) {
		const notice = react.default.useSyncExternalStore(source.hooks.notice.subscribe, source.hooks.notice.getSnapshot);
		if (!notice || !Toast) return null;
		const copy = notice.text ? { tone: notice.tone } : TOAST_COPY[notice.kind] || TOAST_COPY.saveFailed;
		const bound = !notice.text && props && typeof props.t === "function" ? props.t(copy.key) : "";
		const text = notice.text || (bound && bound !== copy.key ? bound : tr(copy.key));
		return h$12(Toast, {
			key: notice.sequence,
			text,
			tone: copy.tone,
			icon: copy.tone ? void 0 : WarningIcon ? h$12(WarningIcon, { size: 16 }) : void 0,
			onDone: source.dismiss
		});
	}
	return {
		show: source.show,
		showText: source.showText,
		ToastHost
	};
}

// src/client/ui/headerEntry.ts
const HEADER_ICON = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.25 2.75h6.5l3 3v7.5c0 .55-.45 1-1 1H3.25c-.55 0-1-.45-1-1V3.75c0-.55.45-1 1-1Z\"/><path d=\"M9.75 2.75v3h3\"/><path d=\"M4.9 7.6h5.4M4.9 9.9h3.6\" stroke-linecap=\"round\"/></svg>";
function createHeaderEntry({ getSessionId, getActiveAnchor, getLocaleId, getShortcut, tr, onOpen, onAnchor }) {
	const buttonForSession = () => {
		const button = document.querySelector(".dsh-an-headerBtn");
		return button?.dataset.sessionId === getSessionId() ? button : null;
	};
	const refreshShortcut = () => {
		const button = buttonForSession();
		if (!button) return;
		const shortcut = getShortcut();
		const available = shortcut && !shortcut.issue && shortcut.conflicts.length === 0;
		const keys = available ? shortcut.keys.join(" ") : "";
		const title = button.dataset.entryTitle ?? "";
		button.title = keys ? `${title} (${keys})` : title;
		if (available && shortcut.aria) button.setAttribute("aria-keyshortcuts", shortcut.aria);
		else button.removeAttribute("aria-keyshortcuts");
	};
	const refresh = () => {
		const sessionId = getSessionId();
		let button = document.querySelector(".dsh-an-headerBtn");
		if (!sessionId) {
			if (button) button.remove();
			return;
		}
		const ready = sessionReadyFor(sessionId);
		const utilities = document.querySelector("[class*=\"_headerUtilities\"]");
		const corner = ready ? null : document.querySelector("[class*=\"_headerCorner\"]");
		const host = utilities || corner;
		if (!host) {
			if (button) button.remove();
			return;
		}
		const workspace = workspaceForSession(sessionId);
		const workspaceFilter = workspace?.workspaceId ?? null;
		const catalogPending = !workspace && !workspaceCatalogReady();
		const mode = storageMode();
		const open = !catalogPending && (mode === "host" || mode === "local") ? readVisibleNotes(workspaceFilter).filter((item) => !item.done).length : null;
		if (!button) {
			button = document.createElement("button");
			button.type = "button";
			button.className = "dsh-an-headerBtn";
			button.addEventListener("pointerdown", (event) => event.stopPropagation());
			button.addEventListener("click", (event) => {
				event.preventDefault();
				event.stopPropagation();
				onOpen(getSessionId(), button);
			});
		}
		if (host === corner) {
			if (host.firstElementChild !== button) host.insertBefore(button, host.firstElementChild);
		} else if (button.parentElement !== host) host.appendChild(button);
		button.dataset.anchor = host === utilities ? "utilities" : "corner";
		button.dataset.sessionId = sessionId;
		onAnchor(sessionId, button);
		const expanded = getActiveAnchor() === button ? "true" : "false";
		button.dataset.active = expanded;
		button.setAttribute("aria-expanded", expanded);
		button.dataset.scope = catalogPending ? "pending" : workspace ? "workspace" : "global";
		const signature = `${getLocaleId()}:${open}`;
		if (button.dataset.signature !== signature) {
			const icon = document.createElement("span");
			icon.className = "dsh-an-headerIcon";
			icon.innerHTML = HEADER_ICON;
			button.replaceChildren(icon);
			if (open !== null && open > 0) {
				const count = document.createElement("span");
				count.className = "dsh-an-headerCount";
				count.textContent = open > 99 ? "99+" : String(open);
				button.appendChild(count);
			}
			button.dataset.signature = signature;
		}
		const scope = workspace ? tr("item.currentWorkspace", { workspace: workspace.title || tr("scope.workspace") }) : tr("scope.global");
		const count = open === null ? tr(mode === "error" ? "storage.hostError" : "storage.loading") : tr("dock.count", { n: open });
		const detail = catalogPending ? tr("scope.loading") : `${scope} · ${count}`;
		button.dataset.entryTitle = `${tr("title")} · ${detail}`;
		refreshShortcut();
		button.setAttribute("aria-label", `${tr("dock.open")} · ${detail}`);
	};
	/** Watch the store, the DOM and the viewport; returns the cleanup. */
	const attach = (onDispose) => {
		let scheduled = false;
		const schedule = () => {
			if (scheduled) return;
			scheduled = true;
			requestAnimationFrame(() => {
				scheduled = false;
				refresh();
			});
		};
		const onStorage = (event) => {
			if (event.key === "dsh.aside-note" || event.key === "dsh.aside-note.workspaces" || event.key === null) schedule();
		};
		TODO_LISTENERS.add(schedule);
		window.addEventListener("storage", onStorage);
		const observer = new MutationObserver(schedule);
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
		refresh();
		return () => {
			TODO_LISTENERS.delete(schedule);
			window.removeEventListener("storage", onStorage);
			observer.disconnect();
			onDispose();
			for (const button of document.querySelectorAll(".dsh-an-headerBtn")) button.remove();
		};
	};
	return {
		refresh,
		attach,
		buttonForSession,
		refreshShortcut
	};
}

// src/client/storage/prefs.ts
/** Panel geometry, list scope and section state. */
/** Read the persisted right-panel width, clamped for the current viewport. */
function readPanelWidth() {
	const ls = storage();
	const max = Math.min(720, Math.max(280, window.innerWidth - 32));
	try {
		const saved = ls && Number(ls.getItem("dsh.aside-note.panel-width"));
		if (Number.isFinite(saved) && saved > 0) return Math.max(280, Math.min(max, saved));
	} catch {}
	return Math.max(280, Math.min(max, 360));
}
/** Persist the right-panel width so it survives reopening the popover. */
function writePanelWidth(width) {
	const ls = storage();
	if (!ls) return;
	try {
		ls.setItem(PANEL_WIDTH_KEY, String(Math.round(width)));
	} catch {}
}
/** Read the persisted right-panel height; 0 means content-sized. */
function readPanelHeight() {
	const ls = storage();
	try {
		const saved = ls && Number(ls.getItem("dsh.aside-note.panel-height"));
		if (Number.isFinite(saved) && saved > 0) return saved;
	} catch {}
	return 0;
}
/** Persist the right-panel height; 0 restores content sizing. */
function writePanelHeight(height) {
	const ls = storage();
	if (!ls) return;
	try {
		if (height > 0) ls.setItem(PANEL_HEIGHT_KEY, String(Math.round(height)));
		else ls.removeItem(PANEL_HEIGHT_KEY);
	} catch {}
}
/** Read the last chosen list scope; "workspace" is the default. */
function readScopeMode() {
	if (hostAuthoritative()) return (pendingHostScopeMode() ?? hostPrefs().sidebyNoteScopeMode) === "global" ? "global" : SCOPE_MODE_DEFAULT;
	try {
		return (storage() && storage().getItem("dsh.aside-note.scope-mode")) === "global" ? "global" : SCOPE_MODE_DEFAULT;
	} catch {
		return SCOPE_MODE_DEFAULT;
	}
}
function writeScopeMode(mode) {
	if (storageMode() === "error") return;
	if (storageMode() === "host") {
		setHostScopeMode(mode);
		return;
	}
	try {
		const ls = storage();
		if (ls) ls.setItem(SCOPE_MODE_KEY, mode === "global" ? "global" : "workspace");
	} catch {}
}
/** Remembered section state; corrupt or missing storage falls back to defaults. */
function readSectionState() {
	const fallback = {
		open: SECTION_STATE_DEFAULT.open,
		done: SECTION_STATE_DEFAULT.done
	};
	const ls = storage();
	if (!ls) return fallback;
	try {
		const raw = ls.getItem(SECTION_STATE_KEY);
		if (!raw) return fallback;
		const saved = JSON.parse(raw);
		if (!saved || typeof saved !== "object") return fallback;
		return {
			open: typeof saved.open === "boolean" ? saved.open : fallback.open,
			done: typeof saved.done === "boolean" ? saved.done : fallback.done
		};
	} catch {
		return fallback;
	}
}
/** Persist the section state immediately; storage failures are ignored. */
function writeSectionState(state) {
	const ls = storage();
	if (!ls) return;
	try {
		ls.setItem(SECTION_STATE_KEY, JSON.stringify({
			open: state.open === true,
			done: state.done === true
		}));
	} catch {}
}

// src/client/ui/useSessionMemoStore.ts
/** The filtered view and a serialized writer for workspace records. */
function useMemoStore(workspaceFilter) {
	const [allItems, setAllItems] = react.default.useState(() => readVisibleNotes(null));
	const [syncError, setSyncError] = react.default.useState(false);
	const chainRef = react.default.useRef(Promise.resolve());
	react.default.useLayoutEffect(() => {
		setSyncError(false);
	}, [workspaceFilter]);
	react.default.useEffect(() => {
		const refresh = () => setAllItems(readVisibleNotes(null));
		const onStorage = (event) => {
			if (event.key === "dsh.aside-note" || event.key === "dsh.aside-note.workspaces" || event.key === null) refresh();
		};
		const onReady = () => {
			refresh();
			if (storageMode() === "host") setSyncError(false);
		};
		TODO_LISTENERS.add(refresh);
		STORE_READY_LISTENERS.add(onReady);
		window.addEventListener("storage", onStorage);
		return () => {
			TODO_LISTENERS.delete(refresh);
			STORE_READY_LISTENERS.delete(onReady);
			window.removeEventListener("storage", onStorage);
		};
	}, []);
	return {
		allItems,
		syncError,
		commit: react.default.useCallback((workspaceId, update) => {
			const run = chainRef.current.then(async () => {
				const current = readWorkspaceRecord(workspaceId);
				const next = {
					...current,
					items: normalizeItems(update(current.items)),
					updatedAt: Date.now()
				};
				const ok = await writeWorkspaceRecord(workspaceId, next, current.items);
				setSyncError(!ok);
				if (ok) setAllItems(readVisibleNotes(null));
				return ok;
			});
			chainRef.current = run.catch(() => void 0);
			return run;
		}, [])
	};
}

// src/client/ui/position.ts
/**
* Mark the section head that is actually pinned to the scroller's top edge.
* Sticky heads stay transparent in flow; only the pinned one takes the menu
* group-header fill, so no full-width layer sits over the list at rest.
*/
function syncStickyHeads(node) {
	const areaTop = node.getBoundingClientRect().top;
	for (const head of node.querySelectorAll(".dsh-an-sectionHead, .dsh-an-doneHead")) {
		const section = head.parentElement;
		if (!section) continue;
		const rect = section.getBoundingClientRect();
		head.toggleAttribute("data-stuck", rect.top < areaTop && rect.bottom > areaTop);
	}
}
/**
* Frame-owned top safety margin for floating surfaces. Read from the layout
* rather than baked in, so macOS window chrome and the Windows titlebar both
* keep their clearance without this page touching the global variable.
*/
function overlayTopFloor(margin) {
	try {
		const raw = getComputedStyle(document.body).getPropertyValue("--dsh-frame-overlay-top").trim();
		const value = Number.parseFloat(raw);
		if (Number.isFinite(value) && value > 0) return Math.max(margin, value);
	} catch {}
	return margin;
}
/**
* Fixed panel placement: a right-side panel for the experimental entry,
* otherwise below the anchor. Both stay inside the viewport margin, and the
* gap side is only abandoned when the opposite side genuinely fits.
*/
function memoPopoverStyle(anchor, placement, requestedWidth, requestedHeight) {
	const margin = window.innerWidth <= 480 ? 12 : 16;
	const topFloor = overlayTopFloor(margin);
	const available = Math.max(280, window.innerWidth - margin * 2);
	const width = Math.max(280, Math.min(720, available, requestedWidth || 360));
	if (placement === "right") {
		const rect = anchor && anchor.isConnected ? anchor.getBoundingClientRect() : null;
		let desiredRight = rect && rect.width > 0 ? rect.right : window.innerWidth - margin;
		const sidebar = [...document.querySelectorAll("[data-sidebar-right-panel][data-sidebar-right-open]")].find((node) => {
			const box = node.getBoundingClientRect();
			return box.width > 24 && box.left > 0 && box.left < window.innerWidth - 24;
		});
		if (sidebar) desiredRight = Math.min(desiredRight, sidebar.getBoundingClientRect().left - 8);
		const rightInset = Math.max(margin, Math.min(window.innerWidth - width - margin, window.innerWidth - desiredRight));
		const top = rect && rect.width > 0 ? Math.max(topFloor, Math.round(rect.bottom + 8)) : topFloor;
		const maxHeight = Math.max(160, window.innerHeight - top - margin);
		const height = requestedHeight ? Math.max(Math.min(240, maxHeight), Math.min(maxHeight, requestedHeight)) : 0;
		const style = {
			right: `${rightInset}px`,
			left: "auto",
			top: `${top}px`,
			width: `${width}px`,
			maxHeight: `${maxHeight}px`
		};
		if (height) style.height = `${height}px`;
		return style;
	}
	const maxHeight = Math.max(160, Math.min(460, window.innerHeight - topFloor - margin));
	if (!anchor) return {
		left: `${margin}px`,
		top: `${topFloor}px`,
		width: `${width}px`,
		maxHeight: `${maxHeight}px`
	};
	const rect = anchor.getBoundingClientRect();
	const left = rect.left < 420 ? Math.max(margin, rect.left) : Math.max(margin, Math.min(rect.right - width, window.innerWidth - width - margin));
	let top = rect.bottom + 8;
	if (top + maxHeight > window.innerHeight - margin) top = Math.max(topFloor, rect.top - maxHeight - 8);
	return {
		left: `${left}px`,
		top: `${top}px`,
		width: `${width}px`,
		maxHeight: `${maxHeight}px`
	};
}

// src/client/ui/usePanelGeometry.ts
/** Panel geometry: remembered width/height, pointer and keyboard resize, placement. */
function usePanelGeometry(anchorRef, placement, panelRef) {
	const [panelWidth, setPanelWidth] = react.default.useState(readPanelWidth);
	const [panelHeight, setPanelHeight] = react.default.useState(readPanelHeight);
	const [style, setStyle] = react.default.useState(() => memoPopoverStyle(anchorRef.current, placement, panelWidth, panelHeight));
	const panelWidthRef = react.default.useRef(panelWidth);
	const panelHeightRef = react.default.useRef(panelHeight);
	const lastStyleRef = react.default.useRef("");
	const updatePosition = react.default.useCallback(() => {
		if (anchorRef.current && !anchorRef.current.isConnected) return;
		if (anchorRef.current || placement === "right") {
			const next = memoPopoverStyle(anchorRef.current, placement, panelWidth, panelHeight);
			const key = JSON.stringify(next);
			if (key === lastStyleRef.current) return;
			lastStyleRef.current = key;
			setStyle(next);
		}
	}, [
		anchorRef,
		placement,
		panelWidth,
		panelHeight
	]);
	react.default.useEffect(() => {
		panelWidthRef.current = panelWidth;
	}, [panelWidth]);
	react.default.useEffect(() => {
		panelHeightRef.current = panelHeight;
	}, [panelHeight]);
	const clampPanelWidth = (value) => {
		const max = Math.min(720, Math.max(280, window.innerWidth - 32));
		return Math.max(280, Math.min(max, value));
	};
	const commitPanelWidth = (value) => {
		const next = clampPanelWidth(value);
		panelWidthRef.current = next;
		setPanelWidth(next);
		writePanelWidth(next);
	};
	const startPanelResize = (event) => {
		if (event.button !== 0) return;
		event.preventDefault();
		const startX = event.clientX;
		const startWidth = panelWidthRef.current;
		const onMove = (moveEvent) => {
			const next = clampPanelWidth(startWidth + (startX - moveEvent.clientX));
			panelWidthRef.current = next;
			setPanelWidth(next);
		};
		const onUp = () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp);
			document.body.style.userSelect = "";
			document.body.style.cursor = "";
			writePanelWidth(panelWidthRef.current);
		};
		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp, { once: true });
		document.body.style.userSelect = "none";
		document.body.style.cursor = "ew-resize";
	};
	const onPanelResizeKeyDown = (event) => {
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			commitPanelWidth(panelWidthRef.current + 16);
		} else if (event.key === "ArrowRight") {
			event.preventDefault();
			commitPanelWidth(panelWidthRef.current - 16);
		} else if (event.key === "Home") {
			event.preventDefault();
			commitPanelWidth(360);
		}
	};
	const clampPanelHeight = (value) => {
		const max = Math.max(240, window.innerHeight - 64 - 16);
		return Math.max(240, Math.min(max, value));
	};
	const commitPanelHeight = (value) => {
		const next = value > 0 ? clampPanelHeight(value) : 0;
		panelHeightRef.current = next;
		setPanelHeight(next);
		writePanelHeight(next);
	};
	const startPanelHeightResize = (event) => {
		if (event.button !== 0) return;
		event.preventDefault();
		const startY = event.clientY;
		const startHeight = panelHeightRef.current || (panelRef.current ? panelRef.current.getBoundingClientRect().height : 360);
		const onMove = (moveEvent) => {
			const next = clampPanelHeight(startHeight + (moveEvent.clientY - startY));
			panelHeightRef.current = next;
			setPanelHeight(next);
		};
		const onUp = () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp);
			document.body.style.userSelect = "";
			document.body.style.cursor = "";
			writePanelHeight(panelHeightRef.current);
		};
		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp, { once: true });
		document.body.style.userSelect = "none";
		document.body.style.cursor = "ns-resize";
	};
	const onPanelHeightKeyDown = (event) => {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			commitPanelHeight((panelHeightRef.current || 360) + 16);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			commitPanelHeight((panelHeightRef.current || 360) - 16);
		} else if (event.key === "Home") {
			event.preventDefault();
			commitPanelHeight(0);
		}
	};
	react.default.useLayoutEffect(() => {
		updatePosition();
		window.addEventListener("resize", updatePosition);
		window.addEventListener("scroll", updatePosition, true);
		return () => {
			window.removeEventListener("resize", updatePosition);
			window.removeEventListener("scroll", updatePosition, true);
		};
	}, [updatePosition]);
	react.default.useEffect(() => {
		const anchor = anchorRef.current;
		if (!anchor || typeof ResizeObserver !== "function") return void 0;
		const target = anchor.closest("[class*=\"_header\"]") || anchor;
		const observer = new ResizeObserver(updatePosition);
		observer.observe(target);
		return () => observer.disconnect();
	}, [anchorRef, updatePosition]);
	react.default.useEffect(() => {
		const timer = window.setInterval(updatePosition, 400);
		return () => window.clearInterval(timer);
	}, [updatePosition]);
	return {
		style,
		commitPanelWidth,
		commitPanelHeight,
		startPanelResize,
		startPanelHeightResize,
		onPanelResizeKeyDown,
		onPanelHeightKeyDown
	};
}

// src/client/ui/useSections.ts
/** Open/completed section visibility, remembered across panel opens. */
function useSections() {
	const [initial] = react.default.useState(readSectionState);
	const [showOpen, setShowOpen] = react.default.useState(initial.open);
	const [showDone, setShowDone] = react.default.useState(initial.done);
	const sectionsRef = react.default.useRef(initial);
	/** Apply one section state and remember it right away, using the next value. */
	const applySections = (next) => {
		sectionsRef.current = next;
		setShowOpen(next.open);
		setShowDone(next.done);
		writeSectionState(next);
	};
	return {
		sectionsRef,
		showOpen,
		showDone,
		applySections,
		toggleOpen: () => applySections({
			open: !sectionsRef.current.open,
			done: sectionsRef.current.done
		}),
		toggleDone: () => applySections({
			open: sectionsRef.current.open,
			done: !sectionsRef.current.done
		})
	};
}

// src/client/update/releaseHistory.ts
/** Enough history to explain a long gap without turning the card into a feed. */
const MAX_RELEASE_HISTORY = 6;
function core(version) {
	return String(version ?? "").replace(/^v/i, "").split("-", 1)[0].split(".").map((part) => Number.parseInt(part, 10) || 0);
}
/** A version carrying a prerelease part, e.g. `1.2.0-beta.1`. */
function isPrerelease(version) {
	return /^\D*\d+\.\d+\.\d+-/.test(String(version ?? "").trim());
}
/**
* Full ordering of two versions, prerelease identifiers included.
*
* A beta build asks for the notes between `1.2.0-beta.1` and `1.2.0-beta.2`;
* comparing the cores alone would call those equal and leave the card with no
* notes at all, which is exactly the case a beta test needs to read.
*/
function compareVersions(a, b) {
	const left = core(a);
	const right = core(b);
	for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
		const difference = (left[index] || 0) - (right[index] || 0);
		if (difference !== 0) return difference > 0 ? 1 : -1;
	}
	const leftPre = prerelease(a);
	const rightPre = prerelease(b);
	if (leftPre.length === 0 && rightPre.length === 0) return 0;
	if (leftPre.length === 0) return 1;
	if (rightPre.length === 0) return -1;
	for (let index = 0; index < Math.max(leftPre.length, rightPre.length); index += 1) {
		const x = leftPre[index];
		const y = rightPre[index];
		if (x === void 0) return -1;
		if (y === void 0) return 1;
		if (x === y) continue;
		const xNumeric = /^\d+$/.test(x);
		const yNumeric = /^\d+$/.test(y);
		if (xNumeric && yNumeric) return Number(x) > Number(y) ? 1 : -1;
		if (xNumeric) return -1;
		if (yNumeric) return 1;
		return x > y ? 1 : -1;
	}
	return 0;
}
/** The prerelease identifiers of a version, or an empty list. */
function prerelease(version) {
	const normalized = String(version ?? "").trim().replace(/^v/i, "");
	const dash = normalized.indexOf("-");
	if (dash === -1) return [];
	const tail = normalized.slice(dash + 1).split("+")[0];
	return tail === "" ? [] : tail.split(".");
}
/** A `x.y.z` or `x.y.z-prerelease` tag, with the `v` prefix and whitespace removed. */
function normalizeVersion(version) {
	const normalized = String(version ?? "").trim().replace(/^v/i, "");
	return /^\d+(\.\d+)*(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(normalized) ? normalized : "";
}
/**
* Filter the feed down to the releases the user is about to receive:
* newer than `current`, not newer than `latest`, newest first, capped.
*/
function selectReleaseHistory(list, query) {
	const max = query.max && query.max > 0 ? query.max : 6;
	const seen = /* @__PURE__ */ new Set();
	const entries = [];
	const allowPrerelease = isPrerelease(query.current) && isPrerelease(query.latest ?? "");
	for (const item of Array.isArray(list) ? list : []) {
		const release = item;
		if (!release || typeof release !== "object") continue;
		if (release.draft === true) continue;
		if (release.prerelease === true && !allowPrerelease) continue;
		const version = normalizeVersion(typeof release.version === "string" ? release.version : release.tag_name);
		if (!version || seen.has(version)) continue;
		if (compareVersions(version, query.current) <= 0) continue;
		if (query.latest && compareVersions(version, query.latest) > 0) continue;
		seen.add(version);
		const url = release.url ?? release.html_url;
		const publishedAt = release.publishedAt ?? release.published_at;
		entries.push({
			version,
			body: typeof release.body === "string" ? release.body : "",
			url: typeof url === "string" ? url : "",
			publishedAt: typeof publishedAt === "string" ? publishedAt : ""
		});
	}
	entries.sort((a, b) => compareVersions(b.version, a.version));
	return {
		entries: entries.slice(0, max),
		truncated: entries.length > max
	};
}

// src/client/update/latest.ts
/**
* Published-version probes: the version number and the release notes behind it.
*
* The panel is usually installed from a checkout, not from a store, so it asks
* the npm registry first and falls back to the GitHub Release tag. Everything
* here is dependency-injected and free of widget state so the contract test can
* exercise the source order, the one-hour cache and the comparison in Node.
*/
/** npm metadata endpoints in fallback order; the mirror covers slow npmjs routes. */
const UPDATE_REGISTRY_HOSTS = ["https://registry.npmjs.org", "https://registry.npmmirror.com"];
/** GitHub's REST host for this repo, derived from the displayed repo URL. */
const UPDATE_GITHUB_API = `${PLUGIN_REPO_URL.replace("https://github.com/", "https://api.github.com/repos/")}/releases`;
/** Second source: a GitHub Release, for checkouts that are not published to npm. */
const UPDATE_GITHUB_RELEASE_URL = `${UPDATE_GITHUB_API}/latest`;
/** The releases feed; one page is enough for the gap the card is willing to show. */
const UPDATE_GITHUB_RELEASES_URL = `${UPDATE_GITHUB_API}?per_page=50`;
/** A resolved version is reused for an hour, including a miss, to keep opens quiet. */
const UPDATE_TTL_MS = 36e5;
/** A manual check should not hang the panel on a black-holed network. */
const UPDATE_TIMEOUT_MS = 8e3;
/** A version carrying a prerelease part, e.g. `1.2.0-beta.1`. */
function isPrereleaseVersion(version) {
	return /^\D*\d+\.\d+\.\d+-/.test(version.trim());
}
/**
* A prerelease on a channel this project actually publishes.
*
* `1.1.2-beta.1` is a build someone installed on purpose and it should check
* for updates like any other release; `2.1.0-dev` is a local build and must not
* nag. The suffix alone cannot tell them apart, so the channel names do.
*/
function isPublishedChannel(version) {
	return /^\d+\.\d+\.\d+-(?:alpha|beta|rc)\./.test(version.trim());
}
/**
* Full ordering, tolerant of a `v` prefix and short forms, with the prerelease
* identifiers compared as semver does: a release outranks any prerelease on the
* same core, `rc.1` sorts below `rc.2`, and a numeric identifier sorts below an
* alphanumeric one.
*
* The prerelease part matters here: a beta build must see the next beta as an
* update, which a comparison over the core alone would call "the same version".
*/
function compareVersionOrder(a, b) {
	const parse = (version) => {
		const [core, ...rest] = version.trim().replace(/^v/, "").split("-");
		const parts = core.split(".").map((part) => parseInt(part, 10));
		if (parts.length === 0 || parts.some((part) => Number.isNaN(part))) return null;
		const prerelease = rest.join("-");
		return {
			core: parts,
			prerelease: prerelease === "" ? [] : prerelease.split(".")
		};
	};
	const next = parse(a);
	const have = parse(b);
	if (next === null && have === null) return 0;
	if (next === null) return -1;
	if (have === null) return 1;
	for (let index = 0; index < Math.max(next.core.length, have.core.length); index += 1) {
		const left = next.core[index] || 0;
		const right = have.core[index] || 0;
		if (left !== right) return left > right ? 1 : -1;
	}
	if (next.prerelease.length === 0 && have.prerelease.length === 0) return 0;
	if (next.prerelease.length === 0) return 1;
	if (have.prerelease.length === 0) return -1;
	for (let index = 0; index < Math.max(next.prerelease.length, have.prerelease.length); index += 1) {
		const left = next.prerelease[index];
		const right = have.prerelease[index];
		if (left === void 0) return -1;
		if (right === void 0) return 1;
		if (left === right) continue;
		const leftNumeric = /^\d+$/.test(left);
		const rightNumeric = /^\d+$/.test(right);
		if (leftNumeric && rightNumeric) return Number(left) > Number(right) ? 1 : -1;
		if (leftNumeric) return -1;
		if (rightNumeric) return 1;
		return left > right ? 1 : -1;
	}
	return 0;
}
/** Whether `latest` is a newer release than `current`. */
function isNewerVersion(latest, current) {
	return compareVersionOrder(latest, current) > 0;
}
/** A fetch that gives up after {@link UPDATE_TIMEOUT_MS} instead of hanging. */
function fetchWithTimeout(fetchImpl, url) {
	if (typeof AbortController !== "function") return Promise.resolve().then(() => fetchImpl(url));
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), UPDATE_TIMEOUT_MS);
	return Promise.resolve().then(() => fetchImpl(url, { signal: controller.signal })).finally(() => clearTimeout(timer));
}
function createUpdateProbe(options = {}) {
	const fetchImpl = options.fetchImpl || ((url, init) => fetch(url, init));
	const now = options.now || (() => Date.now());
	const ttlMs = options.ttlMs || 36e5;
	let cached = null;
	function readJson(url) {
		return fetchWithTimeout(fetchImpl, url).then((response) => response.ok ? response.json() : null).catch(() => null);
	}
	function readNpmVersion(host, channel) {
		return readJson(`${host}/dsh-sideby-note/${channel}`).then((body) => body !== null && typeof body.version === "string" ? body.version : null);
	}
	function readGitHubVersion() {
		return readJson(UPDATE_GITHUB_RELEASE_URL).then((body) => {
			const tag = body !== null && typeof body.tag_name === "string" ? body.tag_name : "";
			return tag === "" ? null : tag.replace(/^v/, "");
		});
	}
	function latest() {
		if (cached === null || now() - cached.at >= ttlMs) {
			const channels = isPrereleaseVersion(options.currentVersion ?? "") ? ["latest", "next"] : ["latest"];
			cached = {
				at: now(),
				promise: (async () => {
					let best = null;
					for (const host of UPDATE_REGISTRY_HOSTS) {
						let answered = false;
						for (const channel of channels) {
							const version = await readNpmVersion(host, channel);
							if (version === null) continue;
							answered = true;
							if (channel !== "latest" && !isPrereleaseVersion(version)) continue;
							if (best === null || isNewerVersion(version, best)) best = version;
						}
						if (answered) return best;
					}
					return best ?? readGitHubVersion();
				})()
			};
		}
		return cached.promise;
	}
	/** Drop the cached answer so the next call reads the network again. */
	function reset() {
		cached = null;
	}
	return {
		latest,
		reset
	};
}
/** Process-wide probe: one fetch per hour no matter how often the panel opens. */
const updateProbe = createUpdateProbe({ currentVersion: PLUGIN_VERSION });
function fetchLatestVersion() {
	return updateProbe.latest();
}
function readJsonWithTimeout(fetchImpl, url) {
	return fetchWithTimeout(fetchImpl, url).then((response) => response.ok ? response.json() : null).catch(() => null);
}
/**
* Fetch the releases between the running build and the published version.
* GitHub is the only source: the notes live on the Release, not in the npm
* manifest. A missing feed falls back to the single newest tag, and a missing
* release (a tag pushed without a Release) leaves the card with links only.
*/
function createReleaseHistoryProbe(options = {}) {
	const fetchImpl = options.fetchImpl || ((url, init) => fetch(url, init));
	const now = options.now || (() => Date.now());
	const ttlMs = options.ttlMs || 36e5;
	const cached = /* @__PURE__ */ new Map();
	function latest(current, target) {
		const key = `${current}..${target}`;
		const hit = cached.get(key);
		if (hit && now() - hit.at < ttlMs) return hit.promise;
		const entry = {
			at: now(),
			promise: (async () => {
				const list = await readJsonWithTimeout(fetchImpl, UPDATE_GITHUB_RELEASES_URL);
				if (Array.isArray(list)) return selectReleaseHistory(list.map((item) => ({
					version: typeof item?.tag_name === "string" ? item.tag_name : item?.version,
					body: item?.body,
					url: item?.html_url,
					prerelease: item?.prerelease,
					draft: item?.draft,
					publishedAt: item?.published_at
				})), {
					current,
					latest: target,
					max: 6
				});
				const single = await readJsonWithTimeout(fetchImpl, `${UPDATE_GITHUB_API}/tags/v${encodeURIComponent(target)}`);
				if (single === null) return {
					entries: [],
					truncated: false
				};
				const tag = typeof single.tag_name === "string" ? single.tag_name.replace(/^v/, "") : target;
				return {
					entries: [{
						version: tag,
						body: typeof single.body === "string" ? single.body : "",
						url: typeof single.html_url === "string" && single.html_url ? single.html_url : `${PLUGIN_REPO_URL}/releases/tag/v${encodeURIComponent(tag)}`,
						publishedAt: typeof single.published_at === "string" ? single.published_at : ""
					}],
					truncated: false
				};
			})()
		};
		cached.set(key, entry);
		return entry.promise;
	}
	function reset() {
		cached.clear();
	}
	return {
		latest,
		reset
	};
}
/** Process-wide history probe, cached per version gap for an hour. */
const releaseHistoryProbe = createReleaseHistoryProbe();
function fetchReleaseHistory(current, target) {
	return releaseHistoryProbe.latest(current, target);
}
/** Manual check: forget both cached answers so the next calls hit the network. */
function resetUpdateChecks() {
	updateProbe.reset();
	releaseHistoryProbe.reset();
}

// src/client/update/releaseNotes.ts
/** Bounds taken from the published-notes convention, not an editorial limit. */
const MAX_NOTE_GROUPS = 6;
const MAX_NOTE_ITEMS = 40;
const MAX_NOTE_ITEM_CHARS = 600;
const MARKER_RE = /<!--\s*app-update-notes:([A-Za-z-]+):start\s*-->([\s\S]*?)<!--\s*app-update-notes:\1:end\s*-->/g;
const GROUP_RE = /^#{2,4}\s+(.+?)\s*$/;
const ITEM_RE = /^\s*[-*]\s+(.+?)\s*$/;
const LEAD_RE = /^([^。．.!?！？:：]{1,40}?[:：])\s*(\S[\s\S]*)$/;
const TRAILING_PR_REFS_RE = /\s*(?:[（(]\s*#\d+(?:\s*[,，、]\s*#\d+)*\s*[)）])\s*$/;
const HTML_TAG_RE = /<\/?[A-Za-z][^>]*>/g;
const IMAGE_RE = /!\[[^\]]*\]\([^)]*\)/g;
const LINK_RE = /\[([^\]]+)\]\([^)]*\)/g;
const CODE_RE = /`([^`]+)`/g;
const STRONG_RE = /\*\*([^*]+)\*\*|__([^_]+)__/g;
const EMPHASIS_RE = /\*([^*]+)\*|_([^_]+)_/g;
const WHITESPACE_RE = /\s+/g;
const ENTITIES = {
	amp: "&",
	apos: "'",
	gt: ">",
	lt: "<",
	nbsp: " ",
	quot: "\""
};
function decodeEntities(value) {
	return value.replace(/&(#x[0-9a-f]+|#\d+|amp|apos|gt|lt|nbsp|quot);/gi, (match, entity) => {
		const lower = entity.toLowerCase();
		if (Object.prototype.hasOwnProperty.call(ENTITIES, lower)) return ENTITIES[lower];
		const codePoint = lower.startsWith("#x") ? Number.parseInt(lower.slice(2), 16) : Number.parseInt(lower.slice(1), 10);
		if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 1114111) return match;
		try {
			return String.fromCodePoint(codePoint);
		} catch {
			return match;
		}
	});
}
/** Flatten one line of release-note markdown to readable plain text. */
function noteText(value) {
	return decodeEntities(String(value ?? "").replace(HTML_TAG_RE, "").replace(IMAGE_RE, "").replace(LINK_RE, "$1").replace(CODE_RE, "$1").replace(STRONG_RE, (_match, strong, underscored) => strong || underscored).replace(EMPHASIS_RE, (_match, italic, underscored) => italic || underscored).replace(TRAILING_PR_REFS_RE, "")).replace(WHITESPACE_RE, " ").trim();
}
/** Split "**Topic:** rest" into its bold lead and the remaining body. */
function splitNoteLead(value) {
	const text = noteText(value);
	const match = LEAD_RE.exec(text);
	return match ? {
		lead: match[1].trim(),
		body: match[2].trim()
	} : {
		lead: "",
		body: text
	};
}
function truncate(value, maxChars) {
	const characters = Array.from(value);
	return characters.length <= maxChars ? value : `${characters.slice(0, maxChars - 1).join("").trimEnd()}…`;
}
/**
* Locale fallback order for a DSH locale id. A Chinese UI reads the `zh` block,
* everything else reads `en`; either falls back to the other when a release
* only shipped one language.
*/
function noteLocalesFor(locale) {
	return String(locale ?? "").toLowerCase().startsWith("zh") ? ["zh", "en"] : ["en", "zh"];
}
/** The notes block for this locale, or an empty string when the release has none. */
function extractUpdateNotes(body, locale) {
	const blocks = /* @__PURE__ */ new Map();
	for (const match of String(body ?? "").matchAll(MARKER_RE)) {
		const key = match[1].toLowerCase();
		if (!blocks.has(key)) blocks.set(key, match[2]);
	}
	for (const key of noteLocalesFor(locale)) {
		const block = blocks.get(key);
		if (block && block.trim()) return block.trim();
	}
	return "";
}
/** Parse one marker block into headings and bullets. */
function parseReleaseNotes(markdown) {
	const drafts = [];
	let current = null;
	for (const rawLine of String(markdown ?? "").split(/\r?\n/)) {
		const line = rawLine.trimEnd();
		const heading = GROUP_RE.exec(line);
		if (heading) {
			current = {
				title: noteText(heading[1]),
				bullets: []
			};
			drafts.push(current);
			continue;
		}
		const item = ITEM_RE.exec(line);
		if (item) {
			if (current === null) {
				current = {
					title: "",
					bullets: []
				};
				drafts.push(current);
			}
			current.bullets.push(item[1]);
			continue;
		}
		if (line.trim() && current !== null && current.bullets.length > 0) {
			const last = current.bullets.length - 1;
			current.bullets[last] = `${current.bullets[last]} ${line.trim()}`;
		}
	}
	const parsed = [];
	for (const draft of drafts) {
		const items = [];
		for (const bullet of draft.bullets) {
			const text = truncate(noteText(bullet), 600);
			if (text) items.push(splitNoteLead(text));
			if (items.length >= 40) break;
		}
		if (items.length > 0) parsed.push({
			title: draft.title,
			items
		});
		if (parsed.length >= 6) break;
	}
	return parsed;
}
/** Convenience for the panel: extract and parse in one step. */
function updateNotesForLocale(body, locale) {
	return parseReleaseNotes(extractUpdateNotes(body, locale));
}

// src/client/update/host.ts
/**
* The host-side update, as the panel sees it.
*
* The host half of this package exposes two same-origin endpoints; a browser
* cannot install a package itself. Nothing here throws: every branch answers
* with a value the card can render, because "the host has no update route"
* falls back to the manual command rather than looking like a failed install.
*/
/** Where the host listens; keep in sync with `host/route.js`. */
const HOST_APPLY_PATH = "/dsh-sideby-note/update/apply";
/** An install can be slow (pnpm download, build scripts) but not unbounded. */
const APPLY_TIMEOUT_MS = 3e5;
function text(value) {
	return typeof value === "string" && value.trim() !== "" ? value : void 0;
}
/**
* Ask the host to install `target` over the running copy.
*
* @param target exact version, as the version check resolved it
*/
async function applyHostUpdate(target) {
	const controller = typeof AbortController === "function" ? new AbortController() : void 0;
	let timedOut = false;
	const timer = setTimeout(() => {
		timedOut = true;
		controller?.abort();
	}, APPLY_TIMEOUT_MS);
	let response;
	try {
		response = await fetch(HOST_APPLY_PATH, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ target }),
			...controller === void 0 ? {} : { signal: controller.signal }
		});
	} catch {
		if (timedOut) return {
			kind: "error",
			code: "UPDATE_TIMEOUT",
			message: "the host update timed out",
			retryable: true
		};
		return { kind: "unavailable" };
	} finally {
		clearTimeout(timer);
	}
	if (response.status === 404) return { kind: "unavailable" };
	let body;
	try {
		body = await response.json();
	} catch {
		return { kind: "unavailable" };
	}
	if (body?.ok === true) return {
		kind: "ok",
		route: body.route === "dsh-plugin" || body.route === "package-manager" || body.route === "none" ? body.route : "dsh",
		...text(body.previousVersion) === void 0 ? {} : { previousVersion: text(body.previousVersion) },
		installedVersion: text(body.installedVersion) ?? target,
		updated: body.updated === true,
		restartRequired: body.restartRequired === true,
		...text(body.output) === void 0 ? {} : { output: text(body.output) }
	};
	return {
		kind: "error",
		code: text(body?.code) ?? "UPDATE_FAILED",
		message: text(body?.message) ?? "the host refused the update",
		retryable: body?.retryable === true,
		...text(body?.hint) === void 0 ? {} : { hint: text(body.hint) }
	};
}

// src/client/domain/clipboard.ts
/** Clipboard write with a synchronous fallback. */
/** Copy plain text, with a synchronous fallback for restricted clipboards. */
async function copyText(text) {
	try {
		if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
			await navigator.clipboard.writeText(text);
			return true;
		}
	} catch {}
	try {
		const area = document.createElement("textarea");
		area.value = text;
		area.setAttribute("readonly", "");
		area.style.position = "fixed";
		area.style.opacity = "0";
		document.body.appendChild(area);
		area.select();
		const ok = document.execCommand("copy");
		area.remove();
		return ok;
	} catch {
		return false;
	}
}

// src/client/ui/useUpdateCenter.ts
/**
* Update centre state for the panel footer.
*
* Three things are allowed to be independent here: the published version check
* (auto on open, manual on demand), the release notes behind that version
* (loaded as soon as an update is offered), and the in-app update itself
* (one host request that installs over the running copy). Keeping them separate
* means a missing release body cannot take the version check down with it.
*
* The panel never runs a package manager itself. When the host has no update
* route, the card falls back to the exact command the host reports, or pins the
* offered version when the failure has no command of its own.
*/
const CHECK_IDLE = {
	status: "idle",
	latestVersion: null,
	checkedAt: null
};
const NOTES_IDLE = {
	status: "idle",
	entries: [],
	truncated: false
};
const RUN_IDLE = {
	phase: "idle",
	failureCode: null,
	message: null,
	retryable: false,
	refreshRequired: false,
	restartRequired: false,
	installedVersion: null
};
/**
* A manual check stays on screen for at least this long. A fast registry answer
* would otherwise flip the button back in a few milliseconds, which reads as
* "did that do anything?" and invites repeat clicks.
*/
const MIN_CHECK_MS = 3e3;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function terminalRun(phase, patch = {}) {
	return {
		...RUN_IDLE,
		phase,
		...patch
	};
}
function useUpdateCenter(localeId) {
	const [check, setCheck] = react.default.useState(CHECK_IDLE);
	const [notes, setNotes] = react.default.useState(NOTES_IDLE);
	const [expandedVersions, setExpandedVersions] = react.default.useState({});
	const [run, setRun] = react.default.useState(RUN_IDLE);
	const disposed = react.default.useRef(false);
	const runRef = react.default.useRef(RUN_IDLE);
	runRef.current = run;
	/** The offered version, readable from callbacks without re-creating them. */
	const latestRef = react.default.useRef(null);
	latestRef.current = check.latestVersion;
	/** Set before the first await so the same panel cannot start two operations. */
	const starting = react.default.useRef(false);
	react.default.useEffect(() => {
		disposed.current = false;
		return () => {
			disposed.current = true;
		};
	}, []);
	const latestVersion = check.latestVersion;
	react.default.useEffect(() => {
		if ("0.1.0".includes("-") && !isPublishedChannel("0.1.0")) return void 0;
		let active = true;
		fetchLatestVersion().then((version) => {
			if (!active) return;
			if (version === null) return;
			if (isNewerVersion(version, "0.1.0")) setCheck({
				status: "available",
				latestVersion: version,
				checkedAt: Date.now()
			});
			else setCheck({
				status: "current",
				latestVersion: null,
				checkedAt: Date.now()
			});
		});
		return () => {
			active = false;
		};
	}, []);
	const checkNow = react.default.useCallback(async () => {
		if (check.status === "checking") return;
		resetUpdateChecks();
		const startedAt = Date.now();
		const previousOffer = check.latestVersion;
		setCheck((previous) => ({
			...previous,
			status: "checking"
		}));
		setRun(RUN_IDLE);
		const version = await fetchLatestVersion();
		const remaining = MIN_CHECK_MS - (Date.now() - startedAt);
		if (remaining > 0) await sleep(remaining);
		if (disposed.current) return;
		if (version === null) {
			setCheck({
				status: "error",
				latestVersion: previousOffer,
				checkedAt: Date.now()
			});
			return;
		}
		if (isNewerVersion(version, "0.1.0")) {
			const sameRelease = previousOffer !== null && version === previousOffer;
			setCheck({
				status: "available",
				latestVersion: version,
				checkedAt: Date.now()
			});
			if (!sameRelease) {
				setNotes(NOTES_IDLE);
				setExpandedVersions({});
			}
		} else {
			setCheck({
				status: "current",
				latestVersion: null,
				checkedAt: Date.now()
			});
			setNotes(NOTES_IDLE);
			setExpandedVersions({});
		}
	}, [check.status, check.latestVersion]);
	const toggleVersion = react.default.useCallback((version) => {
		setExpandedVersions((previous) => ({
			...previous,
			[version]: previous[version] !== true
		}));
	}, []);
	react.default.useEffect(() => {
		if (check.status !== "available" || check.latestVersion === null) return void 0;
		if (notes.status !== "idle") return void 0;
		let active = true;
		setNotes((previous) => ({
			...previous,
			status: "loading"
		}));
		fetchReleaseHistory(PLUGIN_VERSION, check.latestVersion).then((result) => {
			if (!active) return;
			const entries = result.entries.map((entry) => ({
				version: entry.version,
				url: entry.url,
				groups: updateNotesForLocale(entry.body, localeId)
			}));
			if (entries.length === 0) {
				setNotes({
					status: "error",
					entries: [],
					truncated: false
				});
				return;
			}
			setNotes({
				status: "ready",
				entries,
				truncated: result.truncated
			});
			const newest = entries[0].version;
			setExpandedVersions({ [newest]: true });
		});
		return () => {
			active = false;
		};
	}, [
		check.status,
		check.latestVersion,
		localeId
	]);
	const startUpdate = react.default.useCallback(async () => {
		if (starting.current) return;
		if (runRef.current.phase === "starting" || runRef.current.phase === "running") return;
		if (runRef.current.phase === "done" && runRef.current.installedVersion === latestRef.current) return;
		starting.current = true;
		try {
			setRun(terminalRun("starting"));
			const target = latestRef.current;
			if (target === null) {
				setRun(terminalRun("error", {
					failureCode: "AUTO_UPDATE_UNAVAILABLE",
					retryable: false
				}));
				return;
			}
			setRun(terminalRun("running"));
			const host = await applyHostUpdate(target);
			if (disposed.current) return;
			if (host.kind === "ok") {
				setRun(terminalRun("done", {
					installedVersion: host.installedVersion,
					refreshRequired: !host.restartRequired,
					restartRequired: host.restartRequired
				}));
				return;
			}
			if (host.kind === "error") {
				setRun(terminalRun("error", {
					failureCode: host.code,
					message: host.hint ?? host.message,
					retryable: host.retryable
				}));
				return;
			}
			setRun(terminalRun("error", {
				failureCode: "AUTO_UPDATE_UNAVAILABLE",
				retryable: false
			}));
		} finally {
			starting.current = false;
		}
	}, []);
	const refreshPage = react.default.useCallback(() => {
		try {
			window.location.reload();
		} catch {}
	}, []);
	/** Copy the ready-to-paste update prompt; the caller reports the outcome. */
	const copyPrompt = react.default.useCallback((text) => copyText(text), []);
	const fullReleaseUrl = notes.entries[0]?.url || (latestVersion ? `${"https://github.com/LighghtEeloo/dsh-sideby-note"}/releases/tag/v${latestVersion}` : null);
	return {
		check,
		latestVersion,
		notes,
		expandedVersions,
		releasesUrl: `${PLUGIN_REPO_URL}/releases`,
		run,
		fullReleaseUrl,
		checkNow,
		toggleVersion,
		startUpdate,
		refreshPage,
		copyPrompt
	};
}

// src/client/ui/useComposerDraft.ts
/** The add box: draft persistence, auto-grow and the composer key gestures. */
const uploadsByDraft = /* @__PURE__ */ new Set();
const actionsByDraft = /* @__PURE__ */ new Map();
const sameAttachments = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function useComposerDraft({ draftKey, workspaceId, commit, report, storageInUse, canUpload, focusOnMount }) {
	const key = draftKey ? String(draftKey) : "";
	const [draft, setDraft] = react.default.useState(() => readScopeDrafts(key));
	const draftRef = react.default.useRef(draft);
	const [isUploading, setIsUploading] = react.default.useState(() => uploadsByDraft.has(key));
	const inheritedAction = react.default.useRef(actionsByDraft.get(key));
	const [action, setAction] = react.default.useState(inheritedAction.current);
	react.default.useLayoutEffect(() => {
		const syncDraft = (changedKey) => {
			if (changedKey && changedKey !== key) return;
			setIsUploading(uploadsByDraft.has(key));
			const pending = actionsByDraft.get(key);
			setAction(pending);
			if (pending) return;
			const saved = readScopeDrafts(key);
			const next = inheritedAction.current ? saved : {
				...saved,
				add: draftRef.current.add
			};
			inheritedAction.current = void 0;
			const current = draftRef.current;
			if (next.add === current.add && next.workspaceId === current.workspaceId && sameAttachments(next.attachments, current.attachments)) return;
			draftRef.current = next;
			setDraft(next);
		};
		const unsubscribe = subscribeDraftAttachments(syncDraft);
		syncDraft(key);
		return unsubscribe;
	}, [key]);
	const isSubmitting = action === "submit";
	const isRecalling = action === "recall";
	const draftLocked = isRecalling || Boolean(inheritedAction.current);
	const finishAction = () => {
		actionsByDraft.delete(key);
		notifyDraftAttachments(key);
	};
	const addRef = react.default.useRef(null);
	const composingRef = react.default.useRef(false);
	const resizeAdd = (node) => {
		if (!node) return;
		node.style.height = "auto";
		node.style.height = `${node.scrollHeight + 2}px`;
	};
	react.default.useEffect(() => {
		resizeAdd(addRef.current);
	}, [draft.add]);
	const hasFinePointer = () => typeof window.matchMedia !== "function" || window.matchMedia("(hover: hover) and (pointer: fine)").matches;
	react.default.useLayoutEffect(() => {
		const node = addRef.current;
		if (!node || !focusOnMount || !hasFinePointer()) return;
		node.focus();
		const end = node.value.length;
		try {
			node.setSelectionRange(end, end);
		} catch {}
	}, []);
	const hasContent = (value) => Boolean(value.add.trim() || value.attachments.length);
	const showDraft = (next) => {
		draftRef.current = next;
		setDraft(next);
	};
	const addFiles = async (files) => {
		if (!files.length || !canUpload || actionsByDraft.has(key) || uploadsByDraft.has(key)) return;
		if (files.length + readScopeDrafts(key).attachments.length > 10 || files.some((file) => file.size < 1 || file.size > 26214400)) {
			report("attachmentLimit");
			return;
		}
		uploadsByDraft.add(key);
		notifyDraftAttachments(key);
		try {
			const attachments = [];
			for (const file of files) attachments.push(await uploadAttachment(file, AbortSignal.timeout(12e4)));
			const latest = readScopeDrafts(key);
			const next = [...latest.attachments, ...attachments];
			if (next.length > 10) report("attachmentLimit");
			else if (!saveAddDraft(key, latest.add, next)) report("saveFailed");
		} catch {
			report("attachmentUploadFailed");
		} finally {
			uploadsByDraft.delete(key);
			notifyDraftAttachments(key);
		}
	};
	const removeAttachment = (index) => {
		if (actionsByDraft.has(key) || uploadsByDraft.has(key)) return;
		const latest = readScopeDrafts(key);
		if (!sameAttachments(latest.attachments, draftRef.current.attachments)) {
			notifyDraftAttachments(key);
			report("attachmentDraftChanged");
			return;
		}
		const remaining = latest.attachments.filter((_, position) => position !== index);
		if (!saveAddDraft(key, latest.add, remaining, latest.add.trim() || remaining.length ? latest.workspaceId : null)) report("saveFailed");
	};
	const add = async () => {
		const submitted = draftRef.current;
		const text = submitted.add.trim().slice(0, 280);
		const { attachments } = submitted;
		if (!submitted.workspaceId && !workspaceId || !hasContent(submitted) || actionsByDraft.has(key) || uploadsByDraft.has(key) || storageInUse) return;
		const latest = readScopeDrafts(key);
		if (!sameAttachments(attachments, latest.attachments) || submitted.workspaceId !== latest.workspaceId) {
			notifyDraftAttachments(key);
			report("attachmentDraftChanged");
			return;
		}
		if (attachments.length && !canUpload) {
			report("attachmentUploadFailed");
			return;
		}
		actionsByDraft.set(key, "submit");
		notifyDraftAttachments(key);
		try {
			const now = Date.now();
			const item = {
				id: uid(),
				text,
				...attachments.length ? { attachments } : {},
				done: false,
				createdAt: now,
				updatedAt: now
			};
			if (!await commit(submitted.workspaceId ?? workspaceId, (currentItems) => [item, ...currentItems])) {
				report("saveFailed");
				return;
			}
			const saved = readScopeDrafts(key);
			const sameFiles = sameAttachments(saved.attachments, attachments);
			const remaining = sameFiles ? [] : saved.attachments;
			if (draftRef.current === submitted) {
				showDraft({
					add: "",
					attachments: remaining,
					workspaceId: remaining.length ? saved.workspaceId : void 0
				});
				if (saved.add === submitted.add.slice(0, 280)) {
					if (sameFiles) clearAddDraft(key);
					else saveAddDraft(key, "", void 0, remaining.length ? saved.workspaceId : null);
				}
			} else if (sameFiles && saved.workspaceId === submitted.workspaceId) {
				showDraft({
					...draftRef.current,
					attachments: remaining,
					workspaceId: void 0
				});
				saveAddDraft(key, saved.add, [], null);
			}
		} finally {
			finishAction();
		}
	};
	/**
	* Replace the composer with a recalled note and put the caret at its end.
	*
	* This is the only text editor for a note: the row leaves the list and its
	* text lands here, where the user can change it and submit it again.
	*/
	const recall = async (item, takeBack) => {
		if (actionsByDraft.has(key) || uploadsByDraft.has(key) || hasContent(draftRef.current) || hasContent(readScopeDrafts(key))) {
			report("recallBlocked");
			return;
		}
		actionsByDraft.set(key, "recall");
		notifyDraftAttachments(key);
		try {
			const before = readScopeDrafts(key);
			const next = {
				add: String(item.text || "").slice(0, 280),
				attachments: item.attachments ?? [],
				workspaceId: item.workspaceId === workspaceId ? void 0 : item.workspaceId
			};
			if (!saveAddDraft(key, next.add, next.attachments, next.workspaceId ?? null)) {
				report("saveFailed");
				return;
			}
			if (!await takeBack(item)) {
				if (JSON.stringify(readScopeDrafts(key)) === JSON.stringify(next)) saveAddDraft(key, before.add, before.attachments, before.workspaceId ?? null);
				return;
			}
			showDraft(next);
			report("recalled");
		} finally {
			finishAction();
		}
		window.requestAnimationFrame(() => {
			const node = addRef.current;
			if (!node) return;
			if (hasFinePointer()) {
				node.focus();
				const end = node.value.length;
				try {
					node.setSelectionRange(end, end);
				} catch {}
			}
			resizeAdd(node);
		});
	};
	const onDraftChange = (event) => {
		if (draftLocked) return;
		const value = event.target.value;
		const owner = value.trim() || draftRef.current.attachments.length ? draftRef.current.workspaceId : void 0;
		const next = {
			...draftRef.current,
			add: value,
			workspaceId: owner
		};
		showDraft(next);
		saveAddDraft(key, next.add, void 0, owner ?? null);
		resizeAdd(event.target);
	};
	/**
	* Match the main composer: Enter adds the note, Shift+Enter keeps the
	* textarea's native line break, and Enter that belongs to an IME candidate
	* pick is left to the browser. A held Enter must not add note after note.
	*/
	const onDraftKeyDown = (event) => {
		const composing = composingRef.current || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229;
		if (event.key === "Escape") {
			event.currentTarget.blur();
			return;
		}
		if (event.key !== "Enter") return;
		if (composing) return;
		if (event.shiftKey) return;
		if (event.altKey || typeof event.getModifierState === "function" && event.getModifierState("AltGraph")) {
			event.preventDefault();
			return;
		}
		event.preventDefault();
		if (event.repeat) return;
		add();
	};
	return {
		draft,
		draftLocked,
		isSubmitting,
		isRecalling,
		isUploading,
		addRef,
		composingRef,
		add,
		recall,
		addFiles,
		removeAttachment,
		onDraftChange,
		onDraftKeyDown
	};
}

// src/client/ui/useNoteActions.ts
/** Row actions: archive a note, reorder the open ones, take one back into the composer. */
function useNoteActions({ commit, report }) {
	/**
	* Archive one note. There is no manual toggle: a note is archived when it
	* has been put into the conversation, and only `takeBack` brings it back.
	* The stored shape keeps `done` / `completedAt`, so existing lists read as-is.
	*/
	const archive = async (item) => {
		return commit(item.workspaceId, (currentItems) => currentItems.map((candidate) => {
			if (candidate.id !== item.noteId || candidate.done) return candidate;
			const now = Date.now();
			return {
				...candidate,
				done: true,
				updatedAt: now,
				completedAt: now
			};
		}));
	};
	/** Move an open note to `toIndex` among the open notes; archived ones keep their order. */
	const move = async (item, toIndex) => {
		let changed = false;
		const ok = await commit(item.workspaceId, (currentItems) => {
			const next = moveOpenItem(currentItems, item.noteId, toIndex);
			changed = next !== currentItems;
			return next;
		});
		if (!ok) report("saveFailed");
		return ok && changed;
	};
	/**
	* Remove a note so its text can be recalled into the composer.
	*
	* A failed write keeps the row and its text exactly as they were; the
	* caller writes the recalled text only after this succeeds.
	*/
	const takeBack = async (item) => {
		if (!await commit(item.workspaceId, (currentItems) => currentItems.filter((candidate) => candidate.id !== item.noteId))) {
			report("saveFailed");
			return false;
		}
		return true;
	};
	return {
		archive,
		move,
		takeBack
	};
}

// src/client/ui/useRowReorder.ts
/**
* Drag an open note to reorder it, or press the up/down arrows while its
* leading action has focus.
*
* The drag runs outside React: rows follow the pointer through inline
* transforms, so a long list never re-renders per frame. Only the drop goes
* through `onMove`, and the lifted row then glides from where it was let go
* into its new slot (a FLIP in the layout effect below).
*/
/** Vertical pixels the pointer travels before a press becomes a drag. */
const DRAG_THRESHOLD = 4;
/** Distance from the scroller's edge where a held drag starts scrolling it. */
const EDGE_ZONE = 32;
/** Fastest auto-scroll step, in pixels per frame, right at the edge. */
const EDGE_SPEED = 8;
function useRowReorder({ ids, groupFor, scrollRef, onMove }) {
	const listRef = react.default.useRef(null);
	const dragRef = react.default.useRef(null);
	const settleRef = react.default.useRef(null);
	const focusRef = react.default.useRef("");
	const idsRef = react.default.useRef(ids);
	idsRef.current = ids;
	const groupRef = react.default.useRef(groupFor);
	groupRef.current = groupFor;
	const onMoveRef = react.default.useRef(onMove);
	onMoveRef.current = onMove;
	const [api] = react.default.useState(() => {
		const rows = () => {
			const list = listRef.current;
			if (!list) return [];
			return Array.from(list.children).filter((node) => node && node.dataset && node.dataset.rowId);
		};
		/** Move the lifted row with the pointer and open a gap where it would land. */
		const layout = (drag) => {
			const scrolled = drag.scroller ? drag.scroller.scrollTop - drag.startScroll : 0;
			const dy = drag.lastY - drag.startY + scrolled;
			drag.dy = dy;
			const self = drag.rows[drag.from];
			const center = self.top + dy + self.height / 2;
			let to = drag.first;
			drag.rows.forEach((row, index) => {
				if (index >= drag.first && index <= drag.last && index !== drag.from && row.top + row.height / 2 < center) to += 1;
			});
			drag.to = to;
			const shift = self.height + drag.gap;
			drag.rows.forEach((row, index) => {
				if (index === drag.from) {
					row.node.style.transform = `translateY(${dy}px)`;
					return;
				}
				let offset = 0;
				if (drag.from < to && index > drag.from && index <= to) offset = -shift;
				else if (to < drag.from && index >= to && index < drag.from) offset = shift;
				row.node.style.transform = offset ? `translateY(${offset}px)` : "";
			});
		};
		/** Signed scroll step while the pointer rests near the scroller's top or bottom edge. */
		const edgeStep = (drag) => {
			const scroller = drag.scroller;
			if (!scroller) return 0;
			const rect = scroller.getBoundingClientRect();
			const fromTop = drag.lastY - rect.top;
			const fromBottom = rect.bottom - drag.lastY;
			if (fromTop < EDGE_ZONE) return -Math.ceil(EDGE_SPEED * (1 - Math.max(0, fromTop) / EDGE_ZONE));
			if (fromBottom < EDGE_ZONE) return Math.ceil(EDGE_SPEED * (1 - Math.max(0, fromBottom) / EDGE_ZONE));
			return 0;
		};
		const tick = () => {
			const drag = dragRef.current;
			if (!drag) return;
			drag.frame = 0;
			const step = edgeStep(drag);
			if (!step) return;
			drag.scroller.scrollTop += step;
			drag.frame = window.requestAnimationFrame(tick);
		};
		const onScroll = () => {
			const drag = dragRef.current;
			if (drag && drag.started) layout(drag);
		};
		const onEscape = (event) => {
			if (event.key !== "Escape") return;
			event.preventDefault();
			event.stopPropagation();
			finish(false);
		};
		/** Put every row back to its own slot; the row transition glides them there. */
		const release = (drag) => {
			const list = listRef.current;
			if (list) delete list.dataset.dragging;
			for (const row of drag.rows) {
				row.node.style.transform = "";
				delete row.node.dataset.dragging;
			}
		};
		const finish = (commit) => {
			const drag = dragRef.current;
			if (!drag) return;
			dragRef.current = null;
			if (drag.frame) window.cancelAnimationFrame(drag.frame);
			window.removeEventListener("keydown", onEscape, true);
			if (drag.scroller) drag.scroller.removeEventListener("scroll", onScroll);
			try {
				drag.target.releasePointerCapture(drag.pointerId);
			} catch {}
			if (!drag.started) return;
			if (commit && drag.to !== drag.from) {
				const settle = {
					id: drag.id,
					top: drag.rows[drag.from].top + drag.dy
				};
				settleRef.current = settle;
				const cancelSettle = () => {
					if (settleRef.current !== settle) return;
					settleRef.current = null;
					release(drag);
				};
				onMoveRef.current(drag.id, drag.to).then((ok) => {
					if (!ok) cancelSettle();
				}, cancelSettle);
				return;
			}
			release(drag);
		};
		const start = (id, event) => {
			if (event.button !== 0 || dragRef.current || settleRef.current) return;
			const origin = event.target;
			const target = event.currentTarget;
			if (!(origin instanceof window.Element) || !target.contains(origin)) return;
			if (origin.closest("button, a, audio, video, img")) return;
			if (event.pointerType === "touch" && !origin.closest(".dsh-an-rowBody")) return;
			const list = listRef.current;
			const all = rows();
			const from = all.findIndex((node) => node.dataset.rowId === id);
			if (!list || from < 0) return;
			const group = groupRef.current(id);
			let first = from;
			let last = from;
			while (first > 0 && groupRef.current(all[first - 1].dataset.rowId) === group) first -= 1;
			while (last < all.length - 1 && groupRef.current(all[last + 1].dataset.rowId) === group) last += 1;
			if (first === last) return;
			event.preventDefault();
			try {
				target.setPointerCapture(event.pointerId);
			} catch {}
			const listTop = list.getBoundingClientRect().top;
			const scroller = scrollRef.current || null;
			dragRef.current = {
				id,
				from,
				first,
				last,
				to: from,
				target,
				pointerId: event.pointerId,
				startY: event.clientY,
				lastY: event.clientY,
				dy: 0,
				scroller,
				startScroll: scroller ? scroller.scrollTop : 0,
				gap: parseFloat(window.getComputedStyle(list).rowGap) || 0,
				rows: all.map((node) => {
					const rect = node.getBoundingClientRect();
					return {
						node,
						top: rect.top - listTop,
						height: rect.height
					};
				}),
				started: false,
				frame: 0
			};
		};
		const move = (event) => {
			const drag = dragRef.current;
			if (!drag || event.currentTarget !== drag.target || event.pointerId !== drag.pointerId) return;
			drag.lastY = event.clientY;
			if (!drag.started) {
				if (Math.abs(drag.lastY - drag.startY) < DRAG_THRESHOLD) return;
				drag.started = true;
				const list = listRef.current;
				if (list) list.dataset.dragging = "true";
				drag.rows[drag.from].node.dataset.dragging = "true";
				window.addEventListener("keydown", onEscape, true);
				if (drag.scroller) drag.scroller.addEventListener("scroll", onScroll);
			}
			layout(drag);
			if (!drag.frame && edgeStep(drag)) drag.frame = window.requestAnimationFrame(tick);
		};
		const finishPointer = (event, commit) => {
			const drag = dragRef.current;
			if (drag?.target === event.currentTarget && drag.pointerId === event.pointerId) finish(commit);
		};
		/** Arrow keys move the focused note one slot; its leading action keeps focus. */
		const key = (id, event) => {
			if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
			event.preventDefault();
			if (dragRef.current) return;
			const order = idsRef.current;
			const index = order.indexOf(id);
			const to = index + (event.key === "ArrowUp" ? -1 : 1);
			if (index < 0 || to < 0 || to >= order.length || groupRef.current(order[to]) !== groupRef.current(id)) return;
			focusRef.current = id;
			const clearFocus = () => {
				if (focusRef.current === id) focusRef.current = "";
			};
			onMoveRef.current(id, to).then((ok) => {
				if (!ok) clearFocus();
			}, clearFocus);
		};
		return {
			rows,
			start,
			move,
			finish,
			finishPointer,
			key
		};
	});
	const idsKey = ids.join("\n");
	react.default.useLayoutEffect(() => {
		const list = listRef.current;
		const settle = settleRef.current;
		if (settle && list) {
			settleRef.current = null;
			delete list.dataset.dragging;
			const nodes = api.rows();
			for (const node of nodes) {
				node.style.transition = "none";
				node.style.transform = "";
				delete node.dataset.dragging;
			}
			const lifted = nodes.find((node) => node.dataset.rowId === settle.id);
			if (lifted) {
				const natural = lifted.getBoundingClientRect().top - list.getBoundingClientRect().top;
				lifted.style.transform = `translateY(${settle.top - natural}px)`;
			}
			list.offsetHeight;
			for (const node of nodes) node.style.transition = "";
			if (lifted) lifted.style.transform = "";
		}
		const focusId = focusRef.current;
		if (focusId && list) {
			focusRef.current = "";
			const action = api.rows().find((node) => node.dataset.rowId === focusId)?.querySelector(".dsh-an-insert");
			if (action && document.activeElement !== action) action.focus();
		}
	}, [idsKey, api]);
	react.default.useEffect(() => () => api.finish(false), [api]);
	const dragProps = (id) => ({
		onPointerDown: (event) => api.start(id, event),
		onPointerMove: api.move,
		onPointerUp: (event) => api.finishPointer(event, true),
		onPointerCancel: (event) => api.finishPointer(event, false),
		onLostPointerCapture: (event) => api.finishPointer(event, false)
	});
	const reorderKey = (id) => (event) => api.key(id, event);
	return {
		listRef,
		dragProps,
		reorderKey
	};
}

// src/client/ui/useClearConfirm.ts
/** The inline second confirmation for clearing completed notes. */
function useClearConfirm({ scope, showDone, doneCount, onConfirm }) {
	const [confirmClear, setConfirmClear] = react.default.useState(false);
	const clearConfirmTimerRef = react.default.useRef(0);
	/** Drop the pending auto-dismiss clock without touching state. */
	const stopClearConfirmTimer = () => {
		if (!clearConfirmTimerRef.current) return;
		window.clearTimeout(clearConfirmTimerRef.current);
		clearConfirmTimerRef.current = 0;
	};
	/** Close the inline band and drop its pending timer. */
	const dismissClearConfirm = () => {
		stopClearConfirmTimer();
		setConfirmClear(false);
	};
	/** Open the inline band; it retires itself after a short pause. */
	const askClearConfirm = () => {
		stopClearConfirmTimer();
		setConfirmClear(true);
		clearConfirmTimerRef.current = window.setTimeout(() => {
			clearConfirmTimerRef.current = 0;
			setConfirmClear(false);
		}, CLEAR_CONFIRM_MS);
	};
	/** Only the destructive confirm action reaches the clear routine. */
	const confirmClearDone = () => {
		dismissClearConfirm();
		onConfirm();
	};
	react.default.useEffect(() => () => stopClearConfirmTimer(), []);
	react.default.useEffect(() => {
		if (confirmClear && (!showDone || doneCount === 0)) dismissClearConfirm();
	}, [
		confirmClear,
		showDone,
		doneCount
	]);
	react.default.useEffect(() => {
		dismissClearConfirm();
	}, [scope]);
	return {
		confirmClear,
		askClearConfirm,
		dismissClearConfirm,
		confirmClearDone
	};
}

// src/client/ui/useListEdge.ts
/** Tracks whether the note list can still scroll down, and updates sticky heads. */
function useListEdge({ items, showOpen, showDone }) {
	const listRef = react.default.useRef(null);
	const [listHasMore, setListHasMore] = react.default.useState(false);
	/** The bottom fade exists only while the list can still scroll down. */
	const syncListEdge = react.default.useCallback(() => {
		const node = listRef.current;
		if (!node) return;
		syncStickyHeads(node);
		const more = node.scrollTop + node.clientHeight < node.scrollHeight - 1;
		setListHasMore((current) => current === more ? current : more);
	}, []);
	react.default.useEffect(() => {
		const node = listRef.current;
		if (!node) return void 0;
		syncListEdge();
		if (typeof ResizeObserver !== "function") return void 0;
		const observer = new ResizeObserver(syncListEdge);
		observer.observe(node);
		for (const section of node.children) observer.observe(section);
		return () => observer.disconnect();
	}, [
		items,
		showOpen,
		showDone,
		syncListEdge
	]);
	return {
		listRef,
		listHasMore,
		syncListEdge
	};
}

// src/client/ui/useOutsideDismiss.ts
/** Close the panel on an outside pointerdown or Escape. */
function useOutsideDismiss(panelRef, anchorRef, onClose) {
	react.default.useEffect(() => {
		const imagePreviewOpen = () => panelRef.current?.querySelector("[data-image-preview-open]");
		const onPointerDown = (event) => {
			if (imagePreviewOpen()) return;
			if (panelRef.current && panelRef.current.contains(event.target)) return;
			if (anchorRef.current && anchorRef.current.contains(event.target)) return;
			onClose(false);
		};
		const onKeyDown = (event) => {
			if (event.key === "Escape" && !imagePreviewOpen()) onClose();
		};
		document.addEventListener("pointerdown", onPointerDown, true);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown, true);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [onClose, anchorRef]);
}

// src/client/ui/TodoRow.ts
/** A note with a leading insert action and a trailing cell for its age and secondary actions. */
const h$11 = react.default.createElement;
function TodoRow(props) {
	const { item, archived, workspaceName, isCurrentWorkspace, onOpenWorkspace, say, localeId, onToast, onInsert, onRecall, dragProps, onReorderKey } = props;
	const attachments = item.attachments ?? [];
	const hasText = Boolean(item.text);
	const insertLabel = say(hasText ? attachments.length ? "attachment.insertText" : "item.insert" : "attachment.archive");
	const workspaceLabel = onOpenWorkspace ? say(isCurrentWorkspace ? "item.currentWorkspace" : "item.openWorkspace", { workspace: workspaceName }) : void 0;
	const workspaceText = h$11("span", {
		className: "dsh-an-workspaceName",
		title: workspaceLabel ? void 0 : workspaceName
	}, workspaceName);
	const [pending, setPending] = react.default.useState("");
	const mountedRef = react.default.useRef(true);
	react.default.useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);
	const copy = async () => {
		if (pending) return;
		setPending("copy");
		let ok = false;
		try {
			ok = await copyText(item.text);
		} finally {
			if (mountedRef.current) setPending("");
		}
		if (!mountedRef.current) return;
		if (onToast) onToast(ok ? "copied" : "copyFailed");
	};
	return h$11("li", {
		className: archived ? "dsh-an-row dsh-an-rowArchived" : "dsh-an-row",
		"data-row-id": item.id,
		"data-sortable": dragProps ? "true" : void 0,
		...dragProps
	}, h$11("div", { className: "dsh-an-leading" }, archived ? null : withTooltip(insertLabel, h$11("button", {
		type: "button",
		className: "dsh-an-iconBtn dsh-an-insert",
		"aria-label": insertLabel,
		"aria-description": say("item.reorder"),
		"aria-keyshortcuts": "ArrowUp ArrowDown",
		onKeyDown: onReorderKey,
		onClick: () => onInsert(item)
	}, hasText ? h$11(IconInsert) : icon("IconArchiveOutlineRegular") ? h$11(Glyph, {
		name: "IconArchiveOutlineRegular",
		size: 14
	}) : h$11("span", { "aria-hidden": true }, "✓")))), h$11("div", { className: "dsh-an-rowBody" }, hasText ? h$11("div", { className: "dsh-an-text" }, item.text) : null, h$11(AttachmentList, {
		attachments,
		say
	})), workspaceName && h$11("div", { className: "dsh-an-rowWorkspace" }, workspaceLabel ? withTooltip(workspaceLabel, h$11("button", {
		type: "button",
		className: "dsh-an-workspaceJump",
		"aria-label": workspaceLabel,
		"aria-current": isCurrentWorkspace ? "location" : void 0,
		title: Tooltip ? void 0 : workspaceLabel,
		onClick: onOpenWorkspace
	}, h$11("span", {
		className: "dsh-an-workspaceGlyph",
		"aria-hidden": true
	}, isCurrentWorkspace ? "•" : "↗"), workspaceText)) : workspaceText), h$11("div", { className: "dsh-an-trail" }, h$11("span", {
		className: "dsh-an-meta",
		title: metaLabel(item, say, localeId)
	}, rowAge(item, say, localeId)), h$11("div", { className: "dsh-an-actions" }, hasText ? withTooltip(say("item.copy"), h$11("button", {
		type: "button",
		className: "dsh-an-iconBtn",
		"aria-label": say("item.copy"),
		"aria-busy": pending === "copy" ? "true" : "false",
		"data-loading": pending === "copy" ? "true" : void 0,
		onClick: copy
	}, h$11(IconCopy, null))) : null, withTooltip(say("item.recall"), h$11("button", {
		type: "button",
		className: "dsh-an-iconBtn",
		"aria-label": say("item.recall"),
		onClick: () => onRecall(item)
	}, h$11(IconRewind, null))))));
}

// src/client/ui/ScopeSwitch.tsx
/** Segmented switch with a pending-note count for each list scope. */
const h$10 = react.default.createElement;
function countText(count) {
	return h$10("span", { className: "dsh-an-scopeCount" }, count ?? "—");
}
function ScopeSwitch({ say, scopeMode, globalOpenCount, workspaceOpenCount, workspaceName, workspacePending, countStatus, onScopeChange }) {
	const countLabel = (count) => count === null ? countStatus : say("dock.count", { n: count });
	const globalName = say("scope.global");
	const globalLabel = `${globalName} · ${countLabel(globalOpenCount)}`;
	const globalContent = [h$10("span", null, globalName), countText(globalOpenCount)];
	const workspaceIcon = h$10("span", {
		className: "dsh-an-scopeIcon",
		"aria-hidden": true
	}, h$10(Glyph, {
		name: "IconFolderOpenOutlineRegular",
		size: 14
	}));
	if (!workspaceName) return h$10("div", { className: workspacePending ? "dsh-an-scope" : "dsh-an-scopeSummary" }, h$10("span", { className: "dsh-an-srOnly" }, globalLabel), h$10("span", {
		className: "dsh-an-scopeSummaryContent",
		title: globalLabel,
		"aria-hidden": true
	}, ...globalContent), workspacePending && h$10("span", {
		className: "dsh-an-scopePending",
		title: say("scope.loading"),
		"aria-hidden": true
	}, workspaceIcon, countText(null)));
	const workspaceLabel = `${say("item.currentWorkspace", { workspace: workspaceName })} · ${countLabel(workspaceOpenCount)}`;
	const scopeButton = (mode, label, hint, ...content) => withTooltip(`${hint} · ${label}`, h$10("button", {
		type: "button",
		className: mode === "workspace" ? "dsh-an-scopeBtn dsh-an-scopeWorkspace" : "dsh-an-scopeBtn",
		"data-scope-mode": mode,
		"aria-label": label,
		"aria-pressed": scopeMode === mode,
		onClick: () => onScopeChange(mode)
	}, ...content));
	return h$10("div", {
		className: "dsh-an-scope",
		role: "group",
		"aria-label": say("scope.label")
	}, scopeButton("global", globalLabel, say("scope.globalHint"), ...globalContent), scopeButton("workspace", workspaceLabel, say("scope.workspaceHint"), workspaceIcon, h$10("bdi", { className: "dsh-an-scopeName" }, workspaceName), countText(workspaceOpenCount)));
}

// src/client/ui/PanelHead.ts
/** Panel title, counts, the list-scope switch and close action. */
const h$9 = react.default.createElement;
function PanelHead({ onClose, ...scope }) {
	const { say } = scope;
	return h$9("div", { className: "dsh-an-popHead" }, h$9("div", { className: "dsh-an-popTitleLine" }, h$9("div", { className: "dsh-an-popTitle" }, say("popover.title")), h$9(ScopeSwitch, scope)), h$9("div", { className: "dsh-an-popActions" }, withTooltip(say("popover.close"), h$9("button", {
		type: "button",
		className: "dsh-an-popClose",
		"aria-label": say("popover.close"),
		onClick: () => onClose()
	}, h$9(IconClose, null)))));
}

// src/client/ui/StorageDetails.ts
const h$8 = react.default.createElement;
function HostLocation({ say, onToast }) {
	const [location, setLocation] = react.default.useState();
	react.default.useEffect(() => {
		let open = true;
		fetchStoreLocation().then((next) => {
			if (open) setLocation(next);
		});
		return () => {
			open = false;
		};
	}, []);
	if (location === void 0) return h$8("p", null, say("storage.pathLoading"));
	if (!location?.path) return h$8("p", null, say("storage.pathUnavailable"));
	const path = location.path;
	return h$8("div", { className: "dsh-an-storagePathRow" }, h$8("code", {
		className: "dsh-an-storagePath",
		title: path
	}, path), h$8("div", { className: "dsh-an-storageActions" }, h$8("button", {
		type: "button",
		className: "dsh-an-mini dsh-an-storageAction",
		onClick: async () => onToast(await copyText(path) ? "pathCopied" : "copyFailed")
	}, say("storage.copyPath")), h$8("button", {
		type: "button",
		className: "dsh-an-mini dsh-an-storageAction",
		onClick: async () => {
			if (!await revealStoreFile()) onToast("revealFailed");
		}
	}, say("storage.reveal"))), !location.exists && h$8("p", null, say("storage.pathMissing")));
}
function StorageDetails({ say, mode, showStatus, onToast }) {
	const failure = storageFailure();
	if (mode === "error") return null;
	if (mode === "probing") return h$8("p", { role: "status" }, say("storage.loading"));
	return h$8("div", { className: "dsh-an-storageBlock" }, showStatus && h$8("p", { role: "status" }, say(mode === "host" ? "storage.whereHost" : "storage.notSwitched")), mode === "host" && h$8(HostLocation, {
		say,
		onToast
	}), failure && h$8("p", null, say("storage.failure", { code: failure.code })));
}

// src/client/ui/UpdateNotice.ts
/**
* Release notes and update actions behind the panel's update entry.
*
* One compact card: the published version, the release notes it ships with, and
* the update action. The notes load and show as soon as an update is offered —
* they are not hidden behind a disclosure. The action is a button, never
* automatic: one host request installs the offered version, and the panel
* reports the outcome instead of guessing.
*
* When the host has no update route, or refuses the install in a way a terminal
* command can get past, the card states the exact command — with one click to
* copy a ready-to-paste prompt for an agent. The panel never runs a package
* manager itself.
*
* A jump across several versions lists each release separately: the newest one
* opens by default and the ones behind it expand on demand, so a 2.0.0 install
* upgrading to 2.3.0 can read 2.1.0, 2.2.0 and 2.3.0 in order. The full release
* page opens from the link beside the update button.
*/
const h$7 = react.default.createElement;
const NOTES_ID = "dsh-an-update-notes";
const UPDATE_PACKAGE = "dsh-sideby-note";
/** Failure codes the card can explain without echoing the host's message. */
const FAILURE_COPY = {
	PLUGIN_NOT_INSTALLED: "update.notInstalled",
	UPDATE_FORBIDDEN: "update.forbidden",
	UPDATE_REJECTED: "update.rejected",
	OPERATION_BUSY: "update.busy",
	UPDATE_TIMEOUT: "update.timeout",
	"bundle-in-use": "update.bundleInUse",
	"already-installed": "update.alreadyInstalled",
	"management-required": "update.managementRequired",
	"not-removable": "update.notRemovable",
	"stop-profile": "update.stopProfile",
	"incompatible-version": "update.incompatible",
	RESOLVED_VERSION_MISMATCH: "update.versionMismatch",
	DOWNGRADE_DETECTED: "update.downgrade",
	AUTO_UPDATE_UNAVAILABLE: "update.autoUnavailable"
};
/** Refusals a terminal command can actually get past. */
const MANUAL_FALLBACK = /* @__PURE__ */ new Set([
	"OPERATION_BUSY",
	"bundle-in-use",
	"already-installed",
	"management-required",
	"not-removable",
	"stop-profile",
	"AUTO_UPDATE_UNAVAILABLE"
]);
function UpdateNotice(props) {
	const { say, latestVersion, notes, expandedVersions, run, fullReleaseUrl } = props;
	const notesRef = react.default.useRef(null);
	const [fade, setFade] = react.default.useState(false);
	const syncFade = react.default.useCallback(() => {
		const node = notesRef.current;
		if (!node) {
			setFade(false);
			return;
		}
		const overflow = node.scrollHeight > node.clientHeight + 1;
		const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
		setFade(overflow && !atBottom);
	}, []);
	react.default.useEffect(() => {
		const node = notesRef.current;
		if (!node) return void 0;
		const frame = requestAnimationFrame(syncFade);
		const onScroll = () => syncFade();
		node.addEventListener("scroll", onScroll, { passive: true });
		let observer = null;
		if (typeof ResizeObserver === "function") {
			observer = new ResizeObserver(syncFade);
			observer.observe(node);
		}
		window.addEventListener("resize", syncFade);
		return () => {
			cancelAnimationFrame(frame);
			node.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", syncFade);
			observer?.disconnect();
		};
	}, [
		notes.status,
		notes.entries,
		expandedVersions,
		syncFade
	]);
	if (latestVersion === null) return null;
	const phase = run.phase;
	const busy = phase === "starting" || phase === "running";
	const failureKey = run.failureCode ? FAILURE_COPY[run.failureCode] : "";
	/**
	* The host reports the exact command (with the profile directory) for the
	* failures a terminal can get past. When a refusal has no command of its own,
	* pin the offered version here so a later release cannot slip in between the
	* card and the paste.
	*/
	const manualCommand = react.default.useMemo(() => {
		const hinted = run.message?.trim() ?? "";
		const prerelease = isPrereleaseVersion(latestVersion);
		const hintPinsTarget = hinted.includes(latestVersion);
		const hintPinsRegistry = !prerelease || hinted.includes("--registry=https://registry.npmjs.org/");
		if (/^npx\s/u.test(hinted) && hintPinsTarget && hintPinsRegistry) return hinted;
		return `npx -y${prerelease ? " --registry=https://registry.npmjs.org/" : ""} ${prerelease ? `${UPDATE_PACKAGE}@${latestVersion}` : UPDATE_PACKAGE} install --version ${latestVersion}`;
	}, [run.message, latestVersion]);
	/**
	* No host route, or a refusal a terminal can get past: the user needs the
	* command now, not a "try again later" with nothing behind it. The panel never
	* runs a package manager itself.
	*/
	const manual = run.failureCode !== null && MANUAL_FALLBACK.has(run.failureCode);
	/**
	* Hand the user a prompt they can paste into an agent. The command pins the
	* version this card offered, so a release published between render and click
	* cannot silently change the target.
	*/
	const copyPrompt = () => {
		const text = say("update.prompt", {
			version: latestVersion,
			command: manualCommand
		});
		Promise.resolve(props.onCopyPrompt(text)).then((ok) => {
			if (typeof props.onToast === "function") props.onToast(ok ? "copied" : "copyFailed");
		});
	};
	const noteGroups = (list) => list.map((group, index) => h$7("div", {
		key: `${group.title}-${index}`,
		className: "dsh-an-updateGroup"
	}, group.title ? h$7("div", { className: "dsh-an-updateGroupTitle" }, group.title) : null, h$7("ul", { className: "dsh-an-updateItems" }, group.items.map((item, itemIndex) => h$7("li", {
		key: itemIndex,
		className: "dsh-an-updateItem"
	}, item.lead ? h$7("strong", null, item.lead) : null, item.lead ? " " : null, item.body)))));
	const entryBody = (entry) => entry.groups.length > 0 ? noteGroups(entry.groups) : h$7("p", { className: "dsh-an-updateHint" }, say("update.notesMissing"));
	const notesBody = notes.status === "loading" ? h$7("p", { className: "dsh-an-updateHint" }, say("update.notesLoading")) : notes.status === "error" ? h$7("p", { className: "dsh-an-updateHint" }, say("update.notesFailed")) : notes.status === "ready" && notes.entries.length === 1 ? entryBody(notes.entries[0]) : notes.status === "ready" ? h$7("div", { className: "dsh-an-updateVersions" }, h$7("p", { className: "dsh-an-updateHint" }, say("update.historyCount", { n: notes.entries.length })), notes.entries.map((entry, index) => {
		const open = expandedVersions[entry.version] === true;
		return h$7("div", {
			key: entry.version,
			className: "dsh-an-updateVersion"
		}, h$7("button", {
			type: "button",
			className: "dsh-an-updateVersionHead",
			"aria-expanded": open,
			"aria-controls": `${NOTES_ID}-${entry.version}`,
			onClick: () => props.onToggleVersion(entry.version)
		}, h$7("span", {
			className: "dsh-an-updateChevron",
			"data-open": open ? "true" : "false",
			"aria-hidden": true
		}, "▸"), h$7("span", { className: "dsh-an-updateVersionLabel" }, `v${entry.version}`), index === 0 ? h$7("span", { className: "dsh-an-updateLatest" }, say("update.latest")) : null), open ? h$7("div", {
			id: `${NOTES_ID}-${entry.version}`,
			className: "dsh-an-updateVersionBody"
		}, entryBody(entry)) : null);
	}), notes.truncated ? h$7("a", {
		className: "dsh-an-updateFull",
		href: props.releasesUrl,
		target: "_blank",
		rel: "noreferrer"
	}, say("update.olderNotes")) : null) : null;
	return h$7("div", { className: "dsh-an-updateCard" }, h$7("div", { className: "dsh-an-updateTitle" }, say("update.available", { version: `v${latestVersion}` })), h$7("div", {
		id: NOTES_ID,
		ref: notesRef,
		className: "dsh-an-updateNotes",
		role: "region",
		"aria-label": say("update.notesTitle"),
		"data-fade": fade ? "true" : void 0
	}, notesBody), h$7("div", { className: "dsh-an-updateActions" }, phase === "done" ? h$7("div", { className: "dsh-an-updateDone" }, h$7("span", { className: "dsh-an-updateHint" }, say("update.updated", { version: run.installedVersion ? `v${run.installedVersion}` : `v${latestVersion}` })), h$7("button", {
		type: "button",
		className: "dsh-an-updatePrimary",
		onClick: props.onRefresh
	}, say("update.refresh"))) : h$7("button", {
		type: "button",
		className: "dsh-an-updatePrimary",
		disabled: busy,
		"aria-busy": busy,
		onClick: () => props.onStartUpdate()
	}, busy ? phase === "running" ? say("update.updating") : say("update.starting") : say("update.now")), fullReleaseUrl ? h$7("a", {
		className: "dsh-an-updateFull",
		href: fullReleaseUrl,
		target: "_blank",
		rel: "noreferrer"
	}, say("update.full")) : null), phase === "error" ? h$7("div", { className: "dsh-an-updateErrorRow" }, h$7("p", {
		className: "dsh-an-updateError",
		role: "status"
	}, failureKey ? say(failureKey) : say("update.failed", { reason: run.message || run.failureCode || "" }))) : null, manual ? h$7("div", { className: "dsh-an-updateFallback" }, h$7("p", { className: "dsh-an-updateHint" }, say("update.manualHint", { command: manualCommand })), h$7("button", {
		type: "button",
		className: "dsh-an-updateCopy",
		onClick: copyPrompt
	}, say("update.copyPrompt"))) : null, run.phase === "done" && run.restartRequired ? h$7("p", { className: "dsh-an-updateHint" }, say("update.restartHint")) : null);
}

// src/client/ui/PanelFooter.ts
const h$6 = react.default.createElement;
function UpdateDetails({ say, update, onToast }) {
	const [open, setOpen] = react.default.useState(false);
	return h$6("details", {
		className: "dsh-an-updateDetails",
		onToggle: (event) => setOpen(event.currentTarget.open)
	}, h$6("summary", { className: "dsh-an-updateToggle" }, say("update.label")), open && h$6(UpdateNotice, {
		say,
		latestVersion: update.latestVersion,
		notes: update.notes,
		expandedVersions: update.expandedVersions,
		releasesUrl: update.releasesUrl,
		run: update.run,
		fullReleaseUrl: update.fullReleaseUrl,
		onToggleVersion: update.toggleVersion,
		onStartUpdate: update.startUpdate,
		onRefresh: update.refreshPage,
		onCopyPrompt: update.copyPrompt,
		onToast
	}));
}
function PanelFooter({ say, mode, syncError, update, onToast }) {
	const [detailsOpen, setDetailsOpen] = react.default.useState(false);
	const { check, latestVersion } = update;
	const saveError = syncError && mode !== "error";
	const checkResult = check.status === "current" ? say("update.current") : check.status === "error" ? say("update.checkFailed") : check.status === "available" ? say("update.available", { version: `v${latestVersion}` }) : null;
	const checking = check.status === "checking";
	const installing = update.run.phase === "starting" || update.run.phase === "running";
	return h$6("footer", { className: "dsh-an-popFoot" }, saveError && h$6("div", {
		role: "status",
		className: "dsh-an-error"
	}, say(mode === "host" ? "toast.saveFailed" : "storage.failed")), h$6("details", {
		className: "dsh-an-footerDetails",
		onToggle: (event) => setDetailsOpen(event.currentTarget.open)
	}, h$6("summary", { className: "dsh-an-storageToggle" }, say("storage.details")), detailsOpen && h$6("div", { className: "dsh-an-footerBody" }, h$6(StorageDetails, {
		say,
		mode,
		showStatus: !saveError,
		onToast
	}), h$6("div", { className: "dsh-an-versionRow" }, h$6("span", null, `${say("update.version")} ${"0.1.0"}`), h$6("button", {
		type: "button",
		className: "dsh-an-updateCheck",
		"aria-disabled": checking || installing,
		onClick: () => {
			if (!checking && !installing) update.checkNow();
		}
	}, say(checking ? "update.checking" : check.status === "error" ? "update.retryCheck" : "update.check")), h$6("span", {
		role: "status",
		className: check.status === "error" ? "dsh-an-updateHintError" : void 0
	}, checkResult)))), latestVersion && h$6(UpdateDetails, {
		say,
		update,
		onToast
	}));
}

// src/client/ui/ComposerForm.ts
/** The add form: one growing textarea and its submit button. */
const h$5 = react.default.createElement;
function ComposerForm(props) {
	const { say, draft, destination, destinationPending, attachments, draftLocked, isSubmitting, isRecalling, isUploading, canUpload, storageInUse, inputRef, onDraftChange, onCompositionStart, onCompositionEnd, onKeyDown, onSubmit, onFiles, onRemove, onUnavailable, onBusy } = props;
	const pickerRef = react.default.useRef(null);
	const attachRef = react.default.useRef(null);
	const dragDepth = react.default.useRef(0);
	const [dropping, setDropping] = react.default.useState(false);
	const busy = isSubmitting || isRecalling || isUploading;
	const addLabel = say("add.action");
	const destinationId = react.default.useId();
	const attachLabel = say("attachment.add");
	const takeFiles = (files) => {
		if (!files.length) return;
		if (!canUpload) onUnavailable();
		else if (busy) onBusy();
		else onFiles(files);
	};
	return h$5("form", {
		className: "dsh-an-add",
		"data-file-drag": dropping ? "true" : void 0,
		"aria-busy": isUploading,
		onSubmit,
		onDragEnter: (event) => {
			if (!event.dataTransfer.types.includes("Files")) return;
			event.preventDefault();
			dragDepth.current++;
			setDropping(true);
		},
		onDragOver: (event) => {
			if (!event.dataTransfer.types.includes("Files")) return;
			event.preventDefault();
			event.stopPropagation();
			event.dataTransfer.dropEffect = canUpload && !busy ? "copy" : "none";
		},
		onDragLeave: () => {
			dragDepth.current = Math.max(0, dragDepth.current - 1);
			if (!dragDepth.current) setDropping(false);
		},
		onDrop: (event) => {
			dragDepth.current = 0;
			setDropping(false);
			if (!event.dataTransfer.types.includes("Files")) return;
			event.preventDefault();
			event.stopPropagation();
			takeFiles(Array.from(event.dataTransfer.files));
		}
	}, destination && h$5("div", {
		id: destinationId,
		className: "dsh-an-destination"
	}, destination), h$5(AttachmentList, {
		attachments,
		say,
		onRemove: (index) => {
			if (document.activeElement?.closest(".dsh-an-attachment")) attachRef.current?.focus();
			onRemove(index);
		},
		disabled: busy
	}), h$5("textarea", {
		ref: inputRef,
		className: "dsh-an-input",
		value: draft,
		rows: 1,
		maxLength: 280,
		readOnly: draftLocked,
		placeholder: say("add.placeholder"),
		"aria-describedby": destination ? destinationId : void 0,
		"aria-label": say("add.placeholder"),
		onChange: onDraftChange,
		onCompositionStart,
		onCompositionEnd,
		onKeyDown,
		onPaste: (event) => {
			const transfer = event.clipboardData;
			const files = Array.from(transfer.files);
			if (!files.length) return;
			event.stopPropagation();
			if (!transfer.getData("text/plain")) event.preventDefault();
			takeFiles(files);
		}
	}), h$5("input", {
		ref: pickerRef,
		type: "file",
		hidden: true,
		multiple: true,
		onChange: (event) => {
			const files = Array.from(event.currentTarget.files ?? []);
			event.currentTarget.value = "";
			if (files.length) takeFiles(files);
		}
	}), h$5("div", { className: "dsh-an-composerTools" }, withTooltip(attachLabel, h$5("button", {
		type: "button",
		ref: attachRef,
		className: "dsh-an-attachBtn",
		"aria-label": attachLabel,
		disabled: busy,
		onClick: () => canUpload ? pickerRef.current?.click() : onUnavailable()
	}, icon("IconPaperclipOutlineRegular") ? h$5(Glyph, {
		name: "IconPaperclipOutlineRegular",
		size: 16
	}) : h$5("span", { "aria-hidden": true }, "+"))), withTooltip(addLabel, h$5("button", {
		type: "submit",
		className: "dsh-an-addBtn",
		"aria-label": addLabel,
		disabled: destinationPending || storageInUse || busy || !draft.trim() && !attachments.length
	}, h$5("svg", {
		width: 16,
		height: 16,
		viewBox: "0 0 16 16",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 1.5,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		"aria-hidden": true
	}, h$5("path", { d: "M13 4v3a2 2 0 0 1-2 2H3m0 0 3-3m-3 3 3 3" }))))), isUploading ? h$5("span", {
		className: "dsh-an-attachmentStatus",
		role: "status"
	}, say("attachment.uploading")) : null);
}

// src/client/ui/ClearConfirm.ts
/** Inline second confirmation for clearing the completed notes. */
const h$4 = react.default.createElement;
function ClearConfirm(props) {
	const { say, text, onCancel, onConfirm } = props;
	return h$4("div", {
		className: "dsh-an-clearConfirm",
		role: "group",
		"aria-live": "polite",
		"aria-label": text
	}, h$4("p", { className: "dsh-an-clearConfirmText" }, text), h$4("div", { className: "dsh-an-clearConfirmActions" }, h$4("button", {
		type: "button",
		className: "dsh-an-mini",
		onClick: onCancel
	}, say("popover.clearCancel")), h$4("button", {
		type: "button",
		className: "dsh-an-mini dsh-an-miniDanger",
		onClick: onConfirm
	}, say("popover.clearConfirmAction"))));
}

// src/client/ui/EmptyState.ts
const h$3 = react.default.createElement;
function EmptyState(props) {
	return h$3("div", { className: "dsh-an-empty" }, h$3("div", { className: "dsh-an-emptyIcon" }, h$3(IconEmpty, null)), h$3("div", { className: "dsh-an-emptyTitle" }, props.title), h$3("div", { className: "dsh-an-emptyBody" }, props.body));
}

// src/client/ui/NoteList.ts
/** Open/archived sections, their sticky heads, rows and the clear confirmation. */
const h$2 = react.default.createElement;
function NoteList(props) {
	const { say, listRef, listHasMore, syncListEdge, showOpen, toggleOpen, openItems, openListRef, openCount, total, row, hideEmptyState, showDone, toggleDone, doneItems, clearConfirmText, confirmClear, askClearConfirm, dismissClearConfirm, confirmClearDone } = props;
	return h$2("div", {
		className: "dsh-an-listViewport",
		"data-bottom": listHasMore ? "true" : void 0
	}, h$2("div", {
		className: "dsh-an-listArea",
		ref: listRef,
		onScroll: syncListEdge
	}, h$2("div", { className: "dsh-an-listSection" }, h$2("div", { className: "dsh-an-sectionHead" }, h$2("button", {
		type: "button",
		className: "dsh-an-doneToggle",
		"aria-expanded": showOpen ? "true" : "false",
		onClick: toggleOpen
	}, h$2("span", {
		className: "dsh-an-chevron",
		"data-open": showOpen ? "true" : "false"
	}, h$2(IconChevron, null)), say("list.open"), openCount ? h$2("span", { className: "dsh-an-sectionCount" }, String(openCount)) : null)), showOpen ? openItems.length ? h$2("ul", {
		className: "dsh-an-rows",
		ref: openListRef
	}, openItems.map(row)) : hideEmptyState ? null : h$2(EmptyState, {
		title: say(total ? "list.allArchived.title" : "popover.empty.title"),
		body: say(total ? "list.allArchived.body" : "popover.empty.body")
	}) : null), doneItems.length ? h$2("div", { className: "dsh-an-listSection" }, h$2("div", { className: "dsh-an-doneHead" }, h$2("button", {
		type: "button",
		className: "dsh-an-doneToggle",
		"aria-expanded": showDone ? "true" : "false",
		onClick: toggleDone
	}, h$2("span", {
		className: "dsh-an-chevron",
		"data-open": showDone ? "true" : "false"
	}, h$2(IconChevron, null)), say("popover.archived"), h$2("span", { className: "dsh-an-sectionCount" }, String(doneItems.length))), showDone ? h$2("button", {
		type: "button",
		className: "dsh-an-clear",
		"aria-expanded": confirmClear ? "true" : "false",
		onClick: askClearConfirm
	}, say("popover.clearArchived")) : null), showDone && confirmClear ? h$2(ClearConfirm, {
		say,
		text: clearConfirmText,
		onCancel: dismissClearConfirm,
		onConfirm: confirmClearDone
	}) : null, showDone ? h$2("ul", { className: "dsh-an-rows dsh-an-doneRows" }, doneItems.map(row)) : null) : null));
}

// src/client/ui/MemoPopover.ts
/**
* The floating notes panel.
*
* State, handlers and effects for the list in view; the markup lives in the
* sibling components, the geometry in usePanelGeometry and the store in
* useSessionMemoStore.
*/
const h$1 = react.default.createElement;
function subscribeStorageStatus(callback) {
	STORE_READY_LISTENERS.add(callback);
	TODO_LISTENERS.add(callback);
	return () => {
		STORE_READY_LISTENERS.delete(callback);
		TODO_LISTENERS.delete(callback);
	};
}
function MemoComposer({ composerRef, nameOfWorkspace, say, ...options }) {
	const { workspaceId, canUpload, storageInUse, report } = options;
	const { draft, draftLocked, isSubmitting, isRecalling, isUploading, addRef, composingRef, add, recall, addFiles, removeAttachment, onDraftChange, onDraftKeyDown } = useComposerDraft(options);
	react.default.useImperativeHandle(composerRef, () => ({
		recall,
		focus: () => addRef.current?.focus({ preventScroll: true })
	}));
	const destination = draft.workspaceId ?? workspaceId;
	let destinationHint;
	if (!destination) destinationHint = say("scope.loading");
	else if (destination !== workspaceId || destination === "sideby-note:unassigned") destinationHint = say("add.destination", { workspace: nameOfWorkspace(destination) });
	return h$1(ComposerForm, {
		say,
		draft: draft.add,
		destination: destinationHint,
		destinationPending: !destination,
		attachments: draft.attachments,
		draftLocked,
		isSubmitting,
		isRecalling,
		isUploading,
		canUpload,
		storageInUse,
		onFiles: addFiles,
		onRemove: removeAttachment,
		onUnavailable: () => report("attachmentUnavailable"),
		onBusy: () => report("attachmentBusy"),
		inputRef: addRef,
		onDraftChange,
		onCompositionStart: () => {
			composingRef.current = true;
		},
		onCompositionEnd: () => {
			composingRef.current = false;
		},
		onKeyDown: onDraftKeyDown,
		onSubmit: (event) => {
			event.preventDefault();
			if (!composingRef.current) add();
		}
	});
}
function MemoPopover(props) {
	const say = props.say;
	const localeService = props.locale;
	const subscribeLocale = react.default.useCallback((callback) => {
		if (localeService && typeof localeService.subscribe === "function") return localeService.subscribe(callback);
		return () => {};
	}, [localeService]);
	const readLocaleRevision = react.default.useCallback(() => {
		if (!localeService) return 0;
		try {
			const snapshot = typeof localeService.getSnapshot === "function" ? localeService.getSnapshot() : localeService.getLocale();
			return snapshot && typeof snapshot.revision === "number" ? snapshot.revision : 0;
		} catch {
			return 0;
		}
	}, [localeService]);
	react.default.useSyncExternalStore(subscribeLocale, readLocaleRevision, () => 0);
	const localeId = typeof props.getLocaleId === "function" ? props.getLocaleId() : props.localeId || "en";
	const sessionId = props.sessionId || "";
	/** The saved filter applies whenever its workspace is available. */
	const [mode, setMode] = react.default.useState(() => readScopeMode());
	react.default.useEffect(() => {
		const onStorage = (event) => {
			if (event && event.key === "dsh.aside-note.scope-mode") setMode(readScopeMode());
		};
		const onStoreChange = () => {
			const current = storageMode();
			if (current === "host" || current === "error") setMode(readScopeMode());
		};
		TODO_LISTENERS.add(onStoreChange);
		window.addEventListener("storage", onStorage);
		return () => {
			TODO_LISTENERS.delete(onStoreChange);
			window.removeEventListener("storage", onStorage);
		};
	}, []);
	const workspace = workspaceForSession(sessionId);
	const catalogReady = workspaceCatalogReady();
	const workspaceId = workspace?.workspaceId ?? (catalogReady ? "sideby-note:unassigned" : null);
	const workspaceFilter = mode === "workspace" ? workspace?.workspaceId ?? null : null;
	const effectiveMode = workspaceFilter ? "workspace" : "global";
	const nameOfWorkspace = (id) => id === "sideby-note:unassigned" ? say("scope.unassigned") : workspaceById(id)?.title || id;
	const draftKey = draftKeyForSession(sessionId);
	const report = typeof props.onToast === "function" ? props.onToast : () => {};
	const { allItems, syncError, commit } = useMemoStore(workspaceFilter);
	const workspaceItems = react.default.useMemo(() => workspace ? allItems.filter((item) => item.workspaceId === workspace.workspaceId) : [], [allItems, workspace]);
	const items = react.default.useMemo(() => workspaceFilter ? workspaceItems.map((item) => ({
		...item,
		id: item.noteId
	})) : allItems, [
		allItems,
		workspaceFilter,
		workspaceItems
	]);
	const storeMode = react.default.useSyncExternalStore(subscribeStorageStatus, storageMode, storageMode);
	const countsAvailable = storeMode === "host" || storeMode === "local";
	const globalOpenCount = countsAvailable ? allItems.filter((item) => !item.done).length : null;
	const workspaceOpenCount = countsAvailable && workspace ? workspaceItems.filter((item) => !item.done).length : null;
	const countStatus = storeMode === "error" ? say("storage.hostError") : say("storage.loading");
	const failure = react.default.useSyncExternalStore(subscribeStorageStatus, storageFailure, storageFailure);
	const connectionError = storeMode === "error" || storeMode === "host" && isHostConnectionFailure(failure);
	const storageInUse = connectionError && failure?.code === "STORE_IN_USE";
	const [retrying, setRetrying] = react.default.useState(false);
	const { sectionsRef, showOpen, showDone, toggleOpen, toggleDone, applySections } = useSections();
	const update = useUpdateCenter(localeId);
	const inserting = react.default.useRef(/* @__PURE__ */ new Set());
	const canUpload = storeMode === "host";
	const composerRef = react.default.useRef(null);
	const { archive, move, takeBack } = useNoteActions({
		commit,
		report
	});
	const panelRef = react.default.useRef(null);
	const { style, commitPanelWidth, commitPanelHeight, startPanelResize, startPanelHeightResize, onPanelResizeKeyDown, onPanelHeightKeyDown } = usePanelGeometry(props.anchorRef, props.placement, panelRef);
	const openItems = items.filter((item) => !item.done);
	const doneItems = items.filter((item) => item.done).sort(compareDoneItems);
	const openCount = openItems.length;
	const total = items.length;
	const { listRef, listHasMore, syncListEdge } = useListEdge({
		items,
		showOpen,
		showDone
	});
	const openById = new Map(openItems.map((item) => [item.id, item]));
	const reorder = useRowReorder({
		ids: openItems.map((item) => item.id),
		groupFor: (id) => openById.get(id)?.workspaceId,
		scrollRef: listRef,
		onMove: (id, index) => {
			const item = openById.get(id);
			if (!item) return Promise.resolve(false);
			const first = openItems.findIndex((candidate) => candidate.workspaceId === item.workspaceId);
			return move(item, index - first);
		}
	});
	useOutsideDismiss(panelRef, props.anchorRef, props.onClose);
	const clearDone = async () => {
		const idsByWorkspace = /* @__PURE__ */ new Map();
		for (const item of doneItems) {
			const ids = idsByWorkspace.get(item.workspaceId);
			if (ids) ids.add(item.noteId);
			else idsByWorkspace.set(item.workspaceId, /* @__PURE__ */ new Set([item.noteId]));
		}
		let clearedAny = false;
		for (const [owner, ids] of idsByWorkspace) {
			if (!await commit(owner, (current) => current.filter((item) => !item.done || !ids.has(item.id)))) {
				report(clearedAny ? "clearPartial" : "saveFailed");
				return;
			}
			clearedAny = true;
		}
		report("cleared");
		applySections({
			open: sectionsRef.current.open,
			done: false
		});
	};
	const { confirmClear, askClearConfirm, dismissClearConfirm, confirmClearDone } = useClearConfirm({
		scope: workspaceFilter,
		showDone,
		doneCount: doneItems.length,
		onConfirm: clearDone
	});
	const chooseScope = (next) => {
		if (next === effectiveMode) return;
		writeScopeMode(next);
		setMode(next);
		dismissClearConfirm();
		notifyTodoChange();
	};
	/**
	* Inserting a note into the conversation archives it: its text goes into the
	* conversation composer and the row moves to the archive in the same step.
	* When no composer is on screen nothing changes, so the note stays open.
	*/
	const insertItem = async (item) => {
		if (inserting.current.has(item.id)) return;
		const mode = storageMode();
		if (mode === "probing" || mode === "error") {
			report("saveFailed");
			return;
		}
		const hasText = Boolean(item.text);
		if (hasText && !appendToConversation(item.text)) {
			report("insertFailed");
			return;
		}
		inserting.current.add(item.id);
		try {
			const ok = await archive(item);
			if (ok && hasText && item.attachments?.length) report("attachmentTextInserted");
			else report(hasText ? ok ? "inserted" : "archiveFailed" : ok ? "archived" : "saveFailed");
		} finally {
			inserting.current.delete(item.id);
		}
	};
	/**
	* 退回 moves the note's text into the top composer and removes the row.
	* The composer is the only text editor, so recalling over an existing draft
	* would silently destroy it; ask the user to send or clear it first instead.
	*/
	const recallItem = (item) => {
		if (!inserting.current.has(item.id)) composerRef.current?.recall(item, takeBack);
	};
	const row = (item) => {
		const owner = item.workspaceId;
		const showWorkspace = effectiveMode === "global";
		const canOpenWorkspace = showWorkspace && owner !== "sideby-note:unassigned" && workspaceById(owner) !== void 0 && props.onOpenWorkspace;
		return h$1(TodoRow, {
			key: item.id,
			item,
			archived: item.done === true,
			workspaceName: showWorkspace ? nameOfWorkspace(owner) : void 0,
			isCurrentWorkspace: workspace?.workspaceId === owner,
			onOpenWorkspace: canOpenWorkspace ? () => props.onOpenWorkspace(owner) : void 0,
			say,
			localeId,
			onToast: report,
			onInsert: insertItem,
			onRecall: recallItem,
			dragProps: item.done ? void 0 : reorder.dragProps(item.id),
			onReorderKey: item.done ? void 0 : reorder.reorderKey(item.id)
		});
	};
	return h$1("div", {
		ref: panelRef,
		className: props.placement === "right" ? "dsh-an-popover dsh-an-popoverRight" : "dsh-an-popover",
		style,
		role: "dialog",
		"aria-label": say("popover.title")
	}, props.placement === "right" ? h$1("div", {
		className: "dsh-an-resizeHandle",
		role: "separator",
		"aria-orientation": "vertical",
		"aria-label": say("resize.width"),
		tabIndex: 0,
		title: say("resize.hint"),
		onPointerDown: startPanelResize,
		onDoubleClick: () => commitPanelWidth(360),
		onKeyDown: onPanelResizeKeyDown
	}) : null, props.placement === "right" ? h$1("div", {
		className: "dsh-an-resizeHandleBottom",
		role: "separator",
		"aria-orientation": "horizontal",
		"aria-label": say("resize.height"),
		tabIndex: 0,
		title: say("resize.hint"),
		onPointerDown: startPanelHeightResize,
		onDoubleClick: () => commitPanelHeight(0),
		onKeyDown: onPanelHeightKeyDown
	}) : null, h$1(PanelHead, {
		say,
		globalOpenCount,
		workspaceOpenCount,
		workspaceName: workspace ? workspace.title || say("scope.workspace") : null,
		workspacePending: !workspace && !catalogReady,
		countStatus,
		onClose: props.onClose,
		scopeMode: effectiveMode,
		onScopeChange: chooseScope
	}), connectionError && h$1("div", { className: "dsh-an-storageStatus" }, h$1("div", { role: "status" }, h$1("p", null, say(storageInUse ? "storage.inUse" : "storage.hostError")), failure && h$1("p", { className: "dsh-an-storageFailure" }, say("storage.failure", { code: failure.code }))), h$1("button", {
		type: "button",
		className: "dsh-an-mini dsh-an-reconnect",
		"aria-disabled": retrying,
		"aria-busy": retrying,
		onClick: async (event) => {
			if (retrying) return;
			const button = event.currentTarget;
			const hadFocus = document.activeElement === button;
			setRetrying(true);
			try {
				if (await retryStorage() === "host" && hadFocus && (document.activeElement === button || document.activeElement === document.body)) composerRef.current?.focus();
			} finally {
				setRetrying(false);
			}
		}
	}, say(retrying ? "storage.reconnecting" : "storage.retry"))), h$1(MemoComposer, {
		key: draftKey,
		composerRef,
		nameOfWorkspace,
		say,
		draftKey,
		workspaceId,
		commit,
		report,
		storageInUse,
		canUpload,
		focusOnMount: props.focusComposerOnMount
	}), storeMode === "probing" && h$1("p", {
		className: "dsh-an-listStatus",
		role: "status"
	}, countStatus), storeMode !== "probing" && h$1(NoteList, {
		say,
		listRef,
		listHasMore,
		syncListEdge,
		showOpen,
		toggleOpen,
		openItems,
		openListRef: reorder.listRef,
		hideEmptyState: storageInUse,
		openCount,
		total,
		row,
		showDone,
		toggleDone,
		doneItems,
		clearConfirmText: say(workspaceFilter ? "popover.clearConfirm" : "popover.clearGlobalConfirm", { n: doneItems.length }),
		confirmClear,
		askClearConfirm,
		dismissClearConfirm,
		confirmClearDone
	}), h$1(PanelFooter, {
		say,
		mode: connectionError ? "error" : storeMode,
		syncError,
		update,
		onToast: report
	}));
}

// src/client/index.ts
/**
* Sideby Note browser half.
*
* The plugin entry: injects the stylesheet, binds the locale namespace and
* seats the two slots (session capture + frame-wide toast host) plus the
* host-owned header entry. Copy, storage, domain rules and the panel UI live
* in their own modules; P2 splits the remaining UI out of this file.
*/
const h = react.default.createElement;
const toggleCommandId = `${NS}.toggle`;
const desktopToggle = {
	code: "KeyE",
	modifiers: ["primary"]
};
const webToggle = {
	code: "KeyE",
	modifiers: ["primary", "alt"]
};
/** Workspace hooks are optional on profiles without the workspace UI. */
const useNoWorkspace = () => null;
/** Hosts without a session list cannot tell a new session from an old one. */
const useNoSessions = () => void 0;
function isWorkspaceSnapshot(value) {
	return Boolean(value && typeof value === "object" && "items" in value && Array.isArray(value.items));
}
/** Compact floating memo list, anchored to the entry that opened it. */
function apply(ctx) {
	const locale = ctx.get("locale");
	let workspaceCatalog = null;
	ctx.effect(() => {
		const style = document.createElement("style");
		style.dataset.dshPlugin = "dsh-sideby-note";
		style.textContent = `${officialAttachmentCSS}\n${panel_css_default}`;
		document.head.appendChild(style);
		return () => {
			style.remove();
		};
	}, "dsh-sideby-note: styles");
	if (locale && typeof locale.register === "function") ctx.effect(() => locale.register(NS, DICT), "dsh-sideby-note: dictionaries");
	const localeId = () => {
		try {
			const service = ctx.get("locale") || locale;
			const current = service && typeof service.getSnapshot === "function" ? service.getSnapshot() : service && typeof service.getLocale === "function" ? service.getLocale() : null;
			const id = typeof current === "string" ? current : current && (current.active || current.id || current.locale);
			return typeof id === "string" && id ? id : "en";
		} catch {
			return "en";
		}
	};
	const say = makeSay(ctx, localeId);
	const tr = (key, vars) => fill(say(key), vars);
	let activePopover = null;
	let activeSessionId = "";
	const toastSeat = createToastSeat(tr);
	let refreshHeaderEntry = () => {};
	ctx.effect(() => {
		const onNotice = (notice) => {
			if (notice.kind === "migrated") toastSeat.showText(tr("storage.migrated", { n: notice.count }));
			else if (notice.kind === "keptLocal") toastSeat.showText(tr("storage.keptLocal"));
			else toastSeat.showText(tr("storage.notSwitched"));
		};
		const onError = (failure) => {
			if (failure.code === "STORE_IN_USE") {
				toastSeat.showText(tr("storage.inUse"), null);
				return;
			}
			const hostDown = failure.code === "STORE_UNREACHABLE" || failure.code === "STORE_TIMEOUT" || failure.code === "STORE_UNAVAILABLE" || failure.code === "STORE_OPEN_FAILED" || failure.code === "STORE_FORBIDDEN";
			toastSeat.showText(tr(hostDown ? "storage.hostError" : "toast.saveFailed"));
		};
		STORE_NOTICE_LISTENERS.add(onNotice);
		STORE_ERROR_LISTENERS.add(onError);
		return () => {
			STORE_NOTICE_LISTENERS.delete(onNotice);
			STORE_ERROR_LISTENERS.delete(onError);
		};
	}, "dsh-sideby-note: storage notices");
	const closeMemoPopover = (restoreFocus = true) => {
		const current = activePopover;
		activePopover = null;
		if (!current) return;
		const hadFocus = restoreFocus && current.container.contains(document.activeElement);
		try {
			current.root.unmount();
		} catch {}
		current.container.remove();
		const anchor = current.anchorRef.current;
		if (hadFocus && anchor && anchor.isConnected && typeof anchor.focus === "function") anchor.focus({ preventScroll: true });
		refreshHeaderEntry();
	};
	const getWorkspaceNavigation = () => {
		const service = ctx.get("uiWorkspace");
		return typeof service?.openWorkspace === "function" ? service : void 0;
	};
	const openNoteWorkspace = (targetId) => {
		if (workspaceForSession(activeSessionId)?.workspaceId === targetId) return;
		const panel = activePopover;
		const target = workspaceById(targetId);
		const navigation = getWorkspaceNavigation();
		if (!panel || !target || !navigation) return;
		navigation.openWorkspace(target.workspaceId, (sessionId) => {
			if (activePopover === panel) panel.navigation = {
				sessionId,
				workspace: target
			};
		}).catch((error) => {
			console.warn("workspace jump failed:", error);
		});
	};
	const prepareMemoSession = (sessionId) => {
		const workspace = workspaceForSession(sessionId);
		if (workspace) ensureDraftScope(draftKeyForSession(sessionId), sessionId, workspace.sessionIds);
	};
	const renderMemoPopover = (panel) => {
		panel.root.render(h(MemoPopover, {
			sessionId: panel.sessionId,
			say: tr,
			locale,
			getLocaleId: localeId,
			anchorRef: panel.anchorRef,
			placement: "right",
			focusComposerOnMount: panel.focusComposerOnMount,
			onClose: closeMemoPopover,
			onOpenWorkspace: getWorkspaceNavigation() ? openNoteWorkspace : void 0,
			onToast: (kind) => toastSeat.show(kind)
		}));
	};
	const openMemoPopover = (sessionId, anchor) => {
		if (activePopover && activePopover.anchorRef.current === anchor) {
			closeMemoPopover();
			return;
		}
		closeMemoPopover();
		if (storageMode() === "host") requestHostRefresh();
		if (workspaceCatalog) migrateWorkspaceNotes(workspaceCatalog);
		prepareMemoSession(sessionId);
		setForwardTarget(sessionId);
		const container = document.createElement("div");
		container.dataset.dshMemoPopoverRoot = "true";
		document.body.appendChild(container);
		activePopover = {
			container,
			root: react_dom_client.default.createRoot(container),
			anchorRef: { current: anchor },
			sessionId,
			focusComposerOnMount: true
		};
		renderMemoPopover(activePopover);
		refreshHeaderEntry();
	};
	let shortcuts;
	const readToggleShortcut = () => {
		if (shortcuts?.config.getSnapshot().status === "loading") return void 0;
		return shortcuts?.catalog.getSnapshot().find((row) => row.id === toggleCommandId);
	};
	const headerEntry = createHeaderEntry({
		getShortcut: readToggleShortcut,
		getSessionId: () => activeSessionId,
		getActiveAnchor: () => activePopover?.anchorRef.current ?? null,
		getLocaleId: () => localeId(),
		tr,
		onOpen: openMemoPopover,
		onAnchor: (sessionId, anchor) => {
			const panel = activePopover;
			if (!panel || panel.sessionId !== sessionId || panel.anchorRef.current === anchor) return;
			panel.anchorRef = { current: anchor };
			renderMemoPopover(panel);
		}
	});
	refreshHeaderEntry = headerEntry.refresh;
	if (locale && typeof locale.subscribe === "function") ctx.effect(() => locale.subscribe(() => refreshHeaderEntry()), "dsh-sideby-note: locale changes");
	ctx.effect(() => headerEntry.attach(() => closeMemoPopover()), "dsh-sideby-note: right-side entry");
	ctx.inject?.(["shortcuts"], (shortcutCtx) => {
		const service = shortcutCtx.get("shortcuts");
		shortcutCtx.effect(() => {
			const unregister = service.register({
				id: toggleCommandId,
				label: () => say("shortcut.toggle"),
				aliases: ["sideby note"],
				defaults: {
					"desktop:macos": desktopToggle,
					"desktop:windows": desktopToggle,
					"desktop:linux": desktopToggle,
					"web:macos": webToggle,
					"web:windows": webToggle
				},
				regions: ["page", "editable"],
				modals: [],
				resolve: ({ modal }) => {
					if (modal !== null) return { status: "pass" };
					const button = headerEntry.buttonForSession();
					if (!button || !button.getClientRects().length) return { status: "pass" };
					return {
						status: "handled",
						run: () => button.click()
					};
				}
			});
			shortcuts = service;
			const unsubscribe = service.catalog.subscribe(headerEntry.refreshShortcut);
			headerEntry.refreshShortcut();
			return () => {
				unsubscribe();
				unregister();
				shortcuts = void 0;
				headerEntry.refreshShortcut();
			};
		}, "dsh-sideby-note: toggle shortcut");
	});
	function BoundSessionCapture(props) {
		const sessionId = props.sessionId || "";
		const hasWorkspaceHook = typeof props.useWorkspaces === "function";
		const useWorkspaces = hasWorkspaceHook ? props.useWorkspaces : useNoWorkspace;
		const useSessions = typeof props.useSessions === "function" ? props.useSessions : useNoSessions;
		const snapshot = useWorkspaces((state) => state);
		const sessionReady = useSessions((state) => state?.byId?.[sessionId])?.blank !== true;
		const catalog = react.default.useMemo(() => {
			if (!hasWorkspaceHook) return [];
			if (!isWorkspaceSnapshot(snapshot) || snapshot.phase !== void 0 && snapshot.phase !== "ready") return null;
			return snapshot.items.flatMap((candidate) => {
				if (!candidate || typeof candidate !== "object" || !("workspaceId" in candidate) || typeof candidate.workspaceId !== "string" || !candidate.workspaceId) return [];
				return [{
					workspaceId: candidate.workspaceId,
					title: "title" in candidate && typeof candidate.title === "string" ? candidate.title : "",
					sessionIds: "sessionIds" in candidate && Array.isArray(candidate.sessionIds) ? candidate.sessionIds.filter((id) => typeof id === "string") : []
				}];
			});
		}, [hasWorkspaceHook, snapshot]);
		const listedWorkspace = catalog?.find((candidate) => candidate.sessionIds.includes(sessionId));
		react.default.useEffect(() => {
			const panel = activePopover;
			const navigation = panel?.navigation;
			const followedJump = navigation?.sessionId === sessionId;
			const workspace = listedWorkspace ?? (followedJump ? navigation.workspace : null);
			const sessionChanged = activeSessionId !== sessionId;
			const workspaceChanged = workspaceForSession(activeSessionId)?.workspaceId !== workspace?.workspaceId;
			const resolvedCurrentWorkspace = !sessionChanged && workspaceCatalog === null && catalog !== null;
			workspaceCatalog = catalog;
			bindWorkspace(sessionId, workspace, sessionReady, catalog);
			activeSessionId = sessionId;
			if (sessionChanged) setForwardTarget(sessionId);
			if (panel && (followedJump || resolvedCurrentWorkspace)) {
				if (followedJump && listedWorkspace) delete panel.navigation;
				if (sessionChanged || workspaceChanged) {
					prepareMemoSession(sessionId);
					panel.sessionId = sessionId;
					panel.focusComposerOnMount = false;
					renderMemoPopover(panel);
				}
			} else if (sessionChanged || workspaceChanged) closeMemoPopover();
			if (catalog) migrateWorkspaceNotes(catalog);
			notifyTodoChange();
			refreshHeaderEntry();
		}, [
			sessionId,
			listedWorkspace,
			sessionReady,
			catalog
		]);
		return null;
	}
	ctx.effect(() => {
		const onReady = () => {
			if (workspaceCatalog) migrateWorkspaceNotes(workspaceCatalog);
			refreshHeaderEntry();
			notifyTodoChange();
		};
		const onStorage = (event) => {
			if (event.key === "dsh.aside-note.storage-mode" && event.newValue === "host" && storageMode() === "local") retryStorage();
		};
		STORE_READY_LISTENERS.add(onReady);
		window.addEventListener("storage", onStorage);
		bootStorage();
		return () => {
			STORE_READY_LISTENERS.delete(onReady);
			window.removeEventListener("storage", onStorage);
		};
	}, "dsh-sideby-note: storage boot");
	ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({
		name: "conversation.composer.dock",
		id: PANEL_ID,
		order: 30,
		locale: NS
	}, BoundSessionCapture));
	ctx.slots.inject("conversation.hero.options", () => ctx.slots.register({
		name: "conversation.hero.options",
		id: `${PANEL_ID}.new-session`,
		order: 30,
		locale: NS
	}, BoundSessionCapture));
	ctx.slots.inject("shell.overlay", () => ctx.slots.register({
		name: "shell.overlay",
		id: `${PANEL_ID}.toast`,
		order: 60,
		locale: NS
	}, toastSeat.ToastHost));
}
module.exports = {
	inject: ["slots"],
	apply
};

return module.exports; } });