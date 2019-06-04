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
  rx: {
    color: theme.palette.primary.dark,
    opacity: 0.6,
  },
  rxMessage: {
    color: theme.palette.primary.dark,
    filter: 'brightness(20%)',
    opacity: 0.9,
  },
  tx: {
    color: '#DD25C4',
    opacity: 0.6,
  },
  txMessage: {
    color: '#DD25C4',
    filter: 'brightness(80%)',
  },
  macro: {
    color: '#6704D8',
    opacity: 0.6,
  },
  macroMessage: {
    color: '#6704D8',
    filter: 'brightness(60%)',
  },
}), { withTheme: true })

export default useStyles
