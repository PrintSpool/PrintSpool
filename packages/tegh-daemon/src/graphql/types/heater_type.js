import tql from 'typiql'
import snl from 'strip-newlines'
import {
  GraphQLObjectType
} from 'graphql'

const HeaterType = new GraphQLObjectType({
  name: 'Heater',
  description: 'A heated bed or extruder',
  fields: () => ({
    id: {
      type: tql`ID!`,
    },
    targetTemperature: {
      type: tql`Float!`,
      description: snl`
        The target temperature in °C for this heater. The heater will
        attempt to make the current_temp equal to this temperature.
      `,
    },
    currentTemperature: {
      type: tql`Float!`,
      description: snl`
        The current temperature in °C recorded by the heater’s thermocouple
        or thermister.
      `,
    },
    blocking: {
      type: tql`Boolean!`,
      description: snl`
        True if the printer is waiting on this heater to reach it’s
        targetTemp and preventing any more gcodes from executing until it does.
      `,
    },
  })
})

export default HeaterType
