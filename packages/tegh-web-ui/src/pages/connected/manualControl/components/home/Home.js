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
} from '@material-ui/core'
import { Field, reduxForm, formValues } from 'redux-form'

import withSpoolMacro from '../../higherOrderComponents/withSpoolMacro'

const enhance = compose(
  withSpoolMacro,
)

const Home = ({
  spoolMacro,
}) => (
  <Card>
    <CardContent>
      <div style={{ textAlign: 'right' }}>
        <Button
          variant="contained"
          onClick={() => spoolMacro({ macro: 'home', args: { all: true } })}
        >
          Home
        </Button>
      </div>
    </CardContent>
  </Card>
)

export default enhance(Home)
