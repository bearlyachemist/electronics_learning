# Feedback and control expansion (chapters 42–46)

Chapters 35–41 are reserved for the concurrent transistor expansion. This work owns only the five chapters below and its dedicated model, figure, lab, and practice files.

| Chapter | Reading route | Main outcomes | Separate practice |
| --- | --- | --- | --- |
| 42 Negative feedback | /negative-feedback/ | Error and loop gain; exact gain and sensitivity; disturbance location; impedance; bandwidth; phase margin | 5 |
| 43 Feedback in transistor amplifiers | /transistor-feedback/ | Finite-beta degeneration; distortion versus gain; follower loop; collector feedback; two-stage global loop | 5 |
| 44 Regulated power supplies | /regulated-supplies/ | Discrete sensing and pass control; accuracy; dropout; current limit; SOA, heat and dynamics | 5 |
| 45 Temperature control | /temperature-control/ | Thermal energy balance; sensor polarity; P offset; PI, anti-windup and lag; hysteresis and BJT heater drive | 5 |
| 46 Simple BJT and diode logic | /bjt-logic/ | Diode steering; restoration; RTL NOR and DTL NAND; fan-out, noise margins, storage delay | 5 |

Prerequisites: transistor bias, small-signal models and common-emitter stages; complex frequency response for stability. Later transistor circuits can replace the simplified forward blocks without changing the feedback algebra.

## Files and ownership

- src/engine/feedback.mjs: independent numerical models.
- src/components/FeedbackFigures.tsx: static circuit and functional diagrams, reusing existing Parts symbols.
- src/components/FeedbackLabs.tsx: six interactive experiments.
- src/content/feedback-practice.json: 25 problems, kept separate from the shared practice collection.
- src/content/{negative-feedback,transistor-feedback,regulated-supplies,temperature-control,bjt-logic}.mdx: original prose and worked examples.
- tests/feedback.test.mjs: eight model checks.

The dynamic practice route combines both practice collections. The shared reading route and chapter metadata add only these chapter registrations. Display navigation sorts by chapter number so concurrently appended chapters retain their intended sequence.

## Models and limits

Feedback gain uses ideal static nonloading blocks. Disturbances at the output are distinguished from measurement errors. Stability uses a restricted stable three-real-pole forward model and constant feedback, with a cubic Routh check as well as the crossover phase margin.

Emitter degeneration is a constant-temperature exponential forward-active model at a readjusted fixed bias. It excludes Early effect, source loading, capacitance, saturation and self-heating; signal ranges keep the chosen 12 V/2.2 kΩ/1 mA example forward-active.

Supply behavior combines a finite-gain voltage loop, a fixed dropout boundary and ideal hard current limiting into a resistive load. Thermal estimates do not alter the electrical solution or guarantee SOA. Schematics identify functional blocks and omitted implementation details.

Thermal control uses a single thermal mass and optional first-order sensor lag. P, conditional-integration PI and a hysteretic thermostat drive a bounded heater. A 0.1-second timestep is checked against 0.05 seconds. The model does not include transistor driver losses in the thermal mass.

Logic uses stated constant junction drops to test intended truth and a conservative forced-beta current budget. A failed budget is shown as unverified voltage, not a falsely guaranteed logic level. Fan-out examples expose inadequately sized nominal gates rather than assuming unlimited loads.

## Verification

Eight new tests check feedback reconstruction and differential sensitivity; loop crossover/Routh agreement; transistor exponential KVL and finite-difference gain; supply KVL, limiting and power; thermal energy and equilibria; integration convergence and thermostat operation; truth tables and loaded current; invalid parameters.

All 61 numerical tests available at the regression run passed, including the concurrent transistor tests. Production build and TypeScript checks passed. Browser review covers controls, an unstable-loop case, supply limiting, PI convergence, logic fan-out failure, practice disclosures and responsive layouts. This is authored teaching content, not a device-qualified construction design.

