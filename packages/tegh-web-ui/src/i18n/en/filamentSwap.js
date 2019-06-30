import deline from 'deline'

const filamentSwapEn = {
  // Dialog
  title: 'Swap Filament',
  finishWord: 'Finish',
  nextWord: 'Next',
  backWord: 'Back',
  notReadyWhiteoutTitle: 'Filament swap disabled while {{status}}',

  // Steps
  intro: {
    content: deline`
      When you're ready Teg will heat {{name}} to {{materialTarget}}°C and then retract the filament {{distance}}mm to remove it from the extruder.
    `,
    skipContent: deline`
      If you have already removed your filament you can skip this step.
    `,
    skipButton: 'Skip to selecting a new material',
  },
  heatExtruder: {
    title: deline`
      Heating
      ({{currentTemperature}} / {{targetTemperature}}°C)...
    `,
  },
  retract: {
    title: 'Heated to {{targetTemperature}}°C. Retracting {{distance}}mm...',
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
    content: deline`
      Now that the filament has been removed you can replace it.
    `,
    materialWord: 'Material',
  },
  loadFilament: {
    title: 'Load the Filament',
    content: deline`
      Please insert the new filament and slowly extrude it until it until it begins to push out of the nozzle.\n
    `,
    warningWord: 'Warning',
    warningTitle: deline`
      Filament can easily jam while loading. Watch that filament is fed into the printer with each extrusion.
    `,
    warningContent: deline`
      If the filament jams please retract the filament and determine why the jam occured. Continuing to extrude a jammed filament may damage your machine.
    `,
  },
}

export default filamentSwapEn
