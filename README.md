# The Analog Notebook

A browser-based analog electronics learning tool, developed incrementally around original explanations, derivations, examples, and interactive experiments.

## Run locally

Requires a Node.js version supported by the installed Astro release (developed with Node 24).

    npm install
    npm run dev

Open the local address printed by Astro, normally http://127.0.0.1:4321/.

    npm test
    npm run build
    npx tsc --noEmit

## Hosted notebook

The published notebook lives at https://hebert.phd/electronics/. It is a static
section of the existing Cloudflare Pages site; the personal homepage has no link
to it. All 56 chapters and their practice pages are included, with interactive
experiments running in the browser.

Push updates to `main` in this repository to deploy automatically. GitHub Actions
runs the tests, builds and checks the hosted notebook, then syncs only
`public/electronics` into the hebert.phd repository. Its existing Cloudflare Pages
integration publishes the update. See [deployment details](docs/deployment.md)
for the workflow, credential, and troubleshooting information.

The normal local build still uses `/`. To prepare a manual update for the hosted path:

```bash
npm run build:hosted
npm run check:hosted
git -C ../hebert.phd pull --ff-only
node scripts/stage-hosted.mjs ../hebert.phd
```

The staging command replaces only the generated `public/electronics` directory
in the hebert.phd checkout. Review and commit that directory in the host
repository, then push to `main`; its existing Cloudflare Pages integration
publishes the update. The homepage source and build configuration need no edits.
`check:hosted` verifies all 112 HTML pages and their local links, scripts, styles,
React island modules, and font assets under `/electronics`.

## Chapters

| Chapter | Reading | Separate practice |
| --- | --- | --- |
| Voltage dividers and loading | / | /practice/ |
| Thévenin equivalent circuits | /thevenin/ | /thevenin/practice/ |
| Small-signal resistance | /small-signal/ | /small-signal/practice/ |
| Power dissipation and heating | /power/ | /power/practice/ |
| Capacitors: charge and energy | /capacitors/ | /capacitors/practice/ |
| RC circuits | /rc-circuits/ | /rc-circuits/practice/ |
| Differentiators | /differentiators/ | /differentiators/practice/ |
| Integrators | /integrators/ | /integrators/practice/ |
| Ideal and real capacitors | /real-capacitors/ | /real-capacitors/practice/ |
| Inductors | /inductors/ | /inductors/practice/ |
| Transformers | /transformers/ | /transformers/practice/ |
| Semiconductor physics | /semiconductors/ | /semiconductors/practice/ |
| Diode properties & models | /diodes/ | /diodes/practice/ |
| Rectification & filtering | /rectifiers/ | /rectifiers/practice/ |
| Voltage regulators | /regulators/ | /regulators/practice/ |
| Diode circuit applications | /diode-applications/ | /diode-applications/practice/ |
| Inductive-load protection | /diode-protection/ | /diode-protection/practice/ |
| Protection & bypass diodes | /protection-circuits/ | /protection-circuits/practice/ |
| Sinusoids, complex numbers & phasors | /phasors/ | /phasors/practice/ |
| Impedance & reactance | /impedance/ | /impedance/practice/ |
| Power in reactive circuits | /reactive-power/ | /reactive-power/practice/ |
| Dividers generalized & RC filters | /rc-filters/ | /rc-filters/practice/ |
| Poles, slopes & band filters | /poles/ | /poles/practice/ |
| Resonance & LC filters | /resonance/ | /resonance/practice/ |
| Thévenin generalized & capacitor uses | /ac-thevenin/ | /ac-thevenin/practice/ |
| Transistor physics | /transistor-physics/ | /transistor-physics/practice/ |
| The bipolar transistor & switch | /bjt/ | /bjt/practice/ |
| The emitter follower | /emitter-follower/ | /emitter-follower/practice/ |
| Biasing transistor stages | /bjt-biasing/ | /bjt-biasing/practice/ |
| The small-signal model | /bjt-small-signal/ | /bjt-small-signal/practice/ |
| Transistor current sources | /current-sources/ | /current-sources/practice/ |
| The common-emitter amplifier | /common-emitter/ | /common-emitter/practice/ |
| Phase splitter & transconductance | /transconductance/ | /transconductance/practice/ |
| The Ebers–Moll model | /ebers-moll/ | /ebers-moll/practice/ |
| Current mirrors | /current-mirrors/ | /current-mirrors/practice/ |
| Differential amplifiers | /differential-amplifiers/ | /differential-amplifiers/practice/ |
| Push–pull output stages | /push-pull/ | /push-pull/practice/ |
| The Darlington connection | /darlington/ | /darlington/practice/ |
| Bootstrapping | /bootstrapping/ | /bootstrapping/practice/ |
| Current sharing in parallel BJTs | /current-sharing/ | /current-sharing/practice/ |
| Capacitance & the Miller effect | /miller-effect/ | /miller-effect/practice/ |

Practice is separate from illustrative material. A circuit may be static, interactive, linked to a plot, or part of a worked explanation without requiring an attached problem. There are 207 practice problems with hints and worked solutions; grading is by self-assessment.

## Organization

- docs/analog-toc.md: supplied source index, preserving the incomplete Chapter 9 excerpt.
- docs/architecture.md: proposed architecture and implementation decisions.
- docs/curriculum-map.md: current coverage and modeling limitations.
- src/content/*.mdx: original chapter content.
- src/content/practice.json: problems for Chapters 2–41 (Chapters 42–46 use src/content/feedback-practice.json).
- src/curriculum/chapters.ts: navigation metadata.
- src/components/: authored SVG illustrations, React labs, plotting, and equations.
- src/engine/: pure analytical models, independent of the interface.
- tests/: numerical checks, conservation laws, and limiting cases.

The current figures use fixed, deliberately authored topologies. A general circuit graph/netlist system is deferred. Models include ideal resistive DC circuits, a fixed-temperature exponential diode, and a single-node constant-power thermal system. Passive models add capacitor charging, RC transients and sinusoidal responses, C–ESR–ESL impedance, RL charging and clamped turn-off, and ideal transformer ratios with a separate flux estimate. Diode models add PN depletion, exponential operating points, finite-source-resistance rectifier transients, idealized shunt/series regulators, voltage limiters, and resistive-winding flyback energy. Protection models add reverse-polarity topologies, an LC hot-plug transient with an optional bypass diode, and a discontinuous-mode boost cycle. AC models (src/engine/ac.mjs) cover complex arithmetic, two-terminal R/L/C networks, complex power and correction, loaded RC filters, cascaded poles, band-pass, twin-T, series and parallel resonance, LC filters, supply bypassing and AC Thévenin equivalents. Transistor models (src/engine/bjt.mjs) cover a one-dimensional short-base NPN (β from emitter efficiency and base transport, Early voltage, transit time, V_BE temperature coefficient), Ebers–Moll in all regions with the Early effect, and a single-stage solver used by the switch, bias, current-source, amplifier and output-curve experiments. Building-block models (src/engine/stages.mjs) cover five current-mirror topologies, the long-tailed pair, push–pull stages with harmonic analysis, Darlington and Sziklai switches, electro-thermal current sharing, and complex nodal analysis for bootstrapping and Miller-effect frequency responses. These teaching models do not select or certify real components.

The original divider figures save settings locally. The newer experiments reset on navigation. There are no accounts or learning-progress tracking yet. Google Fonts are optional external assets with system-font fallbacks.



## Feedback and control

Chapters 42–46 add feedback fundamentals and transistor applications, regulated power supplies, temperature control, and BJT/diode logic. See docs/feedback-control.md for scope, model assumptions and verification. Their 25 practice problems live in src/content/feedback-practice.json, merged by the practice route. Chapters 35–41 (current mirrors through the Miller effect) are the amplifier building blocks of AoE §§2.3.7–2.4.5; see docs/curriculum-map.md.
