/**
 * OXYNISX VTuber Studio - Global State Store
 *
 * Manages all VTuber state: model settings, microphone config,
 * expression hotkeys, keyboard overlay, and UI state.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ExpressionId = 'expression1' | 'expression2' | 'expression3' | 'expression4' | 'expression5'

export interface ExpressionInfo {
  id: ExpressionId
  name: string
  hotkey: string
  emoji: string
}

export interface VTuberSettings {
  // Model transform
  scale: number
  posX: number
  posY: number
  rotation: number

  // Mouse tracking
  mouseTracking: boolean
  mouseSmoothing: number
  mouseRangeX: number
  mouseRangeY: number

  // Eye tracking
  eyeTracking: boolean
  eyeRangeX: number
  eyeRangeY: number

  // Idle animations
  autoBlink: boolean
  autoBreath: boolean

  // Lip-sync
  lipSyncEnabled: boolean
  micDeviceId: string | null
  micSensitivity: number
  micThreshold: number
  mouthSmoothing: number

  // Background / streaming
  transparentBg: boolean
  bgColor: string

  // Keyboard overlay
  keyboardOverlay: boolean
  keyboardOpacity: number

  // Window
  alwaysOnTop: boolean
  clickThrough: boolean
  decorations: boolean

  // Theme
  theme: 'dark' | 'light'

  // Panel collapsed state
  panelCollapsed: boolean
}

interface VTuberState {
  settings: VTuberSettings
  currentExpression: ExpressionId | null
  micVolume: number
  isSpeaking: boolean
  pressedKeys: Record<string, boolean>
  modelLoaded: boolean
  fps: number

  updateSettings: (partial: Partial<VTuberSettings>) => void
  setExpression: (id: ExpressionId | null) => void
  setMicVolume: (vol: number) => void
  setIsSpeaking: (speaking: boolean) => void
  setKeyPressed: (key: string, pressed: boolean) => void
  setModelLoaded: (loaded: boolean) => void
  setFps: (fps: number) => void
  resetSettings: () => void
}

const DEFAULT_SETTINGS: VTuberSettings = {
  scale: 100,
  posX: 50,
  posY: 60,
  rotation: 0,

  mouseTracking: true,
  mouseSmoothing: 0.3,
  mouseRangeX: 30,
  mouseRangeY: 30,

  eyeTracking: true,
  eyeRangeX: 2,
  eyeRangeY: 2,

  autoBlink: true,
  autoBreath: true,

  lipSyncEnabled: true,
  micDeviceId: null,
  micSensitivity: 50,
  micThreshold: 10,
  mouthSmoothing: 0.5,

  transparentBg: true,
  bgColor: '#0a0a12',

  keyboardOverlay: false,
  keyboardOpacity: 80,

  alwaysOnTop: false,
  clickThrough: false,
  decorations: true,

  theme: 'dark',
  panelCollapsed: false,
}

export const EXPRESSIONS: ExpressionInfo[] = [
  { id: 'expression1', name: 'Feliz', hotkey: '1', emoji: '😊' },
  { id: 'expression2', name: 'Surpreso', hotkey: '2', emoji: '😲' },
  { id: 'expression3', name: 'Bravo', hotkey: '3', emoji: '😠' },
  { id: 'expression4', name: 'Triste', hotkey: '4', emoji: '😢' },
  { id: 'expression5', name: 'Neutro', hotkey: '5', emoji: '😐' },
]

export const useVTuberStore = create<VTuberState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      currentExpression: null,
      micVolume: 0,
      isSpeaking: false,
      pressedKeys: {},
      modelLoaded: false,
      fps: 60,

      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),

      setExpression: (id) => set({ currentExpression: id }),

      setMicVolume: (vol) => {
        set((state) => {
          const threshold = state.settings.micThreshold / 100
          const isSpeaking = vol > threshold
          return { micVolume: vol, isSpeaking }
        })
      },

      setIsSpeaking: (speaking) => set({ isSpeaking: speaking }),

      setKeyPressed: (key, pressed) =>
        set((state) => ({
          pressedKeys: { ...state.pressedKeys, [key]: pressed },
        })),

      setModelLoaded: (loaded) => set({ modelLoaded: loaded }),
      setFps: (fps) => set({ fps }),

      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'oxynisx-vtuber-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
)
