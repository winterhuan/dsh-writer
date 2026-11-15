import { expect, it } from 'vitest'
import { preferredWriterWorkspace, writerSessionsInWorkspace } from '../src/client/workbench-selection.ts'

it('prefers the native novels workspace by path, then by title', () => {
  expect(preferredWriterWorkspace([
    { id: 'other', path: '/workspace/other', title: 'Other' },
    { id: 'novels', path: '/Users/winter/workspace/novels', title: '作品' },
  ])).toBe('novels')
  expect(preferredWriterWorkspace([{ id: 'novels-title', path: '/workspace/writing', title: '我的小说' }])).toBe('novels-title')
  expect(preferredWriterWorkspace([{ id: 'other', path: '/workspace/other', title: 'Other' }])).toBeUndefined()
})

it('offers only Writer sessions that are members of the selected native workspace', () => {
  const workspace = { id: 'novels', path: '/workspace/novels', title: 'novels' }
  const sessions = [
    { id: 'member', cwd: workspace.path, origin: 'user', projectionValues: { agentPreset: 'writer' } },
    { id: 'unlinked', cwd: workspace.path, origin: 'user', projectionValues: { agentPreset: 'writer' } },
    { id: 'other-preset', cwd: workspace.path, origin: 'user', projectionValues: { agentPreset: 'standard' } },
    { id: 'child', cwd: workspace.path, origin: 'subagent', projectionValues: { agentPreset: 'writer' } },
    { id: 'wrong-cwd', cwd: '/workspace/other', origin: 'user', projectionValues: { agentPreset: 'writer' } },
  ]
  expect(writerSessionsInWorkspace(sessions, workspace, ['member'])).toEqual([sessions[0]])
  expect(writerSessionsInWorkspace(sessions, undefined, ['member'])).toEqual([])
})
