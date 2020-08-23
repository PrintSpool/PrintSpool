import React, { useState, useCallback } from 'react'
import {
  Typography,
  TextField,
  MenuItem,
} from '@material-ui/core'
import { useMutation } from 'react-apollo-hooks'
import { useAsync } from 'react-async'
import { useTranslation } from 'react-i18next'
import gql from 'graphql-tag'

import useExecGCodes from '../../../_hooks/useExecGCodes'

import ButtonsFooter from '../ButtonsFooter'
import Loading from '../../../../common/Loading'

const Step5SelectMaterial = ({
  machine,
  component,
  materials,
  next,
  classes,
}) => {
  const { t } = useTranslation('filamentSwap')

  const [materialID, setMaterialID] = useState(
    component.configForm.model.materialID,
  )

  const [setMaterialsMutation] = useMutation(gql`
    mutation setMaterials($input: SetMaterialsInput!) {
      setMaterials(input: $input)
    }
  `)

  const saveAndGoToNext = useAsync({
    deferFn: async () => {
      await setMaterialsMutation({
        variables: {
          input: {
            machineID: machine.id,
            toolheads: {
              id: component.id,
              materialID,
            },
          },
        },
      })
      next()
    },
  }, [component, materialID, next])

  if (saveAndGoToNext.error) {
    console.error(saveAndGoToNext.error)
    throw new Error(saveAndGoToNext.error)
  }

  return (
    <React.Fragment>
      <div className={classes.selectMaterialRoot}>
        <Typography variant="h6" paragraph>
          {t('selectMaterial.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('selectMaterial.content')}
        </Typography>

        <TextField
          label={t('selectMaterial.materialWord')}
          value={materialID}
          onChange={useCallback(e => setMaterialID(e.target.value))}
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
      { saveAndGoToNext.isPending && (
        <Loading transitionDelay={200} className={classes.saving}>
          Saving...
        </Loading>
      )}

      <ButtonsFooter
        backTo={-1}
        onClickNext={saveAndGoToNext.run}
        disabledNext={saveAndGoToNext.isPending}
      />
    </React.Fragment>
  )
}

export default Step5SelectMaterial
