import React, { useCallback, useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import gql from 'graphql-tag'
import classnames from 'classnames'
// import { animated, useSpring } from 'react-spring'

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Typography,
} from '@material-ui/core'

import useLiveSubscription from '../../_hooks/useLiveSubscription'
import useExecGCodes from '../../_hooks/useExecGCodes'

import ExtrudeRetractButtons from '../ExtrudeRetractButtons'

import Step1Introduction from './steps/Step1Introduction'
import HeatExtruder from './steps/HeatExtruder'

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
            heater {
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

const FilamentSwapDialog = ({
  history,
  match,
}) => {
  const classes = FilamentSwapDialogStyles()

  const { hostID, printerID, componentID } = match.params

  const distance = 100

  const removeFilament = useExecGCodes(() => ({
    printerID,
    gcodes: [
      { moveBy: { distances: { [componentID]: distance } } },
    ],
  }))

  const steps = [
    { name: 'Get Started', required: true },
    { name: 'Heat Extruder', required: true },
    { name: 'Retract Filament', required: true },
    { name: 'Remove Filament', required: true },
    { name: 'Select New Filament', required: true },
    { name: 'Heat Extruder', required: true },
    { name: 'Load Filament', required: true },
  ]

  const [activeStep, setActiveStep] = useState(0)
  const [heating, setHeating] = useState(false)

  // TODO: query for the component and the printer
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
  const onClose = useCallback(() => {
    history.go(history.location.replace(/\/[^/]+$/))
  })

  // const heatingSpring = useSpring({ x: heating ? 1 : 0 })

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

  const {
    configForm,
    name,
  } = component

  return (
    <Dialog
      maxWidth="md"
      fullWidth
      onClose={onClose}
      aria-labelledby="material-dialog-title"
      open={open}
      transitionDuration={{
        exit: 0,
      }}
    >
      <DialogTitle id="material-dialog-title" onClose={onClose}>
        {`${name} Filament Swap`}
      </DialogTitle>
      <DialogContent className={classes.root}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          className={classes.stepper}
          orientation="vertical"
        >
          {steps.map(step => (
            <Step key={step.name}>
              <StepLabel>{step.name}</StepLabel>
            </Step>
          ))}
        </Stepper>
        { activeStep === 0 && (
          <Step1Introduction />
        )}
        { activeStep === 1 && (
          <HeatExtruder />
        )}
        { activeStep === 2 && (
          <Typography variant="h5">
            Retracting 100mm of filament
          </Typography>
        )}
        { activeStep === 3 && (
          <div className={classnames(
            // classes.removeFilamentContent,
          )}>
            <Typography variant="h5">
              Please remove your filament
            </Typography>
            <Typography variant="body1">
              It should now safe to remove the filament from your extruder
              however if the filament does not come out easily you may need to retract it further.
            </Typography>
            <ExtrudeRetractButtons
              printer={printer}
              address={component.address}
              extrudeColor="default"
            />
          </div>
        )}
        { activeStep === 4 && (
          <div className={classes.removeFilamentContent}>
            <Typography variant="h5">
              Select your new filament
            </Typography>
            <TextField
              label="Material"
              value={configForm.model.materialID}
              onChange={onMaterialChange}
              select
              fullWidth
            >
              { materials.map(material => (
                <MenuItem key={material.id} value={material.id}>
                  {material.name}
                </MenuItem>
              ))}
            </TextField>
          </div>
        )}
        { activeStep === 5 && (
          <div>
            <Typography variant="h5">
              Wait for the Extruder to reach the new material's target temperature (TODO: chart)
            </Typography>
          </div>
        )}
        { activeStep === 6 && (
          <div>
            <Typography variant="h5" paragraph>
              Load the Filament
            </Typography>
            <Typography variant="body1" paragraph>
              Please insert the new filament and slowly extrude it until it until it begins to push out of the nozzle.
            </Typography>
            <Typography variant="body2" paragraph>
              <b>Warning:</b> Filaments can easily jam while loading. Watch that filament is fed into the printer with each extrusion. If the filament jams please retract the filament and determine why the jam occured. Continuing to extrude a jammed filament may damage your printer.
            </Typography>
            <ExtrudeRetractButtons
              printer={printer}
              address={component.address}
              extrudeColor="default"
            />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          disabled={heating}
          onClick={() => setActiveStep(4)}
        >
          Skip to Filament Selection
        </Button>
        <Button
          color="primary"
          variant="contained"
          disabled={false && heating}
          onClick={() => {
            if (activeStep === 0) {
              removeFilament()
              setHeating(true)
            }
            setActiveStep(activeStep + 1)
          }}
        >
          Next
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default FilamentSwapDialog
