# Sideby Note · 边记部

Asynchronously draft your ideas while the agent is working

[中文](README.md) | English

> **Personal fork notice:** This is a personal adaptation by [LighghtEeloo (光吟)](https://github.com/LighghtEeloo) of [dsh-aside-note](https://github.com/Rayle8/dsh-aside-note) (旁边记 / AsideNote), the original project by [Rayle8 (阿三石)](https://github.com/Rayle8); most of the text below is preserved from the original README. Main differences from the original:
>
> - Display name and copy are **Sideby Note** (边记部); the package name, plugin id and update channel are the fork's `dsh-sideby-note`, installed with `npx dsh-sideby-note install`.
> - **Anonymous feature statistics removed:** the Tencent Cloud RUM SDK, reporting code, Settings › Privacy switch and related local storage keys are gone, so no usage events are sent.
> - Local storage keys keep the upstream `dsh.aside-note.*` names, so existing notes and settings carry over after the rename.
> - The README screenshots come from this fork, not upstream.

Jot it down · Open as needed · Tuck it away

Sideby Note is a lightweight session notes plugin for DeepSeek Harness (DSH). Keep passing thoughts and follow-ups beside the conversation, bring them back to the chat input when needed, then tuck the panel away and carry on.

## Preview and entry

![Sideby Note right-side panel](./docs/assets/preview-right.png)

The same panel in the dark theme; every colour comes from DSH theme tokens:

![Sideby Note right-side panel, dark](./docs/assets/preview-right-dark.png)

A **Sideby Note** button at the top right of the conversation, with the open count:

<img src="./docs/assets/preview-badge.png" width="460" alt="Sideby Note button at the top right">

The same button in the dark theme:

<img src="./docs/assets/preview-badge-dark.png" width="460" alt="Sideby Note button at the top right, dark">

Clicking the entry opens a fixed panel on the right. A blank new session has no conversation header yet, so the button sits in the top-right corner beside the right-sidebar control and shows the workspace list only until the first message.

## Quick install

Sideby Note installs into a DSH profile as the npm package `dsh-sideby-note`. Pick one: hand the prompt to an agent, or run a single command.

### Install with an agent

Give your agent this block:

```text
Install the DSH plugin Sideby Note by running: npx -y dsh-sideby-note install
No DSH restart is needed afterwards: the 边记部 entry is at the top right of the conversation.
If it is missing, tell me to refresh the Plugins page and switch the plugin off and on once.
If it says DSH or a profile cannot be found, tell me to install and start the DeepSeek Harness
client first and retry; do not clone the repo, hand-assemble dependencies, or restart DSH.
```

### Install from the command line

```bash
npx dsh-sideby-note install
```

The installer pulls this package from npm, finds the DSH profile (it honours `DSH_PROFILE_DIR`, otherwise `~/.dsh/profiles/desktop`), backs up `package.json` and `pnpm-lock.yaml` into `.local-backup/`, adds the dependency, appends `dsh-sideby-note` to `dsh.profile.bundles`, runs `pnpm install` **through the node and pnpm DeepSeek Harness ships** (falling back to the pnpm on PATH, and `DSH_RUNTIME_DIR` pins a runtime) and finally verifies the installed `client/client.js`. The host's own toolchain keeps the profile's pnpm store in step with the host — a profile written by another pnpm major answers `ERR_PNPM_UNEXPECTED_STORE` on the host's next install.

```bash
npx dsh-sideby-note install --profile work    # pick a profile
npx dsh-sideby-note install --dry-run         # print the plan, write nothing
npx dsh-sideby-note install --version 0.1.0   # pin the version instead of ^0.1.0
```

It is safe to re-run. No restart is needed: DSH re-composes the profile within about a second, and the 边记部 entry appears at the top right of the conversation. If it does not, refresh the sidebar **Plugins** page and toggle the plugin off and on once — the running host recomposes and the entry appears.

To uninstall, drop `dsh-sideby-note` from `dsh.profile.bundles`, run `pnpm remove dsh-sideby-note` in the profile directory, and no restart is needed: the entry disappears right away, and if the **Plugins** page still lists it, refresh that page.

## Why Sideby Note

Working with AI often brings up things you want to revisit: a detail to change later, a result to double-check, or an idea to explore next.

Sending them straight into the conversation can interrupt the task at hand. Writing them somewhere else means finding them again later. Sideby Note keeps them beside the conversation so you can jot them down and carry on.

A few small tasks should not need a whole management system. Capture a thought, look back when you need it, and let it go when you are done. Open the panel on your terms and tuck it away afterward, with little interruption to the work at hand.

## From a quick note to the next step

### Capture it and keep going

Click the **Sideby Note** button at the top right of the conversation to open the right-side panel. Record tasks, ideas, and details to revisit. The button shows the open count; drag a note by the grip on its left to change the order.

### Keep it in the workspace and pick it up later

Sessions in one workspace share a single list by default: whichever session you open, you see the same tasks. The panel header also switches between **Workspace** and **Session** — workspace covers the whole workspace, session covers only the current conversation. Sessions outside a workspace have no workspace scope and always stay per-session. On first open, notes already recorded in member sessions are folded into the workspace list once, so nothing is lost.

### Bring it back when you are ready

Click a note's **Hand to chat** button to append its text to the current chat input; the note is archived in the same step. Add to or edit it, then send when you are ready. Several notes stack on new lines after whatever is already in the composer. Handing a note over never sends the message automatically.

### Small details for everyday use

- **Saved drafts**: close the panel and pick up where you left off when you reopen it; conversations in one workspace share the same draft, so switching conversations does not mean retyping.
- **Archive to look back on**: separate open and archived sections, with creation and archive times.
- **Adjustable panel**: resize the width and height, with your preferences remembered.
- **Fits into DSH**: follows the light/dark theme and all eight DSH-official languages (Chinese, English, Japanese, Spanish, French, German, Russian and Brazilian Portuguese).
- **Host-file persistence**: notes live in `~/.dsh/storages/aside_note.json`, so page refreshes, DSH restarts and a different browser all keep them; tabs in the same browser stay in sync in real time, while other browsers on the same host refresh when they open the panel. Settings › Data storage shows the full path, with buttons to copy it or reveal the file in your file manager.

> With host storage, browsers connected to the same DSH host share notes. See [Where data lives](#where-data-lives) for the upgrade and fallback behavior.

[Quick install](#quick-install) · [Feedback and issues](https://github.com/LighghtEeloo/dsh-sideby-note/issues)

## Features

- **Workspace-level notes**: one list is shared by every session in a workspace by default, so switching conversations keeps it in view; the panel header switches between **Workspace** and **Session**, and sessions outside a workspace only have the session scope. Browsers and tabs on the same host share one list, with live sync across tabs in one browser.
- **Entry and panel**: an icon button at the top right badges the open count; a blank new session shows it in the corner with the workspace list only until the first message, without the session option; clicking it opens a fixed panel aligned to the entry, which shifts left of the DSH right sidebar and closes when you switch sessions.
- **Note actions**: add, reorder, copy, hand a note to chat, and rewind one into the composer to edit; there is no manual checkbox — handing it to chat archives it. Clearing archived notes asks for confirmation, and archived notes expand for review. Clearing the composer after rewinding a note removes it.
- **Hand to chat**: each note is appended to the **currently open conversation's** composer as plain text — nothing is sent automatically. When the composer already has content, the note lands on a new line after it, so handing over several notes stacks them there. On success the note moves to **Archived**; when no composer is on screen nothing changes and the note stays open.
- **Drag to reorder**: open notes move by the grip on their left; with the grip focused, ↑ / ↓ move a note one slot, and Esc cancels a drag in flight. Archived notes stay in archive order.
- **Remembered state**: add drafts are saved per workspace (per session outside a workspace), so switching conversations or the Workspace/Session switch never loses them; submitting still writes the list selected at that moment. Drafts are restored when the panel reopens, and the open/archived expand state plus the scope choice are remembered too.
- **Panel size**: drag the left edge for width and the bottom handle for height, double-click either to reset; both persist in the browser.
- **List regions**: **Open** and **Archived** each keep a sticky header and its own scroll, and expanding the archive never compresses open; at rest a note shows only its text and age, and on hover the age gives way to Rewind / Copy / Hand to chat; archived notes list newest archive first.
- **Settings**: Data storage (file path, copy and reveal) and About (version, check, author, improver and source).
- **Update notice**: a newer release puts a dot on the settings button, and Settings › About shows the notes and the update action; see [Update notice](#update-notice).
- **Native look**: colours, radii, elevation and scrollbars all reuse DSH design tokens, following light/dark and the DSH locale; see [Design tokens](#design-tokens).

## Feature screenshots

Five states shot from the same demo session and the same set of notes, in both themes:

<table>
  <tr>
    <th width="130">Feature</th>
    <th>Light</th>
    <th>Dark</th>
  </tr>
  <tr>
    <td>Panel overview<br>open / archived sections</td>
    <td><img src="./docs/assets/features/panel.png" width="300" alt="Panel overview"></td>
    <td><img src="./docs/assets/features/panel-dark.png" width="300" alt="Panel overview, dark"></td>
  </tr>
  <tr>
    <td>Settings<br>about</td>
    <td><img src="./docs/assets/features/settings.png" width="300" alt="Settings"></td>
    <td><img src="./docs/assets/features/settings-dark.png" width="300" alt="Settings, dark"></td>
  </tr>
  <tr>
    <td>Row actions<br>grip plus rewind / copy / hand to chat on hover</td>
    <td><img src="./docs/assets/features/actions.png" width="300" alt="Row actions"></td>
    <td><img src="./docs/assets/features/actions-dark.png" width="300" alt="Row actions, dark"></td>
  </tr>
  <tr>
    <td>Clear archived<br>a second confirmation guards clearing</td>
    <td><img src="./docs/assets/features/clear.png" width="300" alt="Clear archived confirmation"></td>
    <td><img src="./docs/assets/features/clear-dark.png" width="300" alt="Clear archived confirmation, dark"></td>
  </tr>
  <tr>
    <td>Empty state<br>guidance when a session has no notes</td>
    <td><img src="./docs/assets/features/empty.png" width="300" alt="Empty state"></td>
    <td><img src="./docs/assets/features/empty-dark.png" width="300" alt="Empty state, dark"></td>
  </tr>
</table>

## Design tokens

The panel and the entry button read from one token block in `src/client/styles/panel.css`:

| Axis | Token | Values |
| --- | --- | --- |
| Colour | `--dsw-alias-*` | DSH semantic aliases only (ink, hover, border, state, settings card); no local ramp |
| Type | `--an-fs-caption/row/title` | 12 / 13 / 14, all on a 20px line height |
| Weight | 400 / 500 | 500 is the cap; hierarchy comes from size and ink |
| Spacing | `--an-space-1 … -6` | 4 / 8 / 12 / 16 / 24 / 32 |
| Radius | `--dsw-radius-sm/md/lg/panel` + 999 | 8 (compact controls) / 16 (groups and fields) / 28 (floating panel) / pills paired with `corner-shape:round` |
| Shadow | `--dsw-elevation-panel` | the panel is `border:0`; the 0.5px hairline is the shadow's first layer |
| Material | `--dsh-an-panelSurface` (`--dsw-alias-bg-layer-2`) | opaque panel surface shared with the pinned header |
| Motion | `--ds-transition-duration*`, `--ds-ease-in-out` | 100 / 200ms, opacity and transform only |
| Scrollbar | shared theme skin | the panel rebinds `--dsh-scrollbar-*` to l2 and gives the list a 9px rail with a 2px inset |

Feedback reuses product surfaces too: copy, hand to chat, rewind, clear-archived, and failed writes all report through a `shell.overlay` toast that outlives the panel, and icon buttons use the `ui-primitives` `Tooltip`.

## Usage

1. Click the **Sideby Note** button at the top right of the conversation to open the right-side panel. Its badge shows the open count when there are open notes; the **Workspace / Session** switch in the panel header moves between the whole workspace and the current conversation.
2. Write one concrete follow-up in the panel and press Enter to add it (Shift+Enter for a new line, matching the main composer), or click **Add**.
3. To change a note, click its **Rewind** button (↺): the text goes back into the top composer, ready to edit and submit again. Clearing that composer removes the note.
4. To change the order, drag a note by the grip on its left (or focus the grip and press ↑ / ↓).
5. When you are ready to continue, click the note's **Hand to chat** button: the text is appended to the chat input and the note is archived; review and send it yourself. Expand **Archived** to look back.
6. Click outside the panel or press Esc to close.

## Where data lives

Notes live in `$DSH_HOME/storages/aside_note.json` when host storage is available. The default path is `~/.dsh/storages/aside_note.json`. DSH writes session and workspace lists to two tables in this file. Settings › Data storage shows the actual path.

- The first start checks the host. If its store is empty, Sideby Note imports notes from `dsh.aside-note` and `dsh.aside-note.workspaces` and keeps the browser originals for recovery. If the host already contains notes, those lists take precedence and the browser originals remain available for recovery.
- If the host is unavailable before the switch, Sideby Note uses browser storage and retries on the next start. Once switched, an unavailable or damaged host file shows an error and disables writes until it is available again.
- Browsers connected to the same DSH host share host-stored notes. Back up the DSH home or copy the file to move notes to another machine. Uninstalling the plugin leaves the file on the host.
- Panel size, open/archived expansion and unsaved drafts stay in the browser. Sessions in one workspace share a draft, and submission saves the note to the scope currently selected. Sessions outside a workspace have their own drafts.

Sideby Note uses the same host file and format as AsideNote 1.2.0. It reads existing host notes and can import from the earlier `dsh.aside-note.*` browser keys. DSH lets one plugin open the store at a time. Disable the plugin currently using the store before switching. Sideby Note pauses writes and shows a message when the store is occupied.

## Update notice

When the panel opens, the plugin quietly checks the latest published version (npm, falling back to npmmirror and then the latest GitHub Release) and caches the answer for an hour. When a newer version exists, the settings button gains a dot and Settings › About shows the update card:

- **Check for updates** re-reads the registry immediately, bypassing that hourly cache, and reports “checking”, “up to date” or a failure underneath.
- **Notes show by default:** an available update immediately lists the release notes from the GitHub Release body — no disclosure to open. The notes are the block between its `app-update-notes:en` / `app-update-notes:zh` markers, flattened to plain text — no HTML is executed or injected.
- **Across several versions:** when the published release is several versions ahead, the notes list every release in the gap, newest first. The newest stays open and each older version expands on its own. Drafts and prereleases are skipped, at most six releases are listed, and a link points at the releases page when more were left out.
- **Full release notes** sits to the right of the update button and opens the matching GitHub Release page in a new tab.
- **Update now** installs over the running copy through the host's own update route, without going through the plugin market, and offers a page refresh when it finishes.
- **Manual fallback:** when the host has no update route, or refuses to replace the in-use plugin files, the card states the command with the offered version and profile directory, plus **Copy update prompt** — one click to copy a ready-to-paste instruction for an agent. Prereleases also pin the npmjs registry so the command cannot fall back to the stable line.

Updating is always an explicit click: the panel only checks, explains and starts the host update — it never runs a command itself, and your notes are never touched. The check only reads public version numbers and release bodies.

Release notes are composed by `tools/release/notes.mjs` from `CHANGELOG.md` — English and Chinese blocks with `app-update-notes` markers, install links and a Full Changelog link — and the tag-triggered workflow creates the Release (with the tarball attached) from it. See [release and versioning](./docs/release.md).

## Development

The browser half lives in `src/client/` and tsdown bundles it into a single `client/client.js`:

```bash
npm install
npm run check         # lint + typecheck + tests + build + catalog check
npm run build         # regenerate client/client.js only
npm run catalog:check # validate the test catalog against the tests
npm run test:run      # per-case run record + report.html/md (.test/runs/)
npm run test:mutate   # mutation check: do the cases catch real defects?
```

To run the checkout inside DSH, link it into a profile (replace `<path-to-repo>`) and run `pnpm install` in the profile directory:

```json
{
  "dependencies": {
    "dsh-sideby-note": "link:<path-to-repo>"
  },
  "dsh": {
    "profile": {
      "bundles": ["dsh-sideby-note"]
    }
  }
}
```

After adding the bundle row, toggle it off/on in the sidebar **Plugins** page to recompose a running Host without a restart.

The entry is `src/client/index.ts`, which exports `apply(ctx)`; tsdown wraps it in DSH's loader shell:

```js
window.__ModuleLoader__.load({ id: 'dsh-sideby-note', factory: (require) => { … } })
```

The artifact is committed: CI rebuilds it and fails when `client/` does not match, so do not edit `client/client.js` by hand.

`index.js` registers the update and note storage routes; `cordis.patch.yml` inserts the package into the profile composition. The UI depends on two services, `slots` and `locale`:

- `conversation.composer.dock`: used only to capture the active session ID; it renders no visible entry.
- The top-right entry is injected into the host header with a MutationObserver, because the host's re-render reclaims a React portal there.

The panel mounts as its own `react-dom/client` root on `document.body` and follows the trigger with fixed positioning. All styles use DSH's `--dsw-alias-*` theme variables, so light and dark themes work.

Run `npm run build` after source changes; the dev client HMR swaps the new bundle, otherwise refresh or restart DSH.

The screenshot and preview pipeline lives in the [screenshot SOP](./docs/screenshot-sop.md): one command re-shoots both themes from an isolated profile, and credentials are not copied unless `COPY_CREDENTIALS=1`.

Code structure, data model and build conventions: [architecture](./docs/architecture.md); the test system (rules, cases, run records, gates): [testing](./docs/testing.md).

Branching, versioning and the release checklist: [release and versioning](./docs/release.md) (Chinese).

## Verification

The panel workflow is covered by integration tests:

- the **Sideby Note** button appears at the top right, with the open count on its badge;
- clicking it opens the panel on the right, aligned with the entry;
- adding updates both the badge and the panel count;
- copy, rewind into the composer, and clear-archived work in the panel; handing a note to chat and drag / arrow-key reordering are driven by the jsdom integration tests;
- records survive a refresh, and the panel header switches between the workspace list and the current session's list;
- the npmjs → npmmirror → GitHub Release fallback, the one-hour cache, and the version comparison are covered by the contract tests, and the jsdom test drives the visible update notice; the live notice needs a published npm package or a GitHub Release.

Run `npm run check` for lint, type checking, the build, automated tests and catalog validation. See [the test catalog](./tests/catalog/README.md).
