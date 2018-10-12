import styled from 'styled-components'
import { compose } from 'recompose'
import { Field, reduxForm, formValues } from 'redux-form'
import {
  Card,
  CardContent,
  Grid,
} from '@material-ui/core'
import {
  ArrowForward,
  ArrowBack,
  ArrowUpward,
  ArrowDownward,
} from 'material-ui-icons'

import withJog from '../../higherOrderComponents/withJog'
import JogButton from './JogButton'
import JogDistanceButtons from './JogDistanceButtons'

const enhance = compose(
  withJog,
  reduxForm({
    initialValues: {
      distance: 1,
    },
  }),
  formValues('distance'),
)

const ZJogButtons = ({ jog, distance }) => (
  <Card>
    <CardContent>
      <Grid
        container
        spacing={24}
      >
        <JogButton xs={12} onClick={jog('z', '+', distance)}>
          <ArrowUpward/>
        </JogButton>
        <JogButton xs={12} disabled>
          Z
        </JogButton>
        <JogButton xs={12} onClick={jog('z', '-', distance)}>
          <ArrowDownward/>
        </JogButton>
        <Field
          name='distance'
          component={ JogDistanceButtons([0.1, 1, 10]) }
        />
      </Grid>
    </CardContent>
  </Card>
)

export default enhance(ZJogButtons)
