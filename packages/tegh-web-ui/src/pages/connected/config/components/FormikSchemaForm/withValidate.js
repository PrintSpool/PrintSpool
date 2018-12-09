import Ajv from 'ajv'
import { withPropsOnChange } from 'recompose'

const withValidate = withPropsOnChange(
  // (props, nextProps) => props.schema !== nextProps.schema,
  ['schema'],
  ({ schema }) => {
    if (schema == null) return { validate: () => [] }

    const ajv = new Ajv({
      allErrors: true,
    })

    const validate = ajv.compile(schema)
    console.log({ validate })

    return { validate }
  },
)

export default withValidate
