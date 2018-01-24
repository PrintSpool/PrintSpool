// @flow
import txParser from './txParser'

const testMCode = (collectionKey) => (line, expectedOutput) => {
  test(`parses ${line}`, () => {
    const result = txParser(line)
    expect(result).toEqual({
      collectionKey,
      ...expectedOutput
    })
  })
}

describe('heater MCodes', () => {
  const testHeaterMCode = testMCode('heaters')

  const extruderScenarios = [
    {description: 'single extruder', suffix: '', id: 'e0'},
    {description: 'multi extruder', suffix: ' p7', id: 'e7'},
  ].forEach(({description, suffix, id}) => {
    describe(description, () => {
      testHeaterMCode(`M104 S218${suffix}`, {
        id,
        code: 'M104',
        changes: {
          blocking: false,
          targetTemperature: 218,
        },
      })
      testHeaterMCode(`M109 R160${suffix}`, {
        id,
        code: 'M109',
        changes: {
          blocking: true,
          targetTemperature: 160,
        },
      })
      testHeaterMCode(`M109 S218${suffix}`, {
        id,
        code: 'M109',
        changes: {
          blocking: true,
          targetTemperature: 218,
        },
      })
      testHeaterMCode(`M116${suffix}`, {
        id,
        code: 'M116',
        changes: {
          blocking: true,
        }
      })
    })
  })

  describe('bed', () => {
    testHeaterMCode('M140 S130', {
      id: 'b',
      code: 'M140',
      changes: {
        blocking: false,
        targetTemperature: 130,
      },
    })
    testHeaterMCode('M190 S130', {
      id: 'b',
      code: 'M190',
      changes: {
        blocking: true,
        targetTemperature: 130,
      },
    })
    testHeaterMCode('M190 R42', {
      id: 'b',
      code: 'M190',
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
    code: 'M106',
    changes: {
      enabled: true,
      speed: 100,
    },
  })
  testFanMCode('M106 p8', {
    id: 8,
    code: 'M106',
    changes: {
      enabled: true,
      speed: 100,
    },
  })
  testFanMCode('M106 p8 s128', {
    id: 8,
    code: 'M106',
    changes: {
      enabled: true,
      speed: 50.2, // percent
    },
  })
  testFanMCode('M107 p5', {
    id: 5,
    code: 'M107',
    changes: {
      enabled: false,
      speed: 0,
    },
  })
  testFanMCode('M107', {
    id: 1,
    code: 'M107',
    changes: {
      enabled: false,
      speed: 0,
    },
  })
})
