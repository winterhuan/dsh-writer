/** Workspace short name and scan health helpers. */
import { expect, it } from 'vitest'
import { workspaceShortName, writerScanHealth } from '../src/client/workspace-status.ts'

it('takes the last path segment for the masthead name', () => {
  expect(workspaceShortName('/Users/winter/stories')).toBe('stories')
  expect(workspaceShortName('/Users/winter/stories/')).toBe('stories')
  expect(workspaceShortName('C:\\Books\\novel')).toBe('novel')
  expect(workspaceShortName('/')).toBe('/')
  expect(workspaceShortName('.')).toBe('.')
})

it('derives loading, ok, partial, and failed health', () => {
  expect(writerScanHealth({
    scanning: true,
    hardFailed: false,
    scanErrors: [],
  })).toBe('loading')
  expect(writerScanHealth({
    scanning: false,
    hardFailed: false,
    scanErrors: [],
  })).toBe('ok')
  expect(writerScanHealth({
    scanning: false,
    hardFailed: false,
    scanErrors: ['soft'],
  })).toBe('partial')
  expect(writerScanHealth({
    scanning: false,
    hardFailed: true,
    scanErrors: [],
  })).toBe('failed')
  expect(writerScanHealth({
    scanning: false,
    hardFailed: false,
    scanErrors: ['unreadable:external'],
  })).toBe('partial')
})

it('keeps scan-only workspaces usable when another directory fails', () => {
  expect(writerScanHealth({
    scanning: false,
    hardFailed: false,
    scanErrors: ['unreadable:other'],
  })).toBe('partial')
})
