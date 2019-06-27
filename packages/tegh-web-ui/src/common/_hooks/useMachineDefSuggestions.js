import { useState, useEffect, useMemo } from 'react'

const MACHINE_DEFS_DAT = 'dat://a295acba915cf57a98854f9f4ecf4be0aa03342a1b814bed591592b611f87e66/'

const useMachineDefSuggestions = () => {
  const [machineDefs, setMachineDefs] = useState(null)
  const loading = machineDefs == null

  useEffect(() => {
    (async () => {
      // TODO: re-implement machine lookups

      // // eslint-disable-next-line no-undef
      // const archive = new DatArchive(MACHINE_DEFS_DAT)
      // const indexFileContent = await archive.readFile('/index.json')
      // const index = JSON.parse(indexFileContent)
      //
      // setMachineDefs(index)
      setMachineDefs({})
    })()
  }, [])

  const suggestions = useMemo(() => (
    Object.entries(machineDefs || {})
      .filter(([, def]) => (
        def.visible && def.fileFormats.includes('text/x-gcode')
      ))
      .map(([filename, def]) => ({
        label: def.name,
        value: `${MACHINE_DEFS_DAT.slice(0, -1)}${filename}`,
      }))
  ), [machineDefs])

  return { suggestions, loading }
}

export default useMachineDefSuggestions
