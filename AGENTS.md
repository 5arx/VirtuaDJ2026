Virtual SL-1210 DJ — Project Handover

Background

This project is a modernisation of an original interactive VRML 2.0 application developed in 2000 as part of an MSc Computer Science course at the University of Birmingham.

The original application simulated a Technics SL-1210 turntable, including interactive controls, platter rotation, tonearm movement, pitch adjustment and audio playback.

A subsequent prototype incorporated two turntables in a virtual DJ environment.

The original application used VRML 2.0, JavaScript, VRML Script nodes and ROUTE-based event handling.

Fundamental Requirement

The original 2000 VRML geometry must be preserved.

The objective is to resurrect and extend the original implementation, not replace it with newly modelled turntables.

Original .wrl source files must remain untouched and be preserved in the repository.

Proposed Technology

* TypeScript
* Three.js
* Vite
* glTF/GLB for converted geometry, where appropriate
* Web Audio API for future audio functionality

These are proposed technologies, not immutable requirements. Identify technical limitations before implementation.

Architecture

Separate the application into three principal concerns:

1. Rendering: Three.js scene management, geometry, materials, camera and lighting.
2. Simulation: Turntable mechanics, including platter rotation, tonearm positioning and control states.
3. Audio: Playback, pitch manipulation, mixing and eventual scratching.

The architecture should support two independently controllable decks.

Milestone 1 — Model Resurrection

Objective

Render the two original SL-1210 models in a modern browser.

Acceptance Criteria

1. Both original turntables render successfully.
2. Original geometry is preserved.
3. Colours, materials and textures are reproduced as faithfully as possible.
4. Camera supports orbit, pan and zoom.
5. Mechanical components remain individually identifiable for future animation.
6. Component transformations and pivot points are preserved where possible.
7. No audio playback or interactive turntable controls are required yet.

Important Technical Considerations

The original VRML files contain scene geometry alongside event routing, sensors, scripts and animation logic.

For this milestone, focus exclusively on recovering and displaying the geometry.

Inspect VRML Inline references and component dependencies before selecting a conversion strategy.

Do not assume that converting VRML to glTF will automatically preserve all transformations, hierarchies or pivot points.

Development Approach

Work incrementally.

Before implementing:

1. Inspect the original VRML files and their dependencies.
2. Identify the principal scene files and component hierarchy.
3. Evaluate suitable VRML conversion or loading mechanisms.
4. Recommend the simplest technically sound implementation.

Do not rewrite the original geometry.

Avoid unnecessary abstractions and additional dependencies.

Implement Milestone 1 only. Do not begin audio or simulation functionality without further instructions.

Longer-Term Vision

Eventually develop a functional browser-based virtual DJ application featuring two SL-1210 turntables, audio playback, variable pitch, scratching and mixing.

This is the eventual direction, not the scope of Milestone 1.