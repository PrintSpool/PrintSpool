import { Record, Map, List } from 'immutable'

import {
  ESTOP,
  DRIVER_ERROR,
  PRINTER_DISCONNECTED,
  SET_CONFIG,
  ComponentTypeEnum,
  getHeaterConfigs,
  getComponentsByType,
} from '@tegh/core'

import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import { SERIAL_SEND } from '../../serial/actions/serialSend'

const { FAN, AXIS } = ComponentTypeEnum

const MAX_MOVEMENT_HISTORY = 50
const MAX_TEMPERATURE_HISTORY = 50

const initialPosition = Record({
  id: 1,
  position: { x: 0, y: 0, z: 0 },
  inboundFeedrate: 0,
})()

export const initialState = Record({
  targetTemperaturesCountdown: null,
  activeExtruderAddress: 'e0',
  relativeMovement: false,
  /*
   * the components' non-configuration/dynamic/ephemeral data (eg.
   * currentTemperature) indexed by their ID
   */
  byAddress: Map(),
  movementHistory: List([initialPosition]),
  temperatureHistory: List(),
  temperatureKeys: [],
})()

export const Heater = Record({
  heater: true,
  id: null,
  type: null,
  address: null,
  currentTemperature: 0,
  targetTemperature: null,
  blocking: false,
})

export const Fan = Record({
  id: null,
  type: null,
  address: null,
  enabled: false,
  speed: 0,
})

export const Axis = Record({
  id: null,
  address: null,
  type: null,
  position: 0,
})

const componentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload

      const heaterConfigs = getHeaterConfigs(config)
      const fanConfigs = getComponentsByType(config).get(FAN, Map())
      const axesConfigs = getComponentsByType(config).get(AXIS, Map())

      const heaters = heaterConfigs.mapEntries(([id, component]) => {
        const address = component.model.get('address')
        return [
          address,
          Heater({
            id,
            address,
            type: component.type,
          }),
        ]
      })

      const fans = fanConfigs.mapEntries(([id, component]) => {
        const address = component.model.get('address')
        return [
          address,
          Fan({
            id,
            address,
            type: component.type,
          }),
        ]
      })

      const axes = axesConfigs.mapEntries(([id, component]) => {
        const address = component.model.get('address')
        return [
          address,
          Axis({
            id,
            address,
            type: component.type,
          }),
        ]
      })

      const dynamicComponents = heaters
        .merge(fans)
        .merge(axes)

      return initialState
        .set('byAddress', dynamicComponents)
        .set('temperatureKeys', heaters.keySeq().toArray())
        .set('temperatureHistory', List())
    }
    case DRIVER_ERROR:
    case ESTOP:
    case PRINTER_DISCONNECTED: {
      /*
       * reset all the dynamic attributes of each component
       */
      return initialState
        .set('temperatureHistory', state.temperatureHistory)
        .set('byAddress', state.byAddress.map((ephemeralComponent) => {
          const {
            id,
            type,
            address,
          } = ephemeralComponent
          const perminentAttrs = { id, type, address }

          if (ephemeralComponent.type === FAN) {
            return Fan(perminentAttrs)
          }
          if (ephemeralComponent.heater === true) {
            return Heater(perminentAttrs)
          }
          if (ephemeralComponent.type === AXIS) {
            return Axis(perminentAttrs)
          }
          return ephemeralComponent
        }))
    }
    case SERIAL_RECEIVE: {
      const {
        temperatures,
        targetTemperaturesCountdown,
        position,
      } = action.payload

      let nextState = state

      if (position != null) {
        Object.entries(position).forEach(([k, v]) => {
          if (state.byAddress.get(k) == null) return
          nextState = nextState.setIn(['byAddress', k, 'position'], v)
        })
      }

      if (temperatures != null) {
        nextState = nextState.update('temperatureHistory', (history) => {
          const nextEntry = {
            createdAt: Date.now(),
            temperatures: state.temperatureKeys.map(address => ({
              address,
              targetTemperature: (
                state.byAddress.getIn([address, 'targetTemperature'], 0)
              ),
              currentTemperature: temperatures[address] || 0,
            })),
          }

          let nextHistory = history.unshift(nextEntry)
          if (nextHistory.size > MAX_TEMPERATURE_HISTORY) {
            nextHistory = nextHistory.pop()
          }
          return nextHistory
        })
        Object.entries(temperatures).forEach(([k, v]) => {
          if (state.byAddress.get(k) == null) return
          nextState = nextState.setIn(['byAddress', k, 'currentTemperature'], v)
        })
      }

      if (targetTemperaturesCountdown != null) {
        // TODO: targetTemperaturesCountdown does not get reset anywhere
        // after a target temperature is reached
        nextState = nextState.set(
          'targetTemperaturesCountdown', targetTemperaturesCountdown,
        )
      }

      return nextState
    }
    case SERIAL_SEND: {
      const {
        macro,
        collectionKey,
        // Legacy: This is actually the address of the component not it's id
        id,
        changes,
        activeExtruderAddress,
        movement,
      } = action.payload

      let nextState = state

      // update the movement history
      if (movement != null) {
        const { position, id: previousID } = state.movementHistory.first()
        const nextPosition = state.byAddress
          .filter(c => c.type === 'AXIS')
          .map((c) => {
            const offset = state.relativeMovement ? position[c.address] : 0
            return offset + (movement.axes || 0)
          })
        nextState = nextState.update('movementHistory', (history) => {
          let nextHistory = history.unshift({
            id: previousID + 1,
            position: nextPosition,
            inboundFeedrate: movement.feedrate,
          })
          if (nextHistory.size > MAX_MOVEMENT_HISTORY) {
            nextHistory = nextHistory.pop()
          }
          return nextHistory
        })
      }

      // update the heater or fan's state.
      if (collectionKey != null) {
        nextState = nextState.mergeIn(['byAddress', id], changes)
      }

      if (activeExtruderAddress != null) {
        nextState = nextState
          .set('activeExtruderAddress', activeExtruderAddress)
      }

      if (macro === 'G91' || macro === 'G90') {
        nextState = nextState.set('relativeMovement', macro === 'G91')
      }

      return nextState
    }
    default: {
      return state
    }
  }
}

export default componentsReducer
