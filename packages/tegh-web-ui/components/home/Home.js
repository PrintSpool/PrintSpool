import { compose } from 'recompose'
import styled from 'styled-components'
import {
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
  CardHeader,
  Switch,
  FormControlLabel,
  Button,
} from 'material-ui'
import { Field, reduxForm, formValues } from 'redux-form'

import withCreateTask from '../../higher_order_components/withCreateTask'

const enhance = compose(
  withCreateTask,
)

const Home = ({
  createTask
}) => (
  <Card>
    <CardContent>
      <div style={{ textAlign: 'right' }}>
        <Button
          raised
          onClick={() => createTask({ macro: 'home', args: { all: true } })}
        >
          Home
        </Button>
      </div>
    </CardContent>
  </Card>
)

export default enhance(Home)
