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
  }), [materialID])

  return (
    <React.Fragment>
      <Typography variant="h5">
        Select your new filament
      </Typography>

      <TextField
        label="Material"
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

      <ButtonsFooter onClickNext={saveAndGoToNext} />
    </React.Fragment>
  )
}

export default Step5SelectMaterial
