/**
 * useMicrophone - Web Audio API microphone capture and volume analysis
 *
 * Captures audio from the selected microphone, computes RMS volume,
 * and updates the global store's micVolume (0-1) every frame.
 * This drives the lip-sync mouth overlay.
 */

'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useVTuberStore } from '@/stores/vtuber-store'

export function useMicrophone() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const volumeSmoothingRef = useRef(0)

  const micDeviceId = useVTuberStore((s) => s.settings.micDeviceId)
  const lipSyncEnabled = useVTuberStore((s) => s.settings.lipSyncEnabled)
  const micSensitivity = useVTuberStore((s) => s.settings.micSensitivity)
  const mouthSmoothing = useVTuberStore((s) => s.settings.mouthSmoothing)
  const setMicVolume = useVTuberStore((s) => s.setMicVolume)
  const setIsSpeaking = useVTuberStore((s) => s.setIsSpeaking)

  const start = useCallback(async () => {
    if (!lipSyncEnabled) return

    try {
      // Stop existing stream
      stop()

      const audioConstraints: MediaStreamConstraints = {
        audio: micDeviceId
          ? {
              deviceId: { exact: micDeviceId },
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
      }

      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints)
      streamRef.current = stream

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioContextClass()
      audioContextRef.current = ctx

      // Resume if suspended (Chrome autoplay policy)
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }

      const source = ctx.createMediaStreamSource(stream)
      sourceRef.current = source

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.3
      analyserRef.current = analyser

      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const sensitivityFactor = (micSensitivity / 50) // 50 = default, 100 = 2x

      const tick = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteTimeDomainData(dataArray)

        // Compute RMS volume
        let sumSquares = 0
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = (dataArray[i] - 128) / 128
          sumSquares += normalized * normalized
        }
        const rms = Math.sqrt(sumSquares / dataArray.length)
        // Apply sensitivity boost
        const boosted = Math.min(1, rms * sensitivityFactor * 3)

        // Smooth
        const smoothing = mouthSmoothing
        volumeSmoothingRef.current += (boosted - volumeSmoothingRef.current) * (1 - smoothing)

        setMicVolume(volumeSmoothingRef.current)

        rafRef.current = requestAnimationFrame(tick)
      }

      tick()
    } catch (e) {
      console.error('Microphone start error:', e)
      setIsSpeaking(false)
    }
  }, [micDeviceId, lipSyncEnabled, micSensitivity, mouthSmoothing, setMicVolume, setIsSpeaking])

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect()
      } catch { /* ignore */ }
      sourceRef.current = null
    }
    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect()
      } catch { /* ignore */ }
      analyserRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close()
      } catch { /* ignore */ }
      audioContextRef.current = null
    }
    setMicVolume(0)
    setIsSpeaking(false)
  }, [setMicVolume, setIsSpeaking])

  useEffect(() => {
    if (lipSyncEnabled) {
      start()
    } else {
      stop()
    }
    return () => {
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lipSyncEnabled, micDeviceId, micSensitivity, mouthSmoothing])

  return { start, stop }
}

/**
 * useAudioInputDevices - enumerate available audio input devices
 */
export function useAudioInputDevices() {
  const [devices, setDevices] = useState<{ deviceId: string; label: string }[]>([])

  useEffect(() => {
    async function enumerate() {
      try {
        // Need to request permission first to get labels
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((t) => t.stop())

        const allDevices = await navigator.mediaDevices.enumerateDevices()
        const audioInputs = allDevices
          .filter((d) => d.kind === 'audioinput')
          .map((d) => ({
            deviceId: d.deviceId,
            label: d.label || `Microfone ${d.deviceId.slice(0, 8)}`,
          }))
        setDevices(audioInputs)
      } catch (e) {
        console.error('Device enumeration error:', e)
      }
    }
    enumerate()
  }, [])

  return devices
}
