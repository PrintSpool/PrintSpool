import { compose } from 'recompose'
import { Field, reduxForm, formValues } from 'redux-form'
import {
  Grid,
  IconButton,
  Button,
  withStyles,
  Card,
  CardContent,
  Typography,
} from 'material-ui'
import {
  Print
} from 'material-ui-icons'

import withSpoolMacro from '../higher_order_components/withSpoolMacro'

const styles = theme => ({
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
})

const enhance = compose(
  withSpoolMacro,
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
  spoolMacro,
}) => {
  const print = input => () => {
    console.log('print??111')
    const file = files[0]
    const { name } = file
    const fileReader = new FileReader()
    fileReader.readAsText(file)
    console.log('print??')

    fileReader.onload = () => {
      console.log('PRINT!!!!', fileReader.result)
      spoolMacro({
        fileName: name,
        gcode: [fileReader.result],
      })
      input.onChange(null)
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
            <div>
              <div style={{ height: 40}}>
                {
                  files == null &&
                  <input
                    name='gcodeFile'
                    type='file'
                    accept='.ngc,.gcode'
                    onChange={onChange(input)}
                  />
                }
                {
                  files != null &&
                  <Typography type='button'>{files[0].name}</Typography>
                }
              </div>
              <Button raised onClick={print(input)} disabled={files == null}>
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
