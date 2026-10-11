# Current curriculum map

These chapter numbers are the learning tool's sequence, not the book's chapter numbers. The source index remains unchanged.

| Learning chapter | Reference coverage | Main learning outcomes | Separate practice |
| --- | --- | --- | --- |
| 01 Voltage dividers and loading | AoE §§1.2.3–1.2.5 | Derive divider equations; calculate loading, output resistance, tolerance and current tradeoffs | 5 problems |
| 02 Thévenin equivalents | AoE §1.2.5 plus supporting circuit theory | Define a port; obtain open-circuit voltage; deactivate independent sources; use test sources with dependent sources; compare Norton equivalents and power transfer | 4 problems |
| 03 Small-signal resistance | AoE §1.2.6 plus supporting diode theory | Separate bias from variation; distinguish DC ratio and differential slope; derive diode resistance; quantify linearization error; analyze an incremental circuit | 4 problems |
| 04 Power dissipation and heating | Supporting foundations for AoE §1.2.2 and later device/power topics | Calculate instantaneous/average/RMS power; analyze pulse energy; derive thermal warm-up; budget temperature, derating and stability | 4 problems |

## Figures and assumptions

- Divider: ideal DC source and linear resistors; linked loading sweep.
- Thévenin: two ideal voltage sources feeding a common output through resistors; both sources may absorb current. Original/equivalent views and a terminal/load-line graph. Separate dependent-source test illustration.
- Small signal: n = 1, thermal voltage 25.85 mV, saturation current 1e-12 A. Fixed-temperature, memoryless diode; no series resistance or capacitance. Exact curve and tangent, with explicitly defined change-error metric. Separate incremental circuit illustration.
- Heating: 100 ohm constant resistor, ideal current drive, uniform thermal body, fixed ambient, constant thermal resistance and capacitance. A 125 °C reference is illustrative, not a component rating. Separate thermal-network analogy.

## Prerequisites and editorial direction

Read dividers before Thévenin, and Thévenin before small-signal circuit analysis. Power can also be read independently after Ohm's law. Derivative and exponential explanations are included where first needed. Advanced material is available without requiring every reader to start there.

Practice stays separate from figures. Illustrative circuits are not obliged to have a paired problem. Circuit controls change quantities relevant to that figure's learning objective.

All content is an authored learning draft, with numerical checks and browser review. Further chapters should be developed and reviewed in small groups rather than generated in one pass.

## Verification of this expansion

- Independent nodal calculations, KCL and electrical power balance for the two-source network.
- Finite-difference check of the diode slope against the exponential model.
- Initial condition, equilibrium and differential energy balance for the thermal model.
- Static build of four reading pages and four practice pages; TypeScript checks.
- Browser checks of switching views, parameter controls, limiting behavior, mobile layout, and solution disclosures.


## Capacitors and magnetics expansion

| Learning chapter | Main outcomes | Separate practice |
| --- | --- | --- |
| 05 Capacitors | Derive charge/current/energy relations; analyze charge sharing and supply support | 3 problems |
| 06 RC circuits | Derive transients; calculate settling and threshold timing; include loading | 3 problems |
| 07 Differentiators | Derive high-pass approximation; quantify phase and gain error; analyze pulses and ramps | 3 problems |
| 08 Integrators | Derive low-pass approximation; analyze square waves, active integration and drift | 3 problems |
| 09 Ideal and real capacitors | Interpret ESR, ESL, resonance, bias dependence, leakage and measurement limits | 3 problems |
| 10 Inductors | Derive flux linkage, energy, RL behavior and clamped release; distinguish saturation and heating | 3 problems |
| 11 Transformers | Derive turns/current/impedance relations; calculate volt-seconds and flux | 3 problems |

The capacitor sequence precedes magnetics. Active differentiator/integrator sections preview ideal op-amp behavior; detailed op-amp theory remains a later topic.

Seven added figures use analytical models:
- Constant-current capacitor charging from zero volts with constant C and unlimited source compliance.
- Ideal unloaded RC charge/discharge with a rescaled five-time-constant window.
- Exact high-pass and low-pass sinusoidal outputs against derivative/integral approximations. Error includes phase and magnitude; startup transients are omitted.
- Constant series C, ESR and ESL impedance on logarithmic axes. Leakage, absorption and voltage dependence are explained separately.
- Linear RL energizing and isolated one-way constant-voltage clamping until zero current; no saturation or core loss.
- Ideal transformer ratios with an independent sinusoidal flux estimate. The illustrative flux target does not modify the ideal waveforms.

Verification now covers 15 numerical tests, including energy derivatives, RC/RL differential equations, filter complementarity and complex errors, impedance resonance, clamp energy, and transformer power/reflection/flux scaling. The build contains 11 reading pages and 11 practice pages. Browser review covers all new lab controls, discharge and turn-off modes, desktop schematics, mobile layout, and practice disclosures.

## Diode and supply expansion

| Learning chapter | Reference scope | Outcomes | Practice |
| --- | --- | --- | --- |
| 12 Semiconductor physics | Supporting theory for §1.6.1 | Carriers, neutrality, drift/diffusion, PN electrostatics, depletion capacitance | 4 problems |
| 13 Diode properties and models | §1.6.1 | Model selection, exponential law, load lines, local resistance, switching charge and ratings | 4 problems |
| 14 Rectification and filtering | §§1.6.2–1.6.4 | Current paths, reservoir ripple, source pulses, startup and reverse stress | 4 problems |
| 15 Voltage regulators | §1.6.5; preview of later supply topics | Zener corners, dynamic resistance, series feedback, dropout, PSRR and heat | 4 problems |
| 16 Diode circuit applications | §1.6.6 | Limiters, rail injection, peak/envelope detection, clampers, steering and polarity | 4 problems |
| 17 Inductive-load protection | §1.6.7; bridge to §1.6.8 | Flywheel paths, resistive-winding decay, clamp placement and energy budgets | 4 problems |

Seven added interactive figures include a selectable bridge current-path schematic. Assumptions:
- PN junction: abrupt, nondegenerate silicon, 300 K, fully ionized doping; no breakdown or forward-injection model.
- Diode operating point: fixed-temperature exponential law and finite series resistor; ideality-factor control is not a temperature control.
- Bridge paths: ideal diodes and resistor load. Separate reservoir model uses fixed drops, 10-ohm total source resistance, ideal C and resistor load.
- Reservoir: backward-Euler transient integration at 20 microseconds, displaying the last two of 40 source cycles. Startup is omitted from the visible steady-state window; capacitor ESR, recovery and winding inductance are omitted.
- Regulators: ideal sharp zener knee, compliant current-sink load, and a separate fixed-dropout series model; no real minimum zener current, current limiting, loop dynamics or shutdown.
- Limiter: fixed diode drop, unloaded output, ideal rails able to sink/source current.
- Winding clamp: linear L and winding R, one-way constant clamp across the whole winding, no wiring overshoot, recovery or motion.

The course now has 17 reading pages and 17 practice pages, with 62 separate problems. There are 23 numerical tests; new checks cover depletion charge/capacitance, diode KVL and exponential consistency, rectifier periodic charge balance and timestep convergence, regulator power, clipping current directions, and independently integrated flyback energy. Manufacturer and university references are linked in the relevant chapters. These are teaching drafts, not completed device-selection designs.


## Protection and impedance expansion

| Learning chapter | Reference scope | Outcomes | Practice |
| --- | --- | --- | --- |
| 18 Protection & bypass diodes | §§1.6.6–1.6.8, extended | Reverse-polarity topologies, regulator and series-string bypass diodes, inrush energy, LC hot-plug overshoot and its bypass diode, TVS/ESD/steering budgets, asymmetric RC timing, discontinuous boost energy | 5 problems |
| 19 Sinusoids, complex numbers & phasors | §§1.3.1, 1.7.1–1.7.3 | Complex arithmetic and quadrants, Euler’s formula, phasors, d/dt → jω, phasor addition, conventions | 5 problems |
| 20 Impedance & reactance | §§1.7.2, 1.7.4, 1.7.5, 1.7.11 | Reactance derivations, generalized Ohm’s law, admittance, series/parallel combination, series↔parallel equivalents, impedance and frequency scaling | 5 problems |
| 21 Power in reactive circuits | §1.7.6, extended | Instantaneous/average power, complex power S = VI*, P/Q/S/PF, line-loss cost, power-factor correction, distortion, conjugate matching | 5 problems |
| 22 Dividers generalized & RC filters | §§1.3.2, 1.7.7–1.7.10 | Generalized divider, decibels, low/high-pass derivation, Bode asymptotes, coupling capacitors, source/load effects, differentiators/integrators in frequency, RL filters | 5 problems |
| 23 Poles, slopes & band filters | §1.7.13, extended | Octaves/decades, pole/zero meaning, buffered vs unbuffered cascades, band-pass, twin-T notch, Bode sketching with a pole–zero shelf | 5 problems |
| 24 Resonance & LC filters | §§1.7.12, 1.7.14, 1.7.15 | Series/parallel resonance, three meanings of Q, phasor diagrams and the RC semicircle, tank loading, LC low-pass terminations and peaking, step overshoot vs Q | 5 problems |
| 25 Thévenin generalized & capacitor uses | §§1.7.16, 1.7.17, 1.8 | AC Thévenin/Norton, bypass capacitors and anti-resonance, coupling and AC grounds, hold-up/snubbing/timing, an AM receiver assembly | 5 problems |

Thirteen added interactive figures and ten static figures. Assumptions:
- Reverse polarity: constant-current load, fixed 0.45 V Schottky drops, 20 mΩ MOSFET channel, 50 mΩ source resistance for the shunt fault; no fuse timing or MOSFET gate limits.
- Hot-plug: ideal 12 V step, lumped series L–R, ideal C, 100 Ω load; optional fixed-drop diode across the series branch. Backward Euler with explicit diode state; checked against the analytic underdamped peak.
- Boost: discontinuous conduction only, ideal switch and inductor, output held constant; the lab warns when the cycle would become continuous.
- AC labs: ideal R, L, C (except where ESR/ESL/winding resistance is an explicit control), sinusoidal steady state, peak phasors for waveforms and RMS phasors for power. Bode plots span fixed decades; curves are clipped to the axes.
- Supply bypassing: 20 mΩ source resistance, lumped wiring inductance, one capacitor with constant ESR/ESL; no planes, vias or regulator dynamics.

The course has 25 reading pages and 25 practice pages, with 102 separate problems. There are 39 numerical tests; new checks cover complex polar/rectangular consistency, reactance limits, admittance addition, phasor-sum versus time-domain sum, averaged instantaneous power against P, exact power-factor correction, filter complementarity and asymptotic slopes, loaded corners, pole stacking, band-pass loading, twin-T null, half-power bandwidth, tank impedance, LC asymptotes, nodal check of the AC Thévenin result, protection power balance, the analytic hot-plug peak, the diode clamp, boost energy conservation and diode-bypassed RC discharge. All worked-example and practice numbers were recomputed from the engine or independent arithmetic.

## Bipolar transistor expansion

| Learning chapter | Reference scope | Outcomes | Practice |
| --- | --- | --- | --- |
| 26 Transistor physics | Supporting physics for §§2.1, 2.3 | Minority-carrier continuity and diffusion length, short-base transport, I_S, emitter efficiency and base transport (β), Early effect, transit time, −2.1 mV/°C derivation | 5 problems |
| 27 The bipolar transistor & switch | §§2.1–2.2.2 | Four rules, current-amplifier model, regions, saturated switch design, LED/relay/inverter/PNP high-side, ratings | 5 problems |
| 28 The emitter follower | §§2.2.3–2.2.4 | Gain, impedance transformation, sink-limited clipping, base–emitter breakdown, zener-plus-follower regulator | 5 problems |
| 29 Biasing transistor stages | §§2.2.5, 2.3.5 | Follower and CE bias, stiffness rule, β and temperature sensitivity, collector feedback bias, recipe | 5 problems |
| 30 The small-signal model | §§2.3.1–2.3.3 (small-signal form) | g_m, r_e, r_π, r_o, hybrid-π and T models, impedance looking into each terminal, linearity limit | 5 problems |
| 31 Transistor current sources | §2.2.6 | Compliance, accuracy limits, degenerated output resistance, base references, applications | 5 problems |
| 32 The common-emitter amplifier | §§2.2.7, 2.3.4 | Gain −R_C/(R_E + r_e), bypassing and partial bypassing, swing with load, low-frequency corners, complete design | 5 problems |
| 33 Phase splitter & transconductance | §§2.2.8–2.2.9 | Unity-gain splitter, output-impedance asymmetry, all-pass phase shifter, G_m view of every stage | 5 problems |
| 34 The Ebers–Moll model | §§2.3.1–2.3.3, 2.3.6, 2.3.7 | Exponential law in all regions, closed-form V_CE(sat), rules of thumb, follower/CE revisited, perfect transistor, current mirrors | 5 problems |

Nine interactive figures and four static figures. Assumptions:
- Physics: uniform doping, one dimension, low-level injection, no bandgap narrowing or depletion recombination; 300 K; emitter 10¹⁹ cm⁻³ × 0.3 µm, collector 10¹⁶ cm⁻³, area 1000 µm². Punch-through is reported rather than modeled.
- Ebers–Moll: transport form with β_F, β_R, I_S and an Early factor (1 − V_BC/V_A) on the transport current; no series resistances, capacitances or high-level injection. The stage solver uses nested bisection on Kirchhoff’s laws, which is monotonic for this single-transistor topology.
- First-model labs (switch, follower, bias) use a fixed V_BE of 0.65 V with −2.1 mV/°C and an idealized saturation floor, matching the chapter in which they appear.
- The common-emitter lab drives the base from an ideal source and treats coupling and bypass capacitors as shorts; the phase-splitter lab is small-signal.

The course has 34 reading pages and 34 practice pages, with 147 separate problems. There are 46 numerical tests; new checks cover the short-base model (β consistency, charge-control I_C = Q_B/τ_F, 60 mV/decade, Early effect), the −2.13 mV/K temperature coefficient, Kirchhoff residuals of the stage solver in cutoff, active and saturation, active-region gain and Early slope, the closed-form Ebers–Moll V_CE(sat), and the simple switch, follower, bias, small-signal, common-emitter and phase-splitter relations.

## Amplifier building blocks expansion

| Learning chapter | Reference scope | Outcomes | Practice |
| --- | --- | --- | --- |
| 35 Current mirrors | §2.3.7, extended | Basic mirror and its base-current, Early, mismatch and thermal errors; degeneration; ratios; β-helper; Wilson; Widlar | 5 problems |
| 36 Differential amplifiers | §2.3.8 | Differential/common-mode decomposition, exact tanh steering law, half-circuit gains, CMRR, current-source tail, mirror active load, offsets and bias currents | 5 problems |
| 37 Push–pull output stages | §2.4.1 | Class A efficiency limit, class B efficiency and peak dissipation, crossover distortion, class AB bias, thermal stability, V_BE multiplier, feedback, protection | 5 problems |
| 38 The Darlington connection | §2.4.2 | Composite gain, on-voltage and speed penalties, bleeders, Sziklai pair (single input V_BE, same saturation), uses and alternatives | 5 problems |
| 39 Bootstrapping | §2.4.3 | Z/(1 − G) principle, bootstrapped follower and its new limit, bootstrapped collector loads, guarding, link to the Miller effect, noise and stability limits | 5 problems |
| 40 Current sharing in parallel BJTs | §2.4.4 | Exponential mismatch, electro-thermal loop gain, hogging and runaway, ballast design, second breakdown and SOA, MOSFET contrast | 5 problems |
| 41 Capacitance & the Miller effect | §2.4.5 | C_π, C_μ and f_T, Miller theorem, common-emitter bandwidth, source impedance, cascode, Miller plateau in switching, follower input capacitance | 5 problems |

Seven interactive figures and five static figures. Assumptions:
- Mirrors: matched Ebers–Moll transistors at one temperature (β_R = 2, Early factor on the transport current), ideal supply; mismatch discussed analytically.
- Differential pair: exact Ebers–Moll steering with α = 1; small-signal half-circuit gains for CMRR; matched devices.
- Push–pull: exponential complementary devices (I_S = 1 pA) with an idealized 1 V saturation clamp; class AB from two fixed 0.65 V drops; feedback mode uses a loop gain of 200. THD from a 128-point DFT of harmonics 2–15. Thermal drift of bias is analyzed in the text, not simulated.
- Darlington/Sziklai: Ebers–Moll driver (β 150, I_S 10 fA) and output (β 50, I_S 1 pA), no series resistances or bleeders. The model corrected an initial expectation: the Sziklai pair saturates no lower than the Darlington.
- Current sharing: two devices with separate heat sinks, fixed total current, −2.1 mV/°C, steady state; hogging is flagged when one device carries over 90%.
- Bootstrapping and Miller: small-signal hybrid-π models solved by complex nodal analysis (stages.mjs `nodal`); no base resistance; C_π set from f_T = 400 MHz in the Miller lab.

The transistor chapters now run through Chapter 41 with 182 problems in practice.json and the divider page (207 including the feedback chapters). Tests added in tests/stages.test.mjs check mirror closed forms (2/β, β-helper, Wilson, Widlar log law, area ratio), Early-effect output resistance, the tanh law and degenerated steering, active-load gain V_A/2V_T, class B crossover and the π/4 efficiency bound, AB and feedback THD reduction, Darlington gain β₁β₂ + β₁ + β₂ and compound-pair saturation, ballast equalization and hogging, the nodal solver against an RC low-pass, bootstrap improvement, and the Miller estimate against the exact pole.

## Chapters 57–94: MOS circuit studies and op amps

Twenty MOSFET chapters develop bias, diode loads, mirrors and ratio scaling,
degeneration, standard/wide-swing cascodes, common-source stages, followers,
common gate, cascode gain, differential steering/range/mirror loads, class-AB
outputs, two-stage gain and noise. Each includes explicit DC assumptions,
multiple operating points, incremental equations and compliance limits.

Six op-amp foundation chapters derive ideal and finite-gain feedback, signed DC
errors, bandwidth/slew/stability, original BJT/CMOS teaching constructions and
input-technology tradeoffs. Twelve applications cover noninverting, summing,
difference, instrumentation, TIA, integration, differentiation, Sallen–Key,
precision rectification/peak hold, MOS current servos, capacitive loads and
nonlinear function/system design. These add 114 separate worked practice
problems, for 371 across the 94-chapter book.

See `textbook-reference-map.md` for the six supplied sources and inspected
sections. The numerical engines are original long-channel/local teaching models
with independent KCL/KVL and slope checks, not commercial-device guarantees.
`check:advanced` validates section targets, strict practice math and critical net
relationships that a disconnected-pin checker alone cannot verify.
