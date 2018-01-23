// @flow
import rxParser from './rx_parser'

test('parses greetings', () => {
  const result = rxParser('start')

  expect(result).toEqual({
    type: 'greeting',
    raw: 'start',
  })
})

test('parses resends', () => {
  const result = rxParser('rs N:95')

  expect(result).toEqual({
    type: 'resend',
    raw: 'rs N:95',
    lineNumber: 95,
  })
})

test('parses echo lines', () => {
  const result = rxParser('echo:stuff')

  expect(result).toEqual({
    type: 'echo',
    raw: 'echo:stuff',
  })
})

test('parses debug lines', () => {
  const result = rxParser('debug_ stuff')

  expect(result).toEqual({
    type: 'debug',
    raw: 'debug_ stuff',
  })
})

test('parses errors', () => {
  const result = rxParser('error stuff')

  expect(result).toEqual({
    type: 'error',
    raw: 'error stuff',
  })
})

describe('parses oks', () => {
  test('without heater values', () => {
    const result = rxParser('ok')

    expect(result).toEqual({
      type: 'ok',
      raw: 'ok',
    })
  })

  test('with heater values', () => {
    const result = rxParser('ok t: 42 e3: 200')

    expect(result).toEqual({
      type: 'ok',
      raw: 'ok t: 42 e3: 200',
      temperatures: {
        e0: 42,
        e3: 200,
      },
      targetTemperaturesCountdown: null,
    })
  })

  test('with a w value', () => {
    const result = rxParser('ok t: 42 e3: 200 w: 29')

    expect(result).toEqual({
      type: 'ok',
      raw: 'ok t: 42 e3: 200 w: 29',
      temperatures: {
        e0: 42,
        e3: 200,
      },
      targetTemperaturesCountdown: 29000,
    })
  })
})

describe('parses temperature feedback', () => {
  test('with heater values', () => {
    const result = rxParser(' t: 42 e3: 200 w: 5')

    expect(result).toEqual({
      type: 'feedback',
      raw: ' t: 42 e3: 200 w: 5',
      temperatures: {
        e0: 42,
        e3: 200,
      },
      targetTemperaturesCountdown: 5000,
    })
  })
})
