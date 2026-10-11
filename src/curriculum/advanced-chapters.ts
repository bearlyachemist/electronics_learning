export const advancedChapters = [
  {
    "id": "mos-bias-atlas",
    "number": "57",
    "title": "MOSFET bias: an operating-point atlas",
    "href": "/mos-bias-atlas/",
    "practice": "/mos-bias-atlas/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Draw the DC constraints"
      ],
      [
        "derive",
        "Intersect the device law with the load line"
      ],
      [
        "cases",
        "Compare three gate biases"
      ],
      [
        "spread",
        "Make the current survive part-to-part spread"
      ],
      [
        "limits",
        "Separate bias margin from signal margin"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-diode-load",
    "number": "58",
    "title": "Diode-connected MOSFET loads",
    "href": "/mos-diode-load/",
    "practice": "/mos-diode-load/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Two channel currents share one output"
      ],
      [
        "resistance",
        "What resistance does a diode connection present?"
      ],
      [
        "derive",
        "Apply KCL before introducing a gain"
      ],
      [
        "cases",
        "Exchange headroom for gain"
      ],
      [
        "limits",
        "What breaks the straight line?"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-current-mirror",
    "number": "59",
    "title": "The basic MOS current mirror",
    "href": "/mos-current-mirror/",
    "practice": "/mos-current-mirror/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "The reference branch establishes V_GS"
      ],
      [
        "derive",
        "Copy the law, including its voltage dependence"
      ],
      [
        "output",
        "Output resistance and compliance"
      ],
      [
        "cases",
        "Low, matched and high output voltages"
      ],
      [
        "reference",
        "Where the reference comes from"
      ],
      [
        "matching",
        "Matching"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-ratioed-mirrors",
    "number": "60",
    "title": "Ratioed and complementary MOS mirrors",
    "href": "/mos-ratioed-mirrors/",
    "practice": "/mos-ratioed-mirrors/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Change polarity and reference direction"
      ],
      [
        "derive",
        "Scale current, then solve the supply constraints"
      ],
      [
        "cases",
        "Compare available PMOS drain headroom"
      ],
      [
        "units",
        "Make ratios accurate with unit devices"
      ],
      [
        "tree",
        "Build and budget a bias tree"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-source-degeneration",
    "number": "61",
    "title": "Source degeneration in MOS circuits",
    "href": "/mos-source-degeneration/",
    "practice": "/mos-source-degeneration/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "A current increase moves its own gate reference"
      ],
      [
        "derive",
        "Keep drain and source equations together"
      ],
      [
        "benefits",
        "Four things degeneration buys"
      ],
      [
        "cases",
        "Degenerated mirrors and their price"
      ],
      [
        "limits",
        "DC, AC and noise are different questions"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-cascode-mirror",
    "number": "62",
    "title": "The cascode current mirror",
    "href": "/mos-cascode-mirror/",
    "practice": "/mos-cascode-mirror/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Identify the two feedback jobs"
      ],
      [
        "rout",
        "Derive output resistance"
      ],
      [
        "compliance",
        "Derive compliance, separately"
      ],
      [
        "cases",
        "Compare three current budgets"
      ],
      [
        "limits",
        "Audit start-up, loading and mismatch"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-wide-swing-mirror",
    "number": "63",
    "title": "Wide-swing cascode bias",
    "href": "/mos-wide-swing-mirror/",
    "practice": "/mos-wide-swing-mirror/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Separate signal devices from the bias generator"
      ],
      [
        "derive",
        "Design the output stack from its margins"
      ],
      [
        "cases",
        "Compare ideal and useful compliance"
      ],
      [
        "bias",
        "Generate the cascode bias"
      ],
      [
        "limits",
        "Include the missing circuit in the design"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-common-source",
    "number": "64",
    "title": "The resistor-loaded common-source amplifier",
    "href": "/mos-common-source/",
    "practice": "/mos-common-source/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "The specification"
      ],
      [
        "gain",
        "The gain is set by a voltage"
      ],
      [
        "design",
        "Design the operating point"
      ],
      [
        "distortion",
        "Distortion is set by the load voltage"
      ],
      [
        "frequency",
        "Place the frequency corners"
      ],
      [
        "limits",
        "Allocate the swing in both directions"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-active-load",
    "number": "65",
    "title": "Common-source stages with active loads",
    "href": "/mos-active-load/",
    "practice": "/mos-active-load/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Two current laws meet at one node"
      ],
      [
        "derive",
        "Convert current imbalance into voltage"
      ],
      [
        "loadlines",
        "See it on the load lines"
      ],
      [
        "cases",
        "Hold bias fixed while changing AC loading"
      ],
      [
        "limits",
        "Close the DC and AC design loops"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-source-follower",
    "number": "66",
    "title": "The resistor-loaded source follower",
    "href": "/mos-source-follower/",
    "practice": "/mos-source-follower/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Current determines the gate–source drop"
      ],
      [
        "derive",
        "Differentiate all source-dependent terms"
      ],
      [
        "cases",
        "Compare gate biases and body connections"
      ],
      [
        "buffer",
        "Use it as a buffer"
      ],
      [
        "limits",
        "Check drive, swing and source impedance"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-current-loaded-follower",
    "number": "67",
    "title": "Current-loaded source followers",
    "href": "/mos-current-loaded-follower/",
    "practice": "/mos-current-loaded-follower/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Add the sink to the source-node equation"
      ],
      [
        "derive",
        "Distinguish load current from bias current"
      ],
      [
        "cases",
        "Compare bias and signal limits"
      ],
      [
        "shift",
        "Use it as a level shifter"
      ],
      [
        "limits",
        "Inspect both transistors on every excursion"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-common-gate",
    "number": "68",
    "title": "Common-gate MOS amplifiers",
    "href": "/mos-common-gate/",
    "practice": "/mos-common-gate/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Move the signal to the source"
      ],
      [
        "derive",
        "Retain finite drain resistance in both ports"
      ],
      [
        "cases",
        "Trade input impedance against bias current"
      ],
      [
        "buffer",
        "Use it as a current buffer"
      ],
      [
        "limits",
        "Know when low input impedance is useful"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-cascode-amplifier",
    "number": "69",
    "title": "The MOS cascode voltage amplifier",
    "href": "/mos-cascode-amplifier/",
    "practice": "/mos-cascode-amplifier/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Treat the middle node as a circuit node"
      ],
      [
        "derive",
        "Distinguish effective transconductance from resistance"
      ],
      [
        "cases",
        "Compare unloaded and useful loaded gains"
      ],
      [
        "miller",
        "Hold the middle node still"
      ],
      [
        "limits",
        "Compare against alternatives on equal terms"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-differential-pair",
    "number": "70",
    "title": "The MOS differential pair",
    "href": "/mos-differential-pair/",
    "practice": "/mos-differential-pair/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Separate differential and common-mode coordinates"
      ],
      [
        "derive",
        "Solve the steering law before linearizing"
      ],
      [
        "halves",
        "Half-circuits"
      ],
      [
        "cases",
        "Watch currents move together"
      ],
      [
        "limits",
        "Match the pair and its surroundings"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-differential-range",
    "number": "71",
    "title": "Differential-pair range and rejection",
    "href": "/mos-differential-range/",
    "practice": "/mos-differential-range/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Replace the ideal tail with a transistor"
      ],
      [
        "derive",
        "Calculate three different ranges"
      ],
      [
        "cases",
        "Move common mode while holding the signal small"
      ],
      [
        "mismatch",
        "Mismatch turns common mode into signal"
      ],
      [
        "frequency",
        "Rejection falls with frequency"
      ],
      [
        "limits",
        "Apply the bounds instantaneously"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-mirror-loaded-differential",
    "number": "72",
    "title": "Mirror-loaded differential stages",
    "href": "/mos-mirror-loaded-differential/",
    "practice": "/mos-mirror-loaded-differential/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Follow the left current into the right load"
      ],
      [
        "derive",
        "Add currents, not voltage gains"
      ],
      [
        "offset",
        "Offset and the balanced output voltage"
      ],
      [
        "cases",
        "Compare current, gain and voltage margins"
      ],
      [
        "limits",
        "Treat the mirror as a signal path"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-differential-degeneration",
    "number": "73",
    "title": "Degenerated MOS differential pairs",
    "href": "/mos-differential-degeneration/",
    "practice": "/mos-differential-degeneration/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Keep two source voltages distinct"
      ],
      [
        "derive",
        "Write the exact input–current relation"
      ],
      [
        "cases",
        "Compare linearity and compliance together"
      ],
      [
        "split",
        "Degenerate without a DC drop"
      ],
      [
        "limits",
        "Choose resistors from a complete budget"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-complementary-output",
    "number": "74",
    "title": "Complementary MOS output followers",
    "href": "/mos-complementary-output/",
    "practice": "/mos-complementary-output/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Give the two gates distinct commands"
      ],
      [
        "crossover",
        "See the crossover"
      ],
      [
        "bias",
        "Set the idle current from the gate spread"
      ],
      [
        "replica",
        "Generate the spread with replicas"
      ],
      [
        "cases",
        "Compare three class-AB biases"
      ],
      [
        "power",
        "Budget the power"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-two-stage-amplifier",
    "number": "75",
    "title": "Build a two-stage MOS voltage amplifier",
    "href": "/mos-two-stage-amplifier/",
    "practice": "/mos-two-stage-amplifier/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Connect transconductance to voltage gain"
      ],
      [
        "derive",
        "Multiply gains and find the polarity"
      ],
      [
        "poles",
        "Two high-impedance nodes, two poles"
      ],
      [
        "split",
        "Split the poles with one capacitor"
      ],
      [
        "design",
        "Design for phase margin"
      ],
      [
        "limits",
        "Close a real feedback loop"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "mos-noise-design",
    "number": "76",
    "title": "MOS noise and transconductance efficiency",
    "href": "/mos-noise-design/",
    "practice": "/mos-noise-design/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Refer noise to the signal input"
      ],
      [
        "white",
        "White noise follows g_m"
      ],
      [
        "cases",
        "Compare noise against the source floor"
      ],
      [
        "efficiency",
        "Transconductance per microamp"
      ],
      [
        "flicker",
        "Flicker noise follows area"
      ],
      [
        "limits",
        "Match the model to the device and task"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-ideal",
    "number": "77",
    "title": "Ideal op amps and feedback",
    "href": "/opamp-ideal/",
    "practice": "/opamp-ideal/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "State the amplifier law and its domain"
      ],
      [
        "derive",
        "Obtain the rules from finite gain"
      ],
      [
        "saturation",
        "Watch the virtual short fail"
      ],
      [
        "polarity",
        "Check the feedback polarity"
      ],
      [
        "limits",
        "Use a repeatable solving order"
      ],
      [
        "precision-depth",
        "Use the golden rules within a working feedback loop"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-dc-errors",
    "number": "78",
    "title": "Real op amps: the DC error budget",
    "href": "/opamp-dc-errors/",
    "practice": "/opamp-dc-errors/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Assign error sources to specific nodes"
      ],
      [
        "derive",
        "Solve the signed noninverting equation"
      ],
      [
        "cases",
        "Compare source resistances"
      ],
      [
        "budget",
        "Build a worst-case budget"
      ],
      [
        "null",
        "Null what is repeatable"
      ],
      [
        "limits",
        "Include the complete signal source"
      ],
      [
        "precision-depth",
        "Design a precision instrument around a complete error budget"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-ac-limits",
    "number": "79",
    "title": "Bandwidth, slew and stability",
    "href": "/opamp-ac-limits/",
    "practice": "/opamp-ac-limits/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Start with one dominant pole"
      ],
      [
        "derive",
        "Gain–bandwidth and noise gain"
      ],
      [
        "slew",
        "Slew rate and full-power bandwidth"
      ],
      [
        "stability",
        "Phase margin and the second pole"
      ],
      [
        "settle",
        "Settling a step"
      ],
      [
        "limits",
        "Measure the relevant form of speed"
      ],
      [
        "precision-depth",
        "Compensate the complete loop and budget dynamic precision"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-bjt-internals",
    "number": "80",
    "title": "Inside a bipolar op amp",
    "href": "/opamp-bjt-internals/",
    "practice": "/opamp-bjt-internals/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Follow an original simplified construction"
      ],
      [
        "derive",
        "Connect exponential physics to specifications"
      ],
      [
        "cases",
        "Compare three input bias currents"
      ],
      [
        "slew",
        "Why bipolar op amps slew slowly"
      ],
      [
        "output",
        "Add output drive and protection"
      ],
      [
        "precision-depth",
        "Connect internal design choices to precision and overload behavior"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-cmos-internals",
    "number": "81",
    "title": "Inside a CMOS op amp",
    "href": "/opamp-cmos-internals/",
    "practice": "/opamp-cmos-internals/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Build the op amp from the MOS studies"
      ],
      [
        "derive",
        "Translate device parameters into amplifier behavior"
      ],
      [
        "cases",
        "Input range and complementary pairs"
      ],
      [
        "output",
        "Rail-to-rail outputs and their load"
      ],
      [
        "leakage",
        "Bias current, leakage and temperature"
      ],
      [
        "limits",
        "Treat rail range and low noise as separate goals"
      ],
      [
        "precision-depth",
        "Evaluate RRIO accuracy across common mode and load"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-input-tradeoffs",
    "number": "82",
    "title": "Choose BJT, JFET, CMOS or chopper inputs",
    "href": "/opamp-input-tradeoffs/",
    "practice": "/opamp-input-tradeoffs/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Include source impedance in every comparison"
      ],
      [
        "derive",
        "Build a frequency-aware input budget"
      ],
      [
        "cases",
        "Compare devices across source resistance"
      ],
      [
        "chopper",
        "Chopping and auto-zeroing"
      ],
      [
        "limits",
        "Choose against the actual measurement"
      ],
      [
        "precision-depth",
        "Select the amplifier by source, operating point and architecture"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-noninverting",
    "number": "83",
    "title": "Noninverting amplifiers and buffers",
    "href": "/opamp-noninverting/",
    "practice": "/opamp-noninverting/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Begin with a valid feedback connection"
      ],
      [
        "derive",
        "Design from noise gain and current"
      ],
      [
        "cases",
        "Compare three impedance scales"
      ],
      [
        "ac",
        "AC coupling and the bias return"
      ],
      [
        "limits",
        "Buffer the actual source and destination"
      ],
      [
        "precision-depth",
        "Bias a single-supply amplifier and build a practical lab chain"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-inverting-summing",
    "number": "84",
    "title": "Inverting and summing amplifiers",
    "href": "/opamp-inverting-summing/",
    "practice": "/opamp-inverting-summing/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Keep the summing node a voltage constraint"
      ],
      [
        "derive",
        "Calculate signal gains and noise gain separately"
      ],
      [
        "cases",
        "Compare a weighted two-input summer"
      ],
      [
        "dac",
        "A summing DAC"
      ],
      [
        "shift",
        "Shift and scale for a single supply"
      ],
      [
        "limits",
        "Set references and resistor accuracy deliberately"
      ],
      [
        "precision-depth",
        "Budget reference currents, range switching and T-network feedback"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-difference",
    "number": "85",
    "title": "Difference amplifiers and resistor CMRR",
    "href": "/opamp-difference/",
    "practice": "/opamp-difference/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Write both input paths"
      ],
      [
        "derive",
        "Expose differential and common-mode terms"
      ],
      [
        "cases",
        "Compare ratio mismatch at high common mode"
      ],
      [
        "monte",
        "Worst case and statistics"
      ],
      [
        "sense",
        "A high-side current sensor"
      ],
      [
        "limits",
        "Check source and input range together"
      ],
      [
        "precision-depth",
        "Preserve Kelvin accuracy and common-mode rejection in real wiring"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-instrumentation",
    "number": "86",
    "title": "Instrumentation amplifiers",
    "href": "/opamp-instrumentation/",
    "practice": "/opamp-instrumentation/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Inspect the internal outputs"
      ],
      [
        "derive",
        "Keep common mode at unity gain"
      ],
      [
        "cmrr",
        "Gain multiplies the CMRR"
      ],
      [
        "cases",
        "Move gain from one stage to another"
      ],
      [
        "bridge",
        "Design a bridge amplifier"
      ],
      [
        "limits",
        "Give the reference a real driver"
      ],
      [
        "precision-depth",
        "Design the INA input, protection, range and programmable gain together"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-transimpedance",
    "number": "87",
    "title": "Transimpedance amplifiers",
    "href": "/opamp-transimpedance/",
    "practice": "/opamp-transimpedance/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Define current direction and capacitance"
      ],
      [
        "derive",
        "Solve signal gain and frequency-dependent noise gain"
      ],
      [
        "stability",
        "See the stability problem"
      ],
      [
        "cases",
        "Compare three feedback capacitors"
      ],
      [
        "noise",
        "Budget noise and dynamic range"
      ],
      [
        "limits",
        "Protect the summing node's capacitance budget"
      ],
      [
        "precision-depth",
        "Apply sensitive feedback to troubleshooting and precision DMMs"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-integrator",
    "number": "88",
    "title": "Practical op-amp integrators",
    "href": "/opamp-integrator/",
    "practice": "/opamp-integrator/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Add a DC feedback path"
      ],
      [
        "derive",
        "Derive both frequency and time behavior"
      ],
      [
        "cases",
        "Compare DC leakage and useful integration"
      ],
      [
        "oscillator",
        "Build a triangle-wave oscillator"
      ],
      [
        "charge",
        "Measure charge"
      ],
      [
        "limits",
        "Design the capacitor as a real component"
      ],
      [
        "precision-depth",
        "Compare integration errors and design a calibrated charge measurement"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-differentiator",
    "number": "89",
    "title": "Band-limited differentiators",
    "href": "/opamp-differentiator/",
    "practice": "/opamp-differentiator/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Bound the derivative at both ends"
      ],
      [
        "derive",
        "Use impedances before approximating"
      ],
      [
        "resonance",
        "Find the resonance"
      ],
      [
        "cases",
        "Compare three input slopes"
      ],
      [
        "limits",
        "Noise and a defined bandwidth"
      ],
      [
        "precision-depth",
        "Specify derivative accuracy, pulse range and noise explicitly"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-active-filters",
    "number": "90",
    "title": "Active filters and Sallen–Key design",
    "href": "/opamp-active-filters/",
    "practice": "/opamp-active-filters/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Name the capacitors by their actual connections"
      ],
      [
        "derive",
        "Identify natural frequency and damping"
      ],
      [
        "cases",
        "Compare three damping choices"
      ],
      [
        "families",
        "Choose a filter family"
      ],
      [
        "design",
        "Design a unity-gain section and a cascade"
      ],
      [
        "limits",
        "Design against the specification, not one cutoff"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-precision-rectifier",
    "number": "91",
    "title": "Precision rectifiers and peak detection",
    "href": "/opamp-precision-rectifier/",
    "practice": "/opamp-precision-rectifier/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Name the two output nodes"
      ],
      [
        "derive",
        "Solve one topology for each diode state"
      ],
      [
        "switching",
        "The switching error"
      ],
      [
        "improved",
        "A two-diode rectifier that does not saturate"
      ],
      [
        "fullwave",
        "Full-wave rectification and an AC meter"
      ],
      [
        "peak",
        "Peak detection"
      ],
      [
        "limits",
        "Select a recovery-aware topology"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-current-servo",
    "number": "92",
    "title": "Op-amp current servos",
    "href": "/opamp-current-servo/",
    "practice": "/opamp-current-servo/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Return the source voltage to minus"
      ],
      [
        "derive",
        "Derive error and compliance budgets"
      ],
      [
        "cases",
        "Compare three sense voltages"
      ],
      [
        "compliance",
        "Find the compliance and the heat"
      ],
      [
        "source",
        "Source current into a grounded load"
      ],
      [
        "limits",
        "Close the loop around a capacitive gate"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-load-stability",
    "number": "93",
    "title": "Capacitive loads and feedback placement",
    "href": "/opamp-load-stability/",
    "practice": "/opamp-load-stability/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "A capacitor adds a pole"
      ],
      [
        "derive",
        "Decide where the resistor sits relative to feedback"
      ],
      [
        "cases",
        "Compare direct drive, isolation and dual feedback"
      ],
      [
        "charge",
        "Deliver the charge"
      ],
      [
        "limits",
        "Verify both stability and delivered accuracy"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  },
  {
    "id": "opamp-function-design",
    "number": "94",
    "title": "Analog functions and a complete design",
    "href": "/opamp-function-design/",
    "practice": "/opamp-function-design/practice/",
    "sections": [
      [
        "overview",
        "Start here"
      ],
      [
        "model",
        "Let the feedback element define the function"
      ],
      [
        "log",
        "Logarithms from a junction"
      ],
      [
        "decide",
        "Decisions from positive feedback"
      ],
      [
        "oscillate",
        "Sine waves from a controlled loop"
      ],
      [
        "chain",
        "Design a complete measurement chain"
      ],
      [
        "limits",
        "Close every budget"
      ],
      [
        "check",
        "Check your understanding"
      ]
    ]
  }
];
