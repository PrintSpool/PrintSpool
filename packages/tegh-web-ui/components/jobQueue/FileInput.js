import {
  Grid,
  IconButton,
  Button,
  withStyles,
  Card,
  CardContent,
  Typography,
} from 'material-ui'

const FileInput = ({ value, onChange }) => {
  const onHTMLInputChange = e => {
    e.preventDefault()
    // convert files to an array
    const files = [ ...e.target.files ]
    onChange(files)
  }

  return (
    <div style={{ height: 40}}>
      {
        (() => {
          if (value.length === 0) {
            return (
              <input
                name='gcodeFile'
                type='file'
                accept='.ngc,.gcode'
                onChange={onHTMLInputChange}
              />
            )
          } else {
            return (
              <Typography type='button'>
                { value.map(f => f.name).join(', ') }
              </Typography>
            )
          }
        })()
      }
    </div>
  )
}

export default FileInput
