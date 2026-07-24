# 🎭 OXYNISX VTuber Studio

> A complete web-based VTuber studio featuring **Ohto Ai** (red hoodie) as the avatar,
> with Live2D rendering, microphone lip-sync, mouse tracking, and BongoCat-style
> keyboard overlay.

![OXYNISX VTuber Studio](https://raw.githubusercontent.com/Kronos1027/oxynisx-vtuber-studio/main/docs/screenshot.png)

---

## ✨ Features

### 🎤 Lip-Sync (Microphone)
- Real-time microphone capture via Web Audio API
- Volume-based mouth animation (SVG overlay)
- Adjustable sensitivity, threshold, and smoothing
- Device selector for choosing your microphone

### 🖱️ Mouse Tracking
- Head follows cursor (ParamAngleX/Y)
- Eyes follow cursor (ParamEyeBallX/Y)
- Adjustable range and smoothing
- Auto-blink and auto-breath idle animations

### 😊 Expressions
- 5 facial expressions: Happy, Surprised, Angry, Sad, Neutral
- Hotkeys: `Ctrl+1` through `Ctrl+5`
- Toggle behavior (press again to clear)

### ⌨️ BongoCat Keyboard Overlay
- Visual keyboard showing pressed keys in real-time
- Full QWERTY layout with function keys
- Red highlight on key press
- Adjustable opacity

### 🎨 Customization
- Avatar scale, position (X/Y), and rotation
- Transparent background mode (for OBS capture)
- Custom background color
- Collapsible control panel

### 🎬 Streaming Ready
- Transparent background for OBS Window Capture
- Chroma key compatible
- Clean stage area separate from controls

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Modern browser with WebGL support

### Installation

```bash
# Clone the repo
git clone https://github.com/Kronos1027/oxynisx-vtuber-studio.git
cd oxynisx-vtuber-studio

# Install dependencies
bun install
# or
npm install

# Run the dev server
bun run dev
# or
npm run dev
```

Open `http://localhost:3000` in your browser.

### First Time Setup

1. **Click anywhere** on the page to grant microphone permission
2. Open the **Microfone & Lip-sync** section in the control panel
3. Select your microphone device
4. Adjust sensitivity until the volume meter responds to your voice
5. (Optional) Enable **Teclado Overlay** for BongoCat-style keyboard visualization
6. (Optional) Enable **Fundo transparente** for OBS streaming

---

## 🎥 Using with OBS

### Method 1: Window Capture (recommended)
1. In OBS, add a **Window Capture** source
2. Select your browser window running OXYNISX VTuber Studio
3. Enable **Fundo transparente** in the app
4. In OBS, right-click the source → **Filters** → add **Chroma Key**
5. Set the chroma key color to **black** (or match your background)

### Method 2: Browser Source
1. In OBS, add a **Browser** source
2. Set URL to `http://localhost:3000`
3. Set width/height to match your scene
4. Enable **Fundo transparente** in the app

---

## 🎮 Controls

| Key | Action |
|-----|--------|
| `Ctrl+1` | Expression: Happy |
| `Ctrl+2` | Expression: Surprised |
| `Ctrl+3` | Expression: Angry |
| `Ctrl+4` | Expression: Sad |
| `Ctrl+5` | Expression: Neutral |
| Mouse move | Head + eye tracking |

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout (loads Live2D Cubism Core)
│   └── page.tsx            # Main VTuber stage + control panel
├── components/
│   └── vtuber/
│       ├── live2d-stage.tsx     # PIXI canvas + model rendering
│       ├── control-panel.tsx    # Settings sidebar
│       ├── mouth-overlay.tsx    # SVG lip-sync mouth
│       └── keyboard-overlay.tsx # BongoCat-style keyboard
├── hooks/
│   ├── use-live2d.ts       # Live2D model management
│   ├── use-microphone.ts   # Web Audio API mic capture
│   └── use-keyboard.ts     # Keyboard event capture
└── stores/
    └── vtuber-store.ts     # Zustand global state
```

### Technology Stack
- **Framework**: Next.js 16 with App Router
- **Live2D**: pixi-live2d-display + Live2D Cubism 4 Core
- **Rendering**: PIXI.js v6
- **Audio**: Web Audio API (AnalyserNode)
- **State**: Zustand with localStorage persistence
- **UI**: shadcn/ui + Tailwind CSS

---

## 🎨 Character

The avatar is **Ohto Ai** from *Wonder Egg Priority*, wearing her signature red hoodie.

- **Hair**: Dark navy blue bob with ahoge
- **Eyes**: Heterochromatic (gold + blue)
- **Outfit**: Bright crimson red hoodie with sunflower accents
- **Base model**: doro (Live2D Cubism 4) with custom texture repaint

The model files are in `public/models/otho-ai/`.

---

## ⚠️ Limitations

- The base doro model doesn't have a `ParamMouthOpen` parameter, so lip-sync
  uses an SVG mouth overlay positioned over the face rather than a true
  Live2D mouth deformation.
- Keyboard capture only works when the browser window has focus. For
  global keyboard capture (even when other apps are focused), you'd need
  a desktop app (Tauri/Electron).
- Microphone requires user interaction to start (browser autoplay policy).

---

## 📝 License

- **Code**: MIT
- **Live2D Cubism Core**: Proprietary (Live2D Inc.)
- **Character**: Ohto Ai © A-1 Pictures / Aniplex

---

## 🛠️ Built for OXYNISX

This VTuber studio was custom-built for **OXYNISX** for live streaming.
