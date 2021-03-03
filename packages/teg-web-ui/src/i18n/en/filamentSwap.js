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
      When you're ready Teg will heat {{name}} to {{materialTarget}}°C and then retract the
      filament {{distance}}mm to remove it from the extruder.
    `,
    skipContent: deline`
      If you have already removed your filament you can skip this step.
    `,
    skipButton: 'Skip to selecting a new material',
    noMaterial: deline`
      Teg is not aware of any filament loaded in your 3D printer. Please make sure there is no
      filament in your extruder or update your settings if there is.
    `,
  },
  heatExtruder: {
    title: deline`
      Heating
      ({{actualTemperature}} / {{targetTemperature}}°C)...
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
    instructions: {
      title: deline`
        Load Filament
      `,
      button: 'Load your new filament',
      details: deline`
        Your 3D printer will quickly load {{bowdenTubeLength}}mm of filament and then prime the hot
        end with a {{filamentSwapExtrudeDistance}}mm test extrusion.
      `,
      warningWord: 'Warning',
      warningContent: deline`
        Filament can jam while loading. Please make sure that your filament is seated properly
        before continuing. If the filament jams you should immediately power down and estop the 3D
        printer.
      `,
    },
    loading: {
      title: 'Loading Filament',
      details: deline`
        Your 3D printer will now automatically pull the filament {{bowdenTubeLength}}mm through to
        the end of your bowden tube or cold end and then prime the hot end with a
        {{filamentSwapExtrudeDistance}}mm test extrusion.
      `,
    },
  },
  adjustNewFilament: {
    title: 'Filament Swap Complete',
    content: deline`
      Your new filament is ready to go!
    `,
    adjustInstructions: deline`
      You can also extrude or retract here should you need to.
    `,
  },
}

export default filamentSwapEn
