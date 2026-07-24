/**
 * useLive2D - Core Live2D model management hook
 *
 * Loads the Ohto Ai model into a PIXI canvas, binds parameters to
 * the global VTuber store, and exposes control methods for
 * expressions, motions, and parameter overrides.
 *
 * Uses pixi-live2d-display (same library as BongoCat).
 */

'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useVTuberStore, type ExpressionId } from '@/stores/vtuber-store'

// Lazy-load PIXI and Live2DModel on client only (they reference `window`)
let PIXI: typeof import('pixi.js') | null = null
let Live2DModel: typeof import('pixi-live2d-display/cubism4').Live2DModel | null = null

async function loadPixi() {
  if (!PIXI) {
    // Wait for Live2DCubismCore to be available on window
    let attempts = 0
    while (typeof window !== 'undefined' && !(window as unknown as { Live2DCubismCore?: unknown }).Live2DCubismCore && attempts < 50) {
      await new Promise((r) => setTimeout(r, 100))
      attempts++
    }
    if (typeof window !== 'undefined' && !(window as unknown as { Live2DCubismCore?: unknown }).Live2DCubismCore) {
      throw new Error('Live2DCubismCore failed to load. Make sure /live2dcubismcore.min.js is included in the page.')
    }

    const pixi = await import('pixi.js')
    const live2d = await import('pixi-live2d-display/cubism4')
    PIXI = pixi
    Live2DModel = live2d.Live2DModel
    // Register PIXI globally (required by pixi-live2d-display)
    if (typeof window !== 'undefined') {
      ;(window as unknown as { PIXI: typeof import('pixi.js') }).PIXI = pixi
    }
  }
  return { PIXI, Live2DModel }
}

export interface Live2DController {
  setExpression: (id: ExpressionId | null) => void
  setParameterValue: (paramId: string, value: number) => void
  getParameterValue: (paramId: string) => number
  getModelSize: () => { width: number; height: number } | null
}

export function useLive2D(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  // We store PIXI/Live2D instances as `unknown` and cast when needed,
  // because the libraries are loaded dynamically and their types reference `window`.
  const appRef = useRef<unknown>(null)
  const modelRef = useRef<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const settings = useVTuberStore((s) => s.settings)
  const setModelLoaded = useVTuberStore((s) => s.setModelLoaded)
  const setFps = useVTuberStore((s) => s.setFps)
  const currentExpression = useVTuberStore((s) => s.currentExpression)
  const micVolume = useVTuberStore((s) => s.micVolume)
  const isSpeaking = useVTuberStore((s) => s.isSpeaking)
  const lipSyncEnabled = useVTuberStore((s) => s.settings.lipSyncEnabled)

  // Mouse target (smoothed)
  const mouseTargetRef = useRef({ x: 0, y: 0 })
  const mouseSmoothRef = useRef({ x: 0, y: 0 })

  // Mouth state (smoothed)
  const mouthOpenRef = useRef(0)

  // Idle animation state
  const blinkTimerRef = useRef(0)
  const blinkStateRef = useRef({ phase: 'open' as 'open' | 'closing' | 'closed' | 'opening', progress: 0 })
  const breathPhaseRef = useRef(0)

  // Initialize PIXI app and load model
  useEffect(() => {
    if (!canvasRef.current) return

    let destroyed = false

    async function init() {
      try {
        setLoading(true)
        setError(null)

        // Load PIXI + Live2D dynamically (client-side only)
        const { PIXI: pixi, Live2DModel: L2DM } = await loadPixi()
        if (destroyed || !pixi || !L2DM || !canvasRef.current) return

        // Create PIXI application
        const app = new pixi.Application({
          view: canvasRef.current,
          width: canvasRef.current.clientWidth || 800,
          height: canvasRef.current.clientHeight || 600,
          backgroundAlpha: 0,
          antialias: true,
          preserveDrawingBuffer: true,
          autoStart: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        })

        if (destroyed) {
          app.destroy(true)
          return
        }

        appRef.current = app

        // Load the Ohto Ai model
        const model = await L2DM.from('/models/otho-ai/cat.model3.json')

        if (destroyed) {
          model.destroy()
          app.destroy(true)
          return
        }

        modelRef.current = model
        app.stage.addChild(model)

        setModelLoaded(true)
        setLoading(false)

        // FPS counter
        let frameCount = 0
        let lastFpsTime = performance.now()
        app.ticker.add(() => {
          frameCount++
          const now = performance.now()
          if (now - lastFpsTime > 1000) {
            setFps(frameCount)
            frameCount = 0
            lastFpsTime = now
          }
        })
      } catch (e) {
        console.error('Live2D init error:', e)
        setError(e instanceof Error ? e.message : String(e))
        setLoading(false)
      }
    }

    init()

    return () => {
      destroyed = true
      setModelLoaded(false)
      if (modelRef.current) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(modelRef.current as any).destroy()
        } catch (e) {
          console.error('Model destroy error:', e)
        }
        modelRef.current = null
      }
      if (appRef.current) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(appRef.current as any).destroy(true)
        } catch (e) {
          console.error('App destroy error:', e)
        }
        appRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef])

  // Handle window resize
  useEffect(() => {
    function handleResize() {
      if (!appRef.current || !canvasRef.current) return
      const w = canvasRef.current.clientWidth
      const h = canvasRef.current.clientHeight
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (appRef.current as any).renderer.resize(w, h)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Apply model transform (scale, position, rotation)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = modelRef.current as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const app = appRef.current as any
    if (!model || !app) return

    const scaleFactor = settings.scale / 100
    const baseScale = Math.min(
      app.renderer.width / model.width,
      app.renderer.height / model.height
    )
    const finalScale = baseScale * scaleFactor

    model.scale.set(finalScale)
    model.x = (app.renderer.width / 2) - (model.width * model.scale.x) / 2 + (settings.posX - 50) * app.renderer.width / 100
    model.y = (app.renderer.height / 2) - (model.height * model.scale.y) / 2 + (settings.posY - 50) * app.renderer.height / 100
    model.angle = settings.rotation
  }, [settings.scale, settings.posX, settings.posY, settings.rotation, settings])

  // Mouse tracking → ParamAngleX/Y + ParamEyeBallX/Y
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const x = (e.clientX / window.innerWidth) * 2 - 1 // -1 to 1
      const y = (e.clientY / window.innerHeight) * 2 - 1 // -1 to 1
      mouseTargetRef.current = { x, y }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Main animation loop: apply tracking, lip-sync, idle animations
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = modelRef.current as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const app = appRef.current as any
    if (!model || !app) return

    const ticker = app.ticker
    const internalModel = model.internalModel
    const coreModel = internalModel.coreModel

    const tick = (delta: number) => {
      // --- Mouse tracking (smoothed) ---
      if (settings.mouseTracking) {
        const smoothing = settings.mouseSmoothing
        mouseSmoothRef.current.x += (mouseTargetRef.current.x - mouseSmoothRef.current.x) * (1 - smoothing)
        mouseSmoothRef.current.y += (mouseTargetRef.current.y - mouseSmoothRef.current.y) * (1 - smoothing)

        const angleX = mouseSmoothRef.current.x * settings.mouseRangeX
        const angleY = -mouseSmoothRef.current.y * settings.mouseRangeY // invert Y (up = positive)

        try {
          coreModel.addParameterValueById?.('ParamAngleX', angleX, 0.5)
          coreModel.addParameterValueById?.('ParamAngleY', angleY, 0.5)
        } catch {
          try {
            internalModel.coreModel.setParameterValueById?.('ParamAngleX', angleX)
            internalModel.coreModel.setParameterValueById?.('ParamAngleY', angleY)
          } catch { /* param may not exist */ }
        }
      }

      // --- Eye tracking ---
      if (settings.eyeTracking) {
        try {
          const eyeX = mouseSmoothRef.current.x * settings.eyeRangeX
          const eyeY = -mouseSmoothRef.current.y * settings.eyeRangeY
          coreModel.setParameterValueById?.('ParamEyeBallX', eyeX)
          coreModel.setParameterValueById?.('ParamEyeBallY', eyeY)
        } catch { /* ignore */ }
      }

      // --- Auto blink ---
      if (settings.autoBlink) {
        blinkTimerRef.current += delta / 60 // seconds
        const blinkCycle = 3 + Math.random() * 2 // blink every 3-5 seconds
        const blinkDuration = 0.15 // 150ms blink

        const st = blinkStateRef.current
        if (st.phase === 'open' && blinkTimerRef.current > blinkCycle) {
          st.phase = 'closing'
          st.progress = 0
          blinkTimerRef.current = 0
        }
        if (st.phase === 'closing') {
          st.progress += delta / 60 / (blinkDuration / 2)
          if (st.progress >= 1) {
            st.phase = 'opening'
            st.progress = 0
          }
        }
        if (st.phase === 'opening') {
          st.progress += delta / 60 / (blinkDuration / 2)
          if (st.progress >= 1) {
            st.phase = 'open'
            st.progress = 0
          }
        }

        let eyeOpen = 1
        if (st.phase === 'closing') {
          eyeOpen = 1 - st.progress
        } else if (st.phase === 'opening') {
          eyeOpen = st.progress
        } else if (st.phase === 'closed') {
          eyeOpen = 0
        }

        try {
          coreModel.setParameterValueById?.('ParamEyeLOpen', eyeOpen)
          coreModel.setParameterValueById?.('ParamEyeROpen', eyeOpen)
        } catch { /* ignore */ }
      }

      // --- Auto breath ---
      if (settings.autoBreath) {
        breathPhaseRef.current += delta / 60 * 1.5 // 1.5 Hz breathing
        const breath = (Math.sin(breathPhaseRef.current) + 1) / 2
        try {
          coreModel.setParameterValueById?.('ParamBreath', breath)
        } catch { /* ignore */ }
      }
    }

    ticker.add(tick)
    return () => {
      ticker.remove(tick)
    }
  }, [settings.mouseTracking, settings.mouseSmoothing, settings.mouseRangeX, settings.mouseRangeY,
      settings.eyeTracking, settings.eyeRangeX, settings.eyeRangeY,
      settings.autoBlink, settings.autoBreath, settings])

  // Apply expression changes
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = modelRef.current as any
    if (!model) return

    if (currentExpression) {
      try {
        model.expression(currentExpression)
      } catch (e) {
        console.warn('Expression failed:', e)
      }
    }
  }, [currentExpression])

  // Controller methods
  const setExpression = useCallback((id: ExpressionId | null) => {
    useVTuberStore.getState().setExpression(id)
  }, [])

  const setParameterValue = useCallback((paramId: string, value: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = modelRef.current as any
    if (!model) return
    try {
      model.internalModel.coreModel.setParameterValueById?.(paramId, value)
    } catch (e) {
      console.warn('setParameterValue failed:', e)
    }
  }, [])

  const getParameterValue = useCallback((paramId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = modelRef.current as any
    if (!model) return 0
    try {
      return model.internalModel.coreModel.getParameterValueById?.(paramId) ?? 0
    } catch {
      return 0
    }
  }, [])

  const getModelSize = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = modelRef.current as any
    if (!model) return null
    return { width: model.width, height: model.height }
  }, [])

  return {
    loading,
    error,
    setExpression,
    setParameterValue,
    getParameterValue,
    getModelSize,
  }
}
