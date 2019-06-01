import React, { useCallback } from 'react'
import { useMutation } from 'react-apollo-hooks'
import gql from 'graphql-tag'

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@material-ui/core'

import { LiveSubscription } from '../../../../../util/LiveSubscription'

import ExtruderButtons from './ExtruderButtons'

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
  const { configForm } = component

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
        Filament Swap
      </DialogTitle>
      <DialogContent>
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
                <div>
                  <div>
                    1. Retract and remove the old filament
                    <ExtruderButtons
                      printer={printer}
                      address={component.address}
                      showExtrude={false}
                    />
                  </div>
                  <div>
                    2. Swap in the new filament
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
                  <div>
                    3. Extruder the new filament
                    <ExtruderButtons
                      printer={printer}
                      address={component.address}
                      showRetract={false}
                      extrudeColor="default"
                    />
                  </div>
                </div>
              )
            })}
          </LiveSubscription>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MaterialDialog
