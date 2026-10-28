# DIIGOO interactive website — WebGL rig edition

<p align="center">
  <img src="dist/assets/diigoo-voxel-reference.png" alt="Diigoo Voxel Character" width="300" />
</p>

DIIGOO's company website, using the user-selected SEBG reference for typography, colours, pinned reading, character-led navigation and mobile corner companion behavior. Content describes DIIGOO and its own products; the reference developer's projects and identity are not presented as DIIGOO work.

## Run

Node.js 18+:

    npm start

Open http://localhost:3000. No dependency installation or build is required. All rendering libraries are included locally.

Alternative: `python3 -m http.server 3000 --directory dist`.

Run JavaScript syntax checks with `npm run check`.

## Source

- `dist/index.html`: company copy, project links, accessible page structure, action menu.
- `dist/tour.css`: Funnel Display / Space Grotesk typography, reference-led grid, blue/paper colours, responsive layouts and character badge.
- `dist/tour.js`: scroll scene coordination, progressive intro text, character narration, menu and service controls.
- `dist/character-webgl.js`: independently authored articulated human host in Three.js: sage sweater, pale skin, brown curls, tan beard, expressive eyes, arms, fingers, mouth, drag/pickup and joint-based gestures.
- `dist/software-renderer.js`: CPU projection of the same rig when WebGL is unavailable. Lower frame rate and lower surface detail than WebGL; the host still animates instead of disappearing.
- `dist/vendor/`: locally bundled Three.js 0.180.0 and its MIT license. This is the only runtime rendering dependency.
- `dist/assets/diigoo-voxel-reference.png`: user's earlier uploaded mascot artwork, retained as a last-resort image fallback. The latest request for reference-style character likeness superseded the voxel character.
- `server.mjs`: dependency-free local preview server.

## Character actions

Say hi, Explain, Dance, Spin, Think, Panic, Fly, Vanish. Drag horizontally to rotate, lift by dragging upward, release to settle. Vertical touch gestures remain available for page scrolling. Pause freezes the animation clock and pose; reduced-motion preferences start paused.

The mascot is procedural geometry and not an exact copy or imported model from SEBG. Website-specific source and character code from SEBG are not bundled. The renderer and interactions were authored for this project; Three.js is bundled under its license.

## Edit

Change content in index.html. Section narration is in `data-speech` attributes. Action narration and scroll routes live in tour.js. Geometry, colours, pose targets and action durations live in character-webgl.js. Layout breakpoints and type scale live in tour.css.

Google Fonts supplies Funnel Display and Space Grotesk, with local system-font fallbacks. No analytics, cookies, credentials, or API keys are included.

## Deploy

Publish `dist/` to any static web host at the domain root. There is no build step, database, or server requirement. Root-relative asset paths must be adjusted for subdirectory deployment. The local Node server is for preview; use your normal production static host.

Contact opens a visitor's email app; Copy email uses Clipboard over HTTPS/localhost. No enquiries are automatically sent or stored. Connecting diigoo.com requires configuring that domain with your selected host and is not performed by this source export.

## Verification and limits

Syntax and archive checks passed. Desktop and phone browser layouts and action/menu states were inspected. The available preview browser disables WebGL, so it exercised the same-rig software fallback. GPU lighting and frame rate could not be visually verified here. Real-device checks in Safari iOS and Chrome Android remain necessary before replacing a public company domain. Exact pixel parity with the reference is not claimed.

## Screenshot-directed UI and motion pass

The supplied SEBG screenshots were inspected directly. Updated the host with monochrome ordered dithering, larger oval eyes, a swept hair silhouette, open smiling mouth, and bottom-cropped desktop bust. The model remains independently authored; exact likeness or pixel parity is not claimed.

Featured products now use pinned navy/lavender/mist chapters, alternating left/right host staging and browser+phone compositions. These are explicitly labelled illustrative product presentations, not screenshots of released product interfaces. A separate All products grid follows the featured chapters. Narrow-screen header overflow was corrected. Mobile narration fades after a short interval and the corner host becomes a portrait.

Motion now uses local action timelines, elapsed-time blending, a continuous scroll route, manual-action priority, completed-turn queuing and a cancellable anchor-scroll controller. The CPU fallback now uses lightweight analytic projections, with the same articulated pose and monochrome treatment. It can differ visually from WebGL lighting. GPU remains unavailable in the preview browser; fallback views and action states were exercised.

### Later-section mascot correction
Desktop portrait position, circular crop, and camera framing now share the scroll route. The dock uses measured stage dimensions, including short/wide viewports. Canvas resolution uses layout dimensions, avoiding scaled low-resolution render buffers on direct section links. JenAI presents with the content-facing arm. The idle expression returns to a smile. Verified in desktop and 320/390px mobile previews using the software renderer; this environment does not support WebGL.

### Large chapter and closing poses
Cybious remains large until the product index begins. Only the product index uses the desktop corner portrait; expertise and process return to large left poses, and contact expands to a large right greeting on a dark background. Mobile Cybious and contact reserve a content slot for the large character. Desktop and 320/390px mobile software-renderer previews checked; GPU WebGL remains unavailable in the QA browser.

### Restored mobile motion and optional sound
Restored the pre-mobile-rebuild layout and scroll-controlled mascot route as requested, retaining the large Cybious and contact poses and existing desktop composition. Added original, synthesised gesture and transition sounds through Web Audio with an accessible sound toggle, silent by default and activated only by a visitor click. Audio stops when the page is hidden. Enable and mute controls and a running AudioContext were checked in the preview; audio fidelity and WebGL rendering are not independently verified by this environment. Public audience retained.

### Reference-informed sound revision
Replaced section beeps with short, pitch-varied narration blips paced at word intervals and throttled to 120ms. Added modulated grab/drop, spin, fly, vanish sounds and separate dance/panic note sequences; successful email copying has a bell cue. Manual gesture effects no longer fire for automatic explanation poses. Sound preference persists, starts only after a visitor gesture, and mute cancels active/scheduled voices and narration timers. The sound button preserves its SVG pointer target during AudioContext state changes. Verified running AudioContext, repeated speech blips, dance and grab/drop event routing, and mute/re-enable. Sound synthesis was tuned from observed functional parameters, with independently authored code. Exact perceived audio parity has not been audibly verified in this environment. Existing layouts and mascot routes remain unchanged.
