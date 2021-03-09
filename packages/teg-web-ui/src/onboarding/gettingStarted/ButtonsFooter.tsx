import React from 'react'
import { Link } from 'react-router-dom'

import {
  Button,
} from '@material-ui/core'

import GettingStartedStyles from './GettingStartedStyles'

const ButtonsFooter = ({
  step,
  disable = false,
  component,
  type = 'button',
  nextURL = null,
  history,
}) => {
  const classes = GettingStartedStyles()

  return (
    <div className={classes.buttons}>
      <Button
        className={classes.button}
        onClick={() => history.goBack()}
      >
        Back
      </Button>
      <Button
        variant="contained"
        color="primary"
        disabled={disable}
        className={classes.button}
        type={type}
        component={component || React.forwardRef((props, ref) => (
          <Link
            innerRef={ref}
            to={nextURL || `/get-started/${step + 1}`}
            {...props}
          />
        ))}
      >
        {step === 4 ? 'Finish' : 'Next'}
      </Button>
    </div>
  )
}

export default ButtonsFooter
