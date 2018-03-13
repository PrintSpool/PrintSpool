import { fromJS } from 'immutable'

const expectToMatchImmutableSnapshot = ({ result, redactions }) => {
  let immutableObj = fromJS(result)
  for (const redaction of redactions) {
    immutableObj = immutableObj.setIn(redaction, '[REDACTED]')
  }

  expect(immutableObj.toJS()).toMatchSnapshot()
}

export default expectToMatchImmutableSnapshot
