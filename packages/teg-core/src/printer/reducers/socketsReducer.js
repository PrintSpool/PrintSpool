// import path from 'path'
import { Record, List, Map } from 'immutable'
import { loop, Cmd } from 'redux-loop'
import camelCase from 'camelcase'

import { createSocketManager, startSocketManager, sendToSocket } from '../effects/socketManager'
import { SET_CONFIG } from '../../config/actions/setConfig'
import { SOCKET_MESSAGE } from '../actions/socketMessage'
import { DEVICE_CONNECTED } from '../../devices/actions/deviceConnected'

import {
  ERRORED,
  ESTOPPED,
  DISCONNECTED,
  CONNECTING,
  READY,
} from '../types/statusEnum'

import {
  CONTROLLER,
  AXIS,
  TOOLHEAD,
  BUILD_PLATFORM,
  FAN,
} from '../../config/types/components/ComponentTypeEnum'

import { SEND_TASK_TO_SOCKET } from '../actions/sendTaskToSocket'
import { SEND_DELETE_TASK_HISTORY_TO_SOCKET } from '../actions/sendDeleteTaskHistoryToSocket'

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
  configuredDeviceIDs: List(),
  id: null,
  despooledLineNumber: null,
  status: null,
  error: null,
  motorsEnabled: null,

  components: Map(),
})

const Component = Record({
  id: null,
  machineID: null,
  type: null,
  address: null,
  axis: null,
  heater: null,
  speedController: null,
})

const Axis = Record({
  id: null,
  machineID: null,
  targetPosition: null,
  actualPosition: null,
  homed: null,
})

const Heater = Record({
  id: null,
  machineID: null,
  targetTemperature: null,
  actualTemperature: null,
  enabled: null,
  blocking: null,
})

const SpeedController = Record({
  id: null,
  machineID: null,
  targetSpeed: null,
  actualSpeed: null,
  enabled: null,
})

// TODO: initial machine state generation based on configuration
const initialMachineState = ({
  machineID,
  machineConfig,
  plugins,
}) => {
  const components = machineConfig.components
    .map((componentConfig) => {
      const address = componentConfig.model.get('address')
      const { id, type } = componentConfig

      const idAttrs = {
        id,
        machineID,
      }

      const commonComponentAttrs = {
        ...idAttrs,
        type,
      }

      switch (type) {
        case CONTROLLER: {
          return Component(commonComponentAttrs)
        }
        case AXIS: {
          return Component({
            ...commonComponentAttrs,
            address,
            axis: Axis({
              ...idAttrs,
              targetPosition: null,
              actualPosition: null,
              homed: false,
            }),
          })
        }
        case TOOLHEAD:
        case BUILD_PLATFORM: {
          return Component({
            ...commonComponentAttrs,
            address,
            heater: Heater({
              ...idAttrs,
              targetTemperature: null,
              actualTemperature: null,
              enabled: false,
              blocking: false,
            }),
          })
        }
        case FAN: {
          return Component({
            ...commonComponentAttrs,
            address,
            speedController: SpeedController({
              ...idAttrs,
              targetSpeed: null,
              actualSpeed: null,
              enabled: false,
            }),
          })
        }
        default: {
          throw new Error(`Invalid component type: ${type}`)
        }
      }
    })
    .toMap()
    .mapKeys((k, v) => (v.type === CONTROLLER ? 'CONTROLLER' : v.get('address')))

  const driverPlugin = plugins.find((plugin, packageName) => (
    plugin.driver && machineConfig.plugins.some(c => c.package === packageName)
  ))

  const { configuredDevices = () => [] } = driverPlugin
  console.log(configuredDevices({ machineConfig }))

  return Machine({
    id: machineID,
    configuredDeviceIDs: List(configuredDevices({ machineConfig })),
    despooledLineNumber: null,
    status: CONNECTING,
    error: null,
    motorsEnabled: false,

    components,
  })
}

const socketsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config, plugins } = action.payload
      // TODO: machine IDs and socket paths
      const machineID = config.printer.id
      const socketPath = `/var/run/teg/machine-${machineID}.sock`

      if (state.socketManager != null) {
        state.socketManager.close()
      }
      const socketManager = createSocketManager({ machineID, socketPath })

      const machineState = initialMachineState({
        machineID,
        machineConfig: config.printer,
        plugins,
      })

      const nextState = state
        .merge({ socketManager })
        .setIn(['machines', machineID], machineState)

      return loop(
        nextState,
        Cmd.run(startSocketManager, {
          args: [socketManager, Cmd.dispatch],
        }),
      )
    }
    case SEND_TASK_TO_SOCKET: {
      const { task } = action.payload
      const { machineID } = task

      const message = {
        spoolTask: {
          taskId: task.id,
          machineOverride: task.machineOverride,
        },
      }

      if (task.filePath != null) {
        message.spoolTask.filePath = task.filePath
      } else {
        message.spoolTask.inline = { commands: task.commands }
      }

      return loop(
        state,
        Cmd.run(sendToSocket, {
          args: [state.socketManager, machineID, message],
        }),
      )
    }
    case SEND_DELETE_TASK_HISTORY_TO_SOCKET: {
      const { taskIDs, machineID } = action.payload

      const message = {
        deleteTaskHistory: {
          taskIds: taskIDs,
        },
      }

      return loop(
        state,
        Cmd.run(sendToSocket, {
          args: [state.socketManager, machineID, message],
        }),
      )
    }
    case DEVICE_CONNECTED: {
      const { device } = action.payload
      console.log('CONNECTED', device.id)

      const machine = state.machines.find(m => (
        m.configuredDeviceIDs.includes(device.id)
      ))

      if (machine == null) {
        return state
      }

      const message = {
        deviceDiscovered: {
          devicePath: device.id,
        },
      }

      return loop(
        state,
        Cmd.run(sendToSocket, {
          args: [state.socketManager, machine.id, message],
        }),
      )
    }
    case SOCKET_MESSAGE: {
      const { machineID, message } = action.payload

      const feedback = message.feedback || {}

      // console.log('FEE1D', feedback)

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

          delete feedback[componentType]
        })

        // set the status
        if (feedback.status != null) {
          machine = machine.set('status', statusCodes[feedback.status])
        }
        if (feedback.error != null) {
          machine = machine.set('error', {
            code: 'MACHINE_SERVICE_INTERNAL_ERROR',
            ...feedback.error,
          })
        }

        // merge the remaining feilds directly into the machine's state
        const scalars = [
          'despooled_line_number',
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
