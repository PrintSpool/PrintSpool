import { parseGCode } from 'tegh-core'
import txParser from './txParser'

const testMCode = collectionKey => (line, expectedOutput) => {
  test(`parses ${line}`, () => {
    const { macro, args } = parseGCode(line)
    const result = txParser({ macro, args })
    expect(result).toEqual({
      collectionKey,
      ...expectedOutput,
    })
  })
}

describe('heater MCodes', () => {
  const testHeaterMCode = testMCode('heaters')

  const extruderScenarios = [
    { description: 'single extruder', suffix: '', id: 'e0' },
    { description: 'multi extruder', suffix: ' p7', id: 'e7' },
  ]
  extruderScenarios.forEach(({ description, suffix, id }) => {
    describe(description, () => {
      testHeaterMCode(`M104 S218${suffix}`, {
        id,
        changes: {
          blocking: false,
          targetTemperature: 218,
        },
      })
      testHeaterMCode(`M109 R160${suffix}`, {
        id,
        changes: {
          blocking: true,
          targetTemperature: 160,
        },
      })
      testHeaterMCode(`M109 S218${suffix}`, {
        id,
        changes: {
          blocking: true,
          targetTemperature: 218,
        },
      })
      testHeaterMCode(`M116${suffix}`, {
        id,
        changes: {
          blocking: true,
        },
      })
    })
  })

  describe('bed', () => {
    testHeaterMCode('M140 S130', {
      id: 'b',
      changes: {
        blocking: false,
        targetTemperature: 130,
      },
    })
    testHeaterMCode('M190 S130', {
      id: 'b',
      changes: {
        blocking: true,
        targetTemperature: 130,
      },
    })
    testHeaterMCode('M190 R42', {
      id: 'b',
      changes: {
        blocking: true,
        targetTemperature: 42,
      },
    })
  })
})

describe('fan MCodes', () => {
  const testFanMCode = testMCode('fans')
  testFanMCode('M106', {
    id: 1,
    changes: {
      enabled: true,
      speed: 100,
    },
  })
  testFanMCode('M106 p8', {
    id: 8,
    changes: {
      enabled: true,
      speed: 100,
    },
  })
  testFanMCode('M106 p8 s128', {
    id: 8,
    changes: {
      enabled: true,
      speed: 50.2, // percent
    },
  })
  testFanMCode('M107 p5', {
    id: 5,
    changes: {
      enabled: false,
    },
  })
  testFanMCode('M107', {
    id: 1,
    changes: {
      enabled: false,
    },
  })
})
