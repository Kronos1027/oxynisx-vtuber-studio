/**
 * useKeyboard - global keyboard capture for BongoCat-style overlay
 *
 * Captures keydown/keyup events and updates the store's pressedKeys.
 * Also handles expression hotkeys (1-5 with Ctrl/Cmd).
 */

'use client'

import { useEffect } from 'react'
import { useVTuberStore, EXPRESSIONS } from '@/stores/vtuber-store'

// Map physical keys to display labels
const KEY_LABELS: Record<string, string> = {
  Escape: 'ESC',
  Tab: 'TAB',
  CapsLock: 'CAPS',
  Shift: 'SHIFT',
  ShiftLeft: 'SHIFT',
  ShiftRight: 'SHIFT',
  Control: 'CTRL',
  ControlLeft: 'CTRL',
  ControlRight: 'CTRL',
  Alt: 'ALT',
  AltLeft: 'ALT',
  AltRight: 'ALT',
  Meta: 'CMD',
  MetaLeft: 'CMD',
  MetaRight: 'CMD',
  Backspace: 'BACK',
  Enter: 'ENTER',
  Space: 'SPACE',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Delete: 'DEL',
  Insert: 'INS',
  Home: 'HOME',
  End: 'END',
  PageUp: 'PGUP',
  PageDown: 'PGDN',
}

export function getKeyLabel(code: string): string {
  if (KEY_LABELS[code]) return KEY_LABELS[code]
  // KeyA -> A, Digit1 -> 1
  if (code.startsWith('Key')) return code.slice(3)
  if (code.startsWith('Digit')) return code.slice(5)
  if (code.startsWith('Numpad')) return 'NUM' + code.slice(6)
  if (code.startsWith('F') && code.length > 1) return code
  return code
}

export function useKeyboard() {
  const setKeyPressed = useVTuberStore((s) => s.setKeyPressed)
  const setExpression = useVTuberStore((s) => s.setExpression)
  const currentExpression = useVTuberStore((s) => s.currentExpression)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Expression hotkeys: Ctrl/Cmd + 1-5
      if (e.ctrlKey || e.metaKey) {
        const num = e.key
        const expr = EXPRESSIONS.find((x) => x.hotkey === num)
        if (expr) {
          e.preventDefault()
          // Toggle: if already active, clear; otherwise set
          if (currentExpression === expr.id) {
            setExpression(null)
          } else {
            setExpression(expr.id)
          }
          return
        }
      }

      // Ignore modifier-only presses for the overlay
      if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return

      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }

      setKeyPressed(e.code, true)
    }

    function handleKeyUp(e: KeyboardEvent) {
      setKeyPressed(e.code, false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    // Clear all keys when window loses focus (prevents stuck keys)
    function handleBlur() {
      // Reset all pressed keys
      const state = useVTuberStore.getState()
      Object.keys(state.pressedKeys).forEach((k) => {
        state.setKeyPressed(k, false)
      })
    }
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [setKeyPressed, setExpression, currentExpression])
}
