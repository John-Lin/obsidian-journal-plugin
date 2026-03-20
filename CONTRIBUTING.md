# Contributing

## Development

```bash
npm install
npm test
npm run build
```

## Releasing

1. Update `version` in both `manifest.json` and `package.json`.
2. Add the new version mapping in `versions.json`.
3. Commit and push to `main`.
4. Create and push a tag matching the version:
   ```bash
   git tag -a 1.0.1 -m "1.0.1"
   git push origin 1.0.1
   ```
5. GitHub Actions will create a **draft release** with `main.js` and `manifest.json` attached.
6. Go to the [Releases](../../releases) page, review the draft, add release notes, then publish.
