import styled from 'styled-components'
import { compose } from 'recompose'
import { Field, reduxForm, formValues } from 'redux-form'
import {
  Paper,
  Grid,
} from 'material-ui'
import {
  ArrowForward,
  ArrowBack,
  ArrowUpward,
  ArrowDownward,
} from 'material-ui-icons'

import withJog from '../../higher_order_components/withJog'
import JogButton from './JogButton'
import JogDistanceButtons from './JogDistanceButtons'

const enhance = compose(
  withJog,
  reduxForm({
    initialValues: {
      distance: 10,
    },
  }),
  formValues('distance'),
)

const XYJogButtons = ({ jog, distance }) => (
  <Paper>
    <Grid
      container
      spacing={24}
    >
      <JogButton xs={12} onClick={jog('y', '-', distance)}>
        <ArrowUpward/>
      </JogButton>
      <JogButton xs={4} onClick={jog('x', '-', distance)} textAlign='right'>
        <ArrowBack/>
      </JogButton>
      <JogButton xs={4} disabled>
        XY
      </JogButton>
      <JogButton xs={4} onClick={jog('x', '+', distance)} textAlign='left'>
        <ArrowForward/>
      </JogButton>
      <JogButton xs={12} onClick={jog('y', '+', distance)}>
        <ArrowDownward/>
      </JogButton>
      <Field
        name='distance'
        component={ JogDistanceButtons([1, 10, 50, 100]) }
      />
    </Grid>
  </Paper>
)

export default enhance(XYJogButtons)
