import deline from 'deline'

const filamentSwapEn = {
  intro: {
    title: 'Let\'s start by removing your current filament',
    content: deline`
      When your ready Tegh will heat your extruder to 220° and then retract the filament 100mm out of the extruder.
    `,
  },
  heatExtruder: {
    title: deline`
      Waiting to reach temperature
      ({{currentTemperature}} / {{targetTemperature}}°C)...
    `,
  }
}

export default filamentSwapEn
