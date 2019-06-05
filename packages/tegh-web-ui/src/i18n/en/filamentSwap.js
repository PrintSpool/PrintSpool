import deline from 'deline'

const filamentSwapEn = {
  intro: {
    title: 'Let\'s start by removing your current filament',
    content: deline`
      When your ready Tegh will heat your extruder to 220° and then retract the filament 100mm out of the extruder.
    `,
    skipToFilamentSelection: 'Skip to Filament Selection',
  },
  heatExtruder: {
    title: deline`
      Waiting while your extruder heats up
      ({{currentTemperature}} / {{targetTemperature}}°C)...
    `,
  },
  retracct: {
    title: 'Retracting {{distance}}mm of filament',
  },
}

export default filamentSwapEn
