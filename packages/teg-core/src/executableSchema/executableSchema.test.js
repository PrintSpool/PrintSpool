import executableSchema from './executableSchema'

describe(executableSchema, () => {
  it('does not error', () => {
    expect(executableSchema).not.toThrow()
  })
})
