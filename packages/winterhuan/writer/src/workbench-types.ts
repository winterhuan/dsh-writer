/** Durable book references; manuscripts and native Session histories retain their own owners. */
export interface WriterBook {
  readonly id: string
  readonly title: string
  readonly form: 'long' | 'short'
  readonly workspaceId: string
  readonly cwd: string
  readonly path: string
  readonly phases: readonly { readonly sessionId: string; readonly createdAt: string }[]
  readonly sessionId: string | null
  readonly pendingSessionId: string | null
}

/** Workbench catalog; availability is checked again before each binding or write. */
export interface WriterCatalog {
  readonly books: readonly WriterBook[]
  readonly workspaces: readonly { readonly id: string; readonly path: string; readonly title: string }[]
}

/** Explicit author operations. Selecting a book never submits a prompt. */
export type WriterBookAction =
  | { readonly action: 'register'; readonly workspaceId: string; readonly path: string; readonly title: string; readonly form: 'long' | 'short'; readonly sessionId?: string }
  | { readonly action: 'create'; readonly workspaceId: string; readonly path: string; readonly title: string; readonly form: 'long' | 'short' }
  | { readonly action: 'open' | 'phase'; readonly id: string }
  | { readonly action: 'bind'; readonly id: string; readonly sessionId: string }
  | { readonly action: 'relink'; readonly id: string; readonly workspaceId: string; readonly path: string }
