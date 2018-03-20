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

const JobCard = ({
  id,
  name,
  quantity,
  tasksCompleted,
  totalTasks,
  status,
  stoppedAt,
  tasks,
}) => {
  return (
    <Card>
      <CardHeader
        title={job.name}
        subtitle={`Printed ${job.tasksCompleted} / ${job.totalTasks}`}
      />
    </Card>
  )
}

export default JobCard
