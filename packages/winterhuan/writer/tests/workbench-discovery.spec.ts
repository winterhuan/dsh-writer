import { expect, it } from 'vitest'
import { discoverWriterBooks } from '../src/workbench-discovery.ts'

it('finds existing long and short manuscripts while skipping research folders', async () => {
  const tree: Record<string, { name: string; type: 'file' | 'directory' | 'other' }[]> = {
    '': [
      { name: '劫轨', type: 'directory' },
      { name: '短篇', type: 'directory' },
      { name: '拆文库', type: 'directory' },
      { name: '扫榜', type: 'directory' },
    ],
    '劫轨': [{ name: '设定', type: 'directory' }, { name: '正文', type: 'directory' }],
    '短篇': [{ name: '正文.md', type: 'file' }, { name: '设定.md', type: 'file' }],
    '拆文库': [{ name: '样本', type: 'directory' }],
    '拆文库/样本': [{ name: '设定', type: 'directory' }],
    '扫榜': [{ name: '20261115', type: 'directory' }],
    '扫榜/20261115': [{ name: '正文', type: 'directory' }],
  }
  const candidates = await discoverWriterBooks(async path => tree[path] ?? [])
  expect(candidates).toEqual([
    { path: '劫轨', title: '劫轨', form: 'long' },
    { path: '短篇', title: '短篇', form: 'short' },
  ])
})

it('does not traverse symlink-like entries or unrecognized directories', async () => {
  const visited: string[] = []
  const candidates = await discoverWriterBooks(async path => {
    visited.push(path)
    if (path === '') return [{ name: 'external', type: 'other' }, { name: 'misc', type: 'directory' }]
    if (path === 'misc') return [{ name: 'notes.md', type: 'file' }]
    return []
  })
  expect(candidates).toEqual([])
  expect(visited).toEqual(['', 'misc'])
})
