import React from 'react'
import { Link } from 'react-router-dom'

import {
  Button,
} from '@material-ui/core'

import GettingStartedStyles from './GettingStartedStyles'

const ButtonsFooter = ({
  step,
  disable,
  component,
  type = 'button',
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
        component={component || (props => (
          <Link
            to={step === 4 ? '/' : `/get-started/${step + 1}`}
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
