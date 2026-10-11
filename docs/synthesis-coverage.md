# Whole-book textbook synthesis coverage

All 94 chapters retain their detailed core explanations, diagrams, labs and practice. The added design studies connect each topic to a numerical design choice and its limits. The studies contain 282 cases in addition to the 371 separate practice problems. Bibliography and inspected PDF sections are documented in [the reference map](textbook-reference-map.md).

## Coverage index

| Chapter | Topic | Added design synthesis |
|---|---|---|
| 01 | Voltage dividers & loading | [A divider driving a sampled input](https://hebert.phd/electronics/#synthesis) |
| 02 | Thévenin equivalent circuits | [Identify a source without confusing the load boundary](https://hebert.phd/electronics/thevenin/#synthesis) |
| 03 | Small-signal resistance | [A tangent needs a signal-amplitude budget](https://hebert.phd/electronics/small-signal/#synthesis) |
| 04 | Power dissipation & heating | [Equal average power can hide different stresses](https://hebert.phd/electronics/power/#synthesis) |
| 05 | Capacitors: charge & energy | [Reservoir capacitance is a charge and energy choice](https://hebert.phd/electronics/capacitors/#synthesis) |
| 06 | RC circuits | [Settling accuracy determines the waiting time](https://hebert.phd/electronics/rc-circuits/#synthesis) |
| 07 | Differentiators | [An edge shaper sees rise time, not an ideal step](https://hebert.phd/electronics/differentiators/#synthesis) |
| 08 | Integrators | [Passive integration has amplitude and phase error](https://hebert.phd/electronics/integrators/#synthesis) |
| 09 | Ideal & real capacitors | [A decoupler has a useful impedance window](https://hebert.phd/electronics/real-capacitors/#synthesis) |
| 10 | Inductors | [Pulse width sets current and clamp energy](https://hebert.phd/electronics/inductors/#synthesis) |
| 11 | Transformers | [One turns ratio supports several load cases](https://hebert.phd/electronics/transformers/#synthesis) |
| 12 | Semiconductor physics | [A varactor tuning range has hidden fixed capacitance](https://hebert.phd/electronics/semiconductors/#synthesis) |
| 13 | Diode properties & models | [Forward-drop spread changes a shared current path](https://hebert.phd/electronics/diodes/#synthesis) |
| 14 | Rectification & filtering | [Ripple and conduction pulses are different budgets](https://hebert.phd/electronics/rectifiers/#synthesis) |
| 15 | Voltage regulators | [A linear regulator must pass the low-input and high-input tests](https://hebert.phd/electronics/regulators/#synthesis) |
| 16 | Diode circuit applications | [An envelope detector must fit between two time scales](https://hebert.phd/electronics/diode-applications/#synthesis) |
| 17 | Inductive-load protection | [Faster release trades clamp voltage against switch stress](https://hebert.phd/electronics/diode-protection/#synthesis) |
| 18 | Protection & bypass diodes | [A hot-plug network can exceed the supply voltage](https://hebert.phd/electronics/protection-circuits/#synthesis) |
| 19 | Sinusoids, complex numbers & phasors | [Time delay becomes a frequency-dependent phase](https://hebert.phd/electronics/phasors/#synthesis) |
| 20 | Impedance & reactance | [The same magnitude can hide different physics](https://hebert.phd/electronics/impedance/#synthesis) |
| 21 | Power in reactive circuits | [Correct power factor without changing useful load power](https://hebert.phd/electronics/reactive-power/#synthesis) |
| 22 | Dividers generalized & RC filters | [One pole cannot satisfy every passband and stopband pair](https://hebert.phd/electronics/rc-filters/#synthesis) |
| 23 | Poles, slopes & band filters | [Two RC sections need a loading calculation](https://hebert.phd/electronics/poles/#synthesis) |
| 24 | Resonance & LC filters | [A small source can create large component voltages](https://hebert.phd/electronics/resonance/#synthesis) |
| 25 | Thévenin generalized & capacitor uses | [Decoupling divides a transient into three mechanisms](https://hebert.phd/electronics/ac-thevenin/#synthesis) |
| 26 | Transistor physics | [Current gain depends on two efficiencies](https://hebert.phd/electronics/transistor-physics/#synthesis) |
| 27 | The bipolar transistor & switch | [A switch needs base-drive and saturation budgets](https://hebert.phd/electronics/bjt/#synthesis) |
| 28 | The emitter follower | [The base source appears at the output divided by current gain](https://hebert.phd/electronics/emitter-follower/#synthesis) |
| 29 | Biasing transistor stages | [Choose divider stiffness from actual beta spread](https://hebert.phd/electronics/bjt-biasing/#synthesis) |
| 30 | The small-signal model | [A bypass capacitor changes AC gain while retaining DC feedback](https://hebert.phd/electronics/bjt-small-signal/#synthesis) |
| 31 | Transistor current sources | [Output resistance determines current regulation above compliance](https://hebert.phd/electronics/current-sources/#synthesis) |
| 32 | The common-emitter amplifier | [Output swing should be allocated before gain](https://hebert.phd/electronics/common-emitter/#synthesis) |
| 33 | Phase splitter & transconductance | [Equal current does not mean equal small-signal current gain per volt](https://hebert.phd/electronics/transconductance/#synthesis) |
| 34 | The Ebers–Moll model | [Reverse-active operation exposes transistor asymmetry](https://hebert.phd/electronics/ebers-moll/#synthesis) |
| 35 | Current mirrors | [Base-current bookkeeping changes with fan-out](https://hebert.phd/electronics/current-mirrors/#synthesis) |
| 36 | Differential amplifiers | [Match an input signal to the pair’s linear scale](https://hebert.phd/electronics/differential-amplifiers/#synthesis) |
| 37 | Push–pull output stages | [The hottest class-B output point is not full output](https://hebert.phd/electronics/push-pull/#synthesis) |
| 38 | The Darlington connection | [Composite gain is paid for in headroom and turn-off](https://hebert.phd/electronics/darlington/#synthesis) |
| 39 | Bootstrapping | [A phase error can turn high input resistance into a complex load](https://hebert.phd/electronics/bootstrapping/#synthesis) |
| 40 | Current sharing in parallel BJTs | [Ballast turns a junction mismatch into a controlled voltage drop](https://hebert.phd/electronics/current-sharing/#synthesis) |
| 41 | Capacitance & the Miller effect | [Gain can dominate the input capacitance budget](https://hebert.phd/electronics/miller-effect/#synthesis) |
| 42 | Negative feedback | [Error suppression depends on where the error enters](https://hebert.phd/electronics/negative-feedback/#synthesis) |
| 43 | Feedback in transistor amplifiers | [Local feedback reduces parameter sensitivity](https://hebert.phd/electronics/transistor-feedback/#synthesis) |
| 44 | Regulated power supplies | [A load-step budget begins before the loop can respond](https://hebert.phd/electronics/regulated-supplies/#synthesis) |
| 45 | Temperature control | [Integral action does not create heater power](https://hebert.phd/electronics/temperature-control/#synthesis) |
| 46 | Simple BJT & diode logic | [Fan-out and speed share the same current budget](https://hebert.phd/electronics/bjt-logic/#synthesis) |
| 47 | Field-effect transistors | [A MOS region label depends on both terminal voltages](https://hebert.phd/electronics/fet-physics/#synthesis) |
| 48 | JFET characteristics & bias | [Self-bias must accommodate two independent parameter spreads](https://hebert.phd/electronics/jfet-bias/#synthesis) |
| 49 | JFET linear circuits | [Source feedback makes gain less dependent on device gm](https://hebert.phd/electronics/jfet-amplifiers/#synthesis) |
| 50 | Gate current, capacitance & oscillators | [High input resistance can make leakage the dominant error](https://hebert.phd/electronics/fet-dynamics/#synthesis) |
| 51 | FETs as signal switches | [Sample capacitance has lower and upper bounds](https://hebert.phd/electronics/fet-switches/#synthesis) |
| 52 | MOSFET physics & characteristics | [Body voltage moves threshold even when the gate is unchanged](https://hebert.phd/electronics/mosfet-physics/#synthesis) |
| 53 | Linear & depletion MOSFET circuits | [A linear pass device has a voltage-current trajectory](https://hebert.phd/electronics/mosfet-linear/#synthesis) |
| 54 | Power MOSFET switching | [Frequency moves the loss balance from conduction to switching](https://hebert.phd/electronics/mosfet-power/#synthesis) |
| 55 | Power stages & IGBTs | [Buck current ripple determines whether the assumed mode exists](https://hebert.phd/electronics/power-fet-circuits/#synthesis) |
| 56 | Parallel MOSFETs & thermal stability | [Current sharing changes as the devices warm](https://hebert.phd/electronics/parallel-mosfets/#synthesis) |
| 57 | MOSFET bias: an operating-point atlas | [A supply-derived gate bias also couples supply ripple](https://hebert.phd/electronics/mos-bias-atlas/#synthesis) |
| 58 | Diode-connected MOSFET loads | [Diode-load bias is a level-shift budget](https://hebert.phd/electronics/mos-diode-load/#synthesis) |
| 59 | The basic MOS current mirror | [A resistor reference is not supply independent](https://hebert.phd/electronics/mos-current-mirror/#synthesis) |
| 60 | Ratioed and complementary MOS mirrors | [A bias tree’s total current includes every copy](https://hebert.phd/electronics/mos-ratioed-mirrors/#synthesis) |
| 61 | Source degeneration in MOS circuits | [A bypass capacitor creates a gain shelf](https://hebert.phd/electronics/mos-source-degeneration/#synthesis) |
| 62 | The cascode current mirror | [High output resistance can make a node slow to settle](https://hebert.phd/electronics/mos-cascode-mirror/#synthesis) |
| 63 | Wide-swing cascode bias | [Recovered headroom must survive bias error](https://hebert.phd/electronics/mos-wide-swing-mirror/#synthesis) |
| 64 | The resistor-loaded common-source amplifier | [Signal amplitude must be allocated against local curvature](https://hebert.phd/electronics/mos-common-source/#synthesis) |
| 65 | Common-source stages with active loads | [Current mismatch can consume the output window](https://hebert.phd/electronics/mos-active-load/#synthesis) |
| 66 | The resistor-loaded source follower | [Supply feedthrough and signal gain use different numerators](https://hebert.phd/electronics/mos-source-follower/#synthesis) |
| 67 | Current-loaded source followers | [Sink noise appears at the output impedance](https://hebert.phd/electronics/mos-current-loaded-follower/#synthesis) |
| 68 | Common-gate MOS amplifiers | [A 50 Ω entrance requires substantial transconductance](https://hebert.phd/electronics/mos-common-gate/#synthesis) |
| 69 | The MOS cascode voltage amplifier | [Two-sided cascodes can leave almost no output window](https://hebert.phd/electronics/mos-cascode-amplifier/#synthesis) |
| 70 | The MOS differential pair | [Symmetry cancels second harmonic but leaves third harmonic](https://hebert.phd/electronics/mos-differential-pair/#synthesis) |
| 71 | Differential-pair range and rejection | [Rejection must be compared with signal size](https://hebert.phd/electronics/mos-differential-range/#synthesis) |
| 72 | Mirror-loaded differential stages | [The mirrored signal path carries its own pole](https://hebert.phd/electronics/mos-mirror-loaded-differential/#synthesis) |
| 73 | Degenerated MOS differential pairs | [Linearity, resistor noise and common-mode voltage share one choice](https://hebert.phd/electronics/mos-differential-degeneration/#synthesis) |
| 74 | Complementary MOS output followers | [A capacitive load demands alternating current at zero voltage crossing](https://hebert.phd/electronics/mos-complementary-output/#synthesis) |
| 75 | Build a two-stage MOS voltage amplifier | [A nulling resistor depends on second-stage gm](https://hebert.phd/electronics/mos-two-stage-amplifier/#synthesis) |
| 76 | MOS noise and transconductance efficiency | [A low-frequency limit changes flicker-noise integration](https://hebert.phd/electronics/mos-noise-design/#synthesis) |
| 77 | Ideal op amps and feedback | [An accuracy target imposes a loop-gain target](https://hebert.phd/electronics/opamp-ideal/#synthesis) |
| 78 | Real op amps: the DC error budget | [A calibrated offset budget still has drift and gain terms](https://hebert.phd/electronics/opamp-dc-errors/#synthesis) |
| 79 | Bandwidth, slew and stability | [Large-step time contains both a rate limit and a settling requirement](https://hebert.phd/electronics/opamp-ac-limits/#synthesis) |
| 80 | Inside a bipolar op amp | [Base shot noise matters for high source resistance](https://hebert.phd/electronics/opamp-bjt-internals/#synthesis) |
| 81 | Inside a CMOS op amp | [Rail-to-rail output is load dependent](https://hebert.phd/electronics/opamp-cmos-internals/#synthesis) |
| 82 | Choose BJT, JFET, CMOS or chopper inputs | [Bandwidth limits white noise but may not remove drift](https://hebert.phd/electronics/opamp-input-tradeoffs/#synthesis) |
| 83 | Noninverting amplifiers and buffers | [Ratio tracking matters more than equal absolute temperature coefficients](https://hebert.phd/electronics/opamp-noninverting/#synthesis) |
| 84 | Inverting and summing amplifiers | [A quiet channel still changes noise gain](https://hebert.phd/electronics/opamp-inverting-summing/#synthesis) |
| 85 | Difference amplifiers and resistor CMRR | [Common-mode rejection is an absolute error budget](https://hebert.phd/electronics/opamp-difference/#synthesis) |
| 86 | Instrumentation amplifiers | [High input impedance still requires a bias-current budget](https://hebert.phd/electronics/opamp-instrumentation/#synthesis) |
| 87 | Transimpedance amplifiers | [Voltage noise rises through the capacitive noise gain](https://hebert.phd/electronics/opamp-transimpedance/#synthesis) |
| 88 | Practical op-amp integrators | [Offset sets the maximum uninterrupted integration time](https://hebert.phd/electronics/opamp-integrator/#synthesis) |
| 89 | Band-limited differentiators | [Differentiation emphasizes the top of the noise band](https://hebert.phd/electronics/opamp-differentiator/#synthesis) |
| 90 | Active filters and Sallen–Key design | [An anti-alias target can require another pole](https://hebert.phd/electronics/opamp-active-filters/#synthesis) |
| 91 | Precision rectifiers and peak detection | [A rectifier-based meter is not automatically true RMS](https://hebert.phd/electronics/opamp-precision-rectifier/#synthesis) |
| 92 | Op-amp current servos | [Kelvin sensing keeps wiring drop out of the commanded current](https://hebert.phd/electronics/opamp-current-servo/#synthesis) |
| 93 | Capacitive loads and feedback placement | [Isolation trades load accuracy for a gentler dynamic load](https://hebert.phd/electronics/opamp-load-stability/#synthesis) |
| 94 | Analog functions and a complete design | [More converter bits do not remove analog noise](https://hebert.phd/electronics/opamp-function-design/#synthesis) |

## Verification

The test suite validates every study’s equation and inline mathematics with strict KaTeX, its three-case table shape and cross-links, and a representative numerical quantity for each study against circuit equations or existing models. Arithmetic checks preserve units and allow only normal displayed rounding. Build checks independently verify the 94 published studies, all declared chapter-section anchors, links and assets. The 282 cases include explicit approximate-model and invalid-headroom examples; those are labeled rather than silently treated as feasible operating points.

The synthesis source is separate from chapter MDX so existing chapter and figure revisions can continue without overwriting these studies. Practical limitations are attached to the specific model rather than a general disclaimer. Original values, prose and circuit-law derivations are used throughout; no source PDF or scanned figure is published.
