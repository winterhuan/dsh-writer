import { createHash } from 'node:crypto'
import type { ClientRemote } from '@deepseek-ai/dsh-api-gateway/client'
import { SessionId } from '@deepseek-ai/dsh-session'
import { expect, it } from 'vitest'
import { readWorkspaceText } from '../src/client/read.ts'
import { manuscriptDigest } from '../src/client/book-status.ts'

function remote(data: Uint8Array): ClientRemote {
  return { workspaceFiles: { readBytes: async () => ({ ok: true, value: { data, version: 'v1' } }) } } as ClientRemote
}

it('preserves the UTF-8 BOM and CRLF bytes used by script fingerprints and later saves', async () => {
  const bytes = new TextEncoder().encode('\uFEFF# 雨夜\r\n她打开门。\r\n')
  const result = await readWorkspaceText(remote(bytes), SessionId('read'), '正文.md', new AbortController().signal)
  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error('read failed')
  expect(await manuscriptDigest(result.value.text)).toBe(createHash('sha256').update(bytes).digest('hex'))
})

it('refuses invalid UTF-8 instead of allowing a replacement-character save', async () => {
  await expect(readWorkspaceText(remote(new Uint8Array([0xff, 0xfe])), SessionId('invalid'), '正文.md', new AbortController().signal)).rejects.toThrow()
})
