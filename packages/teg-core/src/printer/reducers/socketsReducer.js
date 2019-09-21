import path from 'path'

import { Record, Map, List } from 'immutable'
import { loop, Cmd } from 'redux-loop'
import camelCase from 'camelcase'

import { createSocketManager, startSocketManager } from '../effects/socketManager'
import { SET_CONFIG } from '../../config/actions/setConfig'
import { SOCKET_MESSAGE } from '../actions/socketMessage'

import {
  ERRORED,
  ESTOPPED,
  DISCONNECTED,
  CONNECTING,
  READY,
} from '../types/statusEnum'

import {
  // CONTROLLER,
  AXIS,
  TOOLHEAD,
  // BUILD_PLATFORM,
  FAN,
} from '../../config/types/components/ComponentTypeEnum'

const statusCodes = [
  ERRORED, // 0
  ESTOPPED, // 1
  DISCONNECTED, // 2
  CONNECTING, // 3
  READY, // 4
]

export const initialState = Record({
  machines: Map(),
  socketManager: null,
})()

const Machine = Record({
  id: null,
  despooledLineNumber: null,
  status: null,
  error: null,
  motorsEnabled: null,

  events: List(),
  components: Map(),
})

const Component = Record({
  id: null,
  type: null,
  address: null,
  axis: null,
  heater: null,
  speedController: null,
})

const Axis = Record({
  id: null,
  targetPosition: null,
  actualPosition: null,
  homed: null,
})

const Heater = Record({
  id: null,
  targetTemperature: null,
  actualTemperature: null,
  enabled: null,
  blocking: null,
})

const SpeedController = Record({
  id: null,
  targetSpeed: null,
  actualSpeed: null,
  enabled: null,
})

// TODO: initial machine state generation based on configuration
const initialMachineState = ({ id }) => {
  const components = {
    axes: ['x', 'y', 'z'].map((address, i) => Component({
      id: `${id}-axis-${i}`,
      type: AXIS,
      address,
      axis: Axis({
        id: `${id}-axis-${i}`,
        targetPosition: null,
        actualPosition: null,
        homed: false,
      }),
    })),
    heaters: ['b', 'e0'].map((address, i) => Component({
      id: `${id}-heater-${i}`,
      type: TOOLHEAD,
      address,
      heater: Heater({
        id: `${id}-heater-${i}`,
        targetTemperature: null,
        actualTemperature: null,
        enabled: false,
        blocking: false,
      }),
    })),
    speedControllers: ['f0'].map((address, i) => Component({
      id: `${id}-speedController-${i}`,
      type: FAN,
      address,
      speedController: SpeedController({
        id: `${id}-speedController-${i}`,
        targetSpeed: null,
        actualSpeed: null,
        enabled: false,
      }),
    })),
  }

  const componentMap = List(Object.values(components).flat())
    .toMap()
    .mapKeys((k, v) => v.get('address'))

  return Machine({
    id,
    despooledLineNumber: null,
    status: CONNECTING,
    error: null,
    motorsEnabled: false,

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
        .setIn(['machines', machineID], initialMachineState({ id: machineID }))

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

      // console.log('FEE1D', message.feedback)

      /* eslint-disable no-param-reassign */
      const nextState = state.updateIn(['machines', machineID], m => m.withMutations((machine) => {
        // restructue component feedback to be structured more like the graphql Component type
        [
          ['axes', 'axis'],
          ['heaters', 'heater'],
          ['speedControllers', 'speedController'],
        ].forEach(([feedbackCollectionKey, componentType]) => {
          const entries = feedback[feedbackCollectionKey] || []

          entries
            .map(entry => Map(entry).mapKeys(k => camelCase(k)))
            .forEach((entry) => {
              machine = machine.mergeIn(['components', entry.get('address'), componentType], entry)
            })

          delete message.feedback[componentType]
        })

        // append events
        const existingEventIDs = machine.events.map(ev => ev.id)

        const events = feedback.events
          .map(ev => ({
            ...ev,
            id: `${ev.task_id}_${ev.type}`,
          }))
          .filter(ev => existingEventIDs.includes(ev.id) === false)

        machine = machine
          .update('events', existingEvents => existingEvents.concat(events))

        // set the status
        if (feedback.status != null) {
          machine = machine.set('status', statusCodes[feedback.status])
        }

        // merge the remaining feilds directly into the machine's state
        const scalars = [
          'despooled_line_number',
          'error',
          'motors_enabled',
        ]

        scalars
          .filter(k => feedback[k] != null)
          .forEach((k) => { machine = machine.set(camelCase(k), feedback[k]) })

        return machine
      }))

      // console.log('STATE!', JSON.stringify(nextState.machines.get(machineID).toJS(), null, 2))
      return nextState
    }
    default: {
      return state
    }
  }
}

export default socketsReducer
