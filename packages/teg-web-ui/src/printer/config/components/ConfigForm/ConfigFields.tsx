import React, { useContext } from 'react'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import SchemaField from './SchemaField'
import { ConfigFormContext } from './ConfigForm'

export const ConfigFields = () => {
  const {
    schema,
    form,
    advancedForm,
    register,
    control,
    errors,
  } = useContext(ConfigFormContext)

  const formFields = (form) => (
    <>
      { form.map((name) => (
        <SchemaField
          schema={schema}
          property={schema.properties[name]}
          key={name}
          name={name}
          register={register}
          control={control}
          errors={errors}
        />
      ))}
      { errors[''] != null && (
        <Typography
          color="error"
          variant="body1"
          style={{ marginTop: 16 }}
        >
          {'Error: '}
          {
            errors[''].message
            || (typeof errors[''] === 'string' ? errors[''] : 'An unknown error has occured')
          }
        </Typography>
      )}
    </>
  )

  return (
    <>
      {formFields(form)}
      { advancedForm.length > 0 && (
        <Accordion style={{ marginTop: 24 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Advanced</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>
              {formFields(advancedForm)}
            </div>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  )
}

export default ConfigFields
