import React, { useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

import useStyles from './PrintHistory.styles'
import PartHeader from '../PartHeader'

const PrintHistoryView = ({
  machineName,
  part,
}) => {
  const classes = useStyles()

  const settledTasks = part.tasks.filter(t =>
    ['ERRORED', 'CANCELLED', 'FINISHED'].includes(t.status)
  )

  return (
    <div className={classes.root}>
      <PartHeader {...{
        machineName,
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
