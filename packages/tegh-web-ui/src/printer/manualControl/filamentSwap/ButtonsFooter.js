import React, { useContext, useCallback } from 'react'

import {
  Button,
} from '@material-ui/core'

import StepperContext from './StepperContext'

const ButtonsFooter = ({
  disabledNext,
  skipButton,
  onClickNext,
}) => {
  const context = useContext(StepperContext)

  const {
    // activeStep,
    setActiveStep,
    next,
    lastStep,
  } = context

  return (
    <div>
      {/*
        <Button
          disabled={disabledBack || activeStep === 0}
          onClick={
            useCallback(() => setActiveStep(activeStep - 1), [activeStep])
          }
        >
          Back
        </Button>
      */}
      { skipButton && (
        <Button
          onClick={
            useCallback(() => setActiveStep(skipButton.step), [skipButton])
          }
        >
          { skipButton.label }
        </Button>
      )}

      <Button
        variant="contained"
        color="primary"
        disabled={disabledNext}
        onClick={onClickNext || next}
      >
        {lastStep ? 'Finish' : 'Next'}
      </Button>
    </div>
  )
}

export default ButtonsFooter
