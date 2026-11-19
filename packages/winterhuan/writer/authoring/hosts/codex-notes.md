---

Codex adaptation notes:
- Codex callers should request this custom agent with `agent_type: "{{WRITER_ROLE}}"` when the current runtime exposes project-local custom agents.
- If Codex reports `unknown agent_type` or the custom-agent registry is unavailable, the parent workflow must fall back to solo/direct execution and report the fallback instead of failing.
- Stay within this agent's role boundary; escalate adjacent work back to the parent agent.
- Use the deployed Codex reference path only: `.codex/skills/story-setup/references/agent-references/`. If it is missing, report the missing deployment instead of probing other CLI directories.
- Do not assume Claude-only tool names or frontmatter fields exist in Codex.
