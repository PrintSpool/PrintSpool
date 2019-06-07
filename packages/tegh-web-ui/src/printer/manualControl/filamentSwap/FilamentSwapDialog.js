import React, { useCallback, useState } from 'react'
import gql from 'graphql-tag'

import {
  Dialog,
  DialogContent,
} from '@material-ui/core'

import SwipeableViews from 'react-swipeable-views'

import useLiveSubscription from '../../_hooks/useLiveSubscription'

import StepperContext from './StepperContext'

import Step1Introduction from './steps/Step1Introduction'
import HeatExtruder from './steps/HeatExtruder'
import Step3Retract from './steps/Step3Retract'
import Step4RemoveFilament from './steps/Step4RemoveFilament'
import Step5SelectMaterial from './steps/Step5SelectMaterial'
import Step7LoadFilament from './steps/Step7LoadFilament'

import FilamentSwapDialogStyles from './FilamentSwapDialogStyles'

const FILAMENT_SWAP_SUBSCRIPTION = gql`
  subscription MaterialsSubscription($printerID: ID, $componentID: ID) {
    live {
      patch { op, path, from, value }
      query {
        printers(printerID: $printerID) {
          id
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
  const classes = FilamentSwapDialogStyles()

  const { printerID, componentID } = match.params

  const {
    data,
    loading,
    error,
  } = useLiveSubscription(FILAMENT_SWAP_SUBSCRIPTION, {
    variables: {
      componentID,
      printerID,
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

  const printer = data.printers[0]
  const component = printer.components[0]
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
        <StepperContext.Provider value={context}>
          <SwipeableViews
            index={activeStep}
            onChangeIndex={setActiveStep}
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
                      printer={printer}
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