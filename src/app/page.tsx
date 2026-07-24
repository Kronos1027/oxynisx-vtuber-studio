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
import { useVTuberStore } from '@/stores/vtuber-store'
import { PanelLeftClose, PanelLeftOpen, Mic, MicOff } from 'lucide-react'

export default function Home() {
  // Initialize keyboard capture and microphone
  useKeyboard()
  useMicrophone()

  const panelCollapsed = useVTuberStore((s) => s.settings.panelCollapsed)
  const updateSettings = useVTuberStore((s) => s.updateSettings)
  const lipSyncEnabled = useVTuberStore((s) => s.settings.lipSyncEnabled)
  const keyboardOverlay = useVTuberStore((s) => s.settings.keyboardOverlay)
  const isSpeaking = useVTuberStore((s) => s.isSpeaking)

  const [micPermissionRequested, setMicPermissionRequested] = useState(false)

  // Request mic permission on first user interaction
  useEffect(() => {
    if (micPermissionRequested || !lipSyncEnabled) return

    const handleFirstClick = () => {
      setMicPermissionRequested(true)
      // The useMicrophone hook will start automatically once permission is granted
      document.removeEventListener('click', handleFirstClick)
    }

    document.addEventListener('click', handleFirstClick)
    return () => document.removeEventListener('click', handleFirstClick)
  }, [micPermissionRequested, lipSyncEnabled])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Stage area */}
      <div className="relative flex-1 overflow-hidden">
        <Live2DStage />

        {/* Keyboard overlay */}
        {keyboardOverlay && <KeyboardOverlay />}

        {/* Toggle panel button (floating) */}
        <button
          onClick={() => updateSettings({ panelCollapsed: !panelCollapsed })}
          className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 hover:border-red-500/50 hover:bg-red-950/30 transition-all"
          title={panelCollapsed ? 'Mostrar painel' : 'Esconder painel'}
        >
          {panelCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-zinc-300" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-zinc-300" />
          )}
        </button>

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
