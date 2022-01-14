import React, { useCallback, useState } from 'react'
import { gql } from '@apollo/client'

import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'

import SwipeableViews from 'react-swipeable-views'
import { useTranslation } from 'react-i18next'

import useLiveSubscription from '../../_hooks/useLiveSubscription'

import Loading from '../../../common/Loading'

import StepperContext from './StepperContext'

import Step1Introduction from './steps/Step1Introduction'
import HeatExtruder from './steps/HeatExtruder'
import Step3Retract from './steps/Step3Retract'
import Step4RemoveFilament from './steps/Step4RemoveFilament'
import Step5SelectMaterial from './steps/Step5SelectMaterial'
import Step7LoadFilament from './steps/Step7LoadFilament'
import Step8AdjustNewFilament from './steps/Step8AdjustNewFilament'

import useStyles from './FilamentSwapDialogStyles'
import { useMutation } from '@apollo/client'

const FILAMENT_SWAP_SUBSCRIPTION = gql`
  fragment QueryFragment on Query {
    machines(input: { machineID: $machineID }) {
      id
      status
      components(input: { componentID: $componentID }) {
        id
        address
        name
        configForm {
          id
          model
        }
        toolhead {
          currentMaterial {
            id
          }
        }
        heater {
          actualTemperature
          targetTemperature
          materialTarget
          history {
            id
            createdAt
            actualTemperature
            targetTemperature
          }
        }
      }
    }
    materials {
      id
      name
      shortSummary
    }
  }
`

const steps = [
  {
    name: 'Get Started',
    component: Step1Introduction,
  },
  {
    name: 'Heat Extruder',
    component: HeatExtruder,
  },
  {
    name: 'Retract Filament',
    component: Step3Retract,
  },
  {
    name: 'Remove Filament',
    component: Step4RemoveFilament,
  },
  {
    name: 'Select New Filament',
    component: Step5SelectMaterial,
  },
  {
    name: 'Heat Extruder',
    component: HeatExtruder,
  },
  {
    name: 'Load Filament',
    component: Step7LoadFilament,
  },
  {
    name: 'Filament Swap Complete',
    component: Step8AdjustNewFilament,
  },
]

const ESTOP_AND_RESET = gql`
  mutation reset($machineID: ID!) {
    stop(machineID: $machineID) { id }
    reset(machineID: $machineID) { id }
  }
`

const FilamentSwapDialog = ({
  history,
  match,
}) => {
  const { t } = useTranslation('filamentSwap')
  const classes = useStyles()

  const { machineID, componentID } = match.params

  const {
    data,
    loading,
    error,
  } = useLiveSubscription(FILAMENT_SWAP_SUBSCRIPTION, {
    variablesDef: '($machineID: ID, $componentID: ID)',
    variables: {
      componentID,
      machineID,
    },
  })

  const [closing, setClosing] = useState(false)
  const [eStopAndReset] = useMutation(ESTOP_AND_RESET, { variables: { machineID } })

  const close = useCallback(async () => {
    setClosing(true)
    await eStopAndReset()
    history.push('../')
  }, [])

  const [activeStep, setActiveStep] = useState(0)
  const lastStep = activeStep === steps.length - 1

  const context = {
    activeStep,
    setActiveStep,
    close,
    totalSteps: steps.length,
    lastStep,
    next: useCallback(() => {
      if (lastStep) {
        history.push('../')
      } else {
        setActiveStep(activeStep + 1)
      }
    }, [activeStep, close, lastStep]),
  }

  if (loading) {
    return <div />
  }

  if (error) {
    throw error
  }

  const machine = data.machines[0]
  const component = machine.components[0]
  const { materials } = data

  return (
    <Dialog
      maxWidth="md"
      fullWidth
      onClose={close}
      aria-labelledby="material-dialog-title"
      open
      transitionDuration={{
        exit: 0,
      }}
    >
      <DialogContent className={classes.root}>
        { closing && (
          <Typography>Resetting Machine..</Typography>
        )}
        { !closing && (
          <>
            <Loading
              noSpinner
              className={classes.notReadyWhiteout}
              transitionDelay={0}
              transitionDuration={400}
              in={machine.status !== 'READY'}
            >
              { machine.status !== 'READY'
                && t('notReadyWhiteoutTitle', {
                  status: t(machine.status.toLowerCase()),
                })
              }
            </Loading>
            <StepperContext.Provider value={context}>
              <SwipeableViews
                index={activeStep}
                onChangeIndex={setActiveStep}
                className={classes.swipeableViews}
              >
                {steps
                  .filter((step, index) => index <= activeStep)
                  .map((step, index) => {
                    const ComponentForStep = step.component

                    return (
                      <div
                        className={classes.step}
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                      >
                        <ComponentForStep {...{
                          machine,
                          component,
                          materials,
                          next: context.next,
                          setActiveStep: context.setActiveStep,
                          active: index === activeStep,
                          close,
                          classes,
                        }} />
                      </div>
                    )
                  })
                }
              </SwipeableViews>
            </StepperContext.Provider>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default FilamentSwapDialog
