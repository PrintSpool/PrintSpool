// @flow
import txParser from '../src/tx_parser'

test('parses the line number', () => {
  const result = txParser('N1337 g1 x10')

  expect(result).toEqual({
    lineNumber: 1337,
  })
})

const testMCode = (type) => (line, expectedOutput) => {
  test(`parses ${line}`, () => {
    const result = txParser(`N123 ${line}*unparsedChecksumStuff`)
    expect(result).toEqual({
      lineNumber: 123,
      type,
      ...expectedOutput
    })
  })
}

describe('heater MCodes', () => {
  const testHeaterMCode = testMCode('HEATER_CONTROL')

  const extruderScenarios = [
    {description: 'single extruder', suffix: '', id: 'e0'},
    {description: 'multi extruder', suffix: ' p7', id: 'e7'},
  ].forEach(({description, suffix, id}) => {
    describe(description, () => {
      testHeaterMCode(`M104 S218${suffix}`, {
        id,
        changes: {
          blocking: false,
          targetTemperature: 218,
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
        }
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
  const testFanMCode = testMCode('FAN_CONTROL')
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
      speed: 0,
    },
  })
})
