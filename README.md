# QuietList

QuietList is a clean personal todo list desktop app designed to feel friendly, fast, and calm. It is built as a cross-platform Electron app so it can be packaged for Windows, macOS, and Linux from one repository, with one consistent QuietList brand across the app and release flow.

## What it includes

- A polished desktop UI with a focused daily list
- Dark mode with local theme persistence
- Categories and optional due dates for every task
- Local task persistence using `localStorage`
- Filters for all, active, and completed tasks
- A built-in QuietList logo asset for app branding
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
  icon.svg
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

## Release from GitHub

The repository includes two workflows:

- `Validate Desktop App` for push and pull request checks
- `Release Desktop App` for tagged builds and GitHub Releases

Create a version tag to publish release artifacts:

```bash
git tag v1.0.0
git push origin v1.0.0
```


## Notes

- `build/icon.svg` is included for branding and Linux packaging. For the smoothest Windows and macOS installer icons, add dedicated `.ico` and `.icns` files later.
- macOS builds typically need to be created on macOS for the smoothest signing and notarization workflow.
- Windows and Linux packaging can usually be produced from a Windows or Linux machine once Node.js is installed.

## License

MIT
