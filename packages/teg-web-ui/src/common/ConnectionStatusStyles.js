import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    height: '100vh',
    display: 'grid',
    alignItems: 'center',
  },
  center: {
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
  },
  button: {
    display: 'block',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}), { useTheme: true })

export default useStyles
