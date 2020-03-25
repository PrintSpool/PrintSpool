export default `
# Queries

extend type Query {
  jobQueue: JobQueue!
}

type JobQueue {
  id: ID!
  name: String!
  jobs(id: ID): [Job!]!
}

type Job {
  id: ID!
  name: String!
  quantity: Int!
  files: [JobFile]!
  tasks: [Task]!
  history: [JobHistoryEvent]!
  printsCompleted: Int!
  totalPrints: Int!
  isDone: Boolean!
  createdAt: String!
  startedAt: String
  stoppedAt: String
}

type JobFile {
  id: ID!
  name: String!
  quantity: Int!
  tasks: [Task]!
  printsCompleted: Int!
  totalPrints: Int!
  printsQueued: Int!
  isDone: Boolean!
}

type JobHistoryEvent {
  id: ID!
  createdAt: String!
  type: TaskStatus!
}

enum TaskStatus {
  """
  The subject has a task spooled for printing. It will begin printing as soon as the tasks spooled before it finish.
  """
  SPOOLED_TASK

  """
  The subject has a task is in the process of being printed.
  """
  START_TASK

  """
  An error occurred durring the print and it has been stopped automatically.
  """
  ERROR

  """
  The subject was halted pre-emptively by a user's action.
  """
  CANCELLED

  """
  The subject was paused by a user's action.
  """
  PAUSE_TASK

  """
  The subject was completed successfully.
  """
  FINISH_TASK
}

# Mutations

extend type Mutation {
  """
  create a Job from the content and fileName of a file upload.
  """
  createJob(input: CreateJobInput): Job!

  """
  creates a job to print a file already on the Teg server.
  """
  deleteJob(input: DeleteJobInput): Boolean
}

input CreateJobInput {
  name: String!
  files: [FileInput!]!
}

input DeleteJobInput {
  jobID: ID!
}

input FileInput {
  name: String!
  content: String!
}
`
