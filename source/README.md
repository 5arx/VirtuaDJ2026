# VirtuaDJ model viewer

This is the first browser viewer milestone for the original two-deck VRML scene.
It loads `2Decks.wrl` directly with X_ITE so the original scene hierarchy,
component transforms, materials, and textures are not converted or rewritten.
The source model files remain in `../original/VirtuaDJ`.

Audio uses the original `dnbsamp.wav` and `dnbbeats.wav` recordings. Web Audio
follows the original VRML `PowerBoxScript` state events, so each track plays only
when its deck is powered, its platter is turning, and its tonearm is lowered over
the record. The original files remain unchanged.

Each deck's original pitch slider continuously controls its Web Audio playback
rate across the SL-1210-style range from -8% to +8%. The original 33⅓ and 45
RPM buttons select the deck's base playback rate independently of that pitch
adjustment.

Switching off a powered, playing deck now produces a progressive turntable
spin-down instead of stopping its audio instantly.

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
