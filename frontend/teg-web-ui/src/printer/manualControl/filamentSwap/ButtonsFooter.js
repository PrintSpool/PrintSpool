import React, { useContext, useCallback } from 'react'

import Button from '@mui/material/Button'
import MobileStepper from '@mui/material/MobileStepper'

import { useTheme } from '@mui/material/styles'

import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'

import { useTranslation } from 'react-i18next'

import StepperContext from './StepperContext'

import ButtonsFooterStyles from './ButtonsFooter.styles'


const ButtonsFooter = ({
  backTo,
  disabledNext,
  // skipButton,
  onClickNext,
  finish = false,
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
          {lastStep || finish ? t('finishWord') : t('nextWord')}
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
