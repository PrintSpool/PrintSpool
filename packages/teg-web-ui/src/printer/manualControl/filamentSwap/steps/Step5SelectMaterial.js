import React, { useState, useCallback } from 'react'

import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import MUILink from '@material-ui/core/Link'

import { useMutation } from '@apollo/client'
import { useAsync } from 'react-async'
import { useTranslation } from 'react-i18next'
import { gql } from '@apollo/client'
import { Link } from 'react-router-dom'


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

  const hasMaterialLoaded = component.toolhead.material != null

  const [setMaterialsMutation] = useMutation(gql`
    mutation setMaterials($input: SetMaterialsInput!) {
      setMaterials(input: $input) { id }
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
    // eslint-disable-next-line no-console
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
          value={materialID||''}
          onChange={useCallback(e => setMaterialID(e.target.value))}
          select
          margin="normal"
          fullWidth
        >
          { materials.map(material => (
            <MenuItem key={material.id} value={material.id}>
              {`${material.name} - ${material.shortSummary}`}
            </MenuItem>
          ))}
        </TextField>

        <MUILink
          className={classes.editMaterialsLink}
          component={React.forwardRef((props, ref) => (
            <Link to="../../config/materials/" innerRef={ref} {...props} />
          ))}
          paragraph
          variant="body2"
        >
          Edit Materials
        </MUILink>
      </div>
      { saveAndGoToNext.isPending && (
        <Loading transitionDelay={200} className={classes.saving}>
          Saving...
        </Loading>
      )}

      <ButtonsFooter
        backTo={hasMaterialLoaded ? -1 : 0}
        onClickNext={saveAndGoToNext.run}
        disabledNext={saveAndGoToNext.isPending}
      />
    </React.Fragment>
  )
}

export default Step5SelectMaterial
