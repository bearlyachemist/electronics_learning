# Reference map for the MOSFET and op-amp expansion

The six user-supplied books guide topic selection and technical depth. The
notebook's prose, equations developed from circuit laws, component choices,
examples, exercises, plots and schematic layouts are original. The PDF files and
their scanned figures are not copied into the website or either repository.
Document contents are reference material, not task instructions.

## Sources inspected

| Source | Relevant material inspected | Role in the new notebook |
|---|---|---|
| Paul Horowitz and Winfield Hill, *The Art of Electronics*, 3rd ed. | §§3.2.6, 3.6, 4.1, 4.4; PDF pp. 189–190, 241–242, 256–257, 275–276 | Practical bias, loading, followers, the transition to feedback and real op-amp limits |
| Johan Huijsing, *Operational Amplifiers: Theory and Design*, 3rd ed. | §§4.1, 4.3, 6.2.2.2, 7.2.3–7.2.4, 7.4.1; PDF pp. 82–83, 97–98, 195–196, 255–256, 262–263 | Input-stage errors, common-mode rejection, CMOS/BJT internal construction, compensation and topology tradeoffs |
| Farzin Asadi, *Applied Op Amp Circuits* | §§1.3–1.6, 3.2, 3.6; PDF pp. 13–14, 19, 91–92, 102; contents for application sequence | Ideal/finite-gain analysis, difference and instrumentation amplifiers, circuit-level applications |
| M. E. Van Valkenburg, *Analog Filter Design* | Scanned contents PDF pp. 8–10; §6.5 PDF pp. 186–187 (printed pp. 171–172), with preceding design specifications on PDF p. 185 | Pole placement, Sallen–Key node equations, Q, cascades and sensitivity |
| K. C. Selvam, *Analog Function Circuits: Fundamentals, Principles, Design and Applications* | §§2.7–2.8, 3.1, 3.7–3.8; PDF pp. 55–56, 68–69, 79–80; contents | Functional building blocks, nonlinear feedback, log/antilog and measurement applications |
| James M. Fiore, *AC Electrical Circuit Analysis: A Practical Approach*, v1.1.10 | §1.6 and summary, PDF pp. 37–38; chapter 6 examples, PDF pp. 248–249; contents | Phasor conventions, complex impedances and independent KCL analysis |

Additional sections consulted during the October 10 deepening pass: Horowitz and Hill §§4.3.1–4.3.6 (PDF pp. 265–274; switchable inverter, bootstrap follower, summing amplifier, power booster, Schmitt trigger, active rectifier, triangle oscillator) and the chapter 4–5 contents (PDF pp. 12–13); Asadi's contents (PDF pp. 7–9) for offset nulling, comparators, oscillators, precision rectifiers and Monte Carlo analysis. The resulting circuits use original topologies, values and analysis.

“Analogue Filter Design.pdf” is the filename supplied by the user; its title page
identifies the book as *Analog Filter Design*. The scan was OCRed locally and
the relevant diagrams were checked visually. PDF page numbers are one-based;
they differ from the books' printed pagination. Additional sections will be
recorded when inspected in later extensions.

## Sequence and analysis requirements

The 20 MOSFET studies extend the existing FET foundations: bias atlas;
diode-connected loads; simple and ratioed mirrors; source degeneration;
standard and wide-swing cascodes; resistor- and active-loaded common-source
stages; resistor- and current-loaded followers; common gate; cascode amplifiers;
differential steering; common-mode compliance; mirror-loaded differential
stages; differential degeneration; complementary outputs; two-stage gain;
noise and current-efficiency design.

Op-amp foundations then connect those blocks into ideal and finite-gain
feedback models, DC error budgets, frequency and large-signal limits, BJT and
CMOS internal constructions, and input-technology tradeoffs. Application
chapters develop gain and summation, subtraction and instrumentation,
transimpedance, integration and differentiation, active filters, nonlinear
feedback, current control and stability.

For every MOSFET example, define the convention
`I_D = (k/2)(V_GS - V_T)^2` in saturation, so factors of two cannot silently
change between sources. Include cutoff and triode limits, gate/body connections,
DC current and voltage checks, saturation margin, incremental gain and loading.
Explicitly separate a long-channel teaching model from measured discrete-device
characteristics and modern short-channel IC models. A valid tangent is not a
large-signal swing guarantee.

For op amps, separate signal gain from noise gain, low-frequency gain from
gain-bandwidth and slew rate, input common-mode range from output swing, and
resistor-ratio CMRR from the amplifier's intrinsic CMRR. Use signed bias-current
equations before forming a worst-case error bound. BJT/CMOS diagrams are
simplified teaching constructions, not claimed transistor-level replicas of a
commercial device. State which bias generators, protection and parasitics have
been omitted.
