/**
 * KeyboardOverlay - BongoCat-style keyboard visualization
 *
 * Shows a visual keyboard at the bottom of the screen with pressed keys
 * highlighted. Mimics the BongoCat overlay style.
 */

'use client'

import { useVTuberStore } from '@/stores/vtuber-store'
import { getKeyLabel } from '@/hooks/use-keyboard'

const KEYBOARD_LAYOUT: { code: string; label: string; row: number; col: number }[][] = [
  // Row 1: Function row (compact)
  [
    { code: 'Escape', label: 'ESC', row: 0, col: 0 },
    { code: 'F1', label: 'F1', row: 0, col: 2 },
    { code: 'F2', label: 'F2', row: 0, col: 3 },
    { code: 'F3', label: 'F3', row: 0, col: 4 },
    { code: 'F4', label: 'F4', row: 0, col: 5 },
    { code: 'F5', label: 'F5', row: 0, col: 6 },
    { code: 'F6', label: 'F6', row: 0, col: 7 },
    { code: 'F7', label: 'F7', row: 0, col: 8 },
    { code: 'F8', label: 'F8', row: 0, col: 9 },
    { code: 'F9', label: 'F9', row: 0, col: 10 },
    { code: 'F10', label: 'F10', row: 0, col: 11 },
    { code: 'F11', label: 'F11', row: 0, col: 12 },
    { code: 'F12', label: 'F12', row: 0, col: 13 },
  ],
  // Row 2: Number row
  [
    { code: 'Backquote', label: '`', row: 1, col: 0 },
    { code: 'Digit1', label: '1', row: 1, col: 1 },
    { code: 'Digit2', label: '2', row: 1, col: 2 },
    { code: 'Digit3', label: '3', row: 1, col: 3 },
    { code: 'Digit4', label: '4', row: 1, col: 4 },
    { code: 'Digit5', label: '5', row: 1, col: 5 },
    { code: 'Digit6', label: '6', row: 1, col: 6 },
    { code: 'Digit7', label: '7', row: 1, col: 7 },
    { code: 'Digit8', label: '8', row: 1, col: 8 },
    { code: 'Digit9', label: '9', row: 1, col: 9 },
    { code: 'Digit0', label: '0', row: 1, col: 10 },
    { code: 'Minus', label: '-', row: 1, col: 11 },
    { code: 'Equal', label: '=', row: 1, col: 12 },
    { code: 'Backspace', label: '⌫', row: 1, col: 13 },
  ],
  // Row 3: QWERTY
  [
    { code: 'Tab', label: 'TAB', row: 2, col: 0 },
    { code: 'KeyQ', label: 'Q', row: 2, col: 1 },
    { code: 'KeyW', label: 'W', row: 2, col: 2 },
    { code: 'KeyE', label: 'E', row: 2, col: 3 },
    { code: 'KeyR', label: 'R', row: 2, col: 4 },
    { code: 'KeyT', label: 'T', row: 2, col: 5 },
    { code: 'KeyY', label: 'Y', row: 2, col: 6 },
    { code: 'KeyU', label: 'U', row: 2, col: 7 },
    { code: 'KeyI', label: 'I', row: 2, col: 8 },
    { code: 'KeyO', label: 'O', row: 2, col: 9 },
    { code: 'KeyP', label: 'P', row: 2, col: 10 },
    { code: 'BracketLeft', label: '[', row: 2, col: 11 },
    { code: 'BracketRight', label: ']', row: 2, col: 12 },
    { code: 'Backslash', label: '\\', row: 2, col: 13 },
  ],
  // Row 4: ASDF
  [
    { code: 'CapsLock', label: 'CAPS', row: 3, col: 0 },
    { code: 'KeyA', label: 'A', row: 3, col: 1 },
    { code: 'KeyS', label: 'S', row: 3, col: 2 },
    { code: 'KeyD', label: 'D', row: 3, col: 3 },
    { code: 'KeyF', label: 'F', row: 3, col: 4 },
    { code: 'KeyG', label: 'G', row: 3, col: 5 },
    { code: 'KeyH', label: 'H', row: 3, col: 6 },
    { code: 'KeyJ', label: 'J', row: 3, col: 7 },
    { code: 'KeyK', label: 'K', row: 3, col: 8 },
    { code: 'KeyL', label: 'L', row: 3, col: 9 },
    { code: 'Semicolon', label: ';', row: 3, col: 10 },
    { code: 'Quote', label: "'", row: 3, col: 11 },
    { code: 'Enter', label: 'ENTER', row: 3, col: 12 },
  ],
  // Row 5: ZXCV
  [
    { code: 'ShiftLeft', label: 'SHIFT', row: 4, col: 0 },
    { code: 'KeyZ', label: 'Z', row: 4, col: 1 },
    { code: 'KeyX', label: 'X', row: 4, col: 2 },
    { code: 'KeyC', label: 'C', row: 4, col: 3 },
    { code: 'KeyV', label: 'V', row: 4, col: 4 },
    { code: 'KeyB', label: 'B', row: 4, col: 5 },
    { code: 'KeyN', label: 'N', row: 4, col: 6 },
    { code: 'KeyM', label: 'M', row: 4, col: 7 },
    { code: 'Comma', label: ',', row: 4, col: 8 },
    { code: 'Period', label: '.', row: 4, col: 9 },
    { code: 'Slash', label: '/', row: 4, col: 10 },
    { code: 'ShiftRight', label: 'SHIFT', row: 4, col: 11 },
  ],
  // Row 6: Bottom row
  [
    { code: 'ControlLeft', label: 'CTRL', row: 5, col: 0 },
    { code: 'AltLeft', label: 'ALT', row: 5, col: 1 },
    { code: 'Space', label: 'SPACE', row: 5, col: 2 },
    { code: 'AltRight', label: 'ALT', row: 5, col: 3 },
    { code: 'ControlRight', label: 'CTRL', row: 5, col: 4 },
  ],
]

export function KeyboardOverlay() {
  const pressedKeys = useVTuberStore((s) => s.pressedKeys)
  const opacity = useVTuberStore((s) => s.settings.keyboardOpacity)

  return (
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none"
      style={{
        opacity: opacity / 100,
        zIndex: 10,
        paddingBottom: '8px',
      }}
    >
      <div className="bg-zinc-900/60 backdrop-blur-sm rounded-lg p-2 shadow-2xl border border-red-500/20">
        <div className="flex flex-col gap-[3px]">
          {KEYBOARD_LAYOUT.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-[3px] justify-center">
              {row.map((key, colIdx) => {
                const isPressed = pressedKeys[key.code]
                // Special sizing for wide keys
                let widthClass = 'w-7'
                if (key.label === 'SPACE') widthClass = 'w-32'
                else if (key.label === 'BACK' || key.label === 'ENTER' || key.label === 'SHIFT' || key.label === 'CAPS' || key.label === 'TAB') widthClass = 'w-12'
                else if (key.label === 'CTRL' || key.label === 'ALT') widthClass = 'w-10'
                else if (key.label === 'ESC') widthClass = 'w-8'

                return (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={`${widthClass} h-7 rounded flex items-center justify-center text-[9px] font-mono font-semibold transition-all duration-75 ${
                      isPressed
                        ? 'bg-red-500 text-white scale-95 shadow-lg shadow-red-500/50'
                        : 'bg-zinc-700/80 text-zinc-300'
                    }`}
                    style={{
                      transform: isPressed ? 'translateY(2px)' : 'translateY(0)',
                    }}
                  >
                    {key.label}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
