import deline from 'deline'

const filamentSwapEn = {
  // Dialog
  title: '{{name}} Filament Swap',
  finishWord: 'Finish',
  nextWord: 'Next',

  // Steps
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
  retract: {
    title: 'Retracting {{distance}}mm of filament',
  },
  remove: {
    title: 'Please remove your filament',
    content: deline`
      It should now safe to remove the filament from your extruder
      however if the filament does not come out easily you may need to retract it further.
    `,
  },
  selectMaterial: {
    title: 'Select your new filament',
    materialWord: 'Material',
  },
  loadFilament: {
    title: 'Load the Filament',
    content: deline`
      Please insert the new filament and slowly extrude it until it until it begins to push out of the nozzle.\n
    `,
    warningWord: 'Warning',
    warningContent: deline`
      Filaments can easily jam while loading. Watch that filament is fed into the printer with each extrusion. If the filament jams please retract the filament and determine why the jam occured. Continuing to extrude a jammed filament may damage your printer.
    `,
  },
}

export default filamentSwapEn
