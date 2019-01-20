import { Record } from 'immutable'
import uuid from 'uuid'

const UserFactory = Record({
  id: null,
  type: 'USER',
  admin: false,
  publicKey: null,
})

const User = ({
  id = uuid.v4(),
  ...props
} = {}) => (
  UserFactory({
    id,
    ...props,
  })
)

export default User
