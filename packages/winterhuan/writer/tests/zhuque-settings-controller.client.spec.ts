/** The Writer Zhuque settings controller writes the key through credentials, not the settings section. */

import { describe, expect, it, onTestFinished, vi } from 'vitest'
import type { SettingsPathOpView } from '@deepseek-ai/dsh-api-remotes/client'
import { stubConfigForm, type StubConfigForm } from '@deepseek-ai/dsh-client-test-runtime'
import { WRITER_SETTINGS_NS, WriterZhuqueCardController, type WriterZhuqueSettings } from '../src/client/zhuque-settings-controller.ts'

/** Make the stub behave like a Host that accepts every write. */
function acceptWrites(host: StubConfigForm<WriterZhuqueSettings>): void {
  host.mutate.mockImplementation((ops: readonly SettingsPathOpView[]) => {
    const value = { ...host.scope.getSnapshot().value as object }
    const user = { ...host.scope.getSnapshot().user as object }
    for (const op of ops) {
      const field = op.path[0]!
      if (op.op === 'set') {
        value[field] = op.value
        user[field] = op.value
      } else {
        delete value[field]
        delete user[field]
      }
    }
    host.publish({ value, user })
    return Promise.resolve(true)
  })
}

describe('WriterZhuqueCardController', () => {
  it('releases its subscriptions and ignores credential replies after disposal', async () => {
    const host = stubConfigForm<WriterZhuqueSettings>()
    host.publish({ status: 'ready', writable: true, value: {}, user: {} })
    const pending = Promise.withResolvers<{ ok: true; value: Record<string, { configured: boolean; writable: boolean }> }>()
    const describe = vi.fn(() => pending.promise)
    const controller = new WriterZhuqueCardController(host.scope, { remote: { credentials: { describe, set: vi.fn() } } } as never)
    onTestFinished(async () => {
      controller.dispose()
      pending.resolve({ ok: true, value: {} })
      await pending.promise
    })
    const store = controller.inject().hooks.writerZhuqueCard
    const before = store.getSnapshot()

    controller.dispose()
    expect(host.listenerCount()).toBe(0)
    host.publish({ value: { gptImageBaseUrl: 'https://images.example/v1' } })
    controller.refreshCredential('MAKERS_API_KEY')
    expect(describe).toHaveBeenCalledOnce()
    pending.resolve({ ok: true, value: { MAKERS_API_KEY: { configured: true, writable: true } } })
    await pending.promise
    expect(store.getSnapshot()).toBe(before)
  })

  it('keeps the latest credential status when earlier requests for the same references finish late', async () => {
    const host = stubConfigForm<WriterZhuqueSettings>()
    host.publish({ status: 'ready', writable: true, value: {}, user: {} })
    type Result = { ok: true; value: Record<string, { configured: boolean; writable: boolean }> }
    const first = Promise.withResolvers<Result>()
    const second = Promise.withResolvers<Result>()
    const describe = vi.fn(() => first.promise).mockImplementationOnce(() => first.promise).mockImplementationOnce(() => second.promise)
    const controller = new WriterZhuqueCardController(host.scope, { remote: { credentials: { describe, set: vi.fn() } } } as never)
    onTestFinished(async () => {
      controller.dispose()
      first.resolve({ ok: true, value: {} })
      second.resolve({ ok: true, value: {} })
      await Promise.all([first.promise, second.promise])
    })
    const store = controller.inject().hooks.writerZhuqueCard

    controller.refreshCredential('MAKERS_API_KEY')
    expect(describe).toHaveBeenCalledTimes(2)
    second.resolve({ ok: true, value: { MAKERS_API_KEY: { configured: true, writable: false } } })
    await second.promise
    expect(store.getSnapshot().key).toMatchObject({ configured: true, writable: false })
    first.resolve({ ok: true, value: { MAKERS_API_KEY: { configured: false, writable: true } } })
    await first.promise
    expect(store.getSnapshot().key).toMatchObject({ configured: true, writable: false })
  })

  it('settles a saved key from its read-back while a later status refresh is still pending', async () => {
    const host = stubConfigForm<WriterZhuqueSettings>()
    host.publish({ status: 'ready', writable: true, value: {}, user: {} })
    type Result = { ok: true; value: Record<string, { configured: boolean; writable: boolean }> }
    const initial = Promise.resolve<Result>({ ok: true, value: { MAKERS_API_KEY: { configured: false, writable: true } } })
    const verification = Promise.withResolvers<Result>()
    const refresh = Promise.withResolvers<Result>()
    const describe = vi.fn(() => initial)
      .mockImplementationOnce(() => initial)
      .mockImplementationOnce(() => verification.promise)
      .mockImplementationOnce(() => refresh.promise)
    const controller = new WriterZhuqueCardController(host.scope, {
      remote: { credentials: { describe, set: vi.fn(async () => ({ ok: true, value: undefined })) } },
    } as never)
    onTestFinished(async () => {
      controller.dispose()
      verification.resolve({ ok: true, value: {} })
      refresh.resolve({ ok: true, value: {} })
      await Promise.all([verification.promise, refresh.promise])
    })
    await initial
    const face = controller.inject()
    face.edit('makersApiKey', 'replacement')
    face.save()
    await vi.waitFor(() => { expect(describe).toHaveBeenCalledTimes(2) })
    controller.refreshCredential('MAKERS_API_KEY')
    expect(describe).toHaveBeenCalledTimes(3)
    verification.resolve({ ok: true, value: { MAKERS_API_KEY: { configured: true, writable: true } } })
    await verification.promise
    await vi.waitFor(() => { expect(face.hooks.writerZhuqueCard.getSnapshot().saving).toBe(false) })
    expect(face.hooks.writerZhuqueCard.getSnapshot()).toMatchObject({ failed: false, dirty: false })
    expect(face.hooks.writerZhuqueCard.getSnapshot().key.draft.text).toBe('')
    refresh.resolve({ ok: true, value: { MAKERS_API_KEY: { configured: true, writable: true } } })
    await refresh.promise
    expect(face.hooks.writerZhuqueCard.getSnapshot().key.configured).toBe(true)
  })

  it('names the writer namespace', () => {
    expect(WRITER_SETTINGS_NS).toBe('writer')
  })

  it('writes a staged key through the credentials domain', async () => {
    const host = stubConfigForm<WriterZhuqueSettings>()
    acceptWrites(host)
    const describe = vi.fn(() => Promise.resolve({
      ok: true as const,
      value: { MAKERS_API_KEY: { configured: true, writable: true } },
    }))
    const set = vi.fn(() => Promise.resolve({ ok: true as const, value: undefined }))
    const controller = new WriterZhuqueCardController(host.scope, { remote: { credentials: { describe, set } } } as never)
    host.publish({ status: 'ready', writable: true, value: {}, user: {} })
    const face = controller.inject()
    face.edit('makersApiKey', ' makers-secret ')
    expect(face.hooks.writerZhuqueCard.getSnapshot().dirty).toBe(true)
    expect(set).not.toHaveBeenCalled()
    face.save()
    await vi.waitFor(() => { expect(set).toHaveBeenCalledWith('MAKERS_API_KEY', 'makers-secret') })
    expect(host.mutate).not.toHaveBeenCalled()
  })

  it('keeps the stored key when the draft is left blank', () => {
    const host = stubConfigForm<WriterZhuqueSettings>()
    const set = vi.fn()
    const controller = new WriterZhuqueCardController(host.scope, {
      remote: { credentials: { describe: vi.fn(() => Promise.resolve({ ok: true, value: {} })), set } },
    } as never)
    host.publish({ status: 'ready', writable: true, value: {}, user: {} })
    const face = controller.inject()
    face.edit('makersApiKey', '   ')
    expect(face.hooks.writerZhuqueCard.getSnapshot().dirty).toBe(false)
    face.save()
    expect(set).not.toHaveBeenCalled()
  })

  it('stages the cover base URL into the settings section', async () => {
    const host = stubConfigForm<WriterZhuqueSettings>()
    acceptWrites(host)
    const controller = new WriterZhuqueCardController(host.scope, {
      remote: { credentials: { describe: vi.fn(() => Promise.resolve({ ok: true, value: {} })), set: vi.fn() } },
    } as never)
    host.publish({ status: 'ready', writable: true, value: {}, user: {} })
    const face = controller.inject()
    face.edit('gptImageBaseUrl', ' https://proxy.example/v1 ')
    expect(face.hooks.writerZhuqueCard.getSnapshot().gptImageBaseUrl.text).toBe(' https://proxy.example/v1 ')
    expect(face.hooks.writerZhuqueCard.getSnapshot().dirty).toBe(true)
    expect(face.hooks.writerZhuqueCard.getSnapshot().gptImageBaseUrl.overridden).toBe(true)
    face.save()
    await vi.waitFor(() => {
      expect(host.scope.getSnapshot().value).toMatchObject({ gptImageBaseUrl: 'https://proxy.example/v1' })
    })
    expect(face.hooks.writerZhuqueCard.getSnapshot().dirty).toBe(false)
    face.edit('gptImageBaseUrl', '')
    face.save()
    await vi.waitFor(() => {
      expect(host.scope.getSnapshot().value).not.toHaveProperty('gptImageBaseUrl')
    })
    controller.dispose()
  })

  it('retains the draft when replacing an existing key fails', async () => {
    const host = stubConfigForm<WriterZhuqueSettings>()
    const controller = new WriterZhuqueCardController(host.scope, {
      remote: { credentials: {
        describe: vi.fn(async () => ({ ok: true, value: { MAKERS_API_KEY: { configured: true, writable: true } } })),
        set: vi.fn(async () => ({ ok: false, error: 'write failed' })),
      } },
    } as never)
    host.publish({ status: 'ready', writable: true, value: {}, user: {} })
    const face = controller.inject()
    await vi.waitFor(() => { expect(face.hooks.writerZhuqueCard.getSnapshot().key.configured).toBe(true) })
    face.edit('makersApiKey', 'replacement')
    face.save()
    await vi.waitFor(() => { expect(face.hooks.writerZhuqueCard.getSnapshot().failed).toBe(true) })
    expect(face.hooks.writerZhuqueCard.getSnapshot().key.draft.text).toBe('replacement')
    controller.dispose()
  })

  it('addresses a custom makersApiKeyEnv reference', async () => {
    const host = stubConfigForm<WriterZhuqueSettings>()
    const set = vi.fn(() => Promise.resolve({ ok: true as const, value: undefined }))
    const describe = vi.fn(() => Promise.resolve({
      ok: true as const,
      value: { CUSTOM_MAKERS: { configured: true, writable: true } },
    }))
    const controller = new WriterZhuqueCardController(host.scope, { remote: { credentials: { describe, set } } } as never)
    host.publish({ status: 'ready', writable: true, value: { makersApiKeyEnv: 'CUSTOM_MAKERS' }, user: {} })
    const face = controller.inject()
    face.edit('makersApiKey', 'secret')
    face.save()
    await vi.waitFor(() => { expect(set).toHaveBeenCalledWith('CUSTOM_MAKERS', 'secret') })
    controller.dispose()
  })
})
