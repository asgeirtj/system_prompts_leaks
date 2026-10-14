---
name: threejs
description: Three.js 3D reference hub. Use when working with Three.js: pick the topic below and read its file for patterns and API guidance.
source: https://github.com/CloudAI-X/threejs-skills
license: MIT
---

# Three.js

This skill is a hub: one catalog row pointing at ten topic references.
When the task touches a topic, read that topic's file in one hop: join
its `references/threejs-<topic>.md` path against the `skill-dir` value in
this body's wrapper header and pass the absolute path to `read_file`.

- `references/threejs-fundamentals.md` — scene setup, cameras, renderer, Object3D hierarchy, coordinate systems.
- `references/threejs-geometry.md` — built-in shapes, BufferGeometry, custom geometry, instancing.
- `references/threejs-materials.md` — PBR, basic, phong, shader materials, material properties.
- `references/threejs-lighting.md` — light types, shadows, environment lighting.
- `references/threejs-textures.md` — texture types, UV mapping, environment maps, texture settings.
- `references/threejs-animation.md` — keyframe and skeletal animation, morph targets, animation mixing.
- `references/threejs-loaders.md` — GLTF, textures, images, models, async loading patterns.
- `references/threejs-shaders.md` — GLSL, ShaderMaterial, uniforms, custom effects.
- `references/threejs-postprocessing.md` — EffectComposer, bloom, depth of field, screen effects.
- `references/threejs-interaction.md` — raycasting, controls, mouse/touch input, object selection.
