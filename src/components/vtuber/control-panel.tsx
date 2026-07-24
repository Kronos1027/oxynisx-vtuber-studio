/**
 * ControlPanel - The main settings sidebar
 *
 * Contains all VTuber controls organized in collapsible sections:
 * - Expressions
 * - Microphone / Lip-sync
 * - Mouse & Eye Tracking
 * - Avatar Transform
 * - Background / Streaming
 * - Keyboard Overlay
 */

'use client'

import { useState } from 'react'
import { useVTuberStore, EXPRESSIONS } from '@/stores/vtuber-store'
import { useMicrophone, useAudioInputDevices } from '@/hooks/use-microphone'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  ChevronDown,
  Mic,
  MousePointer,
  Sliders,
  Palette,
  Keyboard,
  Smile,
  Volume2,
  RotateCcw,
} from 'lucide-react'

export function ControlPanel() {
  const settings = useVTuberStore((s) => s.settings)
  const updateSettings = useVTuberStore((s) => s.updateSettings)
  const resetSettings = useVTuberStore((s) => s.resetSettings)
  const currentExpression = useVTuberStore((s) => s.currentExpression)
  const setExpression = useVTuberStore((s) => s.setExpression)
  const micVolume = useVTuberStore((s) => s.micVolume)
  const isSpeaking = useVTuberStore((s) => s.isSpeaking)
  const modelLoaded = useVTuberStore((s) => s.modelLoaded)
  const fps = useVTuberStore((s) => s.fps)

  const { start: startMic, stop: stopMic } = useMicrophone()
  const devices = useAudioInputDevices()

  const [activeSection, setActiveSection] = useState<string | null>('expressions')

  const toggleSection = (id: string) => {
    setActiveSection(activeSection === id ? null : id)
  }

  const sections = [
    { id: 'expressions', label: 'Expressões', icon: Smile },
    { id: 'mic', label: 'Microfone & Lip-sync', icon: Mic },
    { id: 'tracking', label: 'Tracking Mouse', icon: MousePointer },
    { id: 'transform', label: 'Avatar', icon: Sliders },
    { id: 'background', label: 'Fundo & Stream', icon: Palette },
    { id: 'keyboard', label: 'Teclado Overlay', icon: Keyboard },
  ]

  return (
    <div className="h-full flex flex-col bg-zinc-950 border-l border-red-500/20">
      {/* Header */}
      <div className="p-4 border-b border-red-500/20 bg-gradient-to-r from-red-950/50 to-zinc-950">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-red-500/30">
            O
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">OXYNISX</h1>
            <p className="text-[10px] text-zinc-400 -mt-0.5">VTuber Studio</p>
          </div>
        </div>
        {/* Status indicators */}
        <div className="mt-2 flex items-center gap-3 text-[10px]">
          <span className={`flex items-center gap-1 ${modelLoaded ? 'text-green-400' : 'text-zinc-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${modelLoaded ? 'bg-green-400' : 'bg-zinc-600'}`} />
            Modelo
          </span>
          <span className={`flex items-center gap-1 ${isSpeaking ? 'text-red-400' : 'text-zinc-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-red-400 animate-pulse' : 'bg-zinc-600'}`} />
            Mic
          </span>
          <span className="text-zinc-500 font-mono">{fps} FPS</span>
        </div>
      </div>

      {/* Scrollable settings */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scroll">
        {/* Expressions Section */}
        <Section
          id="expressions"
          label="Expressões"
          icon={Smile}
          active={activeSection === 'expressions'}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-5 gap-2">
            {EXPRESSIONS.map((expr) => (
              <button
                key={expr.id}
                onClick={() => setExpression(currentExpression === expr.id ? null : expr.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                  currentExpression === expr.id
                    ? 'border-red-500 bg-red-500/20 shadow-lg shadow-red-500/20'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
                }`}
                title={`${expr.name} (Ctrl+${expr.hotkey})`}
              >
                <span className="text-lg">{expr.emoji}</span>
                <span className="text-[9px] text-zinc-400">{expr.name}</span>
                <span className="text-[8px] text-zinc-600 font-mono">⌃{expr.hotkey}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Microphone Section */}
        <Section
          id="mic"
          label="Microfone & Lip-sync"
          icon={Mic}
          active={activeSection === 'mic'}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-300">Lip-sync ativo</label>
              <Switch
                checked={settings.lipSyncEnabled}
                onCheckedChange={(v) => updateSettings({ lipSyncEnabled: v })}
              />
            </div>

            {settings.lipSyncEnabled && (
              <>
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Dispositivo de microfone</label>
                  <select
                    value={settings.micDeviceId || ''}
                    onChange={(e) => updateSettings({ micDeviceId: e.target.value || null })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200"
                  >
                    <option value="">Padrão do sistema</option>
                    {devices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-zinc-300">Sensibilidade</label>
                    <span className="text-xs text-zinc-500 font-mono">{settings.micSensitivity}%</span>
                  </div>
                  <Slider
                    value={[settings.micSensitivity]}
                    onValueChange={(v) => updateSettings({ micSensitivity: v[0] })}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-zinc-300">Threshold (mínimo p/ falar)</label>
                    <span className="text-xs text-zinc-500 font-mono">{settings.micThreshold}%</span>
                  </div>
                  <Slider
                    value={[settings.micThreshold]}
                    onValueChange={(v) => updateSettings({ micThreshold: v[0] })}
                    min={0}
                    max={50}
                    step={1}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-zinc-300">Suavização da boca</label>
                    <span className="text-xs text-zinc-500 font-mono">{Math.round(settings.mouthSmoothing * 100)}%</span>
                  </div>
                  <Slider
                    value={[settings.mouthSmoothing * 100]}
                    onValueChange={(v) => updateSettings({ mouthSmoothing: v[0] / 100 })}
                    min={0}
                    max={90}
                    step={5}
                  />
                </div>

                {/* Volume meter */}
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Volume do microfone</label>
                  <div className="h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="h-full transition-all duration-75"
                      style={{
                        width: `${micVolume * 100}%`,
                        background: isSpeaking
                          ? 'linear-gradient(90deg, #ef4444, #f97316)'
                          : 'linear-gradient(90deg, #52525b, #71717a)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-[9px] text-zinc-600">0%</span>
                    <span className="text-[9px] text-zinc-600">{Math.round(micVolume * 100)}%</span>
                    <span className="text-[9px] text-zinc-600">100%</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </Section>

        {/* Tracking Section */}
        <Section
          id="tracking"
          label="Tracking Mouse"
          icon={MousePointer}
          active={activeSection === 'tracking'}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-300">Tracking de cabeça</label>
              <Switch
                checked={settings.mouseTracking}
                onCheckedChange={(v) => updateSettings({ mouseTracking: v })}
              />
            </div>

            {settings.mouseTracking && (
              <>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-zinc-300">Alcance horizontal</label>
                    <span className="text-xs text-zinc-500 font-mono">±{settings.mouseRangeX}°</span>
                  </div>
                  <Slider
                    value={[settings.mouseRangeX]}
                    onValueChange={(v) => updateSettings({ mouseRangeX: v[0] })}
                    min={5}
                    max={45}
                    step={1}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-zinc-300">Alcance vertical</label>
                    <span className="text-xs text-zinc-500 font-mono">±{settings.mouseRangeY}°</span>
                  </div>
                  <Slider
                    value={[settings.mouseRangeY]}
                    onValueChange={(v) => updateSettings({ mouseRangeY: v[0] })}
                    min={5}
                    max={45}
                    step={1}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-zinc-300">Suavização</label>
                    <span className="text-xs text-zinc-500 font-mono">{Math.round(settings.mouseSmoothing * 100)}%</span>
                  </div>
                  <Slider
                    value={[settings.mouseSmoothing * 100]}
                    onValueChange={(v) => updateSettings({ mouseSmoothing: v[0] / 100 })}
                    min={0}
                    max={90}
                    step={5}
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <label className="text-xs text-zinc-300">Tracking de olhos</label>
              <Switch
                checked={settings.eyeTracking}
                onCheckedChange={(v) => updateSettings({ eyeTracking: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-300">Piscar automático</label>
              <Switch
                checked={settings.autoBlink}
                onCheckedChange={(v) => updateSettings({ autoBlink: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-300">Respiração</label>
              <Switch
                checked={settings.autoBreath}
                onCheckedChange={(v) => updateSettings({ autoBreath: v })}
              />
            </div>
          </div>
        </Section>

        {/* Transform Section */}
        <Section
          id="transform"
          label="Avatar"
          icon={Sliders}
          active={activeSection === 'transform'}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-zinc-300">Escala</label>
                <span className="text-xs text-zinc-500 font-mono">{settings.scale}%</span>
              </div>
              <Slider
                value={[settings.scale]}
                onValueChange={(v) => updateSettings({ scale: v[0] })}
                min={30}
                max={200}
                step={1}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-zinc-300">Posição X</label>
                <span className="text-xs text-zinc-500 font-mono">{settings.posX}%</span>
              </div>
              <Slider
                value={[settings.posX]}
                onValueChange={(v) => updateSettings({ posX: v[0] })}
                min={0}
                max={100}
                step={1}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-zinc-300">Posição Y</label>
                <span className="text-xs text-zinc-500 font-mono">{settings.posY}%</span>
              </div>
              <Slider
                value={[settings.posY]}
                onValueChange={(v) => updateSettings({ posY: v[0] })}
                min={0}
                max={100}
                step={1}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-zinc-300">Rotação</label>
                <span className="text-xs text-zinc-500 font-mono">{settings.rotation}°</span>
              </div>
              <Slider
                value={[settings.rotation]}
                onValueChange={(v) => updateSettings({ rotation: v[0] })}
                min={-15}
                max={15}
                step={0.5}
              />
            </div>
          </div>
        </Section>

        {/* Background Section */}
        <Section
          id="background"
          label="Fundo & Stream"
          icon={Palette}
          active={activeSection === 'background'}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-300">Fundo transparente (OBS)</label>
              <Switch
                checked={settings.transparentBg}
                onCheckedChange={(v) => updateSettings({ transparentBg: v })}
              />
            </div>

            {!settings.transparentBg && (
              <div>
                <label className="text-xs text-zinc-300 block mb-1">Cor de fundo</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.bgColor}
                    onChange={(e) => updateSettings({ bgColor: e.target.value })}
                    className="w-10 h-8 p-1 bg-zinc-900 border border-zinc-700 rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.bgColor}
                    onChange={(e) => updateSettings({ bgColor: e.target.value })}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 font-mono"
                  />
                </div>
              </div>
            )}

            <div className="bg-zinc-900/50 rounded-lg p-2 border border-zinc-800">
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                💡 <strong className="text-zinc-300">Para live:</strong> ative o fundo transparente
                e capture esta janela no OBS com filtro <span className="text-red-400">Chroma Key</span> (cor: preto)
                ou use <span className="text-red-400">Window Capture</span> com transparency.
              </p>
            </div>
          </div>
        </Section>

        {/* Keyboard Section */}
        <Section
          id="keyboard"
          label="Teclado Overlay"
          icon={Keyboard}
          active={activeSection === 'keyboard'}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-300">Mostrar teclado (BongoCat)</label>
              <Switch
                checked={settings.keyboardOverlay}
                onCheckedChange={(v) => updateSettings({ keyboardOverlay: v })}
              />
            </div>

            {settings.keyboardOverlay && (
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-zinc-300">Opacidade</label>
                  <span className="text-xs text-zinc-500 font-mono">{settings.keyboardOpacity}%</span>
                </div>
                <Slider
                  value={[settings.keyboardOpacity]}
                  onValueChange={(v) => updateSettings({ keyboardOpacity: v[0] })}
                  min={20}
                  max={100}
                  step={5}
                />
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-red-500/20 bg-zinc-950">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-zinc-700 hover:border-red-500/50 hover:bg-red-950/20 text-zinc-300 hover:text-red-400"
          onClick={() => {
            if (confirm('Resetar todas as configurações para o padrão?')) {
              resetSettings()
            }
          }}
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Resetar configurações
        </Button>
        <p className="text-[9px] text-zinc-600 text-center mt-2">
          OXYNISX VTuber Studio v1.0
        </p>
      </div>
    </div>
  )
}

// Collapsible section wrapper
function Section({
  id,
  label,
  icon: Icon,
  active,
  onToggle,
  children,
}: {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 overflow-hidden">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-red-400" />
          <span className="text-xs font-medium text-zinc-200">{label}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 transition-transform ${active ? 'rotate-180' : ''}`}
        />
      </button>
      {active && (
        <div className="px-3 pb-3 pt-1">
          {children}
        </div>
      )}
    </div>
  )
}
