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
let react_dom = require("react-dom");
react_dom = __toESM(react_dom, 1);

// \0dsh-css:src/client/styles/panel.css.mjs
var panel_css_default = "/*\n * Panel, composer dock, header entry and toast styles.\n *\n * Only DSH semantic aliases and the shared scale are used here — no palette of\n * its own. The entry point injects this sheet once for the whole frame, because\n * the dock mounts outside the panel tree.\n */\n/* ── 1 令牌 · 只映射 DSH 语义别名与共享尺度，不新建调色板 ─────────── */\nbody{--an-space-1:4px;--an-space-2:8px;--an-space-3:12px;--an-space-4:16px;--an-space-5:24px;--an-space-6:32px;--an-radius-pill:999px;--an-fs-caption:12px;--an-lh-caption:20px;--an-fs-row:13px;--an-lh-row:20px;--an-fs-title:14px;--an-lh-title:20px;--an-hover:var(--dsw-alias-interactive-bg-hover);--an-active:var(--dsw-alias-interactive-bg-active);--an-field:var(--dsw-alias-bg-layer-1);--an-field-line:var(--dsw-alias-border-l4);--an-divider:var(--dsw-alias-border-l2);--an-dur-fast:var(--ds-transition-duration-fast);--an-dur-base:var(--ds-transition-duration);--an-dur-spin:700ms;--an-ease:var(--ds-ease-in-out);--an-transition:background-color var(--an-dur-fast) var(--an-ease),border-color var(--an-dur-fast) var(--an-ease),color var(--an-dur-fast) var(--an-ease),opacity var(--an-dur-fast) var(--an-ease),transform var(--an-dur-fast) var(--an-ease),box-shadow var(--an-dur-fast) var(--an-ease)}\n\n/* ── 2 浮层 · 菜单材质 + 三层阴影，边框为 0（发丝线在阴影第一层） ── */\n.dsh-an-popover{position:fixed;z-index:1000;box-sizing:border-box;display:flex;flex-direction:column;gap:var(--an-space-3);min-height:0;padding:var(--an-space-4);border:0;border-radius:var(--dsw-radius-panel);background:var(--dsh-an-panelSurface);box-shadow:var(--dsw-elevation-panel);color:var(--dsw-alias-label-primary);font-size:var(--an-fs-row);line-height:var(--an-lh-row);--dsw-elevation-stroke-color:var(--dsw-alias-border-l2);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2,var(--an-divider));--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2,var(--dsw-alias-scrollbar-bg-l2,var(--an-divider)));--dsh-an-panelSurface:var(--dsw-alias-bg-layer-2);--dsh-an-listGutter:var(--an-space-4);--dsh-an-scrollRail:9px;--dsh-an-scrollInset:2px;overflow:hidden;animation:dsh-an-pop-in var(--an-dur-base) var(--an-ease) both}\n.dsh-an-popoverRight{padding-left:var(--an-space-4)}\n\n/* ── 3 面板头 · 标题与计数同一行，动作收在右侧 ───────────────────── */\n.dsh-an-popHead{display:flex;align-items:center;justify-content:space-between;gap:var(--an-space-3);min-width:0}\n.dsh-an-popTitleLine{display:flex;align-items:center;gap:var(--an-space-3);flex:1 1 auto;min-width:0}\n.dsh-an-popTitle{min-width:0;overflow:hidden;font-size:var(--an-fs-title);line-height:var(--an-lh-title);font-weight:500;color:var(--dsw-alias-label-primary);white-space:nowrap;text-overflow:ellipsis}\n.dsh-an-popMeta{min-width:0;margin:0;overflow:hidden;font-size:var(--an-fs-caption);line-height:16px;color:var(--dsw-alias-label-secondary);font-weight:400;font-variant-numeric:tabular-nums;white-space:nowrap;text-overflow:ellipsis}\n.dsh-an-popActions{display:flex;align-items:center;flex:none;gap:var(--an-space-2)}\n.dsh-an-popClose,.dsh-an-settingsBtn{display:grid;place-items:center;flex:none;width:24px;height:24px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-popClose:active,.dsh-an-settingsBtn:active{background:var(--an-active)}\n.dsh-an-settingsBtn[data-active=\"true\"]{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-settingsBtn{position:relative}\n.dsh-an-updateDot{position:absolute;top:3px;right:3px;width:6px;height:6px;border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-brand-primary);box-shadow:0 0 0 2px var(--dsh-an-panelSurface)}\n/* The list-scope switch sits at the far right of the title line. */\n.dsh-an-scope{display:inline-flex;align-items:center;flex:none;box-sizing:border-box;height:24px;padding:1px;margin-left:auto;border:0.5px solid var(--dsw-alias-border-l2);border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-bg-layer-1)}\n.dsh-an-scopeBtn{display:inline-flex;align-items:center;justify-content:center;height:20px;padding:0 var(--an-space-2);border:0;border-radius:var(--an-radius-pill);corner-shape:round;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--an-fs-caption);line-height:16px;font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-scopeBtn[data-active=\"true\"]{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}\n.dsh-an-scopeBtn:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:1px}\n\n/* ── 4 添加区 · 嵌套表单组 R16，字段 0.5px 发丝线 ──────────────────── */\n.dsh-an-add{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:var(--an-space-2);padding:var(--an-space-3);border:0.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill);transition:var(--an-transition)}\n.dsh-an-add:focus-within{border-color:var(--dsw-alias-state-business-primary)}\n.dsh-an-input{display:block;align-self:center;width:100%;min-width:0;box-sizing:border-box;min-height:var(--an-lh-row);max-height:120px;padding:0;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-row);line-height:var(--an-lh-row);resize:none;overflow-y:auto;overflow-x:hidden}\n.dsh-an-input::placeholder{color:var(--dsw-alias-label-secondary)}\n.dsh-an-addBtn{display:grid;place-items:center;width:28px;height:28px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);cursor:pointer;transition:var(--an-transition)}\n.dsh-an-addBtn:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:1px}\n.dsh-an-addBtn:active{background:var(--dsw-alias-button-primary-dimmed);transform:scale(.97)}\n.dsh-an-addBtn[disabled]{background:transparent;color:var(--dsw-alias-label-secondary);box-shadow:inset 0 0 0 0.5px var(--an-field-line);cursor:not-allowed}\n\n/* ── 5 分区与列表 · 9px 轨道内嵌 2px，底部羽化只盖内容不盖滚动条 ──── */\n/* The viewport grows into the popover padding so the 9px rail does not steal from the cards; the list pays the padding back minus the rail, so cards and the add field keep one content width at every panel size. */\n.dsh-an-listViewport{position:relative;display:flex;flex-direction:column;flex:1 1 auto;min-height:0;margin-right:calc(var(--dsh-an-listGutter) * -1)}\n/* Bottom edge treatment: a viewport-fixed alpha mask over the scroller itself, exactly like the DSH scroll areas. The first gradient fades the last 48px to transparent; the second keeps the 9px scrollbar rail opaque so the thumb stays crisp. There is no backdrop-filter layer, so there is no hard compositing edge to see. */\n.dsh-an-listViewport[data-bottom=\"true\"] .dsh-an-listArea{--dsh-an-fadeHeight:calc(var(--an-space-6) + var(--an-space-4));-webkit-mask-image:linear-gradient(to bottom,currentColor 0,currentColor calc(100% - var(--dsh-an-fadeHeight)),transparent 100%),linear-gradient(to right,transparent calc(100% - var(--dsh-an-scrollRail)),currentColor calc(100% - var(--dsh-an-scrollRail)));mask-image:linear-gradient(to bottom,currentColor 0,currentColor calc(100% - var(--dsh-an-fadeHeight)),transparent 100%),linear-gradient(to right,transparent calc(100% - var(--dsh-an-scrollRail)),currentColor calc(100% - var(--dsh-an-scrollRail)));-webkit-mask-composite:source-over;mask-composite:add}\n/* Geometry only: the shared DSH skin paints the thumb, so the plugin declares no scrollbar pseudo-elements. The popover already binds the l2 thumb pair for the menu material. */\n.dsh-an-listArea{--dsh-scrollbar-width:var(--dsh-an-scrollRail);--dsh-scrollbar-thumb-border:var(--dsh-an-scrollInset);display:flex;flex-direction:column;flex:1 1 auto;min-height:0;padding-right:calc(var(--dsh-an-listGutter) - var(--dsh-an-scrollRail));overflow-x:hidden;overflow-y:auto;scrollbar-gutter:stable}\n/* The settings card rides the same rail as the list. When the panel is shorter than the card, the viewport takes the squeeze and scrolls instead of letting the card run under the popover's clipped bottom edge; the card keeps one content width in both states. */\n.dsh-an-settingsViewport{display:flex;flex-direction:column;flex:0 1 auto;min-height:0;margin-right:calc(var(--dsh-an-listGutter) * -1);padding-right:calc(var(--dsh-an-listGutter) - var(--dsh-an-scrollRail));overflow-x:hidden;overflow-y:auto;scrollbar-gutter:stable;--dsh-scrollbar-width:var(--dsh-an-scrollRail);--dsh-scrollbar-thumb-border:var(--dsh-an-scrollInset)}\n/* While settings is open the list yields its height first, so the card keeps its natural height until there is nothing left to take from the list. */\n.dsh-an-popover[data-settings=\"true\"] .dsh-an-listViewport{flex-shrink:10000}\n.dsh-an-listSection{display:flex;flex-direction:column;gap:var(--an-space-2);min-width:0}\n.dsh-an-listSection+.dsh-an-listSection{margin-top:var(--an-space-2)}\n.dsh-an-sectionHead,.dsh-an-doneHead{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:var(--an-space-3);min-height:28px;margin:0;padding:var(--an-space-1) 0;background:transparent;transition:background-color var(--an-dur-fast) var(--an-ease)}\n.dsh-an-sectionHead[data-stuck],.dsh-an-doneHead[data-stuck]{background:var(--dsh-an-panelSurface,var(--dsw-alias-bg-layer-2))}\n.dsh-an-doneToggle{display:flex;align-items:center;gap:var(--an-space-2);flex:none;min-width:0;margin:0;padding:var(--an-space-1) var(--an-space-2) var(--an-space-1) 0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;text-align:left;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-doneToggle:active{background:var(--an-active)}\n.dsh-an-doneToggle[disabled]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}\n.dsh-an-chevron{display:flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;color:var(--dsw-alias-label-secondary);transition:transform var(--an-dur-fast) var(--an-ease)}\n.dsh-an-chevron[data-open=\"true\"]{transform:rotate(90deg)}\n.dsh-an-sectionCount{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 var(--an-space-1);border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary);font-size:var(--an-fs-caption);line-height:16px;font-weight:500;font-variant-numeric:tabular-nums}\n.dsh-an-clear{display:inline-flex;align-items:center;flex:none;height:24px;margin-left:auto;padding:0 var(--an-space-2);border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-clear:active{background:var(--an-active);color:var(--dsw-alias-label-primary)}\n.dsh-an-clearConfirm{display:flex;align-items:center;justify-content:space-between;gap:var(--an-space-2);min-width:0;margin-top:var(--an-space-1);padding:var(--an-space-2);border:0.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill)}\n.dsh-an-clearConfirmText{flex:1 1 auto;min-width:0;margin:0;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-primary);overflow-wrap:anywhere}\n.dsh-an-clearConfirmActions{display:flex;align-items:center;flex:none;gap:var(--an-space-1)}\n.dsh-an-doneRows{margin-top:var(--an-space-2)}\n.dsh-an-rows{list-style:none;display:flex;flex-direction:column;gap:2px;margin:0;padding:0}\n/* A note is a bare line on the panel surface: no card, no divider. Grip, text and one trailing cell; the grip column keeps the text on the section label's edge. */\n.dsh-an-row{position:relative;display:grid;grid-template-columns:16px minmax(0,1fr) auto;align-items:start;column-gap:var(--an-space-1);padding:var(--an-space-1);border-radius:var(--dsw-radius-sm);transition:var(--an-transition)}\n\n/* ── 6 一行便笺 · 把手 16 列，正文 13/20，尾格静置显示时间、悬停换成操作 ── */\n/* The grip is a drag handle and a keyboard control (↑/↓). Touch keeps it visible in the quiet non-text ink; pointer devices reveal it on hover. */\n.dsh-an-grip{display:flex;align-items:center;justify-content:center;width:16px;height:24px;margin:-2px 0 0;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;transition:var(--an-transition)}\n.dsh-an-gripSpacer{width:16px}\n.dsh-an-text{display:block;min-width:0;margin:0;padding:0;color:var(--dsw-alias-label-primary);font-size:var(--an-fs-row);line-height:var(--an-lh-row);white-space:pre-wrap;overflow-wrap:anywhere;user-select:text;-webkit-user-select:text}\n.dsh-an-rowArchived .dsh-an-text{color:var(--dsw-alias-label-secondary)}\n/* Age and actions share one grid cell, so the swap never reflows the text. */\n.dsh-an-trail{display:grid;align-items:center;justify-items:end;min-height:24px;margin:-2px 0 0}\n.dsh-an-trail>*{grid-area:1/1}\n.dsh-an-meta{padding:0 var(--an-space-1);font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;white-space:nowrap;opacity:0;transition:opacity var(--an-dur-fast) var(--an-ease)}\n\n/* ── 7 行操作 · 图标按钮 H24/R8，触摸端常显 ────────────────────────── */\n.dsh-an-actions{display:flex;flex:none;gap:2px;transition:opacity var(--an-dur-fast) var(--an-ease)}\n.dsh-an-iconBtn{position:relative;display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-iconBtn:active{background:var(--an-active);color:var(--dsw-alias-label-primary);transform:scale(.94)}\n.dsh-an-iconBtn:disabled,.dsh-an-iconBtn[disabled]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}\n.dsh-an-glyphFlip{transform:scaleX(-1)}\n\n/* ── 7b 拖拽排序 · 抬起的行跟手，其余行用 transform 让位 ─────────────── */\n.dsh-an-rows[data-dragging=\"true\"],.dsh-an-rows[data-dragging=\"true\"] .dsh-an-grip{cursor:grabbing}\n.dsh-an-row[data-dragging=\"true\"]{z-index:1;background:var(--dsh-an-panelSurface);box-shadow:var(--dsw-elevation-prominent);transition:none}\n.dsh-an-row[data-dragging=\"true\"] .dsh-an-grip{opacity:1;color:var(--dsw-alias-label-primary)}\n/* While a row is held the trail stays at rest: the age shows, the actions stay out of the way. */\n.dsh-an-rows[data-dragging=\"true\"] .dsh-an-row .dsh-an-actions{opacity:0;pointer-events:none}\n.dsh-an-rows[data-dragging=\"true\"] .dsh-an-row .dsh-an-meta{opacity:1}\n\n/* ── 8 紧凑文字按钮 · 清空确认 ─────────────────────────────────── */\n.dsh-an-mini{display:inline-flex;align-items:center;justify-content:center;flex:none;height:24px;padding:0 var(--an-space-2);border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-mini:active{background:var(--an-active)}\n.dsh-an-mini[disabled]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}\n.dsh-an-miniDanger{border-color:transparent;background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-foreground)}\n.dsh-an-miniDanger:active{background:var(--dsw-alias-state-error-primary)}\n\n/* ── 9 空态 · 虚线 1px，说明 12/次级墨色 ──────────────────────────── */\n.dsh-an-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--an-space-2);padding:var(--an-space-5) var(--an-space-4);border:1px dashed var(--an-divider);border-radius:var(--dsw-radius-lg);text-align:center}\n.dsh-an-emptyIcon{display:flex;align-items:center;justify-content:center;width:32px;height:32px;margin:0 0 var(--an-space-1);border-radius:var(--dsw-radius-md);background:var(--an-hover);color:var(--dsw-alias-label-secondary)}\n.dsh-an-emptyTitle{font-size:var(--an-fs-row);line-height:var(--an-lh-row);font-weight:500;color:var(--dsw-alias-label-primary)}\n.dsh-an-emptyBody{max-width:36ch;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}\n\n/* ── 10 设置 · 分组 R16，链接走 --dsw-alias-link ─────────────────── */\n.dsh-an-settings{--dsh-an-settingIndent:var(--an-space-3);display:flex;flex-direction:column;gap:var(--an-space-2);margin:0;padding:var(--an-space-3);border:0.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill)}\n.dsh-an-settingsHead{font-size:var(--an-fs-row);line-height:var(--an-lh-row);font-weight:500;color:var(--dsw-alias-label-primary)}\n.dsh-an-settingGroup{display:flex;flex-direction:column;gap:var(--an-space-1);min-width:0}\n.dsh-an-settingLabel{font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;color:var(--dsw-alias-label-secondary)}\n.dsh-an-settingBody{display:flex;flex-direction:column;gap:var(--an-space-1);padding-left:var(--dsh-an-settingIndent)}\n.dsh-an-settingBrand{display:flex;flex-direction:column;gap:2px;min-width:0}\n.dsh-an-settingBrandName{font-size:var(--an-fs-row);line-height:var(--an-lh-row);font-weight:500;color:var(--dsw-alias-label-primary)}\n.dsh-an-settingBrandTagline{font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}\n.dsh-an-settingAbout{display:flex;align-items:center;gap:var(--an-space-2);flex-wrap:wrap;min-width:0;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary)}\n.dsh-an-settingAbout>span{flex:none}\n.dsh-an-settingAbout .dsh-an-updateHint{flex:0 1 auto;min-width:0}\n.dsh-an-settingMetaRow{display:flex;align-items:baseline;gap:var(--an-space-1);min-width:0;overflow:hidden;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);white-space:nowrap}\n.dsh-an-settingMetaRow>span{flex:none}\n.dsh-an-storageBlock{display:flex;flex-direction:column;gap:var(--an-space-2);min-width:0}\n.dsh-an-storagePathRow{display:flex;flex-direction:column;gap:var(--an-space-1);min-width:0}\n.dsh-an-storagePath{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;user-select:all}\n.dsh-an-storageActions{display:flex;flex-wrap:wrap;gap:var(--an-space-1)}\n.dsh-an-storageAction{flex:none;height:24px;padding:0 var(--an-space-2);border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-storageAction:active{background:var(--an-active)}\n.dsh-an-storageAction:focus-visible{outline-offset:2px}\n.dsh-an-settingDot{flex:none;color:var(--dsw-alias-label-tertiary)}\n.dsh-an-settingLink{flex:0 1 auto;min-width:0;overflow:hidden;color:var(--dsw-alias-link);font-weight:500;text-decoration:none;text-overflow:ellipsis;transition:var(--an-transition)}\n.dsh-an-settingLink:focus-visible{text-decoration:underline;text-decoration-style:dotted;text-decoration-thickness:1px;text-underline-offset:3px}\n/* 更新中心：检查入口、可展开的更新说明与更新动作，全部走共享令牌 */\n.dsh-an-updateCheck{flex:none;height:24px;padding:0 var(--an-space-2);border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-updateCheck:active{background:var(--an-active)}\n.dsh-an-updateCheck:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}\n.dsh-an-updateCheck:focus-visible{outline-offset:2px}\n.dsh-an-updateHint{margin:0;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}\n.dsh-an-updateHintError{color:var(--dsw-alias-state-error-primary)}\n.dsh-an-updateCard{display:flex;flex-direction:column;gap:var(--an-space-2);margin-top:var(--an-space-1);padding:var(--an-space-2);border:0.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1)}\n.dsh-an-updateTitle{font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;color:var(--dsw-alias-label-primary)}\n.dsh-an-updateFull:focus-visible,.dsh-an-updateLinkBtn:focus-visible{text-decoration:underline;text-decoration-style:dotted;text-decoration-thickness:1px;text-underline-offset:3px}\n.dsh-an-updateFull{flex:none;color:var(--dsw-alias-link);font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;text-decoration:none;transition:var(--an-transition)}\n.dsh-an-updateNotes{display:flex;flex-direction:column;gap:var(--an-space-2);max-height:220px;overflow-y:auto;padding-right:0;overscroll-behavior:contain;--dsh-scrollbar-width:var(--dsh-an-scrollRail);--dsh-scrollbar-thumb-border:var(--dsh-an-scrollInset);scrollbar-gutter:stable}\n.dsh-an-updateNotes[data-fade=\"true\"]{--dsh-an-fadeHeight:var(--an-space-5);-webkit-mask-image:linear-gradient(to bottom,currentColor 0,currentColor calc(100% - var(--dsh-an-fadeHeight)),transparent 100%),linear-gradient(to right,transparent calc(100% - var(--dsh-an-scrollRail)),currentColor calc(100% - var(--dsh-an-scrollRail)));mask-image:linear-gradient(to bottom,currentColor 0,currentColor calc(100% - var(--dsh-an-fadeHeight)),transparent 100%),linear-gradient(to right,transparent calc(100% - var(--dsh-an-scrollRail)),currentColor calc(100% - var(--dsh-an-scrollRail)));-webkit-mask-composite:source-over;mask-composite:add}\n.dsh-an-updateVersions{display:flex;flex-direction:column;gap:var(--an-space-1);min-width:0}\n.dsh-an-updateVersion{display:flex;flex-direction:column;gap:var(--an-space-1);min-width:0}\n.dsh-an-updateVersion+.dsh-an-updateVersion{padding-top:var(--an-space-1);border-top:0.5px solid var(--an-divider)}\n.dsh-an-updateVersionHead{display:flex;align-items:center;gap:var(--an-space-1);width:100%;padding:2px 0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;text-align:left;cursor:pointer}\n.dsh-an-updateVersionHead:active{background:var(--an-active)}\n.dsh-an-updateVersionHead:focus-visible{text-decoration:underline;text-decoration-style:dotted;text-decoration-thickness:1px;text-underline-offset:3px}\n.dsh-an-updateChevron{display:flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;color:var(--dsw-alias-label-secondary);font-size:var(--an-fs-caption);transition:transform var(--an-dur-fast) var(--an-ease)}\n.dsh-an-updateChevron[data-open=\"true\"]{transform:rotate(90deg)}\n.dsh-an-updateVersionLabel{font-variant-numeric:tabular-nums}\n.dsh-an-updateLatest{display:inline-flex;align-items:center;justify-content:center;flex:none;min-width:18px;height:18px;padding:0 var(--an-space-1);border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary);font-size:var(--an-fs-caption);line-height:16px;font-weight:500}\n.dsh-an-updateVersionBody{display:flex;flex-direction:column;gap:var(--an-space-2);padding-left:var(--an-space-4);min-width:0}\n.dsh-an-updateGroup{display:flex;flex-direction:column;gap:var(--an-space-1);min-width:0}\n.dsh-an-updateGroupTitle{font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;color:var(--dsw-alias-label-secondary)}\n.dsh-an-updateItems{display:flex;flex-direction:column;gap:var(--an-space-1);margin:0;padding-left:var(--an-space-4);color:var(--dsw-alias-label-primary)}\n.dsh-an-updateItem{font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);overflow-wrap:anywhere}\n.dsh-an-updateItem strong{font-weight:500}\n.dsh-an-updateActions{display:flex;align-items:center;gap:var(--an-space-2);flex-wrap:wrap;min-width:0}\n.dsh-an-updatePrimary{display:inline-flex;align-items:center;justify-content:center;flex:none;height:24px;padding:0 var(--an-space-3);border:0;border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-updatePrimary:active{background:var(--dsw-alias-button-primary-dimmed)}\n.dsh-an-updatePrimary:disabled{opacity:.55;cursor:default}\n.dsh-an-updatePrimary:focus-visible{outline-offset:2px}\n.dsh-an-updateDone{display:flex;align-items:center;gap:var(--an-space-2);flex-wrap:wrap;min-width:0}\n.dsh-an-updateErrorRow{display:flex;align-items:baseline;gap:var(--an-space-2);flex-wrap:wrap;min-width:0}\n.dsh-an-updateError{flex:1 1 auto;min-width:0;margin:0;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-state-error-primary);overflow-wrap:anywhere}\n.dsh-an-updateLinkBtn{padding:0;border:0;background:transparent;color:var(--dsw-alias-link);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer}\n.dsh-an-updateFallback{display:flex;align-items:center;gap:var(--an-space-2);flex-wrap:wrap;min-width:0;padding-top:var(--an-space-1);border-top:0.5px solid var(--an-divider)}\n.dsh-an-updateFallback .dsh-an-updateHint{flex:1 1 100%;min-width:0}\n.dsh-an-updateCopy{flex:none;height:24px;padding:0 var(--an-space-2);border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-updateCopy:active{background:var(--an-active)}\n.dsh-an-updateCopy:focus-visible{outline-offset:2px}\n\n/* ── 11 面板脚注 · 存储状态就地提示，错误用状态色 ─────────────────── */\n.dsh-an-popFoot{margin:0;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary)}\n.dsh-an-error{color:var(--dsw-alias-state-error-primary)}\n\n/* ── 12 会话顶部入口 · H28/R8，计数徽标为胶囊 ──────────────────────── */\n.dsh-an-headerBtn{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-headerBtn:active{background:var(--an-active);color:var(--dsw-alias-label-primary)}\n.dsh-an-headerBtn[data-active=\"true\"]{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-headerBtn[data-disabled=\"true\"]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}\n.dsh-an-headerIcon{display:flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;color:currentColor}\n.dsh-an-headerCount{position:absolute;top:-2px;right:-2px;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 var(--an-space-1);border:0.5px solid var(--dsw-alias-bg-base);border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-secondary);font-size:var(--an-fs-caption);line-height:14px;font-weight:500;font-variant-numeric:tabular-nums}\n\n/* ── 13 拖拽把手 · 8px 命中带，3px 视觉条 ─────────────────────────── */\n.dsh-an-resizeHandle{position:absolute;left:0;top:0;bottom:0;z-index:2;display:flex;align-items:center;justify-content:center;width:var(--an-space-2);cursor:ew-resize;touch-action:none;outline:0}\n.dsh-an-resizeHandle::before{content:\"\";width:3px;height:var(--an-space-6);border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-border-l4);transition:transform var(--an-dur-fast) var(--an-ease),background-color var(--an-dur-fast) var(--an-ease)}\n.dsh-an-resizeHandle:focus-visible::before{background:var(--dsw-alias-label-secondary)}\n.dsh-an-resizeHandle:focus-visible{outline-offset:-2px;border-radius:var(--dsw-radius-sm)}\n.dsh-an-resizeHandleBottom{position:absolute;left:50%;bottom:0;z-index:2;display:flex;align-items:center;justify-content:center;width:var(--an-space-6);height:var(--an-space-3);transform:translateX(-50%);cursor:ns-resize;touch-action:none;outline:0}\n.dsh-an-resizeHandleBottom::before{content:\"\";width:var(--an-space-5);height:3px;border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-border-l4);transition:transform var(--an-dur-fast) var(--an-ease),background-color var(--an-dur-fast) var(--an-ease)}\n.dsh-an-resizeHandleBottom:focus-visible::before{background:var(--dsw-alias-label-secondary)}\n.dsh-an-resizeHandleBottom:focus-visible{outline-offset:-2px;border-radius:var(--dsw-radius-sm)}\n\n/* ── 14 加载 · 控件内 12px 环，文字隐藏，不报\"进行中\" ──────────────── */\n[data-loading=\"true\"]{position:relative;color:transparent!important;pointer-events:none;cursor:progress}\n[data-loading=\"true\"]>*{visibility:hidden}\n[data-loading=\"true\"]::after{content:\"\";position:absolute;left:50%;top:50%;box-sizing:border-box;width:12px;height:12px;margin:-6px 0 0 -6px;border:1.5px solid var(--dsw-alias-label-secondary);border-top-color:transparent;border-radius:var(--an-radius-pill);corner-shape:round;animation:dsh-an-spin var(--an-dur-spin) linear infinite}\n\n/* ── 15 悬停 · 只在支持 hover 的设备上启用（触摸端常显操作） ────────── */\n@media (hover:hover){\n.dsh-an-row:hover{background:var(--an-hover)}\n.dsh-an-grip{opacity:0}\n.dsh-an-row:hover .dsh-an-grip,.dsh-an-grip:focus-visible{opacity:1;color:var(--dsw-alias-label-secondary)}\n.dsh-an-grip:hover{color:var(--dsw-alias-label-primary)}\n.dsh-an-meta{opacity:1}\n.dsh-an-actions{opacity:0;pointer-events:none}\n.dsh-an-row:hover .dsh-an-actions,.dsh-an-row:focus-within .dsh-an-actions{opacity:1;pointer-events:auto}\n.dsh-an-row:hover .dsh-an-meta,.dsh-an-row:focus-within .dsh-an-meta{opacity:0}\n.dsh-an-iconBtn:hover{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-popClose:hover,.dsh-an-settingsBtn:hover{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-scopeBtn:hover:not([data-active=\"true\"]){background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-addBtn:hover:not([disabled]){background:var(--dsw-alias-button-primary-hover)}\n.dsh-an-mini:hover:not([disabled]){background:var(--an-hover)}\n.dsh-an-miniDanger:hover:not([disabled]){background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}\n.dsh-an-clear:hover{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-doneToggle:hover{background:var(--an-hover)}\n.dsh-an-settingLink:hover{text-decoration:underline;text-decoration-style:dotted;text-decoration-thickness:1px;text-underline-offset:3px}\n.dsh-an-updatePrimary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}\n.dsh-an-headerBtn:hover{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-resizeHandle:hover::before{transform:scaleY(1.4);background:var(--dsw-alias-label-secondary)}\n.dsh-an-resizeHandleBottom:hover::before{transform:scaleX(1.4);background:var(--dsw-alias-label-secondary)}\n}\n\n/* ── 16 动效 · 只动 opacity/transform，错峰出场封顶 ─────────────────── */\n@media (prefers-reduced-motion:no-preference){\n.dsh-an-rows>.dsh-an-row{animation:dsh-an-row-in var(--an-dur-base) var(--an-ease) backwards}\n.dsh-an-rows>.dsh-an-row:nth-child(2){animation-delay:var(--an-space-1)}\n.dsh-an-rows>.dsh-an-row:nth-child(3){animation-delay:var(--an-space-2)}\n.dsh-an-rows>.dsh-an-row:nth-child(4){animation-delay:calc(var(--an-space-2) + var(--an-space-1))}\n.dsh-an-rows>.dsh-an-row:nth-child(n+5){animation-delay:var(--an-space-3)}\n}\n@keyframes dsh-an-pop-in{from{opacity:0}to{opacity:1}}\n@keyframes dsh-an-row-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}\n@keyframes dsh-an-spin{to{transform:rotate(360deg)}}\n@media (prefers-reduced-motion:reduce){\n.dsh-an-popover,.dsh-an-rows>.dsh-an-row,.dsh-an-chevron,[data-loading=\"true\"]::after{animation:none}\n.dsh-an-popover,.dsh-an-row,.dsh-an-grip,.dsh-an-meta,.dsh-an-actions,.dsh-an-iconBtn{transition-duration:1ms}\n}\n\n/* ── 17 窄视口 · 390 基准下收紧内边距，主操作全部可达 ──────────────── */\n@media (max-width:480px){\n.dsh-an-popover{padding:var(--an-space-3);--dsh-an-listGutter:var(--an-space-3)}\n.dsh-an-popoverRight{padding-left:var(--an-space-4)}\n.dsh-an-popHead{gap:var(--an-space-2)}\n.dsh-an-add{padding:var(--an-space-2) var(--an-space-3)}\n.dsh-an-sectionHead,.dsh-an-doneHead{min-height:24px}\n}\n\n";

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
/** Shown in the in-panel settings; keep in sync with package.json. */
const PLUGIN_VERSION = "0.1.0";
const PLUGIN_AUTHOR = "阿三石";
const PLUGIN_REPO_URL = "https://github.com/LighghtEeloo/dsh-sideby-note";
const PLUGIN_REPO_LABEL = "github.com/LighghtEeloo/dsh-sideby-note";
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
/** Absolute path of the host file, for Settings. */
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
	"popover.count": "{open} offen · {total} gesamt",
	"popover.archived": "Archiviert",
	"popover.clearCancel": "Abbrechen",
	"popover.clearConfirm": "{n} archivierte Notizen löschen?",
	"popover.clearConfirmAction": "Löschen",
	"popover.clearArchived": "Archivierte löschen",
	"popover.local": "Notizen werden nur auf diesem Gerät gespeichert",
	"scope.label": "Notizbereich",
	"scope.workspace": "Arbeitsbereich",
	"scope.session": "Sitzung",
	"scope.workspaceHint": "Zur Liste des Arbeitsbereichs wechseln, die alle Sitzungen teilen",
	"scope.sessionHint": "Zur Sitzungsliste wechseln, die nur in dieser Sitzung sichtbar ist",
	"scope.newSessionHint": "Vorerst ist nur die Liste des Arbeitsbereichs verfügbar; die Sitzungsliste erscheint, sobald die Sitzung beginnt",
	"popover.empty.title": "Noch keine Notizen",
	"popover.empty.body": "Ideen entwerfen, während der Agent arbeitet",
	"settings.open": "Einstellungen",
	"settings.title": "Einstellungen",
	"settings.about": "Info",
	"settings.tagline": "Ideen entwerfen, während der Agent arbeitet.",
	"settings.version": "Version",
	"settings.author": "Autor",
	"settings.improver": "Verbesserungen",
	"settings.improverName": "LighghtEeloo",
	"settings.project": "Quellcode",
	"settings.storage": "Datenspeicher",
	"add.placeholder": "Eine notieren",
	"add.action": "Hinzufügen",
	"list.open": "Offen",
	"list.allArchived.title": "Nichts mehr offen",
	"list.allArchived.body": "Noch eine Notiz hinzufügen oder unten das Archiv aufklappen",
	"item.copy": "Kopieren",
	"item.recall": "Zurückholen",
	"item.insert": "Einfügen",
	"item.reorder": "Zum Sortieren ziehen oder ↑ / ↓ nutzen",
	"time.now": "gerade eben",
	"time.minutes": "vor {n} Min.",
	"time.hours": "vor {n} Std.",
	"time.days": "vor {n} T.",
	"time.createdArchived": "Geschrieben {created} · Archiviert {completed}",
	"storage.failed": "Lokaler Speicher ist nicht verfügbar; Änderungen werden möglicherweise nicht gespeichert",
	"storage.whereHost": "Notizen werden in einer lokalen DSH-Datei gespeichert",
	"storage.loading": "Notizen werden gelesen…",
	"storage.modeHost": "Lokale DSH-Datei (aside_note.json)",
	"storage.modeLocal": "Dieser Browser (localStorage)",
	"storage.settingsLabel": "Speicher",
	"storage.failure": "Letzter Fehler: {code}",
	"storage.migrated": "{n} Notizen aus diesem Browser in die lokale DSH-Datei verschoben",
	"storage.keptLocal": "Host-Notizen werden verwendet; ältere Notizen dieses Browsers wurden nicht zusammengeführt",
	"storage.notSwitched": "Host-Speicher ist nicht verfügbar; Notizen bleiben in diesem Browser und werden beim nächsten Start erneut versucht",
	"storage.hostError": "Notizspeicher ist nicht verfügbar",
	"storage.inUse": "AsideNote verwendet den Notizspeicher. Deaktiviere AsideNote und wähle Einstellungen › Datenspeicher › Erneut verbinden.",
	"storage.retry": "Erneut verbinden",
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
	"header.tooltip": "Sideby Note · {n} offen",
	"header.tooltipEmpty": "Sideby Note",
	"toast.copied": "Kopiert",
	"toast.copyFailed": "Kopieren fehlgeschlagen — erneut versuchen",
	"toast.pathCopied": "Pfad kopiert",
	"toast.revealFailed": "Dateimanager konnte nicht geöffnet werden",
	"toast.inserted": "In den Chat gegeben",
	"toast.insertFailed": "Kein Chat-Eingabefeld gefunden — die Notiz bleibt unverändert",
	"toast.archiveFailed": "An den Chat übergeben, aber das Archiv konnte nicht gespeichert werden",
	"toast.recalled": "Zurück in das Eingabefeld geholt",
	"toast.recallBlocked": "Im Eingabefeld steht bereits Text – zuerst senden oder leeren",
	"toast.cleared": "Archiv geleert",
	"toast.saveFailed": "Speichern fehlgeschlagen — nichts geändert",
	"update.label": "Update verfügbar",
	"update.tip": "Version {version} ist jetzt verfügbar — Versionshinweise öffnen",
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
	"popover.count": "{open} open · {total} total",
	"popover.archived": "Archived",
	"popover.clearCancel": "Cancel",
	"popover.clearConfirm": "Clear {n} archived notes?",
	"popover.clearConfirmAction": "Clear",
	"popover.clearArchived": "Clear archived",
	"popover.local": "Notes are saved only on this device",
	"scope.label": "Note scope",
	"scope.workspace": "Workspace",
	"scope.session": "Session",
	"scope.workspaceHint": "Switch to the workspace list, shared by all sessions",
	"scope.sessionHint": "Switch to the session list, visible only in this session",
	"scope.newSessionHint": "Only the workspace list is available for now; the session list appears once the session starts",
	"popover.empty.title": "No notes yet",
	"popover.empty.body": "Asynchronously draft your ideas while the agent is working",
	"settings.open": "Settings",
	"settings.title": "Settings",
	"settings.about": "About",
	"settings.tagline": "Asynchronously draft your ideas while the agent is working.",
	"settings.version": "Version",
	"settings.author": "Author",
	"settings.improver": "Improver",
	"settings.improverName": "LighghtEeloo",
	"settings.project": "Source",
	"settings.storage": "Data storage",
	"add.placeholder": "Jot one down",
	"add.action": "Add",
	"list.open": "Open",
	"list.allArchived.title": "Nothing left open",
	"list.allArchived.body": "Add another, or expand archived to look back",
	"item.copy": "Copy",
	"item.recall": "Rewind",
	"item.insert": "Insert",
	"item.reorder": "Drag to reorder, or use ↑ / ↓",
	"time.now": "just now",
	"time.minutes": "{n} min ago",
	"time.hours": "{n} hr ago",
	"time.days": "{n} d ago",
	"time.createdArchived": "Written {created} · Archived {completed}",
	"storage.failed": "Local storage is unavailable; changes may not persist",
	"storage.whereHost": "Notes are saved in a DSH local file",
	"storage.loading": "Reading notes…",
	"storage.modeHost": "DSH local file (aside_note.json)",
	"storage.modeLocal": "This browser (localStorage)",
	"storage.settingsLabel": "Storage",
	"storage.failure": "Last failure: {code}",
	"storage.migrated": "Moved {n} notes from this browser into the DSH local file",
	"storage.keptLocal": "Using host notes; this browser's older notes were left unmerged",
	"storage.notSwitched": "Host storage is unavailable, so notes stay in this browser and will be retried on next start",
	"storage.hostError": "Notes storage is unavailable",
	"storage.inUse": "AsideNote is using the notes store. Disable AsideNote, then choose Settings › Data storage › Reconnect.",
	"storage.retry": "Reconnect",
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
	"header.tooltip": "Sideby Note · {n} open",
	"header.tooltipEmpty": "Sideby Note",
	"toast.copied": "Copied",
	"toast.copyFailed": "Copy failed — try again",
	"toast.pathCopied": "Path copied",
	"toast.revealFailed": "Could not open the file manager",
	"toast.inserted": "Inserted into the chat input",
	"toast.insertFailed": "No chat composer found — the note is untouched",
	"toast.archiveFailed": "Inserted into the chat input, but the archive could not be saved",
	"toast.recalled": "Moved back to the input",
	"toast.recallBlocked": "The input already has text — send or clear it first",
	"toast.cleared": "Archive cleared",
	"toast.saveFailed": "Save failed — nothing changed",
	"update.label": "Update available",
	"update.tip": "Version {version} is now available — open the release notes",
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
	"popover.count": "{open} abiertas · {total} en total",
	"popover.archived": "Archivadas",
	"popover.clearCancel": "Cancelar",
	"popover.clearConfirm": "¿Borrar {n} notas archivadas?",
	"popover.clearConfirmAction": "Borrar",
	"popover.clearArchived": "Borrar archivadas",
	"popover.local": "Las notas se guardan solo en este dispositivo",
	"scope.label": "Ámbito de las notas",
	"scope.workspace": "Espacio de trabajo",
	"scope.session": "Sesión",
	"scope.workspaceHint": "Cambiar a la lista del espacio de trabajo, compartida por todas las sesiones",
	"scope.sessionHint": "Cambiar a la lista de la sesión, visible solo en esta sesión",
	"scope.newSessionHint": "Por ahora solo está disponible la lista del espacio de trabajo; la lista de la sesión aparecerá cuando se inicie la sesión",
	"popover.empty.title": "Aún no hay notas",
	"popover.empty.body": "Esboza tus ideas de forma asíncrona mientras el agente trabaja",
	"settings.open": "Ajustes",
	"settings.title": "Ajustes",
	"settings.about": "Acerca de",
	"settings.tagline": "Esboza tus ideas de forma asíncrona mientras el agente trabaja.",
	"settings.version": "Versión",
	"settings.author": "Autor",
	"settings.improver": "Mejoras",
	"settings.improverName": "LighghtEeloo",
	"settings.project": "Código fuente",
	"settings.storage": "Almacenamiento de datos",
	"add.placeholder": "Anota una",
	"add.action": "Añadir",
	"list.open": "Abiertas",
	"list.allArchived.title": "No queda nada abierto",
	"list.allArchived.body": "Añade otra o despliega las archivadas para revisarlas",
	"item.copy": "Copiar",
	"item.recall": "Devolver",
	"item.insert": "Insertar",
	"item.reorder": "Arrastra para ordenar o usa ↑ / ↓",
	"time.now": "ahora mismo",
	"time.minutes": "hace {n} min",
	"time.hours": "hace {n} h",
	"time.days": "hace {n} d",
	"time.createdArchived": "Escrita {created} · Archivada {completed}",
	"storage.failed": "El almacenamiento local no está disponible; es posible que los cambios no se guarden",
	"storage.whereHost": "Las notas se guardan en un archivo local de DSH",
	"storage.loading": "Leyendo notas…",
	"storage.modeHost": "Archivo local de DSH (aside_note.json)",
	"storage.modeLocal": "Este navegador (localStorage)",
	"storage.settingsLabel": "Almacenamiento",
	"storage.failure": "Último fallo: {code}",
	"storage.migrated": "Se movieron {n} notas de este navegador al archivo local de DSH",
	"storage.keptLocal": "Se usan las notas del host; las notas antiguas de este navegador quedaron sin combinar",
	"storage.notSwitched": "El almacenamiento del host no está disponible; las notas siguen en este navegador y se reintentará al iniciar",
	"storage.hostError": "El almacenamiento de notas no está disponible",
	"storage.inUse": "AsideNote está usando el almacén de notas. Desactiva AsideNote y elige Ajustes › Almacenamiento de datos › Volver a conectar.",
	"storage.retry": "Volver a conectar",
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
	"header.tooltip": "Sideby Note · {n} abiertas",
	"header.tooltipEmpty": "Sideby Note",
	"toast.copied": "Copiado",
	"toast.copyFailed": "Error al copiar — inténtalo de nuevo",
	"toast.pathCopied": "Ruta copiada",
	"toast.revealFailed": "No se pudo abrir el gestor de archivos",
	"toast.inserted": "Pasada al chat",
	"toast.insertFailed": "No hay campo de chat — la nota sigue igual",
	"toast.archiveFailed": "La nota se pasó al chat, pero no se pudo archivar",
	"toast.recalled": "Devuelta al cuadro de texto",
	"toast.recallBlocked": "El cuadro de texto ya tiene contenido; envíalo o bórralo primero",
	"toast.cleared": "Archivo borrado",
	"toast.saveFailed": "Error al guardar — nada cambió",
	"update.label": "Actualización disponible",
	"update.tip": "La versión {version} ya está disponible — abre las notas de la versión",
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
	"popover.count": "{open} ouvertes · {total} au total",
	"popover.archived": "Archivées",
	"popover.clearCancel": "Annuler",
	"popover.clearConfirm": "Effacer {n} notes archivées ?",
	"popover.clearConfirmAction": "Effacer",
	"popover.clearArchived": "Effacer les archivées",
	"popover.local": "Les notes sont enregistrées uniquement sur cet appareil",
	"scope.label": "Portée des notes",
	"scope.workspace": "Espace de travail",
	"scope.session": "Session",
	"scope.workspaceHint": "Passer à la liste de l'espace de travail, partagée par toutes les sessions",
	"scope.sessionHint": "Passer à la liste de la session, visible uniquement dans cette session",
	"scope.newSessionHint": "Seule la liste de l'espace de travail est disponible pour l'instant ; la liste de la session apparaîtra au démarrage de la session",
	"popover.empty.title": "Aucune note pour l'instant",
	"popover.empty.body": "Rédigez vos idées de façon asynchrone pendant que l'agent travaille",
	"settings.open": "Paramètres",
	"settings.title": "Paramètres",
	"settings.about": "À propos",
	"settings.tagline": "Rédigez vos idées de façon asynchrone pendant que l'agent travaille.",
	"settings.version": "Version",
	"settings.author": "Auteur",
	"settings.improver": "Améliorations",
	"settings.improverName": "LighghtEeloo",
	"settings.project": "Source",
	"settings.storage": "Stockage des données",
	"add.placeholder": "Notez-en une",
	"add.action": "Ajouter",
	"list.open": "Ouvertes",
	"list.allArchived.title": "Plus rien d'ouvert",
	"list.allArchived.body": "Ajoutez-en une autre ou dépliez les archivées pour les revoir",
	"item.copy": "Copier",
	"item.recall": "Renvoyer",
	"item.insert": "Insérer",
	"item.reorder": "Glisser pour réordonner, ou ↑ / ↓",
	"time.now": "à l'instant",
	"time.minutes": "il y a {n} min",
	"time.hours": "il y a {n} h",
	"time.days": "il y a {n} j",
	"time.createdArchived": "Écrite {created} · Archivée {completed}",
	"storage.failed": "Le stockage local n'est pas disponible ; les modifications peuvent ne pas être conservées",
	"storage.whereHost": "Les notes sont enregistrées dans un fichier local DSH",
	"storage.loading": "Lecture des notes…",
	"storage.modeHost": "Fichier local DSH (aside_note.json)",
	"storage.modeLocal": "Ce navigateur (localStorage)",
	"storage.settingsLabel": "Stockage",
	"storage.failure": "Dernier échec : {code}",
	"storage.migrated": "{n} notes de ce navigateur ont été déplacées vers le fichier local DSH",
	"storage.keptLocal": "Notes de l'hôte utilisées ; les anciennes notes de ce navigateur n'ont pas été fusionnées",
	"storage.notSwitched": "Le stockage de l'hôte est indisponible ; les notes restent dans ce navigateur et seront réessayées au prochain démarrage",
	"storage.hostError": "Le stockage des notes est indisponible",
	"storage.inUse": "AsideNote utilise le stockage des notes. Désactivez AsideNote, puis choisissez Paramètres › Stockage des données › Se reconnecter.",
	"storage.retry": "Se reconnecter",
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
	"header.tooltip": "Sideby Note · {n} ouvertes",
	"header.tooltipEmpty": "Sideby Note",
	"toast.copied": "Copié",
	"toast.copyFailed": "Échec de la copie — réessayez",
	"toast.pathCopied": "Chemin copié",
	"toast.revealFailed": "Impossible d'ouvrir le gestionnaire de fichiers",
	"toast.inserted": "Passée au chat",
	"toast.insertFailed": "Aucune zone de saisie — la note reste en place",
	"toast.archiveFailed": "Note transmise au chat, mais son archivage a échoué",
	"toast.recalled": "Renvoyée dans la zone de saisie",
	"toast.recallBlocked": "La zone de saisie contient déjà du texte ; envoyez-le ou effacez-le d'abord",
	"toast.cleared": "Archive effacée",
	"toast.saveFailed": "Échec de l'enregistrement — rien n'a changé",
	"update.label": "Mise à jour disponible",
	"update.tip": "La version {version} est disponible — ouvrez les notes de version",
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
	"popover.count": "{open} 書きかけ · 全 {total} 件",
	"popover.archived": "アーカイブ",
	"popover.clearCancel": "キャンセル",
	"popover.clearConfirm": "アーカイブのメモ {n} 件を削除しますか？",
	"popover.clearConfirmAction": "削除",
	"popover.clearArchived": "アーカイブを削除",
	"popover.local": "メモはこの端末にのみ保存されます",
	"scope.label": "メモの範囲",
	"scope.workspace": "ワークスペース",
	"scope.session": "セッション",
	"scope.workspaceHint": "すべてのセッションで共有されるワークスペースのリストに切り替えます",
	"scope.sessionHint": "このセッションだけに表示されるセッションのリストに切り替えます",
	"scope.newSessionHint": "現在はワークスペースのリストのみ利用できます。セッションを開始するとセッションのリストが表示されます",
	"popover.empty.title": "メモはまだありません",
	"popover.empty.body": "エージェントが作業している間に、アイデアを非同期で書き留める",
	"settings.open": "設定",
	"settings.title": "設定",
	"settings.about": "このプラグインについて",
	"settings.tagline": "エージェントが作業している間に、アイデアを非同期で書き留める。",
	"settings.version": "バージョン",
	"settings.author": "作者",
	"settings.improver": "改良者",
	"settings.improverName": "LighghtEeloo",
	"settings.project": "ソース",
	"settings.storage": "データ保存",
	"add.placeholder": "ひとつメモする",
	"add.action": "追加",
	"list.open": "書きかけ",
	"list.allArchived.title": "書きかけのメモはありません",
	"list.allArchived.body": "さらに書き足すか、アーカイブを開いて振り返れます",
	"item.copy": "コピー",
	"item.recall": "戻す",
	"item.insert": "挿入",
	"item.reorder": "ドラッグか ↑↓ で並べ替え",
	"time.now": "たった今",
	"time.minutes": "{n} 分前",
	"time.hours": "{n} 時間前",
	"time.days": "{n} 日前",
	"time.createdArchived": "記入 {created} · アーカイブ {completed}",
	"storage.failed": "ローカルストレージを利用できません。変更は保存されない可能性があります",
	"storage.whereHost": "メモは DSH のローカルファイルに保存されます",
	"storage.loading": "メモを読み込み中…",
	"storage.modeHost": "DSH ローカルファイル（aside_note.json）",
	"storage.modeLocal": "このブラウザ（localStorage）",
	"storage.settingsLabel": "保存先",
	"storage.failure": "前回の失敗：{code}",
	"storage.migrated": "このブラウザのメモ {n} 件を DSH ローカルファイルに移行しました",
	"storage.keptLocal": "ホストのメモを使用中です。このブラウザの古いメモは統合していません",
	"storage.notSwitched": "ホストのストレージを利用できないため、メモはこのブラウザに保存され、次回起動時に再試行します",
	"storage.hostError": "メモのストレージを利用できません",
	"storage.inUse": "AsideNote がノートの保存先を使用しています。AsideNote を無効にし、設定 › データ保存 › 再接続を選んでください。",
	"storage.retry": "再接続",
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
	"header.tooltip": "Sideby Note · {n} 件書きかけ",
	"header.tooltipEmpty": "Sideby Note",
	"toast.copied": "コピーしました",
	"toast.copyFailed": "コピーに失敗しました — もう一度お試しください",
	"toast.pathCopied": "パスをコピーしました",
	"toast.revealFailed": "ファイルマネージャーを開けません",
	"toast.inserted": "チャットへ渡しました",
	"toast.insertFailed": "チャットの入力欄が見つかりません — メモはそのままです",
	"toast.archiveFailed": "チャットに渡しましたが、アーカイブを保存できませんでした",
	"toast.recalled": "入力欄に戻しました",
	"toast.recallBlocked": "入力欄に文字があります。送信するかクリアしてください",
	"toast.cleared": "アーカイブを削除しました",
	"toast.saveFailed": "保存に失敗しました — 変更はありません",
	"update.label": "更新があります",
	"update.tip": "バージョン {version} が利用可能です — リリースノートを開く",
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
	"popover.count": "{open} abertas · {total} no total",
	"popover.archived": "Arquivadas",
	"popover.clearCancel": "Cancelar",
	"popover.clearConfirm": "Limpar {n} notas arquivadas?",
	"popover.clearConfirmAction": "Limpar",
	"popover.clearArchived": "Limpar arquivadas",
	"popover.local": "As notas são salvas apenas neste dispositivo",
	"scope.label": "Escopo das notas",
	"scope.workspace": "Espaço de trabalho",
	"scope.session": "Sessão",
	"scope.workspaceHint": "Mudar para a lista do espaço de trabalho, compartilhada por todas as sessões",
	"scope.sessionHint": "Mudar para a lista da sessão, visível apenas nesta sessão",
	"scope.newSessionHint": "Por enquanto, apenas a lista do espaço de trabalho está disponível; a lista da sessão aparece quando a sessão começar",
	"popover.empty.title": "Nenhuma nota ainda",
	"popover.empty.body": "Esboce suas ideias de forma assíncrona enquanto o agente trabalha",
	"settings.open": "Configurações",
	"settings.title": "Configurações",
	"settings.about": "Sobre",
	"settings.tagline": "Esboce suas ideias de forma assíncrona enquanto o agente trabalha.",
	"settings.version": "Versão",
	"settings.author": "Autor",
	"settings.improver": "Melhorias",
	"settings.improverName": "LighghtEeloo",
	"settings.project": "Código-fonte",
	"settings.storage": "Armazenamento de dados",
	"add.placeholder": "Anote uma",
	"add.action": "Adicionar",
	"list.open": "Abertas",
	"list.allArchived.title": "Nada mais em aberto",
	"list.allArchived.body": "Adicione outra ou expanda as arquivadas para revisar",
	"item.copy": "Copiar",
	"item.recall": "Devolver",
	"item.insert": "Inserir",
	"item.reorder": "Arraste para ordenar ou use ↑ / ↓",
	"time.now": "agora mesmo",
	"time.minutes": "há {n} min",
	"time.hours": "há {n} h",
	"time.days": "há {n} d",
	"time.createdArchived": "Escrita {created} · Arquivada {completed}",
	"storage.failed": "O armazenamento local não está disponível; as alterações podem não ser salvas",
	"storage.whereHost": "As notas são salvas em um arquivo local do DSH",
	"storage.loading": "Lendo notas…",
	"storage.modeHost": "Arquivo local do DSH (aside_note.json)",
	"storage.modeLocal": "Este navegador (localStorage)",
	"storage.settingsLabel": "Armazenamento",
	"storage.failure": "Última falha: {code}",
	"storage.migrated": "{n} notas deste navegador foram movidas para o arquivo local do DSH",
	"storage.keptLocal": "Usando as notas do host; as notas antigas deste navegador não foram mescladas",
	"storage.notSwitched": "O armazenamento do host está indisponível; as notas ficam neste navegador e serão tentadas novamente na próxima inicialização",
	"storage.hostError": "O armazenamento de notas está indisponível",
	"storage.inUse": "O AsideNote está usando o armazenamento de notas. Desative o AsideNote e escolha Configurações › Armazenamento de dados › Reconectar.",
	"storage.retry": "Reconectar",
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
	"header.tooltip": "Sideby Note · {n} abertas",
	"header.tooltipEmpty": "Sideby Note",
	"toast.copied": "Copiado",
	"toast.copyFailed": "Falha ao copiar — tente novamente",
	"toast.pathCopied": "Caminho copiado",
	"toast.revealFailed": "Não foi possível abrir o gerenciador de arquivos",
	"toast.inserted": "Passada para o chat",
	"toast.insertFailed": "Nenhum campo do chat — a nota fica como está",
	"toast.archiveFailed": "A nota foi enviada para o chat, mas não pôde ser arquivada",
	"toast.recalled": "Devolvida para a caixa de texto",
	"toast.recallBlocked": "A caixa de texto já tem conteúdo; envie ou limpe primeiro",
	"toast.cleared": "Arquivo limpo",
	"toast.saveFailed": "Falha ao salvar — nada mudou",
	"update.label": "Atualização disponível",
	"update.tip": "A versão {version} já está disponível — abra as notas da versão",
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
	"popover.count": "{open} открыто · всего {total}",
	"popover.archived": "В архиве",
	"popover.clearCancel": "Отмена",
	"popover.clearConfirm": "Очистить архивные заметки ({n})?",
	"popover.clearConfirmAction": "Очистить",
	"popover.clearArchived": "Очистить архив",
	"popover.local": "Заметки сохраняются только на этом устройстве",
	"scope.label": "Область заметок",
	"scope.workspace": "Рабочая область",
	"scope.session": "Сеанс",
	"scope.workspaceHint": "Переключиться на список рабочей области, общий для всех сеансов",
	"scope.sessionHint": "Переключиться на список сеанса, видимый только в этом сеансе",
	"scope.newSessionHint": "Пока доступен только список рабочей области; список сеанса появится после начала сеанса",
	"popover.empty.title": "Заметок пока нет",
	"popover.empty.body": "Набрасывайте идеи асинхронно, пока агент работает",
	"settings.open": "Настройки",
	"settings.title": "Настройки",
	"settings.about": "О плагине",
	"settings.tagline": "Набрасывайте идеи асинхронно, пока агент работает.",
	"settings.version": "Версия",
	"settings.author": "Автор",
	"settings.improver": "Улучшения",
	"settings.improverName": "LighghtEeloo",
	"settings.project": "Исходный код",
	"settings.storage": "Хранилище данных",
	"add.placeholder": "Записать",
	"add.action": "Добавить",
	"list.open": "Открыто",
	"list.allArchived.title": "Открытых заметок нет",
	"list.allArchived.body": "Добавьте заметку или раскройте архив, чтобы вспомнить",
	"item.copy": "Копировать",
	"item.recall": "Вернуть",
	"item.insert": "Вставить",
	"item.reorder": "Перетащите или нажмите ↑ / ↓",
	"time.now": "только что",
	"time.minutes": "{n} мин назад",
	"time.hours": "{n} ч назад",
	"time.days": "{n} дн. назад",
	"time.createdArchived": "Записано {created} · В архиве {completed}",
	"storage.failed": "Локальное хранилище недоступно; изменения могут не сохраниться",
	"storage.whereHost": "Заметки сохраняются в локальном файле DSH",
	"storage.loading": "Чтение заметок…",
	"storage.modeHost": "Локальный файл DSH (aside_note.json)",
	"storage.modeLocal": "Этот браузер (localStorage)",
	"storage.settingsLabel": "Хранилище",
	"storage.failure": "Последняя ошибка: {code}",
	"storage.migrated": "Заметки этого браузера ({n}) перенесены в локальный файл DSH",
	"storage.keptLocal": "Используются заметки хоста; старые заметки этого браузера не объединены",
	"storage.notSwitched": "Хранилище хоста недоступно; заметки остаются в этом браузере, повтор при следующем запуске",
	"storage.hostError": "Хранилище заметок недоступно",
	"storage.inUse": "AsideNote использует хранилище заметок. Отключите AsideNote и выберите «Настройки › Хранилище данных › Подключиться снова».",
	"storage.retry": "Подключиться снова",
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
	"header.tooltip": "Sideby Note · {n} открыто",
	"header.tooltipEmpty": "Sideby Note",
	"toast.copied": "Скопировано",
	"toast.copyFailed": "Не удалось скопировать — повторите попытку",
	"toast.pathCopied": "Путь скопирован",
	"toast.revealFailed": "Не удалось открыть файловый менеджер",
	"toast.inserted": "Передано в чат",
	"toast.insertFailed": "Поле чата не найдено — заметка не тронута",
	"toast.archiveFailed": "Заметка передана в чат, но сохранить её в архиве не удалось",
	"toast.recalled": "Возвращено в поле ввода",
	"toast.recallBlocked": "В поле ввода уже есть текст — сначала отправьте или очистите его",
	"toast.cleared": "Архив очищен",
	"toast.saveFailed": "Не удалось сохранить — ничего не изменено",
	"update.label": "Доступно обновление",
	"update.tip": "Доступна версия {version} — откройте примечания к выпуску",
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
	"popover.count": "{open} 待续 · {total} 条",
	"popover.archived": "归档",
	"popover.clearCancel": "取消",
	"popover.clearConfirm": "清空归档中的 {n} 条？",
	"popover.clearConfirmAction": "清空",
	"popover.clearArchived": "清空归档",
	"popover.local": "便笺数据仅保存在本地",
	"scope.label": "便笺范围",
	"scope.workspace": "工作区",
	"scope.session": "会话",
	"scope.workspaceHint": "切换到工作区清单，所有会话共享",
	"scope.sessionHint": "切换到会话清单，只属于当前会话",
	"scope.newSessionHint": "当前只能记到工作区，会话开始后可切换",
	"popover.empty.title": "边记摸鱼中..",
	"popover.empty.body": "趁 agent 工作时，异步记下你的想法",
	"settings.open": "设置",
	"settings.title": "设置",
	"settings.about": "关于",
	"settings.tagline": "趁 agent 工作时，异步记下你的想法",
	"settings.version": "版本",
	"settings.author": "作者",
	"settings.improver": "改良者",
	"settings.improverName": "光吟",
	"settings.project": "源代码",
	"settings.storage": "数据存储",
	"add.placeholder": "随手记一条",
	"add.action": "添加",
	"list.open": "待续",
	"list.allArchived.title": "案头已空",
	"list.allArchived.body": "再添一笔，或展开归档回看",
	"item.copy": "复制",
	"item.recall": "退回",
	"item.insert": "填入",
	"item.reorder": "拖动排序，↑↓ 亦可",
	"time.now": "刚刚",
	"time.minutes": "{n} 分钟前",
	"time.hours": "{n} 小时前",
	"time.days": "{n} 天前",
	"time.createdArchived": "写于 {created} · 归档于 {completed}",
	"storage.failed": "本地存储不可用，改动不会保留",
	"storage.whereHost": "便笺保存在 DSH 本地文件",
	"storage.loading": "正在读取便笺…",
	"storage.modeHost": "DSH 本地文件（aside_note.json）",
	"storage.modeLocal": "当前浏览器（localStorage）",
	"storage.settingsLabel": "存储",
	"storage.failure": "最近失败：{code}",
	"storage.migrated": "已把本浏览器的 {n} 条便笺迁入 DSH 本地文件",
	"storage.keptLocal": "已使用宿主便笺；本浏览器的旧便笺未合并",
	"storage.notSwitched": "宿主存储暂不可用，便笺仍保存在本浏览器，下次启动会重试",
	"storage.hostError": "便笺存储暂不可用",
	"storage.inUse": "旁边记（AsideNote）正在使用便笺存储。请停用旁边记，再选择「设置 › 数据存储 › 重新连接」",
	"storage.retry": "重新连接",
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
	"header.tooltip": "边记部 · {n} 条待续",
	"header.tooltipEmpty": "边记部",
	"toast.copied": "已复制",
	"toast.copyFailed": "复制失败，请重试",
	"toast.pathCopied": "已复制路径",
	"toast.revealFailed": "无法打开文件管理器",
	"toast.inserted": "已填入",
	"toast.insertFailed": "找不到对话输入框，便笺未动",
	"toast.archiveFailed": "便笺已填入对话输入框，但存档未能保存",
	"toast.recalled": "已退回输入框",
	"toast.recallBlocked": "输入框已有内容，请先发送或清空",
	"toast.cleared": "归档已清空",
	"toast.saveFailed": "保存失败，内容没有改动",
	"update.label": "有新版本",
	"update.tip": "新版本 {version} 已发布，点击查看更新说明",
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
const EMPTY = {
	sessionId: "",
	workspaceId: "",
	title: "",
	sessionIds: [],
	ready: true
};
let binding = EMPTY;
let version = 0;
const listeners = /* @__PURE__ */ new Set();
const text$2 = (value) => value ? String(value) : "";
const notify = () => {
	version += 1;
	for (const listener of listeners) listener();
};
/** Subscribe to binding changes; used by the open panel to gain session scope. */
function subscribeScope(listener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
/** Monotonic version of the binding, read by useSyncExternalStore. */
function scopeVersion() {
	return version;
}
/**
* Resolve the workspace of the captured session; null clears the binding.
* `ready` is false only when the session is still the blank new-session page.
*/
function bindWorkspace(sessionId, workspace, ready = true) {
	const next = workspace ? {
		sessionId: text$2(sessionId),
		workspaceId: text$2(workspace.workspaceId),
		title: text$2(workspace.title),
		sessionIds: Array.isArray(workspace.sessionIds) ? workspace.sessionIds.map(text$2).filter(Boolean) : [],
		ready: ready !== false
	} : {
		...EMPTY,
		sessionId: text$2(sessionId),
		ready: ready !== false
	};
	if (next.sessionId === binding.sessionId && next.workspaceId === binding.workspaceId && next.title === binding.title && next.sessionIds.join("\0") === binding.sessionIds.join("\0") && next.ready === binding.ready) return false;
	binding = next;
	notify();
	return true;
}
/** The workspace list available to this session, or null outside a workspace. */
function workspaceScopeForSession(sessionId) {
	const id = text$2(sessionId);
	if (id && binding.sessionId === id && binding.workspaceId) return {
		kind: "workspace",
		id: binding.workspaceId,
		title: binding.title,
		sessionIds: binding.sessionIds
	};
	return null;
}
/** Whether the captured session has moved past the blank new-session page. */
function sessionReadyFor(sessionId) {
	const id = text$2(sessionId);
	if (!id || binding.sessionId !== id) return true;
	return binding.ready;
}
/** Whether the panel may offer the session list at all. */
function canUseSessionScope(sessionId) {
	return Boolean(text$2(sessionId)) && sessionReadyFor(sessionId);
}
/** The list this session reads and writes under the chosen scope mode. */
function scopeForSession(sessionId, mode = "workspace") {
	const workspace = workspaceScopeForSession(sessionId);
	if (workspace && (mode !== "session" || !sessionReadyFor(sessionId))) return workspace;
	const id = text$2(sessionId);
	return {
		kind: "session",
		id,
		title: "",
		sessionIds: id ? [id] : []
	};
}
/** Stable key of one list (a workspace or a session). */
function scopeKey(scope) {
	if (!scope || !scope.id) return "";
	return scope.kind === "workspace" ? `ws:${scope.id}` : String(scope.id);
}
/**
* Stable key for the drafts of a conversation.
*
* Drafts belong to the workspace, not to the tab the panel is showing: every
* member conversation shares one buffer, so neither switching conversations
* nor switching the workspace/session scope strands half-typed text. The save
* itself still uses the scope selected at that moment. A session outside a
* workspace keeps its own buffer.
*/
function draftKeyForSession(sessionId) {
	const workspace = workspaceScopeForSession(sessionId);
	return workspace ? scopeKey(workspace) : text$2(sessionId);
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
/** The last host failure, for the settings surface. */
function storageFailure() {
	return failure;
}
function setStorageFailure(next) {
	failure = next;
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
	try {
		const { data: snapshot } = await fetchSnapshot();
		if (mode === "host" && !refreshRequested) {
			hydrateHost(snapshot);
			notifyTodoChange();
		}
	} catch {} finally {
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
/**
* Host mutations.
*
* Notes are written as a diff (`order` + changed `upserts` + removed ids) and
* the host applies it atomically, so two tabs editing different rows merge
* instead of replacing each other's whole list. The scope preference is
* optimistic and rolls back on failure.
*/
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
	setStorageFailure({
		...failure,
		status: error?.status
	});
	notifyStoreError(failure);
}
function tableFor(kind) {
	return kind === "workspace" ? "workspaces" : "sessions";
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
async function commitList(kind, listKey, nextItems) {
	if (!listKey) return false;
	const table = tableFor(kind);
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
			const result = await postOp({
				op: "list.patch",
				kind,
				listKey,
				order,
				upserts,
				deletes
			});
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
		const failure = {
			code: typeof error?.code === "string" ? error.code : "STORE_FAILED",
			message: error instanceof Error ? error.message : String(error)
		};
		setStorageFailure({
			...failure,
			status: error?.status
		});
		return false;
	}
}
/** Fold member sessions into a workspace list once, on the host. */
async function ensureWorkspace(workspaceId, sessionIds) {
	if (!workspaceId) return false;
	const current = hostRecord("workspaces", workspaceId);
	const seeded = new Set(Array.isArray(current?.seededSessionIds) ? current.seededSessionIds : []);
	const pendingMembers = (Array.isArray(sessionIds) ? sessionIds : []).filter((id) => id && !seeded.has(id));
	if (current && pendingMembers.length === 0) return true;
	try {
		await serialize(`workspaces:${workspaceId}`, async () => {
			const latest = hostRecord("workspaces", workspaceId);
			const seeded = new Set(Array.isArray(latest?.seededSessionIds) ? latest.seededSessionIds : []);
			if (latest && pendingMembers.every((id) => seeded.has(id))) return;
			const result = await postOp({
				op: "list.ensure",
				workspaceId,
				sessionIds: Array.isArray(sessionIds) ? sessionIds : []
			});
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
/** Merge user preferences on the host; optimistic with the same rollback rule. */
function setPrefs(patch) {
	const previous = hostPrefs();
	const next = {
		...previous,
		...patch,
		version: 1
	};
	applyHostPrefs(next);
	serialize("prefs", async () => {
		try {
			const result = await postOp({
				op: "prefs.set",
				patch
			});
			applyHostPrefs(result.prefs);
			broadcastHostChange({
				kind: "prefs",
				prefs: result.prefs,
				rev: result.rev
			});
		} catch (error) {
			if (sameJson(hostPrefs(), next)) applyHostPrefs(previous);
			report(error);
		}
	});
	return true;
}
/** Upload the pre-switch browser store; safe to re-run after an interruption. */
async function migrate(snapshot) {
	return postOp({
		op: "migrate",
		snapshot,
		source: "localStorage"
	});
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
	if (hostAuthoritative()) return hostPrefs().scopeMode === "session" ? "session" : SCOPE_MODE_DEFAULT;
	try {
		return (storage() && storage().getItem("dsh.aside-note.scope-mode")) === "session" ? "session" : SCOPE_MODE_DEFAULT;
	} catch {
		return SCOPE_MODE_DEFAULT;
	}
}
function writeScopeMode(mode) {
	if (storageMode() === "error") return;
	if (storageMode() === "host") {
		setPrefs({ scopeMode: mode === "session" ? "session" : "workspace" });
		return;
	}
	try {
		const ls = storage();
		if (ls) ls.setItem(SCOPE_MODE_KEY, mode === "session" ? "session" : "workspace");
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
	if (scope === "workspace" || scope === "session") prefs.scopeMode = scope;
	const shortcut = readItem(SEND_SHORTCUT_KEY);
	if (shortcut === "enter" || shortcut === "ctrl-enter") prefs.sendShortcut = shortcut;
	const prefix = readItem(FORWARD_PREFIX_STORAGE_KEY);
	if (typeof prefix === "string") prefs.forwardPrefix = prefix.slice(0, 80);
	return {
		sessions: bucket$2(sessionStore?.sessions),
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
/** Force a new probe (settings retry button). */
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
/** Current mode without waiting. */
function currentStorageMode() {
	return storageMode();
}

// src/client/storage/drafts.ts
/**
* The unsaved composer draft, so closing the panel never loses text.
*
* Records are keyed by draft scope, not by conversation: inside a workspace
* every member session shares one buffer (`ws:<workspaceId>`), so switching
* conversations or the workspace/session scope never strands half-typed text.
* A session outside a workspace keeps its own key. Saving still writes the
* list selected at that moment. The map field stays `sessions` so the existing
* store keeps its shape.
*/
const keyOf = (value) => value ? String(value) : "";
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
	if (!ls) return;
	try {
		ls.setItem(DRAFT_STORAGE_KEY, JSON.stringify(store));
	} catch {}
}
/** The unsaved composer draft of one scope (a workspace or a lone session). */
function readScopeDrafts(key) {
	const id = keyOf(key);
	const record = id ? readDraftStore().sessions[id] : null;
	if (!record || typeof record !== "object" || Array.isArray(record)) return { add: "" };
	return { add: typeof record.add === "string" ? record.add : "" };
}
function pruneDraftScope(store, key) {
	const record = store.sessions[key];
	if (!record) return;
	if (!(typeof record.add === "string" && record.add.length > 0)) delete store.sessions[key];
}
function saveAddDraft(key, text) {
	const id = keyOf(key);
	if (!id) return;
	const store = readDraftStore();
	const record = store.sessions[id] || {};
	const value = String(text || "").slice(0, 280);
	if (value) record.add = value;
	else delete record.add;
	delete record.edits;
	store.sessions[id] = record;
	pruneDraftScope(store, id);
	writeDraftStore(store);
}
function clearAddDraft(key) {
	saveAddDraft(key, "");
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
	if (!add) return false;
	store.sessions[target] = { add };
	for (const member of members) delete store.sessions[member];
	delete store.sessions[source];
	writeDraftStore(store);
	return true;
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
		if (!text) continue;
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
/**
* Session-scoped notes.
*
* Two media, one shape: while this browser is still on `localStorage` the
* record lives under `SESSION_STORAGE_KEY`; after the one-way switch the same
* record lives in the host snapshot's `sessions` table and writes go through
* the host route. The workspace key is separate, so existing per-session data
* is never rewritten into a new schema.
*/
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
/** Read one session's memo record. */
function readSessionRecord(sessionId) {
	const key = sessionId ? String(sessionId) : "";
	if (!key) return {
		items: [],
		updatedAt: 0
	};
	if (hostAuthoritative()) {
		const record = hostRecord("sessions", key);
		return {
			items: normalizeItems(record && record.items),
			updatedAt: record && Number.isFinite(record.updatedAt) ? record.updatedAt : 0
		};
	}
	const record = readLocalStore$1().sessions[key];
	return {
		items: normalizeItems(record && record.items),
		updatedAt: record && Number.isFinite(record.updatedAt) ? record.updatedAt : 0
	};
}
/**
* Persist one session's memo record.
*
* Host mode sends only the changed notes; the host applies them atomically to
* its latest record. Local mode reads the latest stored record first and merges
* by id, so a note another tab added is not overwritten; `base` is the list this
* tab rendered, and ids missing from `record.items` are this tab's deletions.
*
* @returns resolution with whether the write was accepted/durable
*/
async function writeSessionRecord(sessionId, record, base = null) {
	const key = sessionId ? String(sessionId) : "";
	if (!key) return false;
	const mode = storageMode();
	if (mode === "probing" || mode === "error") return false;
	if (mode === "host") return commitList("session", key, normalizeItems(record && record.items));
	const store = readLocalStore$1();
	const previous = store.sessions[key];
	store.sessions[key] = {
		sessionId: key,
		updatedAt: Math.max(record.updatedAt || 0, previous && Number.isFinite(previous.updatedAt) ? previous.updatedAt : 0) || Date.now(),
		items: mergeItems(normalizeItems(previous && previous.items), normalizeItems(record.items), base)
	};
	return writeSessionStore(store);
}

// src/client/storage/workspace.ts
/**
* Workspace-scoped notes.
*
* One list is shared by every session of a workspace. The first time a
* workspace is seen, notes already written per session are folded in once;
* `seededSessionIds` records that so a later delete is not undone. After the
* switch to host storage the fold runs on the host (`list.ensure`), where it is
* atomic; before the switch it stays in the browser and merges before writing.
*/
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
		workspaces: {}
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
		workspaces: bucket(workspaces)
	};
}
/** Persist the whole browser workspace store. */
function writeWorkspaceStore(store) {
	const ls = storage();
	if (!ls) return false;
	try {
		ls.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify({
			version: 1,
			workspaces: bucket(store && store.workspaces)
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
	if (mode === "host") return commitList("workspace", key, normalizeItems(record && record.items));
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
/**
* Fold the member sessions' existing notes into the workspace list once.
* @returns resolution with whether the store changed / was accepted
*/
async function ensureWorkspaceRecord(workspaceId, sessionIds) {
	const key = text$1(workspaceId);
	if (!key) return false;
	if (storageMode() === "probing") await bootStorage();
	const mode = storageMode();
	if (mode === "probing" || mode === "error") return false;
	if (mode === "host") return ensureWorkspace(key, Array.isArray(sessionIds) ? sessionIds : []);
	const previous = readLocalStore().workspaces[key];
	const seeded = new Set(seededOf(previous));
	const items = normalizeItems(previous && previous.items);
	const seen = new Set(items.map((item) => item.id));
	let changed = !previous;
	if (!changed && Array.isArray(sessionIds)) for (const value of sessionIds) {
		const sessionId = text$1(value);
		if (!sessionId) continue;
		if (!seeded.has(sessionId)) {
			changed = true;
			break;
		}
	}
	if (!changed) return false;
	const sessionStore = readSessionStore();
	for (const value of Array.isArray(sessionIds) ? sessionIds : []) {
		const sessionId = text$1(value);
		if (!sessionId || seeded.has(sessionId)) continue;
		seeded.add(sessionId);
		changed = true;
		const sessionRecord = sessionStore.sessions[sessionId];
		for (const item of normalizeItems(sessionRecord && sessionRecord.items)) {
			if (seen.has(item.id)) continue;
			seen.add(item.id);
			items.push(item);
		}
	}
	return writeWorkspaceRecord(key, {
		items,
		updatedAt: previous && Number.isFinite(previous.updatedAt) ? previous.updatedAt : Date.now(),
		seededSessionIds: [...seeded]
	});
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
* Reorder grip. Newer shells ship a drag-handle glyph; older ones fall back to
* the up/down chevrons, so the handle never renders empty.
*/
const IconGrip = () => h$13(Glyph, {
	name: icon("IconDragHandleOutlineRegular") ? "IconDragHandleOutlineRegular" : "IconChevronsUpDownOutlineRegular",
	size: 14
});
const IconGear = () => h$13(Glyph, {
	name: "IconSettingsOutlineRegular",
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
	recalled: {
		key: "toast.recalled",
		tone: "success"
	},
	recallBlocked: { key: "toast.recallBlocked" },
	cleared: {
		key: "toast.cleared",
		tone: "success"
	},
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
/**
* The host-owned notes button in the conversation header.
*
* It is a plain DOM node beside the shell's utilities row: a React portal there
* would be reconciled away. The glyph is inlined for the same reason.
*/
const HEADER_ICON = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.25 2.75h6.5l3 3v7.5c0 .55-.45 1-1 1H3.25c-.55 0-1-.45-1-1V3.75c0-.55.45-1 1-1Z\"/><path d=\"M9.75 2.75v3h3\"/><path d=\"M4.9 7.6h5.4M4.9 9.9h3.6\" stroke-linecap=\"round\"/></svg>";
function createHeaderEntry({ getSessionId, getActiveAnchor, getLocaleId, tr, onOpen }) {
	const refresh = () => {
		const sessionId = getSessionId();
		let button = document.querySelector(".dsh-an-headerBtn");
		if (!sessionId) {
			if (button) button.remove();
			return;
		}
		const ready = sessionReadyFor(sessionId);
		const workspace = workspaceScopeForSession(sessionId);
		if (!ready && !workspace) {
			if (button) button.remove();
			return;
		}
		const utilities = document.querySelector("[class*=\"_headerUtilities\"]");
		const corner = ready ? null : document.querySelector("[class*=\"_headerCorner\"]");
		const host = utilities || corner;
		if (!host) {
			if (button) button.remove();
			return;
		}
		const scope = scopeForSession(sessionId, readScopeMode());
		const store = readSessionStore();
		const open = (scope.kind === "workspace" ? readWorkspaceRecord(scope.id).items : normalizeItems(store.sessions[sessionId] && store.sessions[sessionId].items)).filter((item) => !item.done).length;
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
		button.dataset.active = getActiveAnchor() === button ? "true" : "false";
		button.dataset.scope = scope.kind;
		const signature = `${getLocaleId()}:${scopeKey(scope)}:${open}`;
		if (button.dataset.signature !== signature) {
			const icon = document.createElement("span");
			icon.className = "dsh-an-headerIcon";
			icon.innerHTML = HEADER_ICON;
			button.replaceChildren(icon);
			if (open > 0) {
				const count = document.createElement("span");
				count.className = "dsh-an-headerCount";
				count.textContent = open > 99 ? "99+" : String(open);
				button.appendChild(count);
			}
			button.dataset.signature = signature;
		}
		button.dataset.sessionId = sessionId;
		button.title = open > 0 ? tr("header.tooltip", { n: open }) : tr("header.tooltipEmpty");
		button.setAttribute("aria-label", open > 0 ? `${tr("dock.open")}, ${tr("dock.count", { n: open })}` : tr("dock.open"));
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
			if (event.key === "dsh.aside-note" || event.key === "dsh.aside-note.workspaces" || event.key === "dsh.aside-note.scope-mode") schedule();
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
		attach
	};
}

// src/client/ui/useSessionMemoStore.ts
/** Notes for the active scope plus its writer, serialized per mounted panel. */
/** Read the record the current scope renders. */
function readScope(scope) {
	return scope.kind === "workspace" ? readWorkspaceRecord(scope.id) : readSessionRecord(scope.id);
}
/** Write the record the current scope renders; `base` is what this tab saw. */
function writeScope(scope, record, base) {
	return scope.kind === "workspace" ? writeWorkspaceRecord(scope.id, record, base) : writeSessionRecord(scope.id, record, base);
}
/** Notes of one list (a workspace, or a single session) and their writer. */
function useMemoStore(scope) {
	const kind = scope && scope.kind === "workspace" ? "workspace" : "session";
	const id = scope && scope.id ? String(scope.id) : "";
	const scopeRef = react.default.useRef({
		kind,
		id
	});
	scopeRef.current = {
		kind,
		id
	};
	const [record, setRecord] = react.default.useState(() => readScope(scopeRef.current));
	const [syncError, setSyncError] = react.default.useState(false);
	const chainRef = react.default.useRef(Promise.resolve());
	react.default.useLayoutEffect(() => {
		setRecord(readScope(scopeRef.current));
		setSyncError(false);
	}, [kind, id]);
	react.default.useEffect(() => {
		const onStorage = (event) => {
			if (event.key !== "dsh.aside-note" && event.key !== "dsh.aside-note.workspaces") return;
			setRecord(readScope(scopeRef.current));
		};
		const onLocal = () => setRecord(readScope(scopeRef.current));
		TODO_LISTENERS.add(onLocal);
		window.addEventListener("storage", onStorage);
		return () => {
			TODO_LISTENERS.delete(onLocal);
			window.removeEventListener("storage", onStorage);
		};
	}, []);
	return {
		record,
		syncError,
		commit: react.default.useCallback((updater) => {
			const target = {
				kind,
				id
			};
			const run = chainRef.current.then(async () => {
				const current = readScope(target);
				const base = current.items || [];
				const nextItems = normalizeItems(updater(base));
				const next = {
					...current,
					items: nextItems,
					updatedAt: Date.now()
				};
				const ok = await writeScope(target, next, base);
				const active = scopeRef.current;
				if (active.kind !== target.kind || active.id !== target.id) return ok;
				setSyncError(!ok);
				if (!ok) return false;
				setRecord(readScope(target));
				return true;
			});
			chainRef.current = run.then(() => void 0, () => void 0);
			return run;
		}, [kind, id])
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
		const rightInset = Math.max(margin, Math.min(window.innerWidth - margin, window.innerWidth - desiredRight));
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
* Update centre state for the settings card.
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
function useComposerDraft({ draftKey, commit, report, storageInUse }) {
	const key = draftKey ? String(draftKey) : "";
	const [draft, setDraft] = react.default.useState(() => readScopeDrafts(key).add);
	const draftRef = react.default.useRef({ value: draft });
	const pendingAction = react.default.useRef(false);
	const [isSubmitting, setIsSubmitting] = react.default.useState(false);
	const [isRecalling, setIsRecalling] = react.default.useState(false);
	const addRef = react.default.useRef(null);
	const composingRef = react.default.useRef(false);
	const resizeAdd = (node) => {
		if (!node) return;
		node.style.height = "auto";
		node.style.height = `${node.scrollHeight + 2}px`;
	};
	react.default.useEffect(() => {
		resizeAdd(addRef.current);
	}, [draft]);
	const hasFinePointer = () => typeof window.matchMedia !== "function" || window.matchMedia("(hover: hover) and (pointer: fine)").matches;
	react.default.useLayoutEffect(() => {
		const node = addRef.current;
		if (!node) return;
		if (!hasFinePointer()) return;
		node.focus();
		const end = node.value.length;
		try {
			node.setSelectionRange(end, end);
		} catch {}
	}, []);
	const updateDraft = (value) => {
		draftRef.current = { value };
		setDraft(value);
		saveAddDraft(key, value);
	};
	const add = async () => {
		const submitted = draftRef.current;
		const text = submitted.value.trim().slice(0, 280);
		if (!text || pendingAction.current || storageInUse) return;
		pendingAction.current = true;
		setIsSubmitting(true);
		try {
			const now = Date.now();
			if (!await commit((currentItems) => [{
				id: uid(),
				text,
				done: false,
				createdAt: now,
				updatedAt: now
			}, ...currentItems])) {
				report("saveFailed");
				return;
			}
			if (draftRef.current === submitted) {
				draftRef.current = { value: "" };
				setDraft("");
				if (readScopeDrafts(key).add === submitted.value.slice(0, 280)) clearAddDraft(key);
			}
		} finally {
			pendingAction.current = false;
			setIsSubmitting(false);
		}
	};
	/**
	* Replace the composer with a recalled note and put the caret at its end.
	*
	* This is the only text editor for a note: the row leaves the list and its
	* text lands here, where the user can change it and submit it again.
	*/
	const recall = async (item, takeBack) => {
		if (pendingAction.current || draftRef.current.value.trim() || readScopeDrafts(key).add.trim()) {
			report("recallBlocked");
			return;
		}
		pendingAction.current = true;
		setIsRecalling(true);
		try {
			if (!await takeBack(item)) return;
			updateDraft(String(item.text || "").slice(0, 280));
			report("recalled");
		} finally {
			pendingAction.current = false;
			setIsRecalling(false);
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
		if (isRecalling) return;
		updateDraft(event.target.value);
		resizeAdd(event.target);
	};
	/**
	* Match the main composer: Enter adds the note, Shift+Enter keeps the
	* textarea's native line break, and Enter that belongs to an IME candidate
	* pick is left to the browser. A held Enter must not add note after note.
	*/
	const onDraftKeyDown = (event) => {
		const composing = event.isComposing || event.nativeEvent && event.nativeEvent.isComposing;
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
		isSubmitting,
		isRecalling,
		addRef,
		composingRef,
		add,
		recall,
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
		return commit((currentItems) => currentItems.map((candidate) => {
			if (candidate.id !== item.id || candidate.done) return candidate;
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
	const move = async (itemId, toIndex) => {
		let changed = false;
		const ok = await commit((currentItems) => {
			const next = moveOpenItem(currentItems, itemId, toIndex);
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
		if (!await commit((currentItems) => currentItems.filter((candidate) => candidate.id !== item.id))) {
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
* Reorder the open notes by their grip: drag with any pointer, or press the
* up/down arrows while the grip has focus.
*
* The drag runs outside React: rows follow the pointer through inline
* transforms, so a long list never re-renders per frame. Only the drop goes
* through `onMove`, and the lifted row then glides from where it was let go
* into its new slot (a FLIP in the layout effect below).
*/
/** Pixels the pointer travels before a press on the grip becomes a drag. */
const DRAG_THRESHOLD = 4;
/** Distance from the scroller's edge where a held drag starts scrolling it. */
const EDGE_ZONE = 32;
/** Fastest auto-scroll step, in pixels per frame, right at the edge. */
const EDGE_SPEED = 8;
function useRowReorder({ ids, scrollRef, onMove }) {
	const listRef = react.default.useRef(null);
	const dragRef = react.default.useRef(null);
	const settleRef = react.default.useRef(null);
	const focusRef = react.default.useRef("");
	const idsRef = react.default.useRef(ids);
	idsRef.current = ids;
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
			let to = 0;
			drag.rows.forEach((row, index) => {
				if (index !== drag.from && row.top + row.height / 2 < center) to += 1;
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
				drag.grip.releasePointerCapture(drag.pointerId);
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
			const list = listRef.current;
			const all = rows();
			const from = all.findIndex((node) => node.dataset.rowId === id);
			if (!list || from < 0) return;
			event.preventDefault();
			const grip = event.currentTarget;
			try {
				grip.setPointerCapture(event.pointerId);
			} catch {}
			const listTop = list.getBoundingClientRect().top;
			const scroller = scrollRef.current || null;
			dragRef.current = {
				id,
				from,
				to: from,
				grip,
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
			if (!drag || event.pointerId !== drag.pointerId) return;
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
		/** Arrow keys move the focused note one slot; the grip keeps focus. */
		const key = (id, event) => {
			if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
			event.preventDefault();
			if (dragRef.current) return;
			const order = idsRef.current;
			const index = order.indexOf(id);
			const to = index + (event.key === "ArrowUp" ? -1 : 1);
			if (index < 0 || to < 0 || to >= order.length) return;
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
			const row = api.rows().find((node) => node.dataset.rowId === focusId);
			const grip = row ? row.querySelector(".dsh-an-grip") : null;
			if (grip && document.activeElement !== grip) grip.focus();
		}
	}, [idsKey, api]);
	react.default.useEffect(() => () => api.finish(false), [api]);
	/** Props for one row's grip button. */
	const gripProps = (id) => ({
		onPointerDown: (event) => api.start(id, event),
		onPointerMove: api.move,
		onPointerUp: () => api.finish(true),
		onPointerCancel: () => api.finish(false),
		onLostPointerCapture: () => api.finish(true),
		onKeyDown: (event) => api.key(id, event)
	});
	return {
		listRef,
		gripProps
	};
}

// src/client/ui/useClearConfirm.ts
/** The inline second confirmation for clearing completed notes. */
function useClearConfirm({ sessionId, showDone, doneCount, onConfirm }) {
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
	}, [sessionId]);
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
		const onPointerDown = (event) => {
			if (panelRef.current && panelRef.current.contains(event.target)) return;
			if (anchorRef.current && anchorRef.current.contains(event.target)) return;
			onClose();
		};
		const onKeyDown = (event) => {
			if (event.key === "Escape") onClose();
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
/**
* One note, kept light: a reorder grip, the text, and one trailing cell where
* the age rests and the actions take its place on hover.
*/
const h$11 = react.default.createElement;
function TodoRow(props) {
	const { item, archived, say, localeId, onToast, onInsert, onRecall, grip } = props;
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
		"data-row-id": item.id
	}, grip ? h$11("button", {
		type: "button",
		className: "dsh-an-grip",
		"aria-label": say("item.reorder"),
		...grip
	}, h$11(IconGrip, null)) : h$11("span", {
		className: "dsh-an-gripSpacer",
		"aria-hidden": true
	}), h$11("div", { className: "dsh-an-text" }, item.text), h$11("div", { className: "dsh-an-trail" }, h$11("span", {
		className: "dsh-an-meta",
		title: metaLabel(item, say, localeId)
	}, rowAge(item, say, localeId)), h$11("div", { className: "dsh-an-actions" }, withTooltip(say("item.copy"), h$11("button", {
		type: "button",
		className: "dsh-an-iconBtn",
		"aria-label": say("item.copy"),
		"aria-busy": pending === "copy" ? "true" : "false",
		"data-loading": pending === "copy" ? "true" : void 0,
		onClick: copy
	}, h$11(IconCopy, null))), withTooltip(say("item.recall"), h$11("button", {
		type: "button",
		className: "dsh-an-iconBtn",
		"aria-label": say("item.recall"),
		onClick: () => onRecall(item)
	}, h$11(IconRewind, null))), archived ? null : withTooltip(say("item.insert"), h$11("button", {
		type: "button",
		className: "dsh-an-iconBtn dsh-an-insert",
		"aria-label": say("item.insert"),
		onClick: () => onInsert(item)
	}, h$11(IconInsert, null))))));
}

// src/client/ui/ScopeSwitch.tsx
/** Segmented switch between the workspace list and the session list. */
const h$10 = react.default.createElement;
function ScopeSwitch(props) {
	const { say, mode, canUseSession, onChange } = props;
	const options = [{
		value: "workspace",
		label: say("scope.workspace")
	}, ...canUseSession ? [{
		value: "session",
		label: say("scope.session")
	}] : []];
	return h$10("div", {
		className: "dsh-an-scope",
		role: "group",
		"aria-label": say("scope.label")
	}, options.map((option) => h$10(react.default.Fragment, { key: option.value }, withTooltip(option.value === "session" ? say("scope.sessionHint") : canUseSession ? say("scope.workspaceHint") : say("scope.newSessionHint"), h$10("button", {
		type: "button",
		className: "dsh-an-scopeBtn",
		"data-scope-mode": option.value,
		"data-active": mode === option.value ? "true" : void 0,
		"aria-pressed": mode === option.value,
		onClick: () => onChange(option.value)
	}, option.label)))));
}

// src/client/ui/PanelHead.ts
/** Panel title, counts, the list-scope switch and the settings/close actions. */
const h$9 = react.default.createElement;
function PanelHead(props) {
	const { say, openCount, total, showSettings, onToggleSettings, onClose, newerVersion, scopeMode, canUseWorkspace, canUseSession, onScopeChange } = props;
	return h$9("div", { className: "dsh-an-popHead" }, h$9("div", { className: "dsh-an-popTitleLine" }, h$9("div", { className: "dsh-an-popTitle" }, say("popover.title")), h$9("p", { className: "dsh-an-popMeta" }, say("popover.count", {
		open: openCount,
		total
	})), canUseWorkspace ? h$9(ScopeSwitch, {
		say,
		mode: scopeMode,
		canUseSession,
		onChange: onScopeChange
	}) : null), h$9("div", { className: "dsh-an-popActions" }, withTooltip(say("settings.open"), h$9("button", {
		type: "button",
		className: "dsh-an-settingsBtn",
		"data-active": showSettings ? "true" : void 0,
		"aria-label": newerVersion ? `${say("settings.open")} · ${say("update.tip", { version: `v${newerVersion}` })}` : say("settings.open"),
		"aria-expanded": showSettings,
		onClick: onToggleSettings
	}, h$9(IconGear, null), newerVersion ? h$9("span", {
		className: "dsh-an-updateDot",
		"aria-hidden": true
	}) : null)), withTooltip(say("popover.close"), h$9("button", {
		type: "button",
		className: "dsh-an-popClose",
		"aria-label": say("popover.close"),
		onClick: onClose
	}, h$9(IconClose, null)))));
}

// src/client/ui/UpdateNotice.ts
/**
* Settings › About › update centre.
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
const h$8 = react.default.createElement;
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
	const noteGroups = (list) => list.map((group, index) => h$8("div", {
		key: `${group.title}-${index}`,
		className: "dsh-an-updateGroup"
	}, group.title ? h$8("div", { className: "dsh-an-updateGroupTitle" }, group.title) : null, h$8("ul", { className: "dsh-an-updateItems" }, group.items.map((item, itemIndex) => h$8("li", {
		key: itemIndex,
		className: "dsh-an-updateItem"
	}, item.lead ? h$8("strong", null, item.lead) : null, item.lead ? " " : null, item.body)))));
	const entryBody = (entry) => entry.groups.length > 0 ? noteGroups(entry.groups) : h$8("p", { className: "dsh-an-updateHint" }, say("update.notesMissing"));
	const notesBody = notes.status === "loading" ? h$8("p", { className: "dsh-an-updateHint" }, say("update.notesLoading")) : notes.status === "error" ? h$8("p", { className: "dsh-an-updateHint" }, say("update.notesFailed")) : notes.status === "ready" && notes.entries.length === 1 ? entryBody(notes.entries[0]) : notes.status === "ready" ? h$8("div", { className: "dsh-an-updateVersions" }, h$8("p", { className: "dsh-an-updateHint" }, say("update.historyCount", { n: notes.entries.length })), notes.entries.map((entry, index) => {
		const open = expandedVersions[entry.version] === true;
		return h$8("div", {
			key: entry.version,
			className: "dsh-an-updateVersion"
		}, h$8("button", {
			type: "button",
			className: "dsh-an-updateVersionHead",
			"aria-expanded": open,
			"aria-controls": `${NOTES_ID}-${entry.version}`,
			onClick: () => props.onToggleVersion(entry.version)
		}, h$8("span", {
			className: "dsh-an-updateChevron",
			"data-open": open ? "true" : "false",
			"aria-hidden": true
		}, "▸"), h$8("span", { className: "dsh-an-updateVersionLabel" }, `v${entry.version}`), index === 0 ? h$8("span", { className: "dsh-an-updateLatest" }, say("update.latest")) : null), open ? h$8("div", {
			id: `${NOTES_ID}-${entry.version}`,
			className: "dsh-an-updateVersionBody"
		}, entryBody(entry)) : null);
	}), notes.truncated ? h$8("a", {
		className: "dsh-an-updateFull",
		href: props.releasesUrl,
		target: "_blank",
		rel: "noreferrer"
	}, say("update.olderNotes")) : null) : null;
	return h$8("div", { className: "dsh-an-updateCard" }, h$8("div", { className: "dsh-an-updateTitle" }, say("update.available", { version: `v${latestVersion}` })), h$8("div", {
		id: NOTES_ID,
		ref: notesRef,
		className: "dsh-an-updateNotes",
		role: "region",
		"aria-label": say("update.notesTitle"),
		"data-fade": fade ? "true" : void 0
	}, notesBody), h$8("div", { className: "dsh-an-updateActions" }, phase === "done" ? h$8("div", { className: "dsh-an-updateDone" }, h$8("span", { className: "dsh-an-updateHint" }, say("update.updated", { version: run.installedVersion ? `v${run.installedVersion}` : `v${latestVersion}` })), h$8("button", {
		type: "button",
		className: "dsh-an-updatePrimary",
		onClick: props.onRefresh
	}, say("update.refresh"))) : h$8("button", {
		type: "button",
		className: "dsh-an-updatePrimary",
		disabled: busy,
		"aria-busy": busy,
		onClick: () => props.onStartUpdate()
	}, busy ? phase === "running" ? say("update.updating") : say("update.starting") : say("update.now")), fullReleaseUrl ? h$8("a", {
		className: "dsh-an-updateFull",
		href: fullReleaseUrl,
		target: "_blank",
		rel: "noreferrer"
	}, say("update.full")) : null), phase === "error" ? h$8("div", { className: "dsh-an-updateErrorRow" }, h$8("p", {
		className: "dsh-an-updateError",
		role: "status"
	}, failureKey ? say(failureKey) : say("update.failed", { reason: run.message || run.failureCode || "" }))) : null, manual ? h$8("div", { className: "dsh-an-updateFallback" }, h$8("p", { className: "dsh-an-updateHint" }, say("update.manualHint", { command: manualCommand })), h$8("button", {
		type: "button",
		className: "dsh-an-updateCopy",
		onClick: copyPrompt
	}, say("update.copyPrompt"))) : null, run.phase === "done" && run.restartRequired ? h$8("p", { className: "dsh-an-updateHint" }, say("update.restartHint")) : null);
}

// src/client/ui/StorageSettings.ts
/** Settings › Data storage: the medium, the host file path and its actions. */
const h$7 = react.default.createElement;
/**
* The storage decision can change after this block mounts (retry, or a probe
* finishing late); refresh on the same ready channel the entry uses. The path
* is host-owned state and is fetched only while host storage is in use.
*/
function StorageSettings(props) {
	const { say } = props;
	const [storage, setStorage] = react.default.useState(() => ({
		mode: currentStorageMode(),
		failure: storageFailure()
	}));
	react.default.useEffect(() => {
		const onReady = () => setStorage({
			mode: currentStorageMode(),
			failure: storageFailure()
		});
		STORE_READY_LISTENERS.add(onReady);
		return () => {
			STORE_READY_LISTENERS.delete(onReady);
		};
	}, []);
	const [location, setLocation] = react.default.useState(null);
	const [locating, setLocating] = react.default.useState(false);
	react.default.useEffect(() => {
		if (storage.mode !== "host") {
			setLocation(null);
			setLocating(false);
			return;
		}
		let alive = true;
		setLocating(true);
		fetchStoreLocation().then((next) => {
			if (!alive) return;
			setLocation(next);
			setLocating(false);
		});
		return () => {
			alive = false;
		};
	}, [storage.mode]);
	const notify = typeof props.onToast === "function" ? props.onToast : () => {};
	const copyStorePath = async () => {
		if (!location || !location.path) return;
		notify(await copyText(location.path) ? "pathCopied" : "copyFailed");
	};
	const showStoreFile = async () => {
		if (!await revealStoreFile()) notify("revealFailed");
	};
	const modeLabel = storage.mode === "host" ? say("storage.modeHost") : storage.mode === "local" ? say("storage.modeLocal") : storage.mode === "probing" ? say("storage.loading") : say(storage.failure?.code === "STORE_IN_USE" ? "storage.inUse" : "storage.hostError");
	return h$7("div", { className: "dsh-an-storageBlock" }, h$7("div", { className: "dsh-an-settingMetaRow" }, h$7("span", null, modeLabel), storage.mode === "error" ? h$7("button", {
		type: "button",
		className: "dsh-an-updateCheck",
		onClick: () => {
			retryStorage();
		}
	}, say("storage.retry")) : null), storage.mode === "host" ? locating ? h$7("p", { className: "dsh-an-settingHint" }, say("storage.pathLoading")) : location && location.path ? h$7("div", { className: "dsh-an-storagePathRow" }, h$7("code", {
		className: "dsh-an-storagePath",
		title: location.path
	}, location.path), h$7("div", { className: "dsh-an-storageActions" }, h$7("button", {
		type: "button",
		className: "dsh-an-storageAction",
		onClick: () => {
			copyStorePath();
		}
	}, say("storage.copyPath")), h$7("button", {
		type: "button",
		className: "dsh-an-storageAction",
		onClick: () => {
			showStoreFile();
		}
	}, say("storage.reveal"))), location.exists ? null : h$7("p", { className: "dsh-an-settingHint" }, say("storage.pathMissing"))) : h$7("p", { className: "dsh-an-settingHint" }, say("storage.pathUnavailable")) : storage.mode === "local" ? h$7("p", { className: "dsh-an-settingHint" }, say("storage.notSwitched")) : null, storage.failure ? h$7("p", { className: "dsh-an-settingHint" }, say("storage.failure").replace("{code}", storage.failure.code)) : null);
}

// src/client/ui/SettingsPanel.ts
/** Settings card: about and updates. */
const h$6 = react.default.createElement;
function SettingsPanel(props) {
	const { say, update } = props;
	return h$6("div", { className: "dsh-an-settings" }, h$6("div", { className: "dsh-an-settingsHead" }, say("settings.title")), h$6("div", { className: "dsh-an-settingGroup" }, h$6("div", { className: "dsh-an-settingLabel" }, say("settings.storage")), h$6("div", { className: "dsh-an-settingBody" }, h$6(StorageSettings, {
		say,
		onToast: props.onToast
	}))), h$6("div", { className: "dsh-an-settingGroup" }, h$6("div", { className: "dsh-an-settingLabel" }, say("settings.about")), h$6("div", { className: "dsh-an-settingBody" }, h$6("div", { className: "dsh-an-settingBrand" }, h$6("span", { className: "dsh-an-settingBrandName" }, say("title")), h$6("span", { className: "dsh-an-settingBrandTagline" }, say("settings.tagline"))), h$6("div", { className: "dsh-an-settingAbout" }, h$6("span", { className: "dsh-an-settingAboutVersion" }, `${say("settings.version")} ${PLUGIN_VERSION}`), h$6("button", {
		type: "button",
		className: "dsh-an-updateCheck",
		disabled: update.check.status === "checking",
		onClick: update.checkNow
	}, say(update.check.status === "checking" ? "update.checking" : update.check.status === "error" ? "update.retryCheck" : "update.check")), update.check.status === "current" ? h$6("span", {
		className: "dsh-an-updateHint",
		role: "status"
	}, say("update.current")) : null, update.check.status === "error" ? h$6("span", {
		className: "dsh-an-updateHint dsh-an-updateHintError",
		role: "status"
	}, say("update.checkFailed")) : null), update.latestVersion ? h$6(UpdateNotice, {
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
		onToast: props.onToast
	}) : null, h$6("div", { className: "dsh-an-settingMetaRow" }, h$6("span", null, say("settings.author")), h$6("span", {
		className: "dsh-an-settingDot",
		"aria-hidden": true
	}, "·"), h$6("span", null, PLUGIN_AUTHOR)), h$6("div", { className: "dsh-an-settingMetaRow" }, h$6("span", null, say("settings.improver")), h$6("span", {
		className: "dsh-an-settingDot",
		"aria-hidden": true
	}, "·"), h$6("span", null, say("settings.improverName"))), h$6("div", { className: "dsh-an-settingMetaRow" }, h$6("span", null, say("settings.project")), h$6("span", {
		className: "dsh-an-settingDot",
		"aria-hidden": true
	}, "·"), h$6("a", {
		className: "dsh-an-settingLink",
		href: PLUGIN_REPO_URL,
		target: "_blank",
		rel: "noreferrer",
		title: PLUGIN_REPO_URL
	}, PLUGIN_REPO_LABEL)))));
}

// src/client/ui/ComposerForm.ts
/** The add form: one growing textarea and its submit button. */
const h$5 = react.default.createElement;
function ComposerForm(props) {
	const { say, draft, isSubmitting, isRecalling, storageInUse, inputRef, onDraftChange, onCompositionStart, onCompositionEnd, onKeyDown, onSubmit } = props;
	const addLabel = say("add.action");
	return h$5("form", {
		className: "dsh-an-add",
		onSubmit
	}, h$5("textarea", {
		ref: inputRef,
		className: "dsh-an-input",
		value: draft,
		rows: 1,
		maxLength: 280,
		readOnly: isRecalling,
		placeholder: say("add.placeholder"),
		"aria-label": say("add.placeholder"),
		onChange: onDraftChange,
		onCompositionStart,
		onCompositionEnd,
		onKeyDown
	}), withTooltip(addLabel, h$5("button", {
		type: "submit",
		className: "dsh-an-addBtn",
		"aria-label": addLabel,
		disabled: storageInUse || isSubmitting || isRecalling || !draft.trim()
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
	}, h$5("path", { d: "M13 3v5a2 2 0 0 1-2 2H3m0 0 3-3m-3 3 3 3" })))));
}

// src/client/ui/ClearConfirm.ts
/** Inline second confirmation for clearing the completed notes. */
const h$4 = react.default.createElement;
function ClearConfirm(props) {
	const { say, count, onCancel, onConfirm } = props;
	return h$4("div", {
		className: "dsh-an-clearConfirm",
		role: "group",
		"aria-live": "polite",
		"aria-label": say("popover.clearConfirm", { n: count })
	}, h$4("p", { className: "dsh-an-clearConfirmText" }, say("popover.clearConfirm", { n: count })), h$4("div", { className: "dsh-an-clearConfirmActions" }, h$4("button", {
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
	const { say, listRef, listHasMore, syncListEdge, showOpen, toggleOpen, openItems, openListRef, openCount, total, row, hideEmptyState, showDone, toggleDone, doneItems, confirmClear, askClearConfirm, dismissClearConfirm, confirmClearDone } = props;
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
		count: doneItems.length,
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
	/** The header switch remembers its choice; a workspace-less session stays session-scoped. */
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
	react.default.useSyncExternalStore(subscribeScope, scopeVersion, scopeVersion);
	const canUseWorkspace = Boolean(workspaceScopeForSession(sessionId));
	const canUseSession = canUseSessionScope(sessionId);
	const effectiveMode = canUseSession ? mode : "workspace";
	const scope = scopeForSession(sessionId, effectiveMode);
	const draftKey = draftKeyForSession(sessionId);
	/** Settled outcomes go to the frame-wide toast host, not to inline marks. */
	const report = typeof props.onToast === "function" ? props.onToast : () => {};
	const { record, syncError, commit } = useMemoStore(scope);
	const storageInUse = storageMode() === "error" && storageFailure()?.code === "STORE_IN_USE";
	const { sectionsRef, showOpen, showDone, toggleOpen, toggleDone, applySections } = useSections();
	const [showSettings, setShowSettings] = react.default.useState(false);
	const update = useUpdateCenter(localeId);
	const newerVersion = update.latestVersion;
	const inserting = react.default.useRef(/* @__PURE__ */ new Set());
	const { draft, isSubmitting, isRecalling, addRef, composingRef, add, recall, onDraftChange, onDraftKeyDown } = useComposerDraft({
		draftKey,
		commit,
		report,
		storageInUse
	});
	const { archive, move, takeBack } = useNoteActions({
		commit,
		report
	});
	const { confirmClear, askClearConfirm, dismissClearConfirm, confirmClearDone } = useClearConfirm({
		sessionId,
		showDone,
		doneCount: record.items.filter((item) => item.done).length,
		onConfirm: () => clearDone()
	});
	const panelRef = react.default.useRef(null);
	const { style, commitPanelWidth, commitPanelHeight, startPanelResize, startPanelHeightResize, onPanelResizeKeyDown, onPanelHeightKeyDown } = usePanelGeometry(props.anchorRef, props.placement, panelRef);
	const items = record.items || [];
	const openItems = items.filter((item) => !item.done);
	const doneItems = items.filter((item) => item.done).sort(compareDoneItems);
	const openCount = openItems.length;
	const total = items.length;
	const { listRef, listHasMore, syncListEdge } = useListEdge({
		items,
		showOpen,
		showDone
	});
	const reorder = useRowReorder({
		ids: openItems.map((item) => item.id),
		scrollRef: listRef,
		onMove: move
	});
	useOutsideDismiss(panelRef, props.anchorRef, props.onClose);
	const chooseScope = (next) => {
		if (next === mode) return;
		if (next === "session" && !canUseSession) return;
		if (next === "workspace" && !canUseWorkspace) return;
		if (next === "workspace") {
			const workspace = scopeForSession(sessionId, "workspace");
			if (workspace.kind === "workspace") ensureWorkspaceRecord(workspace.id, workspace.sessionIds);
		}
		writeScopeMode(next);
		setMode(next);
		dismissClearConfirm();
		notifyTodoChange();
	};
	const clearDone = async () => {
		if (!await commit((currentItems) => currentItems.filter((item) => !item.done))) {
			report("saveFailed");
			return;
		}
		report("cleared");
		applySections({
			open: sectionsRef.current.open,
			done: false
		});
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
		if (!appendToConversation(item.text)) {
			report("insertFailed");
			return;
		}
		inserting.current.add(item.id);
		try {
			report(await archive(item) ? "inserted" : "archiveFailed");
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
		if (!inserting.current.has(item.id)) recall(item, takeBack);
	};
	const row = (item) => h$1(TodoRow, {
		key: item.id,
		item,
		archived: item.done === true,
		say,
		localeId,
		onToast: report,
		onInsert: insertItem,
		onRecall: recallItem,
		grip: item.done ? null : reorder.gripProps(item.id)
	});
	const content = h$1("div", {
		ref: panelRef,
		className: props.placement === "right" ? "dsh-an-popover dsh-an-popoverRight" : "dsh-an-popover",
		style,
		"data-settings": showSettings ? "true" : void 0,
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
		openCount,
		total,
		showSettings,
		onToggleSettings: () => setShowSettings((value) => !value),
		onClose: props.onClose,
		newerVersion,
		scopeMode: effectiveMode,
		canUseWorkspace,
		canUseSession,
		onScopeChange: chooseScope
	}), showSettings ? h$1("div", { className: "dsh-an-settingsViewport" }, h$1(SettingsPanel, {
		say,
		update,
		onToast: report
	})) : null, h$1(ComposerForm, {
		say,
		draft,
		isSubmitting,
		isRecalling,
		storageInUse,
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
			if (composingRef.current) return;
			add();
		}
	}), h$1(NoteList, {
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
		confirmClear,
		askClearConfirm,
		dismissClearConfirm,
		confirmClearDone
	}), h$1("div", {
		className: "dsh-an-popFoot",
		role: "status"
	}, h$1("span", { className: syncError || storageMode() === "error" ? "dsh-an-error" : void 0 }, say(storageMode() === "error" ? storageInUse ? "storage.inUse" : "storage.hostError" : syncError ? "storage.failed" : storageMode() === "host" ? "storage.whereHost" : storageMode() === "probing" ? "storage.loading" : "popover.local"))));
	return react_dom.default.createPortal(content, document.body);
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
/** Hosts without ui-workspace (and the bundle test) keep the session list. */
const useNoWorkspace = () => null;
/** Hosts without a session list cannot tell a new session from an old one. */
const useNoSessions = () => void 0;
/** Compact floating memo list, anchored to the entry that opened it. */
function apply(ctx) {
	const locale = ctx.get("locale");
	ctx.effect(() => {
		const style = document.createElement("style");
		style.dataset.dshPlugin = "dsh-sideby-note";
		style.textContent = panel_css_default;
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
	const closeMemoPopover = () => {
		const current = activePopover;
		activePopover = null;
		if (!current) return;
		const hadFocus = current.container.contains(document.activeElement);
		try {
			current.root.unmount();
		} catch {}
		current.container.remove();
		const anchor = current.anchor;
		if (hadFocus && anchor && anchor.isConnected && typeof anchor.focus === "function") anchor.focus({ preventScroll: true });
		refreshHeaderEntry();
	};
	const openMemoPopover = (sessionId, anchor, placement = "popover") => {
		if (activePopover && activePopover.anchor === anchor) {
			closeMemoPopover();
			return;
		}
		closeMemoPopover();
		const scope = scopeForSession(sessionId, readScopeMode());
		if (storageMode() === "host") requestHostRefresh();
		if (scope.kind === "workspace") ensureWorkspaceRecord(scope.id, scope.sessionIds);
		const workspace = workspaceScopeForSession(sessionId);
		if (workspace) ensureDraftScope(draftKeyForSession(sessionId), sessionId, workspace.sessionIds);
		setForwardTarget(sessionId);
		const container = document.createElement("div");
		container.dataset.dshMemoPopoverRoot = "true";
		document.body.appendChild(container);
		const root = react_dom_client.default.createRoot(container);
		activePopover = {
			container,
			root,
			anchor,
			placement
		};
		root.render(h(MemoPopover, {
			sessionId,
			say: tr,
			locale,
			getLocaleId: localeId,
			anchorRef: { current: anchor },
			placement,
			onClose: closeMemoPopover,
			onToast: (kind) => toastSeat.show(kind)
		}));
		refreshHeaderEntry();
	};
	const headerEntry = createHeaderEntry({
		getSessionId: () => activeSessionId,
		getActiveAnchor: () => activePopover ? activePopover.anchor : null,
		getLocaleId: () => localeId(),
		tr,
		onOpen: (sessionId, anchor) => openMemoPopover(sessionId, anchor, "right")
	});
	refreshHeaderEntry = headerEntry.refresh;
	if (locale && typeof locale.subscribe === "function") ctx.effect(() => locale.subscribe(() => refreshHeaderEntry()), "dsh-sideby-note: locale changes");
	ctx.effect(() => headerEntry.attach(() => closeMemoPopover()), "dsh-sideby-note: right-side entry");
	function BoundSessionCapture(props) {
		const sessionId = props.sessionId || "";
		const useWorkspaces = typeof props.useWorkspaces === "function" ? props.useWorkspaces : useNoWorkspace;
		const useSessions = typeof props.useSessions === "function" ? props.useSessions : useNoSessions;
		const snapshot = useWorkspaces((state) => state);
		const summary = useSessions((state) => state && state.byId ? state.byId[sessionId] : void 0);
		const sessionReady = !(summary && summary.blank === true);
		const workspace = react.default.useMemo(() => {
			return (snapshot && Array.isArray(snapshot.items) ? snapshot.items : []).find((candidate) => candidate && Array.isArray(candidate.sessionIds) && candidate.sessionIds.includes(sessionId)) || null;
		}, [snapshot, sessionId]);
		const workspaceRef = react.default.useRef({
			sessionId: "",
			workspaceId: ""
		});
		react.default.useEffect(() => {
			const workspaceId = workspace ? String(workspace.workspaceId) : "";
			const previous = workspaceRef.current;
			const workspaceChanged = previous.sessionId === sessionId && previous.workspaceId !== workspaceId;
			workspaceRef.current = {
				sessionId,
				workspaceId
			};
			bindWorkspace(sessionId, workspace, sessionReady);
			if (activeSessionId !== sessionId) {
				activeSessionId = sessionId;
				setForwardTarget(sessionId);
				closeMemoPopover();
			} else if (workspaceChanged) closeMemoPopover();
			if (workspace) ensureWorkspaceRecord(workspace.workspaceId, workspace.sessionIds);
			refreshHeaderEntry();
		}, [
			sessionId,
			workspace,
			sessionReady
		]);
		return null;
	}
	ctx.effect(() => {
		const onReady = () => {
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