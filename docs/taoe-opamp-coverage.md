# Op-amp and precision coverage checkpoints

This pass covers all of *The Art of Electronics*, third edition, Chapters 4 and 5,
with additional original analysis informed by Huijsing and Asadi. Book chapter
numbers below are source references; the website retains its own sequence.
Every completed website chapter is built, checked and pushed independently.
The local PDF files, extracted text and book drawings are not published.

## First checkpoint: website Chapter 90

Published additions: explicit Sallen–Key node elimination; bootstrap capacitor
current; passive-loading comparison; pole and damping conditions; natural-frequency
phasors and internal swing; step ringing and overshoot; cutoff/peak/noise bandwidth;
source impedance and finite amplifier gain. Two original plots and independent
unequal-component KCL and numerical noise-bandwidth checks accompany the text.

Source coverage: TAOE §4.3.6 and filter context §§6.2–6.3; Van Valkenburg §6.5.

## Remaining chapter checkpoints

| Website chapter | Source topics to audit and deepen |
|---|---|
| 77 Ideal op amps | 4.1.1–4.1.3; golden-rule conditions and feedback polarity |
| 78 DC errors | 4.4.1–4.4.3; 5.1–5.7; millivoltmeter, nulling and complete precision budget |
| 79 AC limits | 4.9.1–4.9.3; 5.8.1–5.8.2, 5.8.5–5.8.7; compensation, gain nonlinearity and phase |
| 80 BJT internals | 4.4.1, 4.7; internal architecture and compensation tradeoffs |
| 81 CMOS internals | 4.6.3; 5.9; RRIO transitions and loaded output limits |
| 82 Input selection | 4.3.4, 4.6.7, 4.7; 5.10–5.11; pinch-off tester, selection and auto-zero |
| 83 Noninverting | 4.2.2–4.2.3, 4.2.7, 4.3.1, 4.6.1, 4.8.1; single-supply lab amplifier |
| 84 Inverting/summing | 4.2.1, 4.3.1; weighted sums, reference and range switching |
| 85 Difference | 4.2.4, 4.8.3; 5.13–5.14; load sensing and ratio accuracy |
| 86 Instrumentation | 5.15–5.16, all subsections; protection, bias paths, programmable gain and range |
| 87 Transimpedance | 4.8.2; 5.12; stuck-node tracing and precision DMM front ends |
| 88 Integration | 4.2.6, 4.3.3, 4.5.5, 4.8.4; triangle oscillator, dose and reset errors |
| 89 Differentiation | 4.5.7; noise-aware band-limited differentiator |
| 91 Nonlinear holding circuits | 4.5.1–4.5.4, 4.5.6; peak, sample/hold, clamp, absolute value and leakage cure |
| 92 Current servos | 4.2.5, 4.4.4; 5.2–5.3, 5.16.9; low-voltage meter and current-loop bandwidth |
| 93 Load stability | 4.6.2; 5.8.3–5.8.4; capacitive loads, crossover and composite buffers |
| 94 Functions and conversion | 4.3.2, 4.3.5, 4.6.4–4.6.6; 5.17; pulse width, VCO, construction and differential ADC drive |

Worked examples and solved self-checks throughout the website supply the source
chapters' exercise/review role. Coverage means explaining the topic and its limits,
not copying each historic circuit, part table, exercise or instrument schematic.

Completed checkpoint: [77 — Ideal op amps and feedback](https://hebert.phd/electronics/opamp-ideal/#precision-depth). Added “Use the golden rules within a working feedback loop” with original analysis and worked examples.

Completed checkpoint: [78 — Real op amps: the DC error budget](https://hebert.phd/electronics/opamp-dc-errors/#precision-depth). Added “Design a precision instrument around a complete error budget” with original analysis and worked examples.

Completed checkpoint: [79 — Bandwidth, slew and stability](https://hebert.phd/electronics/opamp-ac-limits/#precision-depth). Added “Compensate the complete loop and budget dynamic precision” with original analysis and worked examples.

Completed checkpoint: [80 — Inside a bipolar op amp](https://hebert.phd/electronics/opamp-bjt-internals/#precision-depth). Added “Connect internal design choices to precision and overload behavior” with original analysis and worked examples.

Completed checkpoint: [81 — Inside a CMOS op amp](https://hebert.phd/electronics/opamp-cmos-internals/#precision-depth). Added “Evaluate RRIO accuracy across common mode and load” with original analysis and worked examples.

Completed checkpoint: [82 — Choose BJT, JFET, CMOS or chopper inputs](https://hebert.phd/electronics/opamp-input-tradeoffs/#precision-depth). Added “Select the amplifier by source, operating point and architecture” with original analysis and worked examples.
