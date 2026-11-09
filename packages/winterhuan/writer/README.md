---
description: "Add a writing preset that mounts oh-story skills and a sidebar for libraries, writing projects, and market scans."
kind: "package-bundle"
---

# @winterhuan/dsh-writer

English | [中文](README.zh.md)

## Summary

This bundle adds a writing preset, oh-story skills, and a workspace sidebar to DSH. Authors can edit manuscripts with browser draft recovery, inspect chapter progress and versioned reviews, and compare revisions. Skills use the package directory by default; project copies take precedence. Sync and unsync preserve replaced copies in recoverable backups. DSH supplies sessions, filesystem access, and subagents; book files remain the source of truth.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Install the prebuilt release through the [plugin market](https://winterhuan.github.io/dsh-creative/index.json), or use this pinned Git source with DSH `0.2.2-rc.1`:

```sh
dsh plugin --profile market add 'git+https://github.com/winterhuan/dsh-writer.git#v0.1.10&path:/packages/winterhuan/writer'
```

Replace `market` with the name of your existing DSH profile.

### Install into a profile

Build this repository, then add the local bundle to a DSH `0.2.2-rc.1` profile. Replace `web` with the profile name.

```sh
pnpm --filter @winterhuan/dsh-writer build
dsh plugin --profile web add packages/winterhuan/writer
```

Restart the profile after install or rebuild. The patch adds the `writer` host row and the `preset-writer` row. The preset id is `writer` and the menu name is 写作模式.

### Choose how skills are mounted

`skillMount` is `workspace` or `bundled`. The default is `bundled`. Only one mode is active.

In `bundled` mode the host does not auto-copy skills. The preset's skill-filesystem row sets `bundledSkillDir` to the absolute `skills` directory of this package, resolved with `createRequire(baseUrl).resolve('@winterhuan/dsh-writer/package.json')`. That root is trusted by skill-filesystem. The workspace row of skill-filesystem is disabled, so the two rows do not load together.

In `workspace` mode the host does not set `bundledSkillDir`. The first time a session enters 写作模式, the host copies each packaged skill directory to `<project>/.agents/skills/<name>/`, where the project is the nearest ancestor containing `.git`, or the session directory when there is none. A directory that already exists is left unchanged. Skill discovery uses the normal project root `.agents/skills`.

Both modes support `/writer-skills-status`, which shows package and oh-story versions, effective skill paths, and differences from bundled resources. `/writer-sync-skills` stages packaged skills before moving existing `.agents/skills` copies into `.agents/writer-skill-backups/<batch>` and replacing them. `/writer-unsync-skills` moves only packaged skill names into a backup; other skills stay. `/writer-restore-skills <batch>` restores a backup and preserves displaced current copies in another batch. Commands report backup paths; symlink destinations and self-copy are rejected. `.dsh/skills` overrides are diagnosed but never changed. Restart after changing `skillMount`.

```yaml
- id: writer
  name: '@winterhuan/dsh-writer'
  config:
    skillMount: workspace
```

`makersApiKeyEnv` names the environment variable for an explicit Zhuque check. The default is `MAKERS_API_KEY`. `gptImageApiKeyEnv` names the variable for cover image generation. The default is `GPT_IMAGE_API_KEY`. The host stores the names only and mirrors them to `WRITER_ZHUQUE_KEY_ENV` / `WRITER_COVER_KEY_ENV`. The Plugins page shows a Writing entry while this Host row is installed: bind secrets through DSH credentials (never into the settings document). `story-zhuque` and `story-cover` (API path) read those variables and do not run unless the author asks. The settings page also stores the cover API's `gptImageBaseUrl` (plain settings field; the host injects it as `GPT_IMAGE_BASE_URL`, where a configured value wins over a shell export and blank defers to the shell or the default). The image model needs no setting: the skill falls back from `GPT_IMAGE_MODEL` to `gpt-image-2`.

### Scan, analyze, and cover skills

These packaged skills are author-triggered. They do not block chapter writing.

| Skill | Triggers | Notes |
|:------|:---------|:------|
| `story-long-scan` | `/story-long-scan` | Long-form ranking scan. Live boards use Box by default; select Ego with `--browser ego` (`browser-cdp`). |
| `story-short-scan` | `/story-short-scan` | Short-form ranking scan. Same browser note. |
| `story-long-analyze` | `/story-long-analyze` | Long-form teardown. Needs Python 3 for scripts. |
| `story-short-analyze` | `/story-short-analyze` | Short-form teardown. Needs Python 3. |
| `story-cover` | `/story-cover` | Prompt-only needs no key. Generating an image on DSH uses the GPT Image credential above. Codex hosts may still use `$imagegen`. |
| `browser-cdp` | `/browser-cdp` | Browser entry: Box by default, optional Ego, login/CAPTCHA handoff and collector recovery. |

### Use the sidebar

Open the writing sidebar in a `writer` session. Libraries, projects, and dated market scans have separate tabs, lazy directory trees, and filename search. The editor supports `.md`, `.txt`, `.json`, `.yaml`, `.yml`, and `.toml`, Markdown preview, line numbers, original line endings, and a comparison with the loaded version. Cmd/Ctrl+S saves; Cmd/Ctrl+K focuses filename search when the chat composer is not focused.

Unsaved text and its disk baseline are stored in this browser under the workspace and file path. Hiding the sidebar preserves the editor; reopening the page restores the last document and its draft. Failed reads or saves retain the draft. Storage failures stay visible, and leaving the page with unsaved changes triggers the browser warning. Concurrent recovery-copy changes are reported rather than overwritten. Recovery is local to this browser origin and may be unavailable when storage is disabled or full; it is not a manuscript backup.

Saving requires the version returned by the last read. Late reads and save replies cannot update another document or session. If the disk changed, the editor preserves the local draft and pauses saving until the author reloads the disk version. Switching files asks before discarding unsaved edits. The market-scan tab opens each dated record's conclusion, aggregate, or readable ranking report.

### Chapter progress and reviews

Expand “Chapter progress and reviews” in the Projects view. Select a book and chapter, or open a chapter manuscript to inspect it. Without a selected manuscript, the panel uses `.active-book` or the only discovered book and defaults to the next uncommitted chapter. Refresh reads current files without discarding the editor draft.

Progress comes from `追踪/_tracking-state.json`: the last committed chapter and next-chapter commitments. `storyctl.py chapter check` records mechanical results in `.story/checks/第NNN章.json`; manuscript or outline fingerprint changes invalidate them. Missing or unreadable records do not imply a pass. Incomplete files under `.story/work/第NNN章/` can be opened before asking the assistant to continue that chapter.

`story-review` records cited findings in `.story/reviews/第NNN章.json` (short stories use `正文.json`). Each record includes the reviewed manuscript fingerprint and text, severity, line, quotation, explanation, and suggestion. The sidebar distinguishes mechanical checks from content review and compares current text with the reviewed version. Changing the manuscript, including an unsaved draft, marks the review stale and stops presenting earlier accepted or resolved findings as current.

Ask the assistant to accept a finding or recheck a revision. The review recorder requires the current fingerprint and a reason for each decision; stale records must be reviewed again. Semantic findings do not add a mandatory chapter-commit gate. Recording a review is limited to 1 MiB of manuscript and 100 findings; larger requests must be split or reported without claiming a versioned record.

### DSH writing roles

`story-setup` detects DSH and skips other hosts' hooks; check mode diagnoses effective skill sources. The model supplies a role, task, and book directory to `writer_agent`. The plugin loads the role from the session's effective `story-setup` and delegates through native `subagent`; project skill copies retain precedence. Each call creates a new instance and returns its native child session ID. The main agent manages this ID for the task. Follow-ups within the same task use `send_message`; independent tasks and reviews requiring fresh context create new instances. Discovery and interruption use `list_agents` and `interrupt_agent`. Roles share the Writer Preset and inherit native child model defaults; explicit model selection remains subject to DSH policy. Missing roles, tools, or failed starts are reported for the main session to handle under the skill workflow. Read-only role instructions constrain the prompt without creating a separate sandbox or loading another host's model, tool, or hook configuration.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The patch in [cordis.patch.yml](cordis.patch.yml) inserts the host and the preset. The preset carries persona, instructions, time, shell, filesystem, search, jobs, skills, compaction, delegation, ask-user, todo, and web. It does not load an `agent` entry or a skill provider. [src/index.ts](src/index.ts) mounts skills, registers `/writer-sync-skills` and `/writer-unsync-skills`, and mounts `PUT /writer/file`. [src/client/sidebar.tsx](src/client/sidebar.tsx) registers the sidebar tab and its body slot, and shows them only when the session preset is `writer`.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [Writing subsystem](https://github.com/winterhuan/dsh-creative/blob/upstream-conventions/docs/subsystems/writer.md)
- [Right sidebar](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.1/docs/subsystems/sidebar-right.zh.md)
- [Skill filesystem](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.1/packages/skill/skill-filesystem/README.zh.md)

-----

<a id="model-experience"></a>
## Model Experience

### Writing preset

#### What the model sees

A session on preset `writer` receives the preset persona and the oh-story skill catalog, including `story`, `story-long-write`, `story-short-write`, `story-deslop`, `story-zhuque`, scan/analyze/cover skills, and `browser-cdp`. The persona tells the model to load the matching skill, to skip Claude Code and Codex hooks during `story-setup` on DSH, and not to start the oh-story dashboard. `story-zhuque` is for an explicit Zhuque request. The sidebar save is not a model tool. DSH task skills load the native-role dispatch reference on demand. The `writer_agent` parameters list seven roles and their responsibilities. The plugin sends role instructions and the task directly to the child; the main session receives only the role name and child session ID. Review instructions require a manuscript fingerprint before analysis and a validated record afterward. Skill diagnostics and recovery commands return effective paths and backup locations. These operations add context only when invoked.

#### Token effect

The persona prefix and role tool schema are sent on every turn of a writing session; role bodies enter only the delegated child conversation. Loading a skill adds that skill's instructions for that turn. Sessions on another preset do not receive this persona or the forced skill copy.

#### KV Cache effect

The persona is stable for the life of the preset revision. With the default `bundled` mount the skill catalog comes from the package and stays stable across sessions. In `workspace` mode, copying skills into `.agents/skills` can change the skill catalog on a later turn after the first entry into 写作模式. A forced `/writer-sync-skills` (or `/writer-unsync-skills`) can change what project discovery sees the same way. Switching `skillMount` applies only after restart, so it does not rewrite an in-flight prompt.

## Known Limitations and Deferred Work
<a id="known-limitations-and-deferred-work"></a>

- File deletion and automatic manuscript merging are not provided. Browser drafts are not shared across devices or origins. Reports refresh when opened, after an editor save, or on explicit refresh; external file edits require refresh. Mechanical checks and version fingerprints do not certify literary quality or reviewer independence. Workspace copies still override bundled skills until updated or removed. Zhuque and cover generation remain explicit author requests with their own configured credentials.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

Packaged skills come from the latest `zenstory-ai/oh-story-claudecode` tree at vendoring time, plus `story-zhuque` in this package. The oh-story license is `skills/LICENSE.oh-story`.

</details>
