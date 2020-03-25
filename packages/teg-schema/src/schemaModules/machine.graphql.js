export default `
# Queries

extend type Query {
  tegVersion: String!
  hasPendingUpdates: Boolean!
  isConfigured: Boolean!
  machines(machineID: ID): [Machine!]!
}

extend type Mutation {
  eStop(machineID: ID!): Boolean
  reset(machineID: ID!): Boolean
}

type Machine {
  id: ID!
  name: String!

  """
  The machine configuration for general settings.
  """
  configForm: ConfigForm!

  components(componentID: ID): [Component!]!
  plugins(package: String): [Plugin!]!

  availablePackages: [String!]!

  fixedListComponentTypes: [String!]!

  # """
  # The estimated number of seconds until the heater(s) reach their
  # targetTemperature.
  # """
  # targetTemperaturesCountdown: Float

  # """
  # The active extruder ID
  # """
  # activeExtruderID: String

  motorsEnabled: Boolean
  status: MachineStatusEnum!
  error: MachineError
  enabledMacros: [String!]!
  # logEntries(level: String, sources: [String!], limit: Int): [LogEntry!]
  gcodeHistory(limit: Int): [GCodeHistoryEntry!]

  # movementHistory: [MovementHistoryEntry!]!
}

type Plugin {
  id: ID!
  package: String!
  configForm: ConfigForm!
  isEssential:  Boolean!
}

type Component {
  id: ID!
  name: String!
  type: String!
  address: String

  configForm: ConfigForm!

  """
  set if this component is an axis. Null for all other components.
  """
  axis: Axis
  """
  set if this component contains a heater. Null for non-heater components.
  """
  heater: Heater
  """
  set if this component contains a toolhead. Null for non-toolhead components.
  """
  toolhead: Toolhead
  """
  set if this component is a SpeedController. Null for all other components.
  """
  speedController: SpeedController
}

type Axis {
  id: ID!
  """
  The current position in mm.
  """
  actualPosition: Float
  """
  The target position in mm.
  """
  targetPosition: Float
}

type Heater {
  """
  The current material\'s configured temperature in °C for this heater.

  When the Heater is enabled the targetTemperature will be set to the
  materialTargetTemperature.
  """
  materialTarget: Float

  """
  The target temperature in °C for this heater. The heater will attempt to make
  the actualTemperature equal to this temperature.
  """
  targetTemperature: Float

  """
  The current temperature in °C recorded by the heater’s thermocouple or
  thermister.
  """
  actualTemperature: Float

  """
  True if the machine is waiting on this heater to reach it’s targetTemp and
  preventing any more gcodes from executing until it does.
  """
  blocking: Boolean!

  history: [TemperatureHistoryEntry!]!
}

type SpeedController {
  """
  True if the SpeedController is on.
  """
  enabled: Boolean

  """
  The speed of the SpeedController in RPM.
  """
  actualSpeed: Float
  targetSpeed: Float
  maxSpeed: Float!
}

type Toolhead  {
  currentMaterial: Material
}

type TemperatureHistoryEntry {
  id: ID!
  createdAt: DateTime!
  targetTemperature: Float!
  actualTemperature: Float!
}

type MovementDataPoint {
  address: String!
  value: Float!
}

# type MovementHistoryEntry {
#   id: ID!
#   createdAt: DateTime!
#   position: [MovementDataPoint!]!
#   inboundFeedrate: Float!
# }

type GCodeHistoryEntry {
  id: ID!
  direction: GCodeHistoryDirection!,
  createdAt: DateTime!
  content: String!
}

enum GCodeHistoryDirection {
  """GCode sent to the machine"""
  TX

  """GCode response received from the machine"""
  RX
}

# type LogEntry {
#   id: ID!
#   createdAt: DateTime!
#   source: String!
#   level: String!
#   message: String!
# }

type MachineError {
  """
  A machine-readable code indicating the type of error
  """
  code: String!

  """
  A human-readable description of the error
  """
  message: String!
}

enum MachineStatusEnum {
  """
  The machine is being initialized. Attempting to spool anything will result in an error.
  """
  CONNECTING

  """The machine is connected and able to spool tasks/jobs."""
  READY

  """
  The machine is printing a job. Attempting to spool anything will result in an error.
  """
  PRINTING

  """
  The machine is disconnected or turned off. Attempting to spool anything will result in an error.
  """
  DISCONNECTED

  """
  The machine is being initialized. Attempting to spool anything except for an
  emergency macro (ie. reset) will result in an error. Spool the \`reset\` macro
  to reset the error and change the status to \`CONNECTING\`.
  """
  ERRORED

  """
  The machine is estopped. Attempting to spool anything except for an emergency
  macro (ie. reset) will result in an error. Spool the \`reset\` macro to reset
  the estop and change the status to \`CONNECTING\`.
  """
  ESTOPPED
}
`
