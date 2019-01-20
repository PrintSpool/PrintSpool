import { Record, List } from 'immutable'

import Invite from './Invite'
import User from './User'

const AuthConfigFactory = Record({
  invites: List(),
  users: List(),
  hostIdentityKeys: null,
})

const AuthConfig = ({
  invites = [],
  users = [],
  ...props
} = {}) => (
  AuthConfigFactory({
    invites: List(invites).map(Invite),
    users: List(users).map(User),
    ...props,
  })
)

export default AuthConfig
