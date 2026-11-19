import { readFile } from 'node:fs/promises'
import { expect, it } from 'vitest'

const root = new URL('../skills/story-setup/', import.meta.url)

it('routes DSH setup to its own diagnostics and deployment without other-host preflights', async () => {
  const skill = await readFile(new URL('SKILL.md', root), 'utf8')
  expect(skill).toContain('DeepSeek Harness（DSH）')
  expect(skill).toContain('DSH 不部署 Claude Code 的 `.claude/hooks` 或 Codex 的 `.codex/hooks.json`')
  expect(skill).toContain('references/diagnostics-dsh.md')
  expect(skill).toContain('references/deploy-dsh.md')
  expect(skill).toContain('references/deploy-other-hosts.md')
  expect(skill).not.toContain('agents_version: 39')
  expect(skill).not.toContain('scripts/merge-claude-settings.py')
  const deploy = await readFile(new URL('references/deploy-dsh.md', root), 'utf8')
  expect(deploy).toContain('`.claude/hooks/`')
  expect(deploy).toContain('`.codex/hooks.json`')
  expect(deploy).toContain('target_cli: dsh')
  const claudeDeploy = await readFile(new URL('references/deploy-claude-code.md', root), 'utf8')
  const codexDeploy = await readFile(new URL('references/deploy-codex.md', root), 'utf8')
  expect(claudeDeploy).toContain('`.claude/hooks/`')
  expect(codexDeploy).toContain('`.codex/hooks.json`')
  const otherHosts = await readFile(new URL('references/deploy-other-hosts.md', root), 'utf8')
  expect(otherHosts).toContain('scripts/copy-path-safety.py')
  expect(otherHosts).toContain('小于 `39`')
  expect(otherHosts).toContain('大于 `39`')
  expect(otherHosts).not.toContain('大于 `38`')
  expect(otherHosts).toContain('<!-- oh-story:{宿主} 开始')
})
