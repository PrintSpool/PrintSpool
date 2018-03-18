import Promise from 'bluebird'

import { compose } from 'recompose'
import { Field, reduxForm, formValues } from 'redux-form'

import {
  Grid,
  IconButton,
  Button,
  withStyles,
  Card,
  CardContent,
} from 'material-ui'
import {
  Print
} from 'material-ui-icons'

import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

import FileInput from './FileInput'

const createJobGraphQL = gql`
  mutation createJob($input: CreateJobInput!) {
    createJob(input: $input) {
      id
    }
  }
`

const styles = theme => ({
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
})

const enhance = compose(
  graphql(createJobGraphQL, {
    props: ({ mutate }) => ({
      print: async ({ value, onChange }) => {
        console.log('print??111')

        const mutationInput = {
          printerID: "test_printer_id",
          name: value.map(f => f.name).join(', '),
          files: [],
        }

        for (const file of value) {
          const { name } = file

          /* read the file */
          console.log('print??')
          const fileReader = new FileReader()
          fileReader.readAsText(file)
          await new Promise(resolve => fileReader.onload = resolve)
          console.log('PRINT!!!!', fileReader.result)

          mutationInput.files.push({
            name,
            content: fileReader.result
          })
        }
        /* execute the mutation */
        mutate({ input: mutationInput })
        /* reset the file input */
        onChange([])
      }

    })
  }),
  reduxForm({
    initialValues: {
      files: [],
    },
  }),
  formValues('files'),
  withStyles(styles),
)

const PrintButton = ({
  classes,
  files,
  print,
}) => {
  return (
    <Card>
      <CardContent>
        <Field
          name='files'
          component={ ({ input }) => (
            <div>
              { console.log(input) }
              <FileInput { ...input } />
              <Button
                raised
                onClick={() => print(input)}
                disabled={input.value.length === 0}
              >
                Print
                <Print className={classes.rightIcon}/>
              </Button>
            </div>
          )}
        />
      </CardContent>
    </Card>
  )
}

export default enhance(PrintButton)
