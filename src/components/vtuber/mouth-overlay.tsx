/**
 * MouthOverlay - SVG mouth that animates with microphone volume
 *
 * The doro base model doesn't have a ParamMouthOpen parameter, so we
 * overlay an animated SVG mouth positioned over the character's face.
 * The mouth opens/closes based on the mic volume (0-1).
 *
 * Position is calibrated to match where the face renders in the
 * default BongoCat pose (centered, ~40% from top).
 */

'use client'

import { useEffect, useRef, useState } from 'react'

interface MouthOverlayProps {
  volume: number // 0-1
  speaking: boolean
}

export function MouthOverlay({ volume, speaking }: MouthOverlayProps) {
  // The mouth position needs to be calibrated relative to the model's face.
  // The model is centered in the canvas, and the face is at ~40% from top.
  // We position the mouth at 42% from top, 50% from left, and size it
  // relative to the canvas dimensions.

  // Smooth the volume for less jittery mouth
  const smoothVolRef = useRef(0)
  const [mouthHeight, setMouthHeight] = useState(2)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const target = speaking ? volume : 0
      smoothVolRef.current += (target - smoothVolRef.current) * 0.4
      // Map volume to mouth height: 2px (closed) to 14px (open)
      const h = 2 + smoothVolRef.current * 12
      setMouthHeight(h)
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [volume, speaking])

  // Mouth shape: an ellipse that grows vertically with volume
  // Use a dark interior + subtle outline to match anime style
  const mouthWidth = 18
  const lipColor = '#8B3A3A' // dark red lip
  const mouthColor = '#2A1010' // dark interior

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: 'calc(50% - 9px)',
        top: 'calc(42% - 7px)',
        transform: 'translate(-50%, -50%)',
        zIndex: 5,
      }}
    >
      <svg
        width={mouthWidth + 6}
        height={Math.max(mouthHeight + 6, 10)}
        viewBox={`-3 -3 ${mouthWidth + 6} ${Math.max(mouthHeight + 6, 10)}`}
        style={{ overflow: 'visible' }}
      >
        {/* Mouth interior (dark) */}
        <ellipse
          cx={mouthWidth / 2}
          cy={Math.max(mouthHeight, 4) / 2}
          rx={mouthWidth / 2}
          ry={Math.max(mouthHeight, 4) / 2}
          fill={mouthColor}
          opacity={speaking ? 0.85 : 0}
          style={{ transition: 'opacity 0.1s' }}
        />
        {/* Upper lip line */}
        <path
          d={`M 0 0 Q ${mouthWidth / 2} -2 ${mouthWidth} 0`}
          stroke={lipColor}
          strokeWidth="1.5"
          fill="none"
          opacity={speaking ? 0.7 : 0.3}
          strokeLinecap="round"
        />
        {/* Lower lip line */}
        <path
          d={`M 0 ${Math.max(mouthHeight, 2)} Q ${mouthWidth / 2} ${Math.max(mouthHeight, 2) + 2} ${mouthWidth} ${Math.max(mouthHeight, 2)}`}
          stroke={lipColor}
          strokeWidth="1"
          fill="none"
          opacity={speaking ? 0.6 : 0.2}
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
