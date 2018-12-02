import { Record } from 'immutable'

const SchemaForm = Record({
  id: null,
  schema: null,
  form: null,
})

export const NullSchemaForm = SchemaForm({
  id: 'NULL',
  schema: {},
  form: [],
})

export default SchemaForm
