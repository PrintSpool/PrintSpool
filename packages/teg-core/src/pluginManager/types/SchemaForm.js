import { Record, Map } from 'immutable'

const SchemaForm = Record({
  id: null,
  schema: null,
  form: null,
  configPaths: Map({}),
})

export const NullSchemaForm = SchemaForm({
  id: 'NULL',
  schema: {},
  form: [],
})

export default SchemaForm
