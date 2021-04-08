import React from 'react'
import { Story, Meta } from '@storybook/react'
import PrintCard from './PrintCard'

export default {
  title: 'PrintQueue/PrintCard',
  argTypes: {
    status: {
      table: { disable: true },
    },
    cancelTask: {
      table: { disable: true },
      action: 'cancelled',
    },
    pausePrint: {
      table: { disable: true },
      action: 'paused',
    },
    resumePrint: {
      table: { disable: true },
      action: 'resumed',
    },
  },
} as Meta

const isSettled = status => ['CANCELLED', 'ERROR', 'FINISHED'].includes(status)

const task = ({
  status,
  blocking,
}) => ({
  "__typename": "Task",
  "id": "JfDhZaikpkq",
  "percentComplete": 4.599999904632568,
  "estimatedPrintTimeMillis": 14488000,
  "startedAt": "2021-04-08T20:12:42.562483739+00:00",
  "stoppedAt": isSettled(status) ? "2021-04-08T20:12:42.562483739+00:00" : null,
  "status": status,
  "paused": status === 'PAUSED',
  "settled": isSettled(status),
  "partID": "GOcR-RXjjT1",
  "machine": {
    "__typename": "Machine",
    "id": "8dZOlkgMtWs",
    "name": "Newest Most Bestest Dev Printer",
    "status": "PRINTING",
    "components": [
      {
        "__typename": "Component",
        "id": "6",
        "name": "Extruder 1",
        "heater": {
          "__typename": "HeaterEphemeral",
          "id": "nJ6084PoekY",
          blocking,
          "actualTemperature": 80.89598083496094,
          "targetTemperature": 200
        }
      },
    ]
  }
})

const Template: Story = ({
  status,
  blocking,
  ...args
}) => (
  // @ts-ignore
  <PrintCard
    {...{
      print: {
        part: { name: "y-carriage.gcode" },
        task: task({ status, blocking}),
      },
      cancelTask: () => {},
      pausePrint: () => {},
      resumePrint: () => {},
      ...args
    }}
  />
)

export const Printing = Template.bind({})
Printing.args = {
  status: 'STARTED',
  blocking: false,
}

export const Completed = Template.bind({})
Completed.args = {
  status: 'FINISHED',
  blocking: false,
}

export const Cancelled = Template.bind({})
Cancelled.args = {
  status: 'CANCELLED',
  blocking: false,
}
