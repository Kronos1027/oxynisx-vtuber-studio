# 🖥️ Como compilar o .exe no Windows

Este guia mostra como compilar o **OXYNISX VTuber Studio** em um executável
Windows nativo (.exe) usando Tauri.

## ✅ Opção 1: Download direto (mais fácil)

Se houver uma release publicada no GitHub, basta baixar o `.exe` installer:

👉 https://github.com/Kronos1027/oxynisx-vtuber-studio/releases

Baixe o arquivo `OXYNISX-VTuber_1.0.0_x64-setup.exe` e execute.
Não precisa instalar nada — é um installer NSIS padrão do Windows.

---

## 🔨 Opção 2: Compilar no seu PC (recomendado se quiser customizar)

### Passo 1: Instalar pré-requisitos

#### 1.1. Microsoft Visual Studio C++ Build Tools
Baixe e instale: https://visualstudio.microsoft.com/visual-cpp-build-tools/

Marque a opção **"Desenvolvimento para desktop com C++"** durante a instalação.

#### 1.2. Rust
Baixe e instale: https://www.rust-lang.org/tools/install

Execute no PowerShell:
```powershell
winget install Rustlang.Rustup
```
Ou baixe `rustup-init.exe` e execute.

#### 1.3. Bun (ou Node.js)
Baixe e instale: https://bun.sh/

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Ou use Node.js 18+: https://nodejs.org/

#### 1.4. WebView2 (já vem no Windows 11)
Se você usa Windows 10, instale o WebView2 Runtime:
https://developer.microsoft.com/microsoft-edge/webview2/

### Passo 2: Baixar o código

```powershell
git clone https://github.com/Kronos1027/oxynisx-vtuber-studio.git
cd oxynisx-vtuber-studio
```

### Passo 3: Instalar dependências

```powershell
bun install
```

Ou com npm:
```powershell
npm install
```

### Passo 4: Compilar o .exe

```powershell
bun run tauri:build
```

Ou com npm:
```powershell
npm run tauri:build
```

Isso vai:
1. Compilar o frontend Next.js (export estático para `out/`)
2. Compilar o backend Rust em modo release
3. Gerar o installer NSIS (.exe) e MSI (.msi)

⏱️ **Primeira build** demora ~5-10 minutos (Rust compila todas as dependências).
Builds subsequentes são mais rápidas (~1-2 minutos).

### Passo 5: Encontrar o executável

Após a build, os arquivos estarão em:

```
src-tauri/target/release/bundle/
├── nsis/
│   └── OXYNISX-VTuber_1.0.0_x64-setup.exe    ← Installer NSIS
└── msi/
    └── OXYNISX-VTuber_1.0.0_x64_en-US.msi     ← Installer MSI
```

O installer NSIS (`.exe`) é recomendado — é menor e mais rápido.

### Passo 6: Executar

- **Installer**: Execute o `.exe` e instale normalmente. O app aparecerá no
  Menu Iniciar como "OXYNISX VTuber Studio".
- **Portátil**: Se quiser rodar sem instalar, execute diretamente:
  `src-tauri/target/release/OXYNISX-VTuber.exe`

---

## 🎯 Testar em modo desenvolvimento

Para testar antes de compilar o .exe final:

```powershell
bun run tauri:dev
```

Isso abre o app em modo desenvolvimento com hot-reload.
A janela transparente aparece imediatamente.

---

## 🐛 Solução de problemas

### Erro: "linker `link.exe` not found"
Instale o Visual Studio C++ Build Tools (Passo 1.1).

### Erro: "WebView2Loader.dll not found"
Instale o WebView2 Runtime (Passo 1.4).

### Erro: "cargo not found"
Reinicie o PowerShell após instalar o Rust, ou execute:
```powershell
$env:Path += ";$env:USERPROFILE\.cargo\bin"
```

### Janela não fica transparente
No Windows, a transparência da janela requer que o tema do Windows esteja
em modo "Claro" ou que o app tenha permissão de composição.
Tente desativar o `decorations: false` em `src-tauri/tauri.conf.json`
temporariamente para ver se o problema é de transparência.

### Build muito lenta
A primeira build do Rust compila ~400 crates. Builds seguintes usam cache
e são muito mais rápidas. Se quiser acelerar, use um SSD.

---

## 📦 Estrutura do projeto

```
oxynisx-vtuber-studio/
├── src/                          # Frontend Next.js + React
│   ├── app/                      # Páginas
│   ├── components/vtuber/        # Componentes do VTuber
│   ├── hooks/                    # Hooks (Live2D, microfone, teclado, Tauri)
│   └── stores/                   # Estado global (Zustand)
├── src-tauri/                    # Backend Rust + configuração Tauri
│   ├── src/lib.rs                # Comandos Tauri (window control, shortcuts)
│   ├── Cargo.toml                # Dependências Rust
│   ├── tauri.conf.json           # Configuração da janela desktop
│   └── capabilities/             # Permissões
├── public/
│   ├── models/otho-ai/           # Modelo Live2D da Ohto Ai
│   └── live2dcubismcore.min.js   # Runtime Live2D
├── .github/workflows/            # CI/CD (build automática no GitHub)
└── package.json
```

---

## 🎮 Como usar o app compilado

1. **Inicie o app** — a Ohto Ai aparece em uma janela transparente
2. **Clique na janela** para autorizar o microfone
3. **Abra o painel** (botão no canto superior direito) para configurar:
   - Microfone e lip-sync
   - Tracking de mouse
   - Expressões (Ctrl+1..5 funcionam globalmente)
   - Teclado overlay (BongoCat)
4. **Ative "Sempre no topo"** (botão 📌) para o avatar ficar sobre todas as janelas
5. **Ative "Click-through"** (botão 🖱️) para o mouse atravessar a janela
6. **Para streaming**: ative fundo transparente e capture a janela no OBS

### Atalhos globais (funcionam mesmo com outra janela focada)
- `Ctrl+1` — Expressão Feliz
- `Ctrl+2` — Expressão Surpreso
- `Ctrl+3` — Expressão Bravo
- `Ctrl+4` — Expressão Triste
- `Ctrl+5` — Expressão Neutro
