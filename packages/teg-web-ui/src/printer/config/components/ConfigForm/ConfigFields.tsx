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
    developerMode,
    developerForm,
    register,
    control,
    errors,
  } = useContext(ConfigFormContext)

  console.log('form errors', errors)

  const formFields = (form) => form.map((name) => (
    <SchemaField
      schema={schema}
      property={schema.properties[name]}
      key={name}
      name={name}
      register={register}
      control={control}
      errors={errors}
    />
  ))

  const showDeveloperForm = developerMode && developerForm.length > 0
  const showAdvancedForm = advancedForm.length > 0 || showDeveloperForm
  console.log({ showAdvancedForm, developerMode, developerForm })

  return (
    <>
      {formFields(form)}
      <Accordion style={{
        marginTop: 24,
        display: showAdvancedForm ? null : 'none',
      }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="advanced-form-content"
          id="advanced-form-header"
        >
          <Typography>Advanced</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div>
            {formFields(advancedForm)}
            <div style={{
              borderRadius: 2,
              boxShadow: '#e53e3e 0px 0px 0pt 1pt',
              paddingLeft: 16,
              paddingRight: 16,
              paddingBottom: 16,
              display: showDeveloperForm ? null : 'none',
            }}>
              <div style={{
                color: '#e53e3e',
                position: 'relative',
                top: '-0.7rem',
                background: 'white',
                display: 'block',
                width: 'max-content',
                paddingLeft: 10,
                paddingRight: 10,
                zIndex: 1000,
              }}>
                Developer Settings
              </div>
              {formFields(developerForm)}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
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
}

export default ConfigFields
