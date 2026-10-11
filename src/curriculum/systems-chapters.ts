export const systemsChapters = [
  {
    "id": "precision-references",
    "number": "90",
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
    "id": "precision-noise-grounding",
    "number": "91",
    "title": "Noise, grounding and shielding",
    "href": "/precision-noise-grounding/",
    "practice": "/precision-noise-grounding/practice/",
    "group": "Precision measurement",
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
    "id": "precision-calibration",
    "number": "92",
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
    "id": "power-linear-regulators",
    "number": "94",
    "title": "Linear regulators and supply integrity",
    "href": "/power-linear-regulators/",
    "practice": "/power-linear-regulators/practice/",
    "group": "Linear regulation",
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
    "id": "power-buck-converters",
    "number": "98",
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
    "number": "99",
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
    "id": "power-control-layout",
    "number": "100",
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
    "id": "em-fields",
    "number": "101",
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
    "number": "102",
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
    "number": "103",
    "title": "RF components and the Smith chart",
    "href": "/rf-components-smith/",
    "practice": "/rf-components-smith/practice/",
    "group": "RF circuits",
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
    "number": "104",
    "title": "RF impedance and matching networks",
    "href": "/rf-impedance-matching/",
    "practice": "/rf-impedance-matching/practice/",
    "group": "RF circuits",
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
    "id": "oscillators-pll",
    "number": "105",
    "title": "Oscillators, PLLs and phase noise",
    "href": "/oscillators-pll/",
    "practice": "/oscillators-pll/practice/",
    "group": "RF circuits",
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
    "id": "rf-signal-chains",
    "number": "106",
    "title": "RF amplifiers, mixers and receiver design",
    "href": "/rf-signal-chains/",
    "practice": "/rf-signal-chains/practice/",
    "group": "RF circuits",
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
    "number": "107",
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
    "number": "108",
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
    "number": "109",
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
    "number": "110",
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
    "number": "111",
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
    "number": "112",
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
    "number": "113",
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
    "number": "115",
    "title": "Digital logic, timing and clock domains",
    "href": "/digital-logic-timing/",
    "practice": "/digital-logic-timing/practice/",
    "group": "Logic & timing",
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
    "id": "digital-board-protocols",
    "number": "116",
    "title": "UART, SPI and I²C in detail",
    "href": "/digital-board-protocols/",
    "practice": "/digital-board-protocols/practice/",
    "group": "Interfaces",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "layers",
        "Separate electrical signaling, framing and application meaning"
      ],
      [
        "uart",
        "Follow an asynchronous frame and its timing error"
      ],
      [
        "spi",
        "Choose clock phase from launch and capture edges"
      ],
      [
        "i2c",
        "Follow bus ownership, addressing and acknowledgments"
      ],
      [
        "pullups",
        "Derive a valid pull-up interval"
      ],
      [
        "audio",
        "Clock continuous audio and widen memory transfers"
      ],
      [
        "choose",
        "Compare useful work and failure behavior"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "digital-cable-interfaces",
    "number": "117",
    "title": "RS-485, CAN, USB and Ethernet",
    "href": "/digital-cable-interfaces/",
    "practice": "/digital-cable-interfaces/practice/",
    "group": "Interfaces",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "rs485",
        "Build an RS-485 bus and a separate message protocol"
      ],
      [
        "can",
        "Understand dominant arbitration and fault containment"
      ],
      [
        "usb",
        "Keep USB signaling, host behavior and Type-C distinct"
      ],
      [
        "ethernet",
        "Separate MAC packets from the cable PHY"
      ],
      [
        "choice",
        "Compare the link by its failure and timing budgets"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  }
];
