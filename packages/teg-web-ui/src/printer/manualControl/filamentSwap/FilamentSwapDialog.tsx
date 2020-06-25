import React, { useCallback, useState } from 'react'
import gql from 'graphql-tag'

import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import Typography from '@material-ui/core/Typography'

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

import useStyles from './FilamentSwapDialogStyles'
import { useMutation } from 'react-apollo-hooks'

const FILAMENT_SWAP_SUBSCRIPTION = gql`
  subscription MaterialsSubscription($machineID: ID, $componentID: ID) {
    live {
      patch { op, path, from, value }
      query {
        machines(machineID: $machineID) {
          id
          status
          components(componentID: $componentID) {
            id
            address
            name
            configForm {
              id
              model
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
        }
      }
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
]

const ESTOP_AND_RESET = gql`
  mutation reset($machineID: ID!) {
    reset(machineID: $machineID)
    eStop(machineID: $machineID)
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
