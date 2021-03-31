import React from 'react'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import TextField from '@material-ui/core/TextField'

import useStyles from './Terminal.styles'

const TerminalView = ({
  onSubmit,
  isSubmitting,
  register,
  isReady,
  gcodeHistory,
  errors,
}) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <form className={classes.inputRow} onSubmit={onSubmit}>
        <TextField
          className={classes.input}
          label="GCode"
          name="gcode"
          disabled={!isReady}
          inputRef={register({
            required: 'Required',
          })}
          error={errors.gcode != null}
          helperText={errors.gcode?.message}
        />
        <Button
          variant="contained"
          type="submit"
          disabled={!isReady || isSubmitting}
        >
          Send
        </Button>
      </form>
      <Typography
        variant="body1"
        className={classes.reference}
        component="div"
      >
        Need a GCode reference? Try the
        {' '}
        <Link
          href="https://marlinfw.org/meta/gcode/"
          underline="always"
          target="_blank"
          rel="noopener noreferrer"
        >
          Marlin GCode Index.
        </Link>
      </Typography>
      <div className={classes.terminalHistory}>
        { [...gcodeHistory].reverse().map(entry => (
          // eslint-disable-next-line react/no-array-index-key
          <div
            key={entry.id}
            className={[
              classes.terminalEntry,
              classes[entry.direction === 'TX' ? 'tx' : 'rx'],
            ].join(' ')}
          >
            <Typography
              variant="body2"
              component="div"
            >
              {
                <span className={classes.createdAt}>
                  {entry.createdAt?.replace(/.\d+\+/, '+')}
                </span>
              }
              <span className={classes.direction}>
                {` ${entry.direction} `}
              </span>
              <span className={classes.content}>
                {entry.content}
              </span>
            </Typography>
          </div>
        )) }
      </div>
    </div>
  )
}

export default TerminalView
