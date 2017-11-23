import uuid from 'uuid-random'

// TODO: these values would be generated somehow here and then stored in a config file
const defaults = () => ({
  id: uuid(),
  heaters: ['e0', 'e1', 'b'],
  axes: ['x', 'y', 'z', 'e0', 'e1']
})

export default defaults
