import React from 'react'
import {
  Card,
  CardContent,
  Button,
  Typography,
} from '@material-ui/core'

import useExecGCodes from '../../../../../common/useExecGCodes'

const Home = ({
  printer,
}) => {
  const home = axes => useExecGCodes(() => ({
    printer,
    gcodes: [
      { home: { axes } },
    ],
  }))

  return (
    <Card>
      <CardContent style={{ paddingBottom: 16 }}>
        <Typography variant="subtitle1">
          <div style={{ float: 'right', marginTop: -4 }}>
            <Button
              onClick={home(['x'])}
            >
              X
            </Button>
            <Button
              onClick={home(['y'])}
            >
              Y
            </Button>
            <Button
              onClick={home(['z'])}
            >
              Z
            </Button>
            <Button
              onClick={home(['x', 'y'])}
            >
              X&Y
            </Button>
            <Button
              onClick={home('all')}
            >
              All
            </Button>
          </div>
          Home
        </Typography>
      </CardContent>
    </Card>
  )
}

export default Home
