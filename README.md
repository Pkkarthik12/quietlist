# QuietList

QuietList is a clean personal todo list desktop app designed to feel friendly, fast, and calm. It is built as a cross-platform Electron app so it can be packaged for Windows, macOS, and Linux from one repository.

## What it includes

- A polished desktop UI with a focused daily list
- Local task persistence using `localStorage`
- Filters for all, active, and completed tasks
- A lightweight Electron shell ready for packaging
- GitHub-ready project structure

## Project structure

```text
src/
  main/
    main.js
  renderer/
    index.html
    styles.css
    app.js
build/
  icon-placeholder.txt
package.json
README.md
```

## Run locally

Install dependencies:

```bash
npm install
```

Start the desktop app:

```bash
npm start
```

## Build installers

Create production packages:

```bash
npm run dist
```

Targets configured in `package.json`:

- Windows: `nsis`
- macOS: `dmg`
- Linux: `AppImage`, `deb`



## Notes

- You should replace the placeholder app icon in `build/` with real `.ico`, `.icns`, and `.png` assets before shipping.
- macOS builds typically need to be created on macOS for the smoothest signing and notarization workflow.
- Windows and Linux packaging can usually be produced from a Windows or Linux machine once Node.js is installed.

## License

MIT
