import path from 'path'

import { Record, Map, List, mergeDeep } from 'immutable'
import { loop, Cmd } from 'redux-loop'

import { createSocketManager, startSocketManager } from '../effects/socketManager'
import { SET_CONFIG } from '../../config/actions/setConfig'
import { SOCKET_MESSAGE } from '../actions/socketMessage'

/* reducer */

export const initialState = Record({
  machines: Map(),
  socketManager: null,
})()

const Machine = Record({
  despooled_line_number: null,
  status: null,
  error: null,
  motors_enabled: null,

  events: List(),
  components: Map(),
})


// TODO: initial machine state generation based on configuration
const initialMachineState = () => {
  const components = {
    axes: ['x', 'y', 'z'].map(address => Map({
      address,
      axis: Map({
        target_position: null,
        actual_position: null,
        homed: false,
      }),
    })),
    heaters: ['e0'].map(address => Map({
      address,
      heater: {
        target_temperature: null,
        actual_temperature: null,
        enabled: false,
        blocking: false,
      },
    })),
    // TODO: speed controllers
    speed_controllers: [].map(address => Map({
      address,
      axis: {
        target_speed: null,
        actual_speed: null,
        enabled: false,
      }
    })),
  }

  let componentMap = List(Object.values(components).flat())
    .toMap()
    .mapKeys((k, v) => v.get('address'))

  return Machine({
    despooled_line_number: null,
    status: 3, // 3 = Connecting
    error: null,
    motors_enabled: false,

    events: List(),
    components: componentMap,
  })
}

const socketsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      // const { config } = action.payload
      // const model = getPluginModels(config).get('@tegapp/core')
      // return state.set('automaticPrinting', model.get('automaticPrinting'))

      // TODO: machine IDs and socket paths
      const machineID = 0
      const socketPath = path.join(__dirname, '../../../../teg-rust-experimental/target/debug/machine.sock')

      const socketManager = createSocketManager({ machineID, socketPath })

      const nextState = state
        .merge({ socketManager })
        .setIn(['machines', machineID], initialMachineState())

      console.log('initial state', initialMachineState())

      return loop(
        nextState,
        Cmd.run(startSocketManager, {
          args: [socketManager, Cmd.dispatch],
        }),
      )
    }
    case SOCKET_MESSAGE: {
      const { machineID, message } = action.payload

      const feedback = message.feedback || {}

      console.log('FEE1D', message.feedback)


      let nextState = state.updateIn(['machines', machineID], m => m.withMutations((machine) => {
        // restructue component feedback to be structured more like the graphql Component type
        ['axes', 'heaters', 'speedControllers'].forEach((componentType) => {
          (feedback[componentType] || []).forEach((entry) => {
            machine = machine.mergeIn(['components', entry.address, componentType], entry)
          })
  
          delete message.feedback[componentType]
        })
  
        let {
          events,
        } = feedback
        const {
          status,
        } = feedback

        const existingEventIDs = machine.events.map(ev => ev.id)

        events = events
          .map(ev => ({
            ...ev,
            id: `${ev.task_id}_${ev.type}`,
          }))
          .filter(ev => existingEventIDs.includes(ev.id) === false)

        // merge the remaining feilds directly into the machine's state
        machine = machine
          .set('status', status)
          .update('events', existingEvents => existingEvents.concat(events))

        return machine
      }))

      console.log('STATE!', JSON.stringify(nextState.machines.get(machineID).toJS(), null, 2))
      return nextState
    }
    default: {
      return state
    }
  }
}

export default socketsReducer
