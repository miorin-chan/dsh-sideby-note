import type { WorkspaceView } from '@deepseek-ai/dsh-api-workspace-controller/client'

/** The active conversation and workspace catalog shared by the panel and badge. */
export type ScopeMode = 'global' | 'workspace'

export type NoteWorkspace = Pick<WorkspaceView, 'workspaceId' | 'title'> & {
  sessionIds: readonly string[]
}

export const UNASSIGNED_WORKSPACE = 'sideby-note:unassigned'

let binding: { sessionId: string; workspace: NoteWorkspace | null; ready: boolean; catalogReady: boolean } = {
  sessionId: '', workspace: null, ready: true, catalogReady: false,
}
let workspaces: NoteWorkspace[] = []

export function bindWorkspace(sessionId: string, workspace: NoteWorkspace | null, ready: boolean, catalog: NoteWorkspace[] | null) {
  binding = { sessionId, workspace, ready, catalogReady: catalog !== null }
  workspaces = catalog ?? []
}

export function workspaceForSession(sessionId: string) {
  return binding.sessionId === sessionId ? binding.workspace : null
}

export function workspaceCatalogReady() {
  return binding.catalogReady
}

export function workspaceById(workspaceId: string) {
  return workspaces.find(workspace => workspace.workspaceId === workspaceId)
}

export function sessionReadyFor(sessionId: string) {
  return binding.sessionId !== sessionId || binding.ready
}

export function bindableSessionId(sessionId: string): string | undefined {
  return sessionId && binding.sessionId === sessionId && binding.ready ? sessionId : undefined
}

export function draftKeyForSession(sessionId: string) {
  const workspace = workspaceForSession(sessionId)
  return workspace ? `ws:${workspace.workspaceId}` : sessionId
}
