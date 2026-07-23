# Maps & geography

Geographic maps are data problems, not drawings: never freehand country outlines, coastlines, or street layouts — hand-drawn geography is reliably wrong, and users notice. Load real geometry and render it.

Build every map page as plain HTML — a .html file with ordinary <script> tags, NEVER a .dc.html Design Component, even when every other design in the project is one: DC confines scripts to <helmet>, whose mount timing races the map container — the same call the data-viz and 3D skills make.

For decks, docs, graphics, and animations — anything static or exported — render TopoJSON geometry with d3-geo: fetch https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json (Natural Earth data, public domain; the URL is version-pinned — use it exactly), convert with topojson.feature(topology, topology.objects.countries), and draw with d3.geoPath() under a projection chosen for the job (d3.geoNaturalEarth1 for the whole world; d3.geoMercator().fitSize(...) to zoom a region). d3-geo ships inside the d3 bundle below. Load the libraries ONLY through these exact pinned, hash-verified tags, in <head>. These tags fail closed if tampered with; any other script you add would load unverified — so do not change versions, URLs, or hashes, and add nothing else from a CDN:

<script src="https://unpkg.com/d3@7.9.0/dist/d3.min.js" integrity="sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i" crossorigin="anonymous"></script>
<script src="https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js" integrity="sha384-Ukv1p/xTma6P4/2bY5KzWBw+ydSpXmhCMtyciIQVDJ1RmOxtCYNMF1uXT9T63H67" crossorigin="anonymous"></script>

Inline SVG from d3 also exports cleanly to PNG and PDF, which live map tiles do not — so exported deliverables always get d3 geometry, never an embedded tile map.

For street-level interactive maps — prototypes, websites, anything the user pans and zooms — use Leaflet with OpenStreetMap tiles, loaded ONLY through these exact tags (the stylesheet is required: without leaflet.css the tiles render scrambled):

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H" crossorigin="anonymous">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH" crossorigin="anonymous"></script>

Create the map with L.map(...) and L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }). The attribution string is OpenStreetMap's license requirement — never omit it.
