import React, { useState, useCallback } from 'react'
import {
  Typography,
  TextField,
  MenuItem,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

import useExecGCodes from '../../../_hooks/useExecGCodes'

import ButtonsFooter from '../ButtonsFooter'

const Step5SelectMaterial = ({
  printer,
  component,
  materials,
  next,
  classes,
}) => {
  const { t } = useTranslation('filamentSwap')

  const [materialID, setMaterialID] = useState(
    component.configForm.model.materialID,
  )

  const saveAndGoToNext = useExecGCodes(() => ({
    printer,
    gcodes: [
      { setMaterials: { toolheads: { [component.address]: materialID } } },
    ],
    update: next,
  }), [component, materialID, next])

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

      <ButtonsFooter
        backTo={-1}
        onClickNext={saveAndGoToNext}
      />
    </React.Fragment>
  )
}

export default Step5SelectMaterial
