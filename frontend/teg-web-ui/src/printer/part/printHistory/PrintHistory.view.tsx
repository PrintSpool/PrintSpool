import React, { useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import useStyles from './PrintHistory.styles'
import PartHeader from '../PartHeader'

const PrintHistoryView = ({
  part,
}) => {
  const classes = useStyles()

  const settledTasks = part.tasks.filter(t =>
    ['ERRORED', 'CANCELLED', 'FINISHED'].includes(t.status)
  )

  return (
    <div className={classes.root}>
      <PartHeader {...{
        part,
        value: 1,
      }}/>

      <Card>
        <CardContent>
          <List>
            { settledTasks.map((task) => (
              <ListItem key={task.id} dense>
                <ListItemText>
                  {`Print ${task.status.toLowerCase()} at `}
                  {new Date(Date.parse(task.stoppedAt)).toLocaleString()}
                </ListItemText>
              </ListItem>
            ))}
          </List>
          { settledTasks.length === 0 && (
            <Typography variant="body2">
              No previous prints
            </Typography>
          )}

        </CardContent>
      </Card>
    </div>
  )
}

export default PrintHistoryView
