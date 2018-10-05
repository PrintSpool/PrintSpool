describe('SERIAL_RECEIVE', () => {
  describe('on receiving a greeting', () => {
    it('sends hello', async () => {
      const state = initialState.set('status', PRINTER_READY)

      const nextState = reducer(state, serialReceive('ok'))

      expect(pause.length).toEqual(50)
      expect(result).toMatchObject([
        serialReceive('greeting'),
        sendHello,
      ])
    })
  })

  describe('on receiving a \'ok\' to the hello message', () => {
    it('puts PRINTER_READY', async () => {
      const state = initialState.set('status', PRINTER_READY)

      reducer(state, serialReceive('ok'))

      expect(result).toMatchObject([
        serialReceive('ok'),
        printerReadyAction,
      ])
    })
  })
})
describe('GREETING_DELAY_DONE', () => {
  it('', () => {
  })
})
