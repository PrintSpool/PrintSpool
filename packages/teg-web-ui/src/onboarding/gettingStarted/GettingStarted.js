import React, { useMemo, useState } from 'react'

import {
  Stepper,
  Step,
  StepLabel,
  Typography,
} from '@material-ui/core'

import StaticTopNavigation from '../../common/topNavigation/StaticTopNavigation'

import GettingStartedStyles from './GettingStartedStyles'

import Step1InstallTeg from './steps/Step1InstallTeg'
import Step2Connect from './steps/Step2Connect'
import Step3Setup from './steps/Step3Setup.page'
import Step4Backup from './steps/Step4Backup'

const GettingStarted = ({
  location,
  history,
  match,
}) => {
  const classes = GettingStartedStyles()

  const [skippedStep3, setSkippedStep3] = useState(false)

  const steps = [
    'Install',
    'Connect',
    'Printer Setup',
    'Done',
  ]

  const step = parseInt(match.params.step || 1, 10)
  const invite = useMemo(() => {
    const params = new URLSearchParams(location.search)

    return params.get('invite')
  })

  return (
    <div className={classes.root}>
      <StaticTopNavigation title={() => 'Welcome to Teg!'} />
      <Stepper activeStep={step - 1} className={classes.stepper}>
        {steps.map((label, i) => (
          <Step key={label}>
            <StepLabel
              optional={i === 2 && (
                <Typography variant="caption">First Time Only</Typography>
              )}
              completed={i < step - 1 && (i !== 2 || !skippedStep3)}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      { step === 1 && (
        <Step1InstallTeg history={history} className={classes.content} />
      )}
      { step === 2 && (
        <Step2Connect history={history} className={classes.content} />
      )}
      { step === 3 && (
        <Step3Setup
          location={location}
          history={history}
          setSkippedStep3={setSkippedStep3}
          className={classes.content}
          invite={invite}
        />
      )}
      { step === 4 && (
        <Step4Backup
          history={history}
          className={classes.content}
        />
      )}
    </div>
  )
}

export default GettingStarted
