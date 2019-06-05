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
    activeStep,
    setActiveStep,
    totalSteps,
    close,
  } = context

  const lastStep = activeStep === totalSteps - 1

  const next = useCallback(() => {
    if (onClickNext != null) {
      onClickNext()
    } else if (lastStep) {
      close()
    } else {
      context.next()
    }
  }, [activeStep])

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
        onClick={next}
      >
        {lastStep ? 'Finish' : 'Next'}
      </Button>
    </div>
  )
}

export default ButtonsFooter
