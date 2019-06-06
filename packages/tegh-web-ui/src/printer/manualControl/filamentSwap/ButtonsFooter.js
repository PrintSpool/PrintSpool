import React, { useContext, useCallback } from 'react'

import {
  Button,
  MobileStepper,
} from '@material-ui/core'

import { useTheme } from '@material-ui/styles'

import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@material-ui/icons'

import { useTranslation } from 'react-i18next'

import StepperContext from './StepperContext'


const ButtonsFooter = ({
  disabledBack = true,
  disabledNext,
  // skipButton,
  onClickNext,
}) => {
  const context = useContext(StepperContext)
  const { t } = useTranslation('filamentSwap')
  const theme = useTheme()

  const {
    activeStep,
    setActiveStep,
    totalSteps,
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
      { skipButton && (
        <Button
          onClick={
            useCallback(() => setActiveStep(skipButton.step), [skipButton])
          }
        >
          { skipButton.label }
        </Button>
      )*/}

      <MobileStepper
        variant="dots"
        steps={totalSteps}
        position="static"
        activeStep={activeStep}
        nextButton={(
          <Button
            size="small"
            disabled={disabledNext}
            onClick={onClickNext || next}
          >
            {lastStep ? t('finishWord') : t('nextWord')}
            {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
          </Button>
        )}
        backButton={(
          <Button
            size="small"
            disabled={disabledBack || activeStep === 0}
            onClick={
              useCallback(() => setActiveStep(activeStep - 1), [activeStep])
            }
          >
            {t('backWord')}
            {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
          </Button>
        )}
      />
    </div>
  )
}

export default ButtonsFooter
