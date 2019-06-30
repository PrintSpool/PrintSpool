import React, { useState, useCallback } from 'react'
import {
  Typography,
  TextField,
  MenuItem,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

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

  const [saving, setSaving] = useState(false)

  const saveAndGoToNext = useExecGCodes(() => {
    setSaving(true)

    return {
      machine,
      gcodes: [
        { setMaterials: { toolheads: { [component.address]: materialID } } },
      ],
      update: () => {
        setSaving(false)
        next()
      },
    }
  }, [component, materialID, next])

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
      { saving && (
        <Loading transitionDelay={200} className={classes.saving}>
          Saving...
        </Loading>
      )}

      <ButtonsFooter
        backTo={-1}
        onClickNext={saveAndGoToNext}
        disabledNext={saving}
      />
    </React.Fragment>
  )
}

export default Step5SelectMaterial
