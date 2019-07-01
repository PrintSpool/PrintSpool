import React, { useCallback, useState } from 'react'
import gql from 'graphql-tag'

import {
  Dialog,
  DialogContent,
} from '@material-ui/core'

import SwipeableViews from 'react-swipeable-views'
import camelCase from 'camelcase'
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

import FilamentSwapDialogStyles from './FilamentSwapDialogStyles'

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
              currentTemperature
              targetTemperature
              materialTarget
              history {
                id
                createdAt
                currentTemperature
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

const FilamentSwapDialog = ({
  history,
  match,
}) => {
  const { t } = useTranslation('filamentSwap')
  const classes = FilamentSwapDialogStyles()

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

  const open = true
  const close = useCallback(() => {
    history.push('../')
  })

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
        close()
      } else {
        setActiveStep(activeStep + 1)
      }
    }, [activeStep, close, lastStep]),
  }

  if (loading) {
    return <div />
  }

  if (error) {
    return (
      <div>
        {JSON.stringify(error)}
      </div>
    )
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
      open={open}
      transitionDuration={{
        exit: 0,
      }}
    >
      <DialogContent className={classes.root}>
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
                    <ComponentForStep
                      machine={machine}
                      component={component}
                      materials={materials}
                      next={context.next}
                      setActiveStep={context.setActiveStep}
                      active={index === activeStep}
                      classes={classes}
                    />
                  </div>
                )
              })
            }
          </SwipeableViews>
        </StepperContext.Provider>
      </DialogContent>
    </Dialog>
  )
}

export default FilamentSwapDialog
