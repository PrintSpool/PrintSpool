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

import withCreateTask from '../higher_order_components/withCreateTask'

const styles = theme => ({
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
})

const enhance = compose(
  withCreateTask,
  reduxForm({
    initialValues: {
      files: null,
    },
  }),
  formValues('files'),
  withStyles(styles),
)

const PrintButton = ({
  classes,
  files,
  createTask,
  fields
}) => {
  const print = () => {
    if (files == null) return
    const file = files[0]
    const { name } = file
    const fileReader = new FileReader()
    fileReader.readAsText(file)

    fileReader.onload = () => {
      createTask({
        fileName: name,
        gcode: [fileReader.result],
      })
    }
  }

  const onChange = input => e => {
    e.preventDefault()
    // convert files to an array
    const files = [ ...e.target.files ]
    input.onChange(files)
  }
  return (
    <Card>
      <CardContent>
        <Field
          name='files'
          component={({ input }) => (
            <input
              name='gcodeFile'
              type='file'
              accept='.ngc,.gcode'
              onChange={onChange(input)}
            />
          )}
        />
        <Button raised onClick={print} disabled={files == null}>
          Print
          <Print className={classes.rightIcon}/>
        </Button>
      </CardContent>
    </Card>
  )
}

export default enhance(PrintButton)
