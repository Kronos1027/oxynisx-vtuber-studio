/**
 * OXYNISX VTuber Studio - Main Page
 *
 * Layout:
 *  - Left: Live2D stage (transparent for OBS capture)
 *  - Right: Control panel (collapsible)
 *
 * The stage area is designed to be captured by OBS for streaming.
 * The control panel is for configuration only and should not be captured.
 */

'use client'

import { useRef, useState, useEffect } from 'react'
import { Live2DStage } from '@/components/vtuber/live2d-stage'
import { ControlPanel } from '@/components/vtuber/control-panel'
import { KeyboardOverlay } from '@/components/vtuber/keyboard-overlay'
import { useKeyboard } from '@/hooks/use-keyboard'
import { useMicrophone } from '@/hooks/use-microphone'
import { useTauri, isTauri } from '@/hooks/use-tauri'
import { useVTuberStore } from '@/stores/vtuber-store'
import { PanelLeftClose, PanelLeftOpen, Mic, MicOff, Pin, PinOff, MousePointerClick, Eye, EyeOff } from 'lucide-react'

export default function Home() {
  // Initialize keyboard capture and microphone
  useKeyboard()
  useMicrophone()
  useTauri()

  const panelCollapsed = useVTuberStore((s) => s.settings.panelCollapsed)
  const updateSettings = useVTuberStore((s) => s.updateSettings)
  const lipSyncEnabled = useVTuberStore((s) => s.settings.lipSyncEnabled)
  const keyboardOverlay = useVTuberStore((s) => s.settings.keyboardOverlay)
  const isSpeaking = useVTuberStore((s) => s.isSpeaking)
  const alwaysOnTop = useVTuberStore((s) => s.settings.alwaysOnTop)
  const clickThrough = useVTuberStore((s) => s.settings.clickThrough)
  const decorations = useVTuberStore((s) => s.settings.decorations ?? true)
  const transparentBg = useVTuberStore((s) => s.settings.transparentBg)

  const [micPermissionRequested, setMicPermissionRequested] = useState(false)
  const [isDesktopApp, setIsDesktopApp] = useState(false)

  // Detect Tauri desktop environment
  useEffect(() => {
    setIsDesktopApp(isTauri())
  }, [])

  // Request mic permission on first user interaction
  useEffect(() => {
    if (micPermissionRequested || !lipSyncEnabled) return

    const handleFirstClick = () => {
      setMicPermissionRequested(true)
      document.removeEventListener('click', handleFirstClick)
    }

    document.addEventListener('click', handleFirstClick)
    return () => document.removeEventListener('click', handleFirstClick)
  }, [micPermissionRequested, lipSyncEnabled])

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${transparentBg ? 'bg-transparent' : 'bg-zinc-950'} text-zinc-100`}>
      {/* Stage area */}
      <div className="relative flex-1 overflow-hidden">
        <Live2DStage />

        {/* Keyboard overlay */}
        {keyboardOverlay && <KeyboardOverlay />}

        {/* Top-right control buttons */}
        <div className="absolute top-3 right-3 z-20 flex gap-2">
          {/* Pin (always on top) - only in desktop mode */}
          {isDesktopApp && (
            <button
              onClick={() => updateSettings({ alwaysOnTop: !alwaysOnTop })}
              className={`p-2 rounded-lg backdrop-blur-sm border transition-all ${
                alwaysOnTop
                  ? 'bg-red-500/30 border-red-500/50 text-red-400'
                  : 'bg-zinc-900/80 border-zinc-700 hover:border-red-500/50 text-zinc-300'
              }`}
              title={alwaysOnTop ? 'Desativar sempre no topo' : 'Ativar sempre no topo'}
            >
              {alwaysOnTop ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </button>
          )}
          {/* Click-through - only in desktop mode */}
          {isDesktopApp && (
            <button
              onClick={() => updateSettings({ clickThrough: !clickThrough })}
              className={`p-2 rounded-lg backdrop-blur-sm border transition-all ${
                clickThrough
                  ? 'bg-red-500/30 border-red-500/50 text-red-400'
                  : 'bg-zinc-900/80 border-zinc-700 hover:border-red-500/50 text-zinc-300'
              }`}
              title={clickThrough ? 'Desativar click-through' : 'Ativar click-through (mouse atravessa)'}
            >
              <MousePointerClick className="w-4 h-4" />
            </button>
          )}
          {/* Toggle panel */}
          <button
            onClick={() => updateSettings({ panelCollapsed: !panelCollapsed })}
            className="p-2 rounded-lg bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 hover:border-red-500/50 hover:bg-red-950/30 transition-all"
            title={panelCollapsed ? 'Mostrar painel' : 'Esconder painel'}
          >
            {panelCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-zinc-300" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-zinc-300" />
            )}
          </button>
        </div>

        {/* Mic permission prompt */}
        {lipSyncEnabled && !micPermissionRequested && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-zinc-900/90 backdrop-blur-sm border border-red-500/30 rounded-lg px-4 py-2 shadow-xl">
            <p className="text-xs text-zinc-300">
              <Mic className="w-3 h-3 inline mr-1 text-red-400" />
              Clique em qualquer lugar para ativar o microfone
            </p>
          </div>
        )}

        {/* Speaking indicator */}
        {lipSyncEnabled && isSpeaking && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-red-950/80 backdrop-blur-sm border border-red-500/50 rounded-lg px-3 py-1.5 shadow-lg">
            <div className="flex items-end gap-0.5 h-3">
              <div className="w-0.5 bg-red-400 rounded-full animate-pulse" style={{ height: '60%' }} />
              <div className="w-0.5 bg-red-400 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.1s' }} />
              <div className="w-0.5 bg-red-400 rounded-full animate-pulse" style={{ height: '80%', animationDelay: '0.2s' }} />
            </div>
            <span className="text-xs text-red-300 font-medium">Falando</span>
          </div>
        )}

        {/* Desktop mode indicator */}
        {isDesktopApp && (
          <div className="absolute bottom-2 right-2 text-[10px] text-zinc-600 font-mono pointer-events-none select-none">
            🖥️ Desktop Mode
          </div>
        )}
      </div>

      {/* Control panel */}
      {!panelCollapsed && (
        <div className="w-80 flex-shrink-0">
          <ControlPanel />
        </div>
      )}
    </div>
  )
}
