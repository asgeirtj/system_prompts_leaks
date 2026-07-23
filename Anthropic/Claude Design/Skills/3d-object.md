# 3D object

Model a 3D object the user can inspect from every angle and download,
built with three.js and presented in the three_d_stage starter.

START by calling copy_starter_component with kind: "three_d_stage.js" —
it is the whole viewer: studio lighting, ground shadow, orbit controls,
an auto-framed camera, and a toolbar that downloads the object as
OBJ + MTL or GLB. Read the copied file's usage block and follow its page
skeleton exactly. You only write the model-building module script.

Build the page as plain HTML — a .html file with ordinary <script>
tags — even when the project's other designs are .dc.html Design
Components: DC restricts scripts to <helmet>, which races the stage's
mount and can't host this skeleton.

Load three.js ONLY through this exact pinned import map, in <head>,
before any module script. Do not change versions, URLs, or hashes, do
not add other copies of three.js, and do not import addons beyond the
three listed — the map is deliberately a closed set, so anything else
fails to resolve rather than loading unverified:

<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.184.0/build/three.module.js",
    "three/addons/controls/OrbitControls.js": "https://unpkg.com/three@0.184.0/examples/jsm/controls/OrbitControls.js",
    "three/addons/exporters/OBJExporter.js": "https://unpkg.com/three@0.184.0/examples/jsm/exporters/OBJExporter.js",
    "three/addons/exporters/GLTFExporter.js": "https://unpkg.com/three@0.184.0/examples/jsm/exporters/GLTFExporter.js"
  },
  "integrity": {
    "https://unpkg.com/three@0.184.0/build/three.module.js": "sha384-8FCZ1eVO6it4+pbec2aDtnTrwjWXZLJRC+MAGCIPDgsYnUrl/E0A2YlF8ioMKI/J",
    "https://unpkg.com/three@0.184.0/build/three.core.js": "sha384-dw2ooPewaEIrAgl6oFDBmmBWCE9oW9LxRGcfwZ0hLvEprzo202wXl7vCYHRlSnOT",
    "https://unpkg.com/three@0.184.0/examples/jsm/controls/OrbitControls.js": "sha384-4rziNxOBZKQ69i+w+f89KJ55TCYquwchVbByQwmaOeIOXdOU2PLDn3kOfXHwIJC9",
    "https://unpkg.com/three@0.184.0/examples/jsm/exporters/OBJExporter.js": "sha384-nbwtoZENJD3Vq+ACK0CuGQdPMuDWHkamC2KJD70EV5nfg6jQjfppKOea07YJN+N3",
    "https://unpkg.com/three@0.184.0/examples/jsm/exporters/GLTFExporter.js": "sha384-VofkvpG6HERhFCYbsUOHeNXBCqID2nfqkQqnVzE1jc/oPcz+qJ13ADdXH08hE+cQ"
  }
}
</script>

Build the model programmatically, as a THREE.Group composed of named
parts:
- Compose primitives (BoxGeometry, CylinderGeometry, SphereGeometry,
  TorusGeometry, LatheGeometry, ExtrudeGeometry with Shape) before
  reaching for raw BufferGeometry; real objects decompose into far more
  primitives than you'd guess.
- NAME every mesh and every material ("hull", "walnut", "brass") — the
  names become the o / usemtl entries in the exported OBJ and the node
  names in the GLB, which is what makes the download usable in Blender.
- Use MeshStandardMaterial with a small curated palette (3-5 materials,
  shared across parts); set roughness/metalness deliberately. Textures
  don't survive the OBJ export — prefer geometry and material color over
  texture detail.
- Model in real-world meters, y-up, centered on the origin, base resting
  at the lowest y. Offset deliberately coplanar faces by ~0.001 so
  nothing z-fights.
- Curved surfaces need enough segments to read as smooth at full screen
  (32+ radial segments on feature surfaces), but don't tessellate what
  no one will see.

The stage's toolbar gives the user OBJ + MTL (universal, geometry +
per-material colors) and GLB (the modern interchange format — keeps the
part hierarchy and PBR materials; imports cleanly into Blender, Maya,
Cinema 4D, Unity, Unreal). Those two are the export formats on offer —
when the user asks for something else (FBX, USDZ, STEP), say plainly
that the stage exports OBJ + MTL and GLB.

Iterate with screenshots: the stage keeps its last frame readable, so
the ordinary screenshot tools capture the live canvas — no extra steps.
After editing a module file, reload with show_html before screenshotting
(the iframe caches already-loaded modules). Look at the object from the
default framing and refine silhouette, proportion, and material
separation — the silhouette carries the object.
