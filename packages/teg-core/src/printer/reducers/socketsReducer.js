// import path from 'path'
import { Record, List, Map } from 'immutable'
import { loop, Cmd } from 'redux-loop'

import { createSocketManager, startSocketManager, sendToSocket } from '../effects/socketManager'
import { SET_CONFIG } from '../../config/actions/setConfig'
import { SOCKET_MESSAGE } from '../actions/socketMessage'
import { DEVICE_CONNECTED } from '../../devices/actions/deviceConnected'
import { APPROVE_UPDATES } from '../../updates/actions/approveUpdates'

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
import { REQUEST_ESTOP } from '../actions/requestEStop'
import { REQUEST_RESET } from '../actions/requestReset'
import statusChanged from '../actions/statusChanged'

const statusCodes = [
  ERRORED, // 0
  ESTOPPED, // 1
  DISCONNECTED, // 2
  CONNECTING, // 3
  READY, // 4
]

export const initialState = Record({
  localID: null,
  machines: Map(),
  socketManager: null,
})()

const Machine = Record({
  configuredDeviceIDs: List(),
  id: null,
  status: null,
  error: null,
  motorsEnabled: false,

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
  homed: false,
})

const Heater = Record({
  id: null,
  machineID: null,
  targetTemperature: null,
  actualTemperature: null,
  enabled: false,
  blocking: false,
})

const SpeedController = Record({
  id: null,
  machineID: null,
  targetSpeed: null,
  actualSpeed: null,
  enabled: false,
})

const componentFeatures = {
  axis: Axis,
  heater: Heater,
  speedController: SpeedController,
}

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
            }),
          })
        }
        case FAN: {
          return Component({
            ...commonComponentAttrs,
            address,
            speedController: SpeedController({
              ...idAttrs,
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
      const socketPath = `/var/lib/teg/machine-${machineID}.sock`

      let effects = []

      if (state.socketManager != null) {
        const message = { resetWhenIdle: {} }

        effects = state.machines.map(machine => (
          Cmd.run(sendToSocket, {
            args: [state.socketManager, machine.id, message],
          })
        )).toList().toArray()
        // state.socketManager.close()
      }
      const socketManager = createSocketManager({ machineID, socketPath })

      const machineState = initialMachineState({
        machineID,
        machineConfig: config.printer,
        plugins,
      })

      const nextState = state
        .merge({ socketManager })
        .set('localID', config.host.localID)
        .setIn(['machines', machineID], machineState)

      effects.push(
        Cmd.run(startSocketManager, {
          args: [socketManager, Cmd.dispatch],
        }),
      )

      return loop(
        nextState,
        Cmd.list(effects),
      )
    }
    case APPROVE_UPDATES: {
      const message = {
        reset: {},
      }

      return loop(
        state,
        Cmd.list(state.machines.map(machine => (
          Cmd.run(sendToSocket, {
            args: [state.socketManager, machine.id, message],
          })
        )).toList().toArray()),
      )
    }
    case SEND_TASK_TO_SOCKET: {
      const { task } = action.payload
      const { machineID } = task

      const message = {
        spoolTask: {
          taskId: task.id,
          clientId: state.localID,
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
    case REQUEST_ESTOP: {
      const { machineID } = action.payload

      const message = {
        estop: {},
      }

      return loop(
        state,
        Cmd.run(sendToSocket, {
          args: [state.socketManager, machineID, message],
        }),
      )
    }
    case REQUEST_RESET: {
      const { machineID } = action.payload

      const message = {
        reset: {},
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
      const nextEffects = []

      // console.log('FEE1D', feedback)
      // console.log('responses + events', feedback.responses, feedback.events)

      /* eslint-disable no-param-reassign */
      const nextState = state.updateIn(['machines', machineID], m => m.withMutations((machine) => {
        // restructue component feedback to be structured more like the graphql Component type
        [
          ['axes', 'axis'],
          ['heaters', 'heater'],
          ['speedControllers', 'speedController'],
        ].forEach(([feedbackCollectionKey, componentType]) => {
          const entries = feedback[feedbackCollectionKey] || []

          // temporary speed controller percentage speed hack for 8 bit
          // marlin speeds
          if (componentType === 'speedController') {
            entries.forEach((entry) => {
              entry.targetSpeed = entry.targetSpeed === 255 ? 100 : null
            })
          }

          entries
            .forEach((entry) => {
              const Feature = componentFeatures[componentType]
              machine = machine.updateIn(
                ['components', entry.address, componentType],
                feature => (
                  Feature({
                    id: feature.id,
                    machineID: feature.machineID,
                  }).merge(entry)
                ),
              )
            })

          delete feedback[componentType]
        })

        // set the status
        if (feedback.status != null) {
          const nextStatus = statusCodes[feedback.status]
          // console.log(nextStatus)

          if (nextStatus !== machine.status) {
            machine = machine.set('status', nextStatus)

            nextEffects.push(Cmd.action(statusChanged(nextStatus)))
          }
        }
        // console.log(feedback)

        if (feedback.error != null) {
          machine = machine.set('error', {
            code: 'MACHINE_SERVICE_INTERNAL_ERROR',
            ...feedback.error,
          })
        }

        // merge the remaining feilds directly into the machine's state
        const scalars = [
          'despooledLineNumber',
          'motorsEnabled',
        ]

        scalars.forEach((k) => {
          machine = machine.set(k, feedback[k])
        })

        return machine
      }))

      // console.log('STATE!', JSON.stringify(nextState.machines.get(machineID).toJS(), null, 2))
      // console.log('STATUS!', state.machines.get(machineID).status, nextState.machines.get(machineID).status)

      return loop(
        nextState,
        Cmd.list(nextEffects),
      )
    }
    default: {
      return state
    }
  }
}

export default socketsReducer
