export const systemsChapters = [
  {
    "id": "noise-fundamentals",
    "number": "90",
    "title": "Noise sources, SNR and noise figure",
    "href": "/noise-fundamentals/",
    "practice": "/noise-fundamentals/practice/",
    "group": "Low-noise design",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "random",
        "Describe a random signal"
      ],
      [
        "johnson",
        "Derive Johnson noise from thermal equilibrium"
      ],
      [
        "shot",
        "Derive shot noise from random arrivals"
      ],
      [
        "flicker",
        "Recognize flicker, burst and interference"
      ],
      [
        "snr",
        "Define SNR, noise figure and noise temperature"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "transistor-noise",
    "number": "91",
    "title": "Low-noise design with BJTs and JFETs",
    "href": "/transistor-noise/",
    "practice": "/transistor-noise/practice/",
    "group": "Low-noise design",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Model an amplifier's noise with e<sub>n</sub> and i<sub>n</sub>"
      ],
      [
        "bjt",
        "Derive a BJT's noise from its currents"
      ],
      [
        "optimum",
        "Choose the current for a given source"
      ],
      [
        "jfet",
        "Compare JFETs"
      ],
      [
        "low",
        "Handle a very low source resistance"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-noise",
    "number": "92",
    "title": "Noise in op-amp and transimpedance circuits",
    "href": "/opamp-noise/",
    "practice": "/opamp-noise/practice/",
    "group": "Low-noise design",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Build the noise model"
      ],
      [
        "noninverting",
        "Refer every source to the input"
      ],
      [
        "choose",
        "Choose an op amp by source resistance"
      ],
      [
        "tia",
        "Analyze transimpedance-amplifier noise"
      ],
      [
        "integrate",
        "Integrate to an rms number"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "noise-measurement",
    "number": "93",
    "title": "Measuring noise and recovering signals",
    "href": "/noise-measurement/",
    "practice": "/noise-measurement/practice/",
    "group": "Low-noise design",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "rms",
        "Measure rms noise in a known bandwidth"
      ],
      [
        "nf",
        "Measure noise figure with a noise source"
      ],
      [
        "averaging",
        "Average, and know when averaging stops helping"
      ],
      [
        "lockin",
        "Recover a buried signal with a lock-in"
      ],
      [
        "thermometry",
        "Use noise as the measurement"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "precision-noise-grounding",
    "number": "94",
    "title": "Noise, grounding and shielding",
    "href": "/precision-noise-grounding/",
    "practice": "/precision-noise-grounding/practice/",
    "group": "Low-noise design",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "noise",
        "Integrate the noise that reaches the measurement"
      ],
      [
        "coupling",
        "Follow electric, magnetic and shared-impedance coupling"
      ],
      [
        "returns",
        "Arrange return currents before dividing ground labels"
      ],
      [
        "shields",
        "Separate shielding from guarding"
      ],
      [
        "detection",
        "Move the measurement away from its worst noise"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "precision-references",
    "number": "95",
    "title": "Precision voltage references",
    "href": "/precision-references/",
    "practice": "/precision-references/practice/",
    "group": "Precision measurement",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "architecture",
        "Choose what must stay constant"
      ],
      [
        "bandgap",
        "Derive temperature cancellation"
      ],
      [
        "budget",
        "Translate every specification into volts"
      ],
      [
        "loading",
        "Design static and dynamic loading"
      ],
      [
        "ratio",
        "Cancel a reference by measuring a ratio"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "precision-calibration",
    "number": "96",
    "title": "Calibration and precision measurement",
    "href": "/precision-calibration/",
    "practice": "/precision-calibration/practice/",
    "group": "Precision measurement",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "transfer",
        "Write a measurement equation before choosing parts"
      ],
      [
        "uncertainty",
        "Keep bounds, statistics and resolution separate"
      ],
      [
        "resistance",
        "Measure resistance without measuring the leads"
      ],
      [
        "temperature",
        "Treat sensor compensation as part of the circuit"
      ],
      [
        "validate",
        "Design a validation that can fail honestly"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "line-supplies",
    "number": "97",
    "title": "From the AC line to an unregulated supply",
    "href": "/line-supplies/",
    "practice": "/line-supplies/practice/",
    "group": "Line & linear supplies",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "input",
        "Protect and filter the line input"
      ],
      [
        "transformer",
        "Size the transformer"
      ],
      [
        "rectifiers",
        "Choose a rectifier topology"
      ],
      [
        "ripple",
        "Derive ripple, conduction angle and peak current"
      ],
      [
        "noise",
        "Compare linear and switching supplies for noise"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "power-linear-regulators",
    "number": "99",
    "title": "Linear regulators and supply integrity",
    "href": "/power-linear-regulators/",
    "practice": "/power-linear-regulators/practice/",
    "group": "Line & linear supplies",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "loop",
        "See the regulator as a feedback amplifier"
      ],
      [
        "heat",
        "Calculate input power and junction temperature"
      ],
      [
        "transient",
        "Let charge conservation set the first response"
      ],
      [
        "stability",
        "Choose the capacitor for the actual control loop"
      ],
      [
        "rejection",
        "Use a post-regulator with a real noise budget"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "regulator-ics",
    "number": "100",
    "title": "Three-terminal and low-dropout regulators",
    "href": "/regulator-ics/",
    "practice": "/regulator-ics/practice/",
    "group": "Line & linear supplies",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "taxonomy",
        "Sort the regulator families"
      ],
      [
        "adjustable",
        "Set the output of an adjustable regulator"
      ],
      [
        "ripple",
        "Improve ripple rejection and noise"
      ],
      [
        "ldo",
        "Compare dropout architectures"
      ],
      [
        "current",
        "Use a regulator as a current source"
      ],
      [
        "pitfalls",
        "Avoid the common pitfalls"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "thermal-soa",
    "number": "101",
    "title": "Heat sinking and safe operating area",
    "href": "/thermal-soa/",
    "practice": "/thermal-soa/practice/",
    "group": "Heat & power switches",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Model heat flow as a circuit"
      ],
      [
        "transient",
        "Account for short pulses"
      ],
      [
        "soa",
        "Read the safe operating area"
      ],
      [
        "derating",
        "Derate for temperature and lifetime"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "power-buck-converters",
    "number": "105",
    "title": "Buck converters from switching states",
    "href": "/power-buck-converters/",
    "practice": "/power-buck-converters/practice/",
    "group": "Switching converters",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "states",
        "Draw both current paths"
      ],
      [
        "modes",
        "Derive the boundary instead of hiding negative current"
      ],
      [
        "capacitors",
        "Size the input and output current reservoirs"
      ],
      [
        "losses",
        "Compare the complete loss budget"
      ],
      [
        "control",
        "Connect the plant to the feedback design"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "power-boost-isolated",
    "number": "106",
    "title": "Boost, buck–boost and isolated converters",
    "href": "/power-boost-isolated/",
    "practice": "/power-boost-isolated/practice/",
    "group": "Switching converters",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "boost",
        "Derive boost voltage and current from the two states"
      ],
      [
        "rhp",
        "Explain the response that initially moves the wrong way"
      ],
      [
        "buckboost",
        "Choose inversion or four switches deliberately"
      ],
      [
        "isolation",
        "Separate stored-energy conversion from transformer action"
      ],
      [
        "chargepump",
        "Recognize what switched capacitors can and cannot do"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "isolated-offline",
    "number": "107",
    "title": "Transformer-isolated and offline converters",
    "href": "/isolated-offline/",
    "practice": "/isolated-offline/practice/",
    "group": "Switching converters",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "offline",
        "Rectify the mains directly"
      ],
      [
        "flyback",
        "Design the flyback"
      ],
      [
        "forward",
        "Reset the core in a forward converter"
      ],
      [
        "pfc",
        "Define and correct power factor"
      ],
      [
        "safety",
        "Respect the isolation barrier"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "power-control-layout",
    "number": "108",
    "title": "Power control, protection and layout",
    "href": "/power-control-layout/",
    "practice": "/power-control-layout/practice/",
    "group": "Switching converters",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "current",
        "Separate voltage control from current control"
      ],
      [
        "slope",
        "Derive why peak-current control may alternate cycles"
      ],
      [
        "faults",
        "Define startup, overload and shutdown states"
      ],
      [
        "ringing",
        "Find the parasitic oscillator before choosing a snubber"
      ],
      [
        "layout",
        "Route the current difference between switching states"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "batteries-protection",
    "number": "109",
    "title": "Batteries, energy storage and supply protection",
    "href": "/batteries-protection/",
    "practice": "/batteries-protection/practice/",
    "group": "Storage & protection",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Model a battery"
      ],
      [
        "chemistry",
        "Compare chemistries"
      ],
      [
        "charging",
        "Charge lithium-ion with CC–CV"
      ],
      [
        "supercap",
        "Store energy in capacitors"
      ],
      [
        "protection",
        "Protect supplies and loads"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "em-fields",
    "number": "110",
    "title": "Electromagnetic fields behind circuit models",
    "href": "/em-fields/",
    "practice": "/em-fields/practice/",
    "group": "Fields & waves",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "lumped",
        "Decide when a circuit is lumped"
      ],
      [
        "capacitance",
        "Derive capacitance from Gauss's law"
      ],
      [
        "inductance",
        "Derive inductance from Ampère's law"
      ],
      [
        "returns",
        "Find where the return current really flows"
      ],
      [
        "skin",
        "Derive skin depth and AC resistance"
      ],
      [
        "radiation",
        "Radiate only when you mean to"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "transmission-lines",
    "number": "111",
    "title": "Transmission lines and reflections",
    "href": "/transmission-lines/",
    "practice": "/transmission-lines/practice/",
    "group": "Fields & waves",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "distributed",
        "Replace one wire with distributed storage"
      ],
      [
        "boundaries",
        "Calculate launch and load reflection"
      ],
      [
        "bounces",
        "Follow the wave back to the source"
      ],
      [
        "termination",
        "Choose where the wave is absorbed"
      ],
      [
        "pcb",
        "Keep geometry, return and measurement continuous"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "rf-components-smith",
    "number": "112",
    "title": "RF components and the Smith chart",
    "href": "/rf-components-smith/",
    "practice": "/rf-components-smith/practice/",
    "group": "RF components & stages",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "parasitics",
        "Model real components across frequency"
      ],
      [
        "q",
        "Define Q and convert between series and parallel"
      ],
      [
        "lines",
        "Derive the input impedance of a terminated line"
      ],
      [
        "smith",
        "Derive the Smith chart from one map"
      ],
      [
        "matching",
        "Match with transformers and stubs"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "rf-impedance-matching",
    "number": "113",
    "title": "RF impedance and matching networks",
    "href": "/rf-impedance-matching/",
    "practice": "/rf-impedance-matching/practice/",
    "group": "RF components & stages",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "power",
        "State the impedance behind every RF number"
      ],
      [
        "conjugate",
        "Derive what matching actually optimizes"
      ],
      [
        "lmatch",
        "Derive a low-pass L network"
      ],
      [
        "bandwidth",
        "Let parasitics and frequency change the answer"
      ],
      [
        "measurement",
        "Read S parameters at the stated reference planes"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "rf-amplifiers",
    "number": "114",
    "title": "RF amplifier design",
    "href": "/rf-amplifiers/",
    "practice": "/rf-amplifiers/practice/",
    "group": "RF components & stages",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "gain",
        "Define gain as a power ratio"
      ],
      [
        "stability",
        "Test whether the amplifier can oscillate"
      ],
      [
        "lna",
        "Derive the inductively degenerated LNA input"
      ],
      [
        "noise",
        "Choose between gain match and noise match"
      ],
      [
        "linearity",
        "Relate compression to intercept"
      ],
      [
        "pa",
        "Size a power amplifier's load"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "rf-filters",
    "number": "115",
    "title": "RF and IF filters",
    "href": "/rf-filters/",
    "practice": "/rf-filters/practice/",
    "group": "RF components & stages",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "spec",
        "Write the filter specification"
      ],
      [
        "responses",
        "Derive the order a response needs"
      ],
      [
        "ladder",
        "Synthesize a ladder from prototype values"
      ],
      [
        "bandpass",
        "Transform to high-pass and band-pass"
      ],
      [
        "loss",
        "Predict insertion loss from finite Q"
      ],
      [
        "technology",
        "Choose a filter technology"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "oscillators-pll",
    "number": "116",
    "title": "Oscillators, PLLs and phase noise",
    "href": "/oscillators-pll/",
    "practice": "/oscillators-pll/practice/",
    "group": "Oscillators, modulation & receivers",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "condition",
        "State the oscillation condition two ways"
      ],
      [
        "colpitts",
        "Derive the Colpitts start-up condition"
      ],
      [
        "crystal",
        "Model a crystal and its load capacitance"
      ],
      [
        "noise",
        "Turn phase noise into jitter"
      ],
      [
        "pll",
        "Lock a VCO with a phase-locked loop"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "modulation",
    "number": "117",
    "title": "Modulation, I/Q and demodulation",
    "href": "/modulation/",
    "practice": "/modulation/practice/",
    "group": "Oscillators, modulation & receivers",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "why",
        "Move the message to a carrier"
      ],
      [
        "am",
        "Derive the AM spectrum and detect its envelope"
      ],
      [
        "fm",
        "Estimate FM bandwidth with Carson's rule"
      ],
      [
        "iq",
        "Build any modulation from I and Q"
      ],
      [
        "digital",
        "Relate constellations, symbol rate and bandwidth"
      ],
      [
        "noise",
        "Connect error rate to signal-to-noise ratio"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "rf-signal-chains",
    "number": "118",
    "title": "RF amplifiers, mixers and receiver design",
    "href": "/rf-signal-chains/",
    "practice": "/rf-signal-chains/practice/",
    "group": "Oscillators, modulation & receivers",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "noise",
        "Derive a cascaded noise budget"
      ],
      [
        "linearity",
        "Budget compression and third-order products separately"
      ],
      [
        "mixers",
        "Derive frequency translation and the image"
      ],
      [
        "oscillators",
        "Connect oscillator noise to system performance"
      ],
      [
        "bench",
        "Measure without confusing the instrument and the circuit"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "antennas-propagation",
    "number": "119",
    "title": "Antennas, links and emissions",
    "href": "/antennas-propagation/",
    "practice": "/antennas-propagation/practice/",
    "group": "Radiation & signal integrity",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "dipole",
        "Derive the radiation resistance of a short dipole"
      ],
      [
        "practical",
        "Use half-wave dipoles and monopoles"
      ],
      [
        "gain",
        "Define directivity, gain and effective area"
      ],
      [
        "friis",
        "Derive the Friis link equation"
      ],
      [
        "regions",
        "Locate the far field before measuring"
      ],
      [
        "emissions",
        "Estimate what a board or cable radiates"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "differential-pairs",
    "number": "120",
    "title": "Differential pairs and high-speed PCB channels",
    "href": "/differential-pairs/",
    "practice": "/differential-pairs/practice/",
    "group": "Radiation & signal integrity",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "modes",
        "Define the two signals a pair can carry"
      ],
      [
        "impedance",
        "Derive odd and even mode impedance"
      ],
      [
        "skew",
        "Quantify what unmatched timing creates"
      ],
      [
        "routing",
        "Preserve symmetry and the return environment"
      ],
      [
        "interface",
        "Terminate and assess the actual channel"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "sampling-converter-errors",
    "number": "121",
    "title": "Sampling and converter error budgets",
    "href": "/sampling-converter-errors/",
    "practice": "/sampling-converter-errors/practice/",
    "group": "Sampling",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "codes",
        "Define the transfer function and code convention"
      ],
      [
        "noise",
        "Derive the familiar ideal SNR formula"
      ],
      [
        "alias",
        "Explain why the analog filter comes first"
      ],
      [
        "timing",
        "Translate jitter and acquisition into voltage error"
      ],
      [
        "linearity",
        "Separate static errors from dynamic performance"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "adc-successive-approximation",
    "number": "122",
    "title": "Successive-approximation ADCs",
    "href": "/adc-successive-approximation/",
    "practice": "/adc-successive-approximation/practice/",
    "group": "Analog-to-digital converters",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "search",
        "Perform a conversion one decision at a time"
      ],
      [
        "capacitors",
        "Derive a charge-redistribution trial DAC"
      ],
      [
        "thermal",
        "Trade sampling noise against charge and settling"
      ],
      [
        "reference",
        "Design the trial DAC reference as a dynamic load"
      ],
      [
        "throughput",
        "Budget the whole acquisition and data path"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "adc-flash-pipeline",
    "number": "123",
    "title": "Flash, pipeline and interleaved ADCs",
    "href": "/adc-flash-pipeline/",
    "practice": "/adc-flash-pipeline/practice/",
    "group": "Analog-to-digital converters",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "flash",
        "Make every threshold decision in parallel"
      ],
      [
        "subranging",
        "Convert the residual instead of the full input again"
      ],
      [
        "pipeline",
        "Derive a redundant 1.5-bit stage"
      ],
      [
        "interleave",
        "Use multiple sample paths without assuming they match"
      ],
      [
        "selection",
        "Match the architecture to the whole channel"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "adc-integrating-delta-sigma",
    "number": "124",
    "title": "Integrating and delta–sigma ADCs",
    "href": "/adc-integrating-delta-sigma/",
    "practice": "/adc-integrating-delta-sigma/practice/",
    "group": "Analog-to-digital converters",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "dual",
        "Derive dual-slope conversion"
      ],
      [
        "line",
        "Derive line-frequency rejection and multislope behavior"
      ],
      [
        "feedback",
        "Follow a delta–sigma stream through charge balance"
      ],
      [
        "shaping",
        "Derive oversampling and noise shaping separately"
      ],
      [
        "filter",
        "Read decimation as a frequency response and a delay"
      ],
      [
        "choice",
        "Choose precision together with bandwidth and latency"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "dac-architectures-output",
    "number": "125",
    "title": "DAC architectures and analog output design",
    "href": "/dac-architectures-output/",
    "practice": "/dac-architectures-output/practice/",
    "group": "Digital-to-analog converters",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "scale",
        "Define the voltage or current represented by a code"
      ],
      [
        "string",
        "Use positive resistor increments for monotonic taps"
      ],
      [
        "binary",
        "Derive binary weighting and the R–2R ladder"
      ],
      [
        "steering",
        "Trade unit elements, segmentation and switching error"
      ],
      [
        "output",
        "Design the buffer and reconstruction filter"
      ],
      [
        "pwm",
        "Derive the limits of a PWM substitute"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "digital-logic-timing",
    "number": "127",
    "title": "Digital logic, timing and clock domains",
    "href": "/digital-logic-timing/",
    "practice": "/digital-logic-timing/practice/",
    "group": "Logic, timing & signal integrity",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "levels",
        "Use guaranteed voltage ranges"
      ],
      [
        "power",
        "Calculate charge, edge current and loading"
      ],
      [
        "synchronous",
        "Derive setup and hold from the launch/capture timeline"
      ],
      [
        "domains",
        "Handle metastability without promising it disappears"
      ],
      [
        "interfaces",
        "Shift levels and define reset behavior"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "digital-signal-integrity",
    "number": "128",
    "title": "Digital signal integrity",
    "href": "/digital-signal-integrity/",
    "practice": "/digital-signal-integrity/practice/",
    "group": "Logic, timing & signal integrity",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "edges",
        "Treat a logic edge as an analog signal"
      ],
      [
        "reflections",
        "Derive reflections and choose a termination"
      ],
      [
        "impedance",
        "Explain why every interface fixes an impedance"
      ],
      [
        "eye",
        "Read an eye diagram"
      ],
      [
        "crosstalk",
        "Budget crosstalk and ground bounce"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "uart-rs232",
    "number": "129",
    "title": "UART and RS-232",
    "href": "/uart-rs232/",
    "practice": "/uart-rs232/practice/",
    "group": "Board-level buses",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "frame",
        "Specify the asynchronous frame"
      ],
      [
        "tolerance",
        "Derive the clock-tolerance budget"
      ],
      [
        "rs232",
        "Put the frame on an RS-232 cable"
      ],
      [
        "distortion",
        "See how slow edges distort bit widths"
      ],
      [
        "practice",
        "Build a robust UART link"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "spi-interfaces",
    "number": "130",
    "title": "SPI and its relatives",
    "href": "/spi-interfaces/",
    "practice": "/spi-interfaces/practice/",
    "group": "Board-level buses",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "signals",
        "Name the signals and the topology"
      ],
      [
        "modes",
        "Derive the four modes from launch and capture edges"
      ],
      [
        "transactions",
        "Structure a transaction and count its cost"
      ],
      [
        "timing",
        "Derive the round-trip timing budget"
      ],
      [
        "integrity",
        "Protect the clock edge and chain devices"
      ],
      [
        "relatives",
        "Widen the bus and stream audio"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "i2c-bus",
    "number": "131",
    "title": "The I²C bus",
    "href": "/i2c-bus/",
    "practice": "/i2c-bus/practice/",
    "group": "Board-level buses",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "electrical",
        "Specify the open-drain electrical layer"
      ],
      [
        "protocol",
        "Follow a transfer bit by bit"
      ],
      [
        "pullups",
        "Size the pull-up resistors"
      ],
      [
        "clock",
        "Derive the clock rate and let targets stretch it"
      ],
      [
        "arbitration",
        "Resolve arbitration between controllers"
      ],
      [
        "faults",
        "Diagnose noise, level shifting and stuck buses"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "rs485-can",
    "number": "132",
    "title": "RS-485 and CAN",
    "href": "/rs485-can/",
    "practice": "/rs485-can/practice/",
    "group": "Cable interfaces",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "differential",
        "See what a differential pair rejects"
      ],
      [
        "rs485",
        "Read the RS-485 electrical specification"
      ],
      [
        "bus",
        "Terminate, bias and turn the bus around"
      ],
      [
        "can-phy",
        "Specify CAN's dominant and recessive states"
      ],
      [
        "can-frame",
        "Follow a frame through arbitration"
      ],
      [
        "timing",
        "Derive bit timing and maximum bus length"
      ],
      [
        "errors",
        "Confine faults with error counters"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "usb-ethernet",
    "number": "133",
    "title": "USB and Ethernet",
    "href": "/usb-ethernet/",
    "practice": "/usb-ethernet/practice/",
    "group": "Cable interfaces",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "clock",
        "Recover a clock from the data"
      ],
      [
        "usb-signal",
        "Specify USB 2.0 signalling"
      ],
      [
        "usb-coding",
        "Code bits with NRZI and stuffing"
      ],
      [
        "eth-phy",
        "Separate the Ethernet MAC from the PHY"
      ],
      [
        "eth-frame",
        "Count frame overhead and payload"
      ],
      [
        "layout",
        "Lay out the high-speed path"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  }
];
