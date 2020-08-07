export default `
# Mutations

extend type Mutation {
  """
  Spools and executes GCode outside of the job queue.

  execGCodes is synchronous and will return only once the GCode has executed
  and any resulting machine movements are done.

  This means that for example if you use execGCodes to run \`G1 X100\nM400\` the
  mutation will wait until the toolhead has moved 100mm and then return.

  This can be useful for informing users whether an action is in progress or
  completed.

  If the machine errors during the execution of the GCode the mutation will
  fail.

  Note a null Task is presently always returned. This may chance in the future
  if we introduce an async flag for execGCodes.

  See ExecGCodesInput.gcodes for GCode formatting options.
  """
  execGCodes(input: ExecGCodesInput!): Task

  """
  Starts a print by spooling a task to print the job file.
  """
  spoolJobFile(input: SpoolJobFileInput!): Task!
}

input ExecGCodesInput {
  machineID: ID!
  """
  If true blocks the mutation until the GCodes have been spooled to the machine (default: false)
  """
  sync: Boolean

  """
  If true allows this gcode to be sent during a print and inserted before the print gcodes. This can
  be used to override print settings such as extuder temperatures and fan speeds (default: false)

  override GCodes will not block. Cannot be used with sync = true.
  """
  override: Boolean

  """
  Teg supports 3 formats of GCode:

  1. Standard GCode Strings
    eg. \`gcodes: ["G1 X10", "G1 Y20"]\`
    and equivalently:
    \`gcodes: ["G1 X0\nG1 Y0"]\`
  2. JSON GCode Objects - To make constructing GCode easier with modern languages Teg allows GCodes to be sent as JSON objects in the format { [GCODE|MACRO]: ARGS }.
    eg. \`gcodes: [{ g1: { x: 10 } }, { g1: { y: 20 } }]\`
    Macros can also be called using JSON GCode Objects.
    eg. \`gcodes: [{ g1: { x: 10 } }, { delay: { period: 5000 } }]\`
  3. JSON GCode Strings - Teg allows GCodes to be serialized as JSON. JSON GCode Strings can also be Macro calls.
    GCode: \`gcodes: ["{ \"g1\": { \"x\": 10 } }", "{ \"delay\": { \"period\": 5000 } }"]\`
  """
  gcodes: [JSON!]!
}

input SpoolJobFileInput {
  machineID: ID!
  jobFileID: ID!
}

"""
A spooled set of gcodes to be executed by the machine
"""
type Task {
  id: ID!
  name: String!
  currentLineNumber: Int
  totalLineNumbers: Int!
  percentComplete(
    """
    The number of digits to the right of the decimal place to round to. eg.
    \`digits: 0\` => 83 \`digits: 1\` => 82.6 \`digits: 2\` => 82.62
    """
    digits: Int
  ): Float!
  createdAt: DateTime!
  startedAt: DateTime
  stoppedAt: DateTime
  status: TaskStatus!
  machine: Machine!
}
`
