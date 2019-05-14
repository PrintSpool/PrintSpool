import React from 'react'
import { compose, withProps } from 'recompose'
import {
  Card,
  CardContent,
  Button,
  Typography,
} from '@material-ui/core'

import withSpoolMacro from '../../../shared/higherOrderComponents/withSpoolMacro'

const enhance = compose(
  withSpoolMacro,
  withProps(({ spoolMacro, printer }) => ({
    doHome: (args) => {
      spoolMacro({
        printerID: printer.id,
        macro: 'home',
        args,
      })
    },
  })),
)

const Home = ({
  doHome,
}) => (
  <Card style={{ marginTop: 16, marginBottom: 16 }}>
    <CardContent style={{ paddingBottom: 16 }}>
      <Typography variant="subtitle1">
        <div style={{ float: 'right', marginTop: -4 }}>
          <Button
            onClick={() => doHome(['x'])}
          >
            X
          </Button>
          <Button
            onClick={() => doHome(['y'])}
          >
            Y
          </Button>
          <Button
            onClick={() => doHome(['z'])}
          >
            Z
          </Button>
          <Button
            onClick={() => doHome(['x', 'y'])}
          >
            X&Y
          </Button>
          <Button
            onClick={() => doHome({ all: true })}
          >
            All
          </Button>
        </div>
        Home
      </Typography>
    </CardContent>
  </Card>
)

export default enhance(Home)
