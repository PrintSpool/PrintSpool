import React from 'react'
import { compose } from 'recompose'
import {
  Card,
  CardContent,
  Button,
} from '@material-ui/core'

import withSpoolMacro from '../../../shared/higherOrderComponents/withSpoolMacro'

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
