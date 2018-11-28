import { Record } from 'immutable'

const SchemaForm = Record({
  schema: null,
  form: null,
})

export const NullSchemaForm = SchemaForm({
  schema: {},
  form: [],
})

export default SchemaForm
