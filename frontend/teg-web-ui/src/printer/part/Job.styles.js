import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    overflow: 'scroll',
  },
  card: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  viewingUsersButton: {
    float: 'right',
  },
}))

export default useStyles
