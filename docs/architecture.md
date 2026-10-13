# Architecture proposal

Status: initial architecture proposal, updated after building the first chapter prototype.

## Product and scope

A browser-based analog electronics course progressing through intuition, mathematical analysis, practical design, measurement, and independent problem solving. Use the source contents as a coverage index while writing original explanations, derivations, examples, and exercises.

The supplied index covers Chapters 1–8 and Chapter 9 through §9.3.2. Maintain a separate curriculum map with stable lesson IDs, prerequisites, objectives, source references, and editorial status. One book section may require several lessons; several sections may feed one lesson.

Retain switching devices, analog switches, power conversion, noise, oscillators, and relevant mixed-signal interfaces. Defer digital logic design, DSP/DDS implementation, and counter-based timing. Consider analog PLL concepts later. The supplied Chapter 9 excerpt is incomplete.

## Platform

Recommend Astro + MDX for prebuilt lesson pages, with React + TypeScript for interactive labs. MDX supports prose and embedded components; Astro supports selectively interactive pages. Put a coupled schematic, controls, equations, and plots inside one lab component with one state owner.

Use KaTeX for equations after checking pilot notation, SVG for schematics and plots, and browser storage for initial progress with versioned export/import. Start with a small SVG plotting abstraction; choose additional plotting libraries from demonstrated needs.

Deploy as a static site initially; provider undecided. Accounts and synchronization can be added later. Reconsider a full application shell if freeform circuit editing becomes the dominant activity.

References:
- https://docs.astro.build/en/concepts/islands/
- https://mdxjs.com/docs/
- https://ngspice.sourceforge.io/shared.html

## Proposed structure

- docs/: source index, architecture, curriculum map, editorial guide.
- src/content/lessons/: MDX lessons.
- src/curriculum/: stable IDs, prerequisites, objectives, coverage.
- src/components/lesson/: derivation steps, hints, worked examples.
- src/components/labs/: coupled interactive experiences.
- src/circuits/: electrical definitions, symbols, authored layouts.
- src/engine/: quantities, analytical models, solvers, analysis.
- src/exercises/: prompts, solutions, validation rules.
- src/progress/: versioned local progress and exports.
- tests/: numerical, content, interaction, and visual checks.

Start as one project with internal modules. The pilot now includes a chapter, two interactive divider figures, a static equivalent-circuit figure, and a separate practice page.

## Pedagogy and authoring

Each lesson declares its objectives, prerequisites, math prerequisites, model assumptions, source references, and editorial status.

Lesson sequence:
1. Practical question and prediction.
2. Physical intuition, units, vocabulary, and reference directions.
3. Model assumptions.
4. Step-by-step derivation with reasons for each step.
5. Several worked examples with different constraints.
6. Interactive experiment with observation prompts.
7. Nonideal behavior, sensitivity, and misconceptions.
8. A separate practice collection with staged hints and complete solutions; no exercise is required per circuit.
9. Design or troubleshooting task and mastery checks.

Use progressive depth: intuition, analysis, design mastery. Supply just-in-time math lessons for algebra, calculus, differential equations, complex numbers, Laplace/Fourier methods, probability, and numerical methods. Prerequisites guide navigation without forcibly locking pages.

Track planned, outlined, drafted, numerically checked, visually checked, and reviewed separately. Reading completion is not mastery.

## Circuit representation and visual quality

Use a typed electrical graph containing stable component IDs, terminal-to-node connections, values, model choices, and probes. Store layout coordinates, orientation, labels, wire paths, and annotations separately.

The graph is authoritative for connectivity. A wire crossing never establishes a connection. Drawing, calculations, highlighting, and later netlist export refer to the same IDs.

Author teaching layouts on a consistent grid with conventional symbols, explicit junction dots, voltage polarities, current arrows, and reference nodes. Prioritize generous spacing and predictable signal flow. Prefer deliberately authored layouts before automatic routing.

Render in SVG for crisp zoom and export. Provide textual circuit descriptions, keyboard-accessible controls, and cues beyond color. A freeform drag-and-drop editor is a later project.

## Numerical architecture

Keep pure numerical functions separate from React and prose. Use SI values internally with unit-aware input/output boundaries, engineering-prefix formatting, valid parameter ranges, and explicit reference directions.

Stage 1: analytical models for dividers, equivalents, RC/RL behavior, impedance, ideal amplifiers, and selected filters.

Stage 2: a bounded modified nodal analysis solver for supported linear DC and small-signal AC circuits, with singular-circuit diagnostics. Add transient analysis only with timestep and error controls.

Stage 3: evaluate SPICE for nonlinear models and richer transient behavior. ngspice has a shared-library interface; a browser WebAssembly integration requires a separate feasibility study. Compare packaging, licensing, model support, performance, and download size against an optional simulation service. Do not assume a ready-made browser integration.

Use Web Workers for expensive work and discard obsolete results. Identify the active model and assumptions in every lab. Report unsupported circuits and convergence failures explicitly.

Validate using independent hand calculations, conservation checks, limiting cases, and reference simulations. Simulation alone does not establish correctness.

## Interactive labs

One lab state coordinates the schematic, values, equations, probes, and plots. Include unit-aware inputs, bounded sliders, exact values, reset, presets, and model selection. Save reproducible settings through versioned URLs or exports.

Add time traces, Bode plots, phasors, load lines, device curves, tolerance sweeps, and noise/error budgets as lessons require them. Specify peak/RMS conventions, dB reference, frequency units, and phase convention.

Offer optional prediction prompts where useful; do not gate exploration. Highlight relationships between components and equation terms. Give each interaction a learning purpose.

## Exercises and progress

Support conceptual reasoning, numeric answers with units, prediction, derivation, constrained design, and fault diagnosis.

Keep prompts, hints, complete solutions, misconception feedback, and grading rules separate from presentation. Numeric grading needs absolute/relative tolerances and unit conversion. Seed randomized variants, constrain their domains, and independently verify their solutions.

Design tasks may have many valid answers; grade constraints. Use rubrics and self-assessment for open-ended reasoning initially. Automatic symbolic or AI grading is not assumed.

Track attempts and demonstrated skills separately from page visits. Browser-stored solutions are inspectable; this is a self-study tool rather than a secure examination platform.

## Rough design direction

A quiet technical textbook with an adjacent workbench: strong typography, spacious equations, large diagrams, and restrained color. Use consistent semantic accents for input, output, reference, and selection.

Use a reading column plus lab on wide screens and a stacked layout on small screens. Allow lab expansion. Support keyboard use, contrast, reduced motion, accessible math, plot data summaries, and printing.

Create three representative design studies before expanding: a derivation-heavy page, an interactive lab, and a worked solution.

## First complete lesson

Pilot: the loaded voltage divider.

Provide prerequisites for voltage, current, resistance, Ohm's law, KCL/KVL, and algebra.

Include:
- Unloaded and loaded derivations from circuit laws.
- Comparison with a Thévenin equivalent.
- Worked examples for divider selection, instrument loading, and a constrained output target.
- A labeled schematic with source/resistance/load controls.
- Output-versus-load plot and unloaded limiting case.
- Current, dissipation, and tolerance analysis.
- Prediction, calculation, design, and troubleshooting exercises with hints and solutions.

Acceptance: independently checked results, mobile and desktop readability, keyboard control, no label collisions, useful feedback, reloadable state, and readable print/export.

Next build an RC transient/frequency lesson to test differential-equation pedagogy and plot reuse. Later use BJT biasing to establish nonlinear model requirements.

## Incremental delivery

1. Agree on learner starting point, scope, lesson template, and visual direction.
2. Outline prerequisites and create the curriculum cross-reference.
3. Build and review the voltage-divider lesson end to end.
4. Revise the authoring and interactive components.
5. Build the RC pilot and verify reuse.
6. Expand in small reviewed lesson groups.
7. Add richer simulation and longer design projects when justified.

Keep content, circuits, exercises, and numerical changes reviewable in version control. Do not generate the entire course in one pass.

## Confirmed teaching direction and pilot implementation

Practice is separate from chapter illustrations. A circuit can be illustrative, linked to a graph, interactive, or any useful combination. Do not require a fixed circuit/exercise pairing.

The pilot implements original MDX prose, KaTeX equations, SVG circuits, two React labs, a logarithmic loading plot, browser-local saved settings, and five standalone practice problems with hints and worked solutions. No automatic grading or learning-progress tracking is implemented.

The numerical engine currently models a fixed divider topology. A shared parameter object drives its diagram and calculations. The proposed general graph, netlist exporter, and generic solver remain future work; they are not prerequisites to reviewing this chapter.

Review the prototype for prose density, derivation depth, circuit style, controls/plots, and separation of reading from practice before expanding the curriculum.

## Foundations expansion

Four reading chapters and four separate practice pages are now implemented. Shared chapter metadata drives desktop and mobile navigation. A reusable plotting component and control components support the new Thévenin, diode small-signal, and heating experiments. Static supporting schematics remain independent teaching elements. See curriculum-map.md for scope and assumptions.

Numerical model tests now check nodal equivalence and conservation, diode slope by finite differences, and thermal energy balance. Plot coordinates are rounded for consistent server/browser rendering; range controls remain disabled until their event handlers are ready.

## Passive-component expansion

Eleven reading chapters and eleven practice pages are implemented. Seven added figures share LabControls and Plot; Plot supports logarithmic axes for capacitor impedance. Pure models in passives.mjs keep SI calculations independent of display units and are checked using conservation, differential equations, limiting cases, and complex-response identities.

The longer curriculum uses a collapsible chapter index, a scrollable mobile menu, and previous/next reading links. Separate practice totals 38 problems. No generic solver, saturation simulation, automatic grading, or account system is implied by this expansion.

## Diodes and supplies

Six further reading chapters and their separate practice pages bring the course to 17 chapters and 62 problems. DiodeLabs contains seven figures, including interactive bridge current paths. diodes.mjs includes the first piecewise transient integration: a backward-Euler reservoir-rectifier calculation with finite source resistance and state-consistent conduction. Periodic charge balance and timestep convergence supplement analytical-model tests. This is a bounded teaching model, not a general transient solver.

PN electrostatics, exponential diode behavior, idealized regulators, clipping and winding-clamp release each state their assumptions separately. Constant-temperature diode controls do not imply physical temperature modeling. Regulator saturation and flyback zero-current boundaries are handled explicitly.

## Protection and impedance chapters

Eight further reading chapters bring the course to 25 chapters and 102 problems. Shared schematic primitives (src/components/Parts.tsx: resistor, capacitor, inductor, diode, source, switch, ground, labels) replace per-file drawing helpers for new figures, and a reusable PhasorDiagram renders complex-plane arrows with tip-to-tail placement. Static teaching figures live in src/components/Figures.tsx and render at build time without hydration. Plot now clips curves to its axes, so Bode and impedance curves can run off-scale safely.

src/engine/ac.mjs holds the complex-number toolkit and steady-state AC models; src/engine/protection.mjs holds the protection transients. The hot-plug model is the second piecewise transient integration (after the rectifier) and uses explicit diode state switching. Both engines have independent numerical tests. A general MNA/AC solver remains future work; each lab still uses a fixed, authored topology.

## Bipolar transistor chapters

Nine further chapters (26–34) bring the course to 34 chapters and 147 problems. src/engine/bjt.mjs holds a device-physics model, Ebers–Moll with the Early effect, and solveStage, a single-NPN solver (Thévenin base drive, collector and emitter resistors) used by several labs; first-model helpers remain for chapters that precede Ebers–Moll. A Bjt symbol was added to Parts.tsx. Plot now breaks polylines at non-finite points, so curve families can share one legend entry.

## Amplifier building blocks (Chapters 35–41)

src/engine/stages.mjs adds multi-transistor solvers built from the Ebers–Moll function of bjt.mjs (mirrors, differential pair, push–pull, compound pairs, paralleled devices) and a general complex nodal-analysis routine (`nodal`) with admittance, transconductance and current-injection stamps. The bootstrap and Miller labs are the first to use nodal analysis rather than a closed-form transfer function—a step toward the generic small-signal solver proposed above. Labs live in src/components/StageLabs.tsx. Chapters 42–46 were developed concurrently in a separate session (see docs/feedback-control.md); chapters.ts is kept sorted by chapter number so navigation follows the book order.

## Parts and chapter numbering (reorganized October 2026)

Chapters are grouped into seven parts defined in `src/curriculum/parts.ts`; each part is a set of units with contiguous
chapter ranges. The sidebar, mobile chapter list, topbar, footer, `/contents/` page and every chapter's eyebrow label are
derived from it, and the previous/next pager announces part boundaries.

| Part | Title | Chapters |
| --- | --- | --- |
| I | Foundations & passive circuits | 1–18 |
| II | Semiconductors & transistors | 19–71 |
| III | Op amps, noise & precision | 72–96 |
| IV | Power electronics | 97–109 |
| V | Electromagnetics & RF | 110–120 |
| VI | The analog–digital boundary | 121–125 |
| VII | Digital electronics & interfaces | 126–133 |

Chapter numbers are display labels only; URLs use chapter ids, so renumbering never breaks links. The old-to-new map used
for the reorganization (all internal "Chapter N" references were rewritten with it; textbook chapter citations were left
alone) is: 1–11 unchanged; AC 19–25 → 12–18; diodes 12–18 → 19–25; 26–43 unchanged; 45 → 44; FETs 47–53 → 45–51;
MOS 57–76 → 52–71; op amps 77–94 → 72–89; precision 95–97 → 90–92; power 44 → 93, 98 → 94, 54–56 → 95–97, 99–101 → 98–100;
RF 104 → 102, 102 → 104, 103 → 106, 105 → 108 (new chapters 101, 103, 105, 107); converters 106–110 → 109–113;
digital 46 → 114, 111–113 → 115–117. New chapters take the next number inside their unit and require extending that
unit's range in `parts.ts`.

### Second expansion (October 2026)

Eighteen chapters were added and the protocol chapters split. Existing chapters were renumbered with this map:
1–89 unchanged; precision references 90 → 95, noise/grounding 91 → 94, calibration 92 → 96; regulated supplies
93 → 98, linear regulators 94 → 99; power MOSFET chapters 95–97 → 102–104; buck 98 → 105, boost/isolated 99 → 106,
control/layout 100 → 108; EM fields 101 → 110, transmission lines 102 → 111, RF components 103 → 112, matching
104 → 113, oscillators/PLL 105 → 116, signal chains 106 → 118, antennas 107 → 119, differential pairs 108 → 120;
converters 109–113 → 121–125; BJT logic 114 → 126, logic timing 115 → 127. The former 116 (board protocols) and
117 (cable interfaces) were replaced by 129–133.

New chapters: 90 noise-fundamentals, 91 transistor-noise, 92 opamp-noise, 93 noise-measurement, 97 line-supplies,
100 regulator-ics, 101 thermal-soa, 107 isolated-offline, 109 batteries-protection, 114 rf-amplifiers, 115
rf-filters, 117 modulation, 128 digital-signal-integrity, 129 uart-rs232, 130 spi-interfaces, 131 i2c-bus,
132 rs485-can, 133 usb-ethernet. Figures live in NoiseFigures.tsx, PowerFigures.tsx, RfFigures.tsx and
DigitalFigures.tsx (which provides a reusable `Timing` diagram component).
