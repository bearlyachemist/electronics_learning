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
to it. All 117 chapters and their practice pages are included, with interactive
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
`check:hosted` verifies all 189 HTML pages (188 chapter/practice pages and the op-amp topic guide) and their local links, scripts, styles,
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

Practice is separate from illustrative material. A circuit may be static, interactive, linked to a plot, or part of a worked explanation without requiring an attached problem. There are 440 practice problems with hints and worked solutions; grading is by self-assessment.

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



The expansion notes below retain their original checkpoint numbering where
applicable. Current chapter order is defined by `src/curriculum/parts.ts` and
the [published contents](https://hebert.phd/electronics/contents/).

## Feedback and control

Chapters 42–46 add feedback fundamentals and transistor applications, regulated power supplies, temperature control, and BJT/diode logic. See docs/feedback-control.md for scope, model assumptions and verification. Their 25 practice problems live in src/content/feedback-practice.json, merged by the practice route. Chapters 35–41 (current mirrors through the Miller effect) are the amplifier building blocks of AoE §§2.3.7–2.4.5; see docs/curriculum-map.md.

## MOSFET and op-amp expansion

Chapters 57–76 provide twenty MOSFET circuit studies, from bias and mirrors
through cascodes, followers, differential pairs, complementary output stages,
two-stage gain and noise. Chapters 77–82 derive ideal/real op-amp properties
and compare original simplified BJT and CMOS internal constructions. Chapters
83–94 develop twelve application studies with numerical examples, checks and
three worked practice problems each. The 38 new chapters add 114 problems.

The six supplied textbooks guide technical coverage; see
[the reference map](docs/textbook-reference-map.md) for bibliography and inspected
sections. The published content and schematics are original. No source PDFs or
scanned figures are included. New content lives in `src/content/advanced/`, with
metadata in `src/curriculum/advanced-chapters.ts` and practice in
`src/content/advanced-practice.json`. Models in `mos-analog.mjs` and `opamp.mjs`
are verified against DC KCL/KVL, independent nodal equations and numerical slopes.

## Textbook synthesis across the complete book

Every one of the 117 reading chapters includes a Design synthesis section,
with an original worked design, equation, three numerical cases, practical
limits and cross-links. The 351 cases extend the chapter examples and compare
operating conditions rather than replacing the separate practice notebooks.
See [the synthesis coverage index](docs/synthesis-coverage.md) for the chapter
map, source roles and verification scope. These sections are independent of
ongoing prose/figure revisions and live in `src/content/synthesis.json`.

`npm run check:synthesis` verifies all published studies, chapter-section
targets and rendered math. The test suite checks representative numerical
quantities in every study against circuit equations or the independent engines.

## Practical explanations from the reference review

[The practical-depth index](docs/practical-depth-review.md) records 42 further
explanations integrated into the relevant chapter sections, with six original
figures. They cover component choices, measurement loading, charge and startup,
feedback architectures, internal bias, filter states and analog multiplication.
`npm run check:practical` verifies their published anchors, navigation and new
circuit relationships; `npm test` also checks the figure models and arithmetic.

## Op-amp and precision topic guide

The [published guide](https://hebert.phd/electronics/opamp-coverage/) maps all 26 top-level sections and 113 numbered subsections of TAOE Chapters 4–5 to Chapters 72–89. The full coverage pass adds original derivations, numerical operating points, solved self-checks and 13 additional teaching visuals. Each chapter was independently committed, verified and pushed. `check:precision` verifies the guide and critical connections in the new schematics; precision tests also check strict math and complex feedback KCL.


## Precision through digital systems

The [systems guide](https://hebert.phd/electronics/systems-coverage/) links 23
chapters on precision measurement, power conversion, electromagnetics and RF,
transmission lines, differential pairs, ADC/DAC architectures and digital
interfaces. They add 69 independent problems and 69 synthesis cases. See
[the systems coverage index](docs/systems-coverage.md) for chapter numbers,
reference roles, model limits and verification.

`npm run check:systems` checks the rendered guide, contents, chapter labels
and six critical circuit topologies. The test suite also verifies contiguous
numbering and part membership, antenna power integration and snubber energy.
