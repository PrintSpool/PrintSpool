import React, { useEffect } from 'react'

import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import MUILink from '@material-ui/core/Link'

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import ButtonsFooter from '../ButtonsFooter'
import { useExecGCodes2 } from '../../../_hooks/useExecGCodes'

// {t('intro.title')}

const Step1Introduction = ({
  machine,
  component,
  classes,
  setActiveStep,
}) => {
  const { t } = useTranslation('filamentSwap')

  const {
    bowdenTubeLength = 0,
    filamentSwapExtrudeDistance = 50,
    beforeFilamentSwapHook = '',
  } = component.configForm.model

  const hasMaterialLoaded = component.toolhead.currentMaterial != null

  const execBeforeHook = useExecGCodes2(() => ({
    machine,
    gcodes: [beforeFilamentSwapHook],
    sync: false,
  }))

  useEffect(execBeforeHook.run, [])

  const distance = filamentSwapExtrudeDistance + bowdenTubeLength

  return (
    <React.Fragment>
      <div className={classes.introRoot}>
        <Typography variant="h6" paragraph id="material-dialog-title">
          {t('title')}
        </Typography>
        { !hasMaterialLoaded && (
          <>
            <Typography variant="body1" paragraph>
              {t('intro.noMaterial', {
              })}
              {' '}
            </Typography>
            {/* <Typography variant="h6" paragraph>
              Option 1: My Printer has filament loaded
            </Typography> */}
            <Button
              className={classes.updateSettingsBeforeSwap}
              fullWidth
              component={React.forwardRef((props, ref) => (
                <Link
                  to={`../../config/components/${component.id}/`}
                  innerRef={ref}
                  {...props}
                />
              ))}
              variant="outlined"
            >
              My printer has filament loaded and I need to update my settings
            </Button>
            <Button
              variant="outlined"
              onClick={() => setActiveStep(4)}
              fullWidth
            >
              My extruder is empty - let's load some filament
            </Button>
          </>
        )}
        { hasMaterialLoaded && (
          <>
            <Typography variant="body1" paragraph>
              {t('intro.content', {
                name: component.name,
                materialTarget: component.heater.materialTarget,
                distance,
              })}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('intro.skipContent')}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setActiveStep(4)}
            >
              {t('intro.skipButton')}
            </Button>
          </>
        )}
      </div>

      <ButtonsFooter
        disabledNext={!hasMaterialLoaded}
      />
    </React.Fragment>
  )
}

export default Step1Introduction
