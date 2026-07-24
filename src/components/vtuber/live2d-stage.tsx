/**
 * Live2DStage - The main Live2D rendering canvas
 *
 * Hosts the PIXI application that renders the Ohto Ai model.
 * Connects to the useLive2D hook for model management.
 */

'use client'

import { useRef, useEffect } from 'react'
import { useLive2D } from '@/hooks/use-live2d'
import { useVTuberStore } from '@/stores/vtuber-store'
import { MouthOverlay } from './mouth-overlay'

export function Live2DStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { loading, error } = useLive2D(canvasRef)

  const transparentBg = useVTuberStore((s) => s.settings.transparentBg)
  const bgColor = useVTuberStore((s) => s.settings.bgColor)
  const keyboardOverlay = useVTuberStore((s) => s.settings.keyboardOverlay)
  const lipSyncEnabled = useVTuberStore((s) => s.settings.lipSyncEnabled)
  const isSpeaking = useVTuberStore((s) => s.isSpeaking)
  const micVolume = useVTuberStore((s) => s.micVolume)

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: transparentBg ? 'transparent' : bgColor,
      }}
    >
      {/* PIXI Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />

      {/* Mouth overlay (lip-sync) */}
      {lipSyncEnabled && <MouthOverlay volume={micVolume} speaking={isSpeaking} />}

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-3" />
            <p className="text-sm text-zinc-400">Carregando Ohto Ai...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-red-950/80 border border-red-500/50 rounded-lg p-4 max-w-md">
            <p className="text-red-400 text-sm font-medium mb-1">Erro ao carregar modelo</p>
            <p className="text-red-300/70 text-xs font-mono">{error}</p>
          </div>
        </div>
      )}

      {/* Debug info (bottom-left, subtle) */}
      <div className="absolute bottom-2 left-2 text-[10px] text-zinc-600 font-mono pointer-events-none select-none">
        OXYNISX VTuber Studio
      </div>
    </div>
  )
}
