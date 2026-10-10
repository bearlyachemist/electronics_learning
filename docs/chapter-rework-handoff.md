# Chapter rework handoff

Updated October 10, 2026. The existing Claude work and this continuation remain uncommitted.

## Completed coverage

The supplied handoff identifies Chapters 1–18 and the Chapter 27 pilot as finished. The continuations now complete Chapters 19–26 and 28–56. That completes the chapter-by-chapter pass across all 56 chapters; the earlier pasted summary's “20 of 56” count was inconsistent with its chapter list.

Chapters 19–25 retain their existing house layout and explanations, with checked additions:

- 19: phase and time, phasor cancellation, amplitude derivation, scope-to-complex-gain example.
- 20: passive reference directions, parallel branch-current addition, measured impedance and series/parallel conversion.
- 21: reactive energy, correction current versus capacitance, harmonic current and true power factor.
- 22: explicit source/load transfer functions and a design checked against component tolerances.
- 23: unbuffered cascade KCL derivation, impedance scaling, twin-T and shelf diagrams.
- 24: resonance bandwidth, exact lossy parallel-resonance condition, loaded LC normalization and step overshoot.
- 25: local bypass loop, charge/ESR/inductance droop budget, coupling with source resistance, radio loading and snubber energy.

Each chapter now has five or six expandable self-checks, linked from the chapter navigation. `src/components/AcFigures.tsx` contains 23 static figures: seven migrated existing figures and sixteen new ones. The old AC figure exports were removed from `Figures.tsx`.

## Bipolar transistor and stage continuation

Chapter 26 and Chapters 28–41 now retain the house layout and add five expandable self-checks each, linked from navigation (75 new self-checks in this continuation). Chapter 27 remains the completed pilot.

- 26: exact minority-carrier profile and survival fraction, transport cross-section, base-width/gain tradeoff, Early-effect profiles, temperature curves, charge and speed budget.
- 28: source loading versus base-to-emitter gain, follower swing/current/heat budget, zener follower circuit.
- 29: complete divider bias circuit, beta/temperature spread, sensitivity and worst-case operating points.
- 30: hybrid-π diagram, bias-dependent parameter plots, exact versus approximate emitter resistance, curvature error.
- 31: current sink and compliance plot, active-region headroom and LED heat budget.
- 32: complete common-emitter circuit, degeneration plots and finite-bypass shelf derivation.
- 33: loaded phase splitter and known-load resistor balancing.
- 34: model limits, saturation/base-drive curve, basic mirror and combined error calculation.
- 35: all five mirror lab topologies, unequal-area base-current counting, helper versus Wilson wiring, Widlar sensitivities and compliance.
- 36: resistive and mirror-loaded differential-pair diagrams, quantitative linear range, input impedance and bias-current offset.
- 37: all three push–pull lab modes, class B powers, bias multiplier, class AB current sensitivity and heat budget.
- 38: single, Darlington and Sziklai connections, corrected quasi-complementary explanation, bleeder/charge removal and guaranteed input drive.
- 39: loaded/unloaded bootstrap circuits, complex phase sensitivity and capacitor/band limits.
- 40: individual ballast diagram, thermal sharing plot, explicit ballast sizing, mismatch and power budget.
- 41: full high-frequency hybrid-π diagram, Miller port equivalent, CE/cascode lab circuits including upper-device capacitances, source resistance and multiple-pole limits.

`BjtTheoryFigures.tsx` has 19 static exports and `StageFigures.tsx` has 17. `BipolarCircuits.tsx` and `StageCircuits.tsx` share diagrams between static teaching figures and live labs. `Figures.tsx` is now a compatibility re-export of the migrated stage figures.

## Feedback and FET completion

Chapters 42–56 now use the house section-heading layout, a chapter-specific opening question, a learning map and five expandable self-checks each, with matching navigation (75 more self-checks). Existing detailed explanations were retained and extended.

- 42: loop-gain accuracy requirement and error/sensitivity plot.
- 43: finite-transconductance sensitivity and local-feedback plot; collector feedback input is explicitly AC-coupled.
- 44: reference/divider/offset error allocation and normal-versus-fault pass heating.
- 45: numeric PI sensor-lag stability bound and comparative thermal responses.
- 46: joint fan-out, current and rise-time budget; corrected RTL and DTL circuits.
- 47: channel-charge profile and transconductance-per-current tradeoff.
- 48: parameter sensitivities and piecewise-compliance-aware JFET spread plot.
- 49: second-order degeneration derivation and FET differential-pair steering.
- 50: integrated RC thermal-noise calculation and actual Wien-network circuit.
- 51: simultaneous capacitor bounds for acquisition, injection and droop; sample/hold circuit.
- 52: body-effect follower calculation and threshold/body-connection comparison.
- 53: current-sink accuracy budget and amplifier-controlled MOS sink circuit.
- 54: closed temperature/resistance loss equation and gate/drain charge allocation.
- 55: continuous-current boundary, bootstrap refresh budget and synchronous buck power paths.
- 56: branch current versus power sensitivity and individual source/gate resistor circuit.

`FeedbackTeachingFigures.tsx` adds five static plots; `FetTeachingFigures.tsx` adds five plots and five circuit figures. `FeedbackFigures.tsx` and `FetFigures.tsx` now use anchor-based electrical drawings (the FET cross-section remains a conceptual illustration). Circuit changes include the missing JFET gate return, MOS amplifier bias divider and load, separate analytical gain circuit, properly connected source resistors, and opposing body diodes for back-to-back MOSFETs. Actual screenshots were used to catch and fix an op-amp wire route through its symbol, beyond connectivity lint alone.

## Shared corrections

- Repaired literal subscript notation in AC, BJT, transistor-stage, protection and feedback lab prose and headings. Controls, readouts, plot legends and SVG labels use their appropriate math rendering paths.
- React math now includes MathML for accessibility, matching chapter math.
- Schematic value text uses the existing `symbol-value` font style; its previous class had no style rule and caused overlapping labels.
- Removing the bypass capacitor no longer draws a wire that shorts the supply.
- Exact phasor cancellation displays undefined phase and zero instantaneous sum.
- LC lab natural frequency includes finite source/load resistance; the exact peaking frequency is sampled and gain is compared with DC gain.

- Base-transport depletion widths are converted from metres to micrometres before plotting on the drawing’s scale; the sweep no longer crashes when some collector voltages punch through.
- Follower waveform includes the drawn 10 kΩ source resistor’s base-current voltage drop. A new independent KCL/KVL test covers finite source resistance and cutoff.
- Zero small-signal amplitude no longer yields division-by-zero percentage errors.
- Phase splitter diagrams use stiff base bias and AC-coupled loads, matching their model.
- Wilson and Sziklai lab wiring now matches the engine’s actual connections.
- Bootstrap load is drawn and its coupling-capacitor assumptions are explicit; cascode drawing includes the upper device’s capacitances used by the solver.
- Corrected several prose claims: carrier-density ratio, junction-temperature scaling, MOSFET threshold versus specified on-resistance, package heating and transistor-type comparisons.

- JFET symbol gate lead now lands on its published anchor even though the arrow is near the source end.
- Self-bias solver supports both resistors set to zero; existing KVL/channel-law tests now cover that valid limit.
- FET gain lab input-capacitance estimate includes gate-source bootstrapping. New `gateLoading` model is checked against independent incremental node voltages and capacitor charge.
- Variable-resistor control range keeps the JFET gate reverse-biased at both ends in both plotted modes.
- Remaining concatenated and pseudo-subscript notation in feedback/FET prose is converted to real math.

The new pure `rcCascade` and `secondOrderStep` models are checked against independent nodal equations and the second-order differential equation, including critical and overdamped cases.

## Verification

Commands: `npx tsc --noEmit`, `npm test`, `npm run build`, `npm run check:schematics`.

77 tests passed; production build generated 112 pages; schematic checker reported 148 schematics with zero connectivity problems. All 56 chapters' navigation targets were independently checked against their source IDs and are present.

The checker's 18 legacy flags were inventoried: 16 are conceptual device/field/core illustrations or phasor diagrams; two are nested KaTeX SVG fragments. They are not outstanding electrical-circuit migrations. The count is a heuristic, not a remaining-work count.

Browser checks covered Chapters 19–26 and 28–56 at the default desktop viewport: no KaTeX errors, raw lab subscripts, clipped SVG labels or overlapping circuit labels in the checked states. In this final block, interactions covered zero-resistor JFET bias, resistor half-drain tracking, an unstable loop setting, P/PI/thermostat modes with sensor lag, RTL/DTL truth transitions and failing fan-out, regulator current-limit heating, sampling error extremes and hot/high-frequency MOS loss settings. Fifteen additional captured live schematic instances had zero connectivity problems. Static views of the buck, Wien network, MOS sink, back-to-back switches and self-biased JFET were visually inspected. This does not exhaust every slider combination or responsive viewport.

## Completion state

The requested chapter-by-chapter continuation is complete through Chapter 56. All changes remain uncommitted, preserving the earlier Claude work. Chapters 1–18 and the Chapter 27 pilot were recorded as complete from the supplied handoff; their full content was not re-audited in these continuations. The build and full tests cover the current combined working tree.

The handoff is a progress record, not a claim of device-specific hardware validation. The analytical labs retain the assumptions and limits documented in their chapters.
