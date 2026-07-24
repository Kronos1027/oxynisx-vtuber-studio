# GitHub Actions Workflow (opcional)

Este arquivo configura build automática do .exe no GitHub Actions.
Se você quiser builds automáticas, crie o arquivo manualmente:

**Caminho:** `.github/workflows/build-windows.yml`

**Conteúdo:**

```yaml
name: Build Windows Executable

on:
  push:
    branches: [main]
    tags: ['v*']
  workflow_dispatch:

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Install dependencies
        run: bun install

      - name: Build Tauri app
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: \${{ github.ref_name }}
          releaseName: 'OXYNISX VTuber Studio \${{ github.ref_name }}'
          releaseBody: 'See the assets below to download the Windows installer.'
          releaseDraft: true
          prerelease: false
          args: --target x86_64-pc-windows-msvc

      - name: Upload installer artifact
        uses: actions/upload-artifact@v4
        with:
          name: OXYNISX-VTuber-Windows-Installer
          path: |
            src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/*.exe
            src-tauri/target/x86_64-pc-windows-msvc/release/bundle/msi/*.msi
```

Depois de criar o arquivo, faça commit e push. O GitHub Actions vai
compilar o `.exe` automaticamente a cada push para `main`.

Você também pode baixar o `.exe` compilado na aba **Actions** do repositório
(em **Artifacts**).
