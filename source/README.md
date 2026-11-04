# VirtuaDJ model viewer

This is the first browser viewer milestone for the original two-deck VRML scene.
It loads `2Decks.wrl` directly with X_ITE so the original scene hierarchy,
component transforms, materials, and textures are not converted or rewritten.
The source model files remain in `../original/VirtuaDJ`.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Drag to orbit, right-drag to pan, and use
the scroll wheel to zoom.

`npm run build` creates a static site in `dist`. Vite serves and copies the
original model directory as the public asset directory so VRML `Inline` and
texture references resolve relative to the original scene. The build corrects
case-only mismatches in a few VRML file references in the generated copies;
the original scene and component files are not changed.
