// eslint-disable-next-line import/no-extraneous-dependencies
import { advanceTo } from 'jest-date-mock'
import uuid from 'uuid'

const installDeterministicUUID = () => {
  let index = -1

  jest.spyOn(uuid, 'v4').mockImplementation(() => {
    index += 1
    return `MOCK_ID_${index}`
  })
}

const installDeterministicDate = () => {
  advanceTo(new Date('2018'))
  let date = new Date('2018')

  jest.spyOn(Date, 'now').mockImplementation(() => {
    date += 1
    return date
  })
}

const deterministicTestSetup = () => {
  installDeterministicUUID()
  installDeterministicDate()
}

export default deterministicTestSetup
