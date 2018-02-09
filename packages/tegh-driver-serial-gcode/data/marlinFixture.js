export const greeting = [
  'start',
  'echo:Marlin 1.1.0.9 ',
  'echo: Last Updated: 2016-04-27 12:00 | Author: (Alephtrieved (396 bytes)',
  'echo:Stepsompiled: Aug 26 2016',
  'echo: Free Memory: 4404  PlannerBufferBytes: 1232',
  'echo:V23 stored settings retrieved (396 bytes)',
  'echo:Steps per unit:',
  'echo:  M92 X100.50 Y100.50 Z1600.00 E833.00',
  'echo:Maximum feedrates (mm/s):',
  'echo:  M203 X800.00 Y800.00 Z8.00 E40.00',
  'echo:Maximum Acceleration (mm/s2):',
  'echo:  M201 X9000 Y9000 Z100 E1000',
  'echo:Accelerations: P=printing, R=retract and T=travel',
  'echo:  M204 P2000.00 R3000.00 T2000.00',
  'echo:Advanced variables: S=Min feedrate (mm/s), T=Min travel feedrate (mm/s), B=minimum segment time (ms), X=maximum XY jerk (mm/s),  Z=maximum Z jerk (mm/s),  E=maximum E jerk (mm/s)',
  'echo:  M205 S0.00 T0.00 B20000 X12.00 Z0.40 E10.00',
  'echo:Home offset (mm):',
  'echo:  M206 X0.00 Y0.00 Z0.00',
  'echo:PID settings:',
  'echo:  M301 P28.79 I1.91 D108.51 C100.00 L20',
  'echo:  M304 P294.00 I65.00 D382.00',
  'echo:Filament settings: Disabled',
  'echo:  M200 D3.00',
  'echo:  M200 D0',
  'echo:Z-Probe Offset (mm):',
  'echo:  M851 Z-1.43',
]

export const responses = {
  g1: [
    'ok',
  ],
  m105: [
    'ok T:25.3 /0.0 B:25.8 /0.0 B@:0 @:0',
  ],
  g28: [
    'X:0.00 Y:191.00 Z:159.00 E:0.00 Count X: 0 Y:19196 Z:254400',
    'ok',
  ],
  m112: [
    'Error:Printer halted. kill() called!'
  ],
}

export const errors = {
  sentSameLineTwice: [
    'Error:Line Number is not Last Line Number+1, Last Line: 1',
  ],
  checksumMismatch: [
    'Error:checksum mismatch, Last Line: 0',
    'Resend: 1',
    'ok P15 B4',
  ],
  // in response to G29 (auto bed level)
  failToCleanNozzle: [
    'G29 Auto Bed Leveling',
    'Rewiping',
    'X:0.00 Y:191.00 Z:10.00 E:-30.00 Count X: 0 Y:19196 Z:16000',
    'Rewiping',
    'Error:PROBE FAIL CLEAN NOZZLE',
  ],
}
