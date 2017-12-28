import tql from 'typiql'
import HeaterType from '../types/heater_type.js'

const heatersChangedSubscription = () => ({
  type: tql`[${HeaterType}!]!`,
  subscribe: () => console.log(arguments)//pubsub.asyncIterator('heatersChanged')
})

export default heatersChangedSubscription
