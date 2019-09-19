import { fromJS, isImmutable } from 'immutable'

const expectToMatchImmutableSnapshot = ({ result, redactions }) => {
  let immutableObj = fromJS(result)

  if (!isImmutable(immutableObj)) {
    throw new Error(`cannot convert to immutable object: ${result}`)
  }

  for (const redaction of redactions) {
    immutableObj = immutableObj.setIn(redaction, '[REDACTED]')
  }

  expect(immutableObj.toJS()).toMatchSnapshot()
}

export default expectToMatchImmutableSnapshot
