import { Record } from 'immutable'

const AuthConfigFactory = Record({
  hostIdentityKeys: null,
})

const AuthConfig = ({
  ...props
} = {}) => (
  AuthConfigFactory({
    ...props,
  })
)

export default AuthConfig
