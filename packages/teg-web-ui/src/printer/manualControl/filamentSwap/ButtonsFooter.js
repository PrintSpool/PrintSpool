import React, { useContext, useCallback } from 'react'

import {
  Button,
  MobileStepper,
} from '@material-ui/core'

import { useTheme } from '@material-ui/styles'

import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'

import { useTranslation } from 'react-i18next'

import StepperContext from './StepperContext'

import ButtonsFooterStyles from './ButtonsFooterStyles'


const ButtonsFooter = ({
  backTo,
  disabledNext,
  // skipButton,
  onClickNext,
}) => {
  const context = useContext(StepperContext)
  const { t } = useTranslation('filamentSwap')
  const theme = useTheme()
  const classes = ButtonsFooterStyles()

  const {
    activeStep,
    setActiveStep,
    totalSteps,
    next,
    lastStep,
  } = context

  const back = useCallback(() => (
    setActiveStep(backTo >= 0 ? backTo : activeStep + backTo)
  ), [activeStep, backTo])

  return (
    <MobileStepper
      className={classes.root}
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
          disabled={backTo == null}
          onClick={back}
        >
          {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
          {t('backWord')}
        </Button>
      )}
    />
  )
}

export default ButtonsFooter
