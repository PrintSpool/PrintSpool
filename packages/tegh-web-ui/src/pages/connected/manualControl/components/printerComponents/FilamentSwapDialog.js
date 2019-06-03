import React, { useCallback, useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import gql from 'graphql-tag'
import classnames from 'classnames'
import { animated, useSpring } from 'react-spring'

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

import { LiveSubscription } from '../../../../../util/LiveSubscription'
import useSpoolGCodes from '../../../../../common/useSpoolGCodes'

import ExtruderButtons from './ExtruderButtons'
import HistoryChart from './HistoryChart'

import FilamentSwapDialogStyles from './FilamentSwapDialogStyles'

const CHANGE_MATERIAL = gql`
  mutation changeMaterial($input: UpdateConfigInput!) {
    updateConfig(input: $input) {
      errors {
        dataPath
        message
      }
    }
  }
`

const MATERIALS_SUBSCRIPTION = gql`
  subscription MaterialsSubscription {
    live {
      patch { op, path, from, value }
      query {
        materials {
          id
          name
        }
      }
    }
  }
`

const MaterialDialog = ({
  onClose,
  open,
  printer,
  component,
}) => {
  const classes = FilamentSwapDialogStyles()

  const {
    configForm,
    name,
    heater: {
      currentTemperature,
      targetTemperature,
    },
  } = component

  const distance = 100

  const removeFilament = useSpoolGCodes(() => ({
    variables: {
      input: {
        printerID: printer.id,
        gcodes: [
          { toggleHeater: { [component.id]: true } },
          { moveBy: { [component.address]: distance } },
        ],
      },
    },
  }))

  const changeMaterialMutation = useMutation(CHANGE_MATERIAL)

  // TODO: optimistic update to the query
  // TODO: loading spinner
  const onMaterialChange = useCallback((e) => {
    changeMaterialMutation({
      variables: {
        input: {
          configFormID: configForm.id,
          modelVersion: configForm.modelVersion,
          printerID: printer.id,
          collection: 'COMPONENT',
          model: {
            ...configForm.model,
            materialID: e.target.value,
          },
        },
      },
    })
  }, [configForm, printer.id])

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

  // const heatingSpring = useSpring({ x: heating ? 1 : 0 })

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
        {name}
        {' '}
        Filament Swap
      </DialogTitle>
      <DialogContent className={classes.root}>
        { open && (
          <LiveSubscription
            subscription={MATERIALS_SUBSCRIPTION}
          >
            {(({ data, loading, error }) => {
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

              return (
                <React.Fragment>
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
                    <React.Fragment>
                      <div className={classes.introContent}>
                        <Typography variant="h5">
                          Let's start by removing your current filament
                        </Typography>
                        <Typography variant="body1">
                          When your ready Tegh will heat your extruder to 220° and then retract the filament 100mm out of the extruder.
                        </Typography>
                      </div>
                    </React.Fragment>
                  )}
                  { activeStep === 1 && (
                    <div
                      className={classnames(
                        heating && classes.heatingOldFilament,
                        !heating && classes.oldFilamentHeated,
                      )}
                    >
                      <Typography variant="h5" className={classes.heatingOverlayHeader}>
                        Waiting to reach temperature (
                        {currentTemperature.toFixed(1)}
                        {' / '}
                        {targetTemperature}
                        °C)...
                      </Typography>
                      <HistoryChart
                        className={classes.heatingOverlayChart}
                        data={component.heater.history}
                        materialTarget={component.heater.materialTarget || 220}
                      />
                    </div>
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
                      <ExtruderButtons
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
                        { data.materials.map(material => (
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
                      <ExtruderButtons
                        printer={printer}
                        address={component.address}
                        extrudeColor="default"
                      />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </LiveSubscription>
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

export default MaterialDialog
