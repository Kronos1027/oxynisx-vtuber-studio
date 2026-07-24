/**
 * useTauri - Tauri desktop integration hook
 *
 * Provides:
 * - Global keyboard shortcut events (Ctrl+1..5 for expressions)
 * - Window control commands (always-on-top, click-through, decorations)
 * - Detects if running inside Tauri vs browser
 *
 * In browser mode, this is a no-op (returns false for isTauri).
 */

'use client'

import { useEffect } from 'react'
import { useVTuberStore, EXPRESSIONS } from '@/stores/vtuber-store'

// Check if we're running inside Tauri (desktop) or browser
export function isTauri(): boolean {
  if (typeof window === 'undefined') return false
  return '__TAURI_INTERNALS__' in window || '__TAURI__' in window
}

export function useTauri() {
  const setExpression = useVTuberStore((s) => s.setExpression)
  const currentExpression = useVTuberStore((s) => s.currentExpression)
  const updateSettings = useVTuberStore((s) => s.updateSettings)
  const alwaysOnTop = useVTuberStore((s) => s.settings.alwaysOnTop)
  const clickThrough = useVTuberStore((s) => s.settings.clickThrough)

  useEffect(() => {
    if (!isTauri()) return

    let unlisten: (() => void) | null = null

    async function setup() {
      try {
        const { listen } = await import('@tauri-apps/api/event')
        const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow')

        // Listen for global expression shortcuts (Ctrl+1..5)
        // These fire even when the app window isn't focused
        unlisten = await listen<number>('global-expression', (event) => {
          const idx = event.payload - 1
          if (idx >= 0 && idx < EXPRESSIONS.length) {
            const expr = EXPRESSIONS[idx]
            setExpression(currentExpression === expr.id ? null : expr.id)
          }
        })

        const win = getCurrentWebviewWindow()

        // Apply initial window state
        await win.setAlwaysOnTop(alwaysOnTop)
        await win.setIgnoreCursorEvents(clickThrough)
      } catch (e) {
        console.warn('Tauri setup failed:', e)
      }
    }

    setup()

    return () => {
      if (unlisten) unlisten()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync always-on-top changes
  useEffect(() => {
    if (!isTauri()) return
    import('@tauri-apps/api/webviewWindow')
      .then(({ getCurrentWebviewWindow }) => getCurrentWebviewWindow().setAlwaysOnTop(alwaysOnTop))
      .catch(() => {})
  }, [alwaysOnTop])

  // Sync click-through changes
  useEffect(() => {
    if (!isTauri()) return
    import('@tauri-apps/api/webviewWindow')
      .then(({ getCurrentWebviewWindow }) => getCurrentWebviewWindow().setIgnoreCursorEvents(clickThrough))
      .catch(() => {})
  }, [clickThrough])
}

/**
 * Window control helpers (callable from React components)
 */
export async function toggleAlwaysOnTop(): Promise<boolean> {
  if (!isTauri()) return false
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow')
    const win = getCurrentWebviewWindow()
    return await invoke<boolean>('toggle_always_on_top', { window: win })
  } catch (e) {
    console.error('toggleAlwaysOnTop failed:', e)
    return false
  }
}

export async function toggleClickThrough(): Promise<boolean> {
  if (!isTauri()) return false
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow')
    const win = getCurrentWebviewWindow()
    return await invoke<boolean>('toggle_click_through', { window: win })
  } catch (e) {
    console.error('toggleClickThrough failed:', e)
    return false
  }
}

export async function toggleDecorations(): Promise<boolean> {
  if (!isTauri()) return false
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow')
    const win = getCurrentWebviewWindow()
    return await invoke<boolean>('toggle_decorations', { window: win })
  } catch (e) {
    console.error('toggleDecorations failed:', e)
    return false
  }
}

export async function bringToFront(): Promise<void> {
  if (!isTauri()) return
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow')
    const win = getCurrentWebviewWindow()
    await invoke('bring_to_front', { window: win })
  } catch (e) {
    console.error('bringToFront failed:', e)
  }
}
