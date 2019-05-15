import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    padding: theme.spacing.unit * 2,
  },
  terminalHistory: {
    flexGrow: 1,
    marginTop: theme.spacing.unit * 4,
    maxHeight: 'calc(100vh - 200px)',
    overflowY: 'scroll',
  },
  inputRow: {
    display: 'flex',
    width: '100%',
  },
  input: {
    flexGrow: 1,
    marginRight: theme.spacing.unit * 2,
  },
  createdAt: {
    color: '#666',
  },
}), { withTheme: true })

export default useStyles
