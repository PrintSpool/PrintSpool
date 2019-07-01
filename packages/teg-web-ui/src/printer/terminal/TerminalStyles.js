import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    padding: theme.spacing(2),
  },
  terminalHistory: {
    flexGrow: 1,
    marginTop: theme.spacing(4),
    maxHeight: 'calc(100vh - 200px)',
    overflowY: 'scroll',
  },
  inputRow: {
    display: 'flex',
    width: '100%',
  },
  input: {
    flexGrow: 1,
    marginRight: theme.spacing(2),
  },
  macroTerminalEntry: {
    background: '#DDD',
  },
  txTerminalEntry: {
    background: '#EEE',
  },
  createdAt: {
    color: '#666',
  },
  rx: {
    color: theme.palette.primary.dark,
    marginRight: theme.spacing(1),
  },
  rxMessage: {
  },
  tx: {
    color: '#DD25C4',
    marginRight: theme.spacing(1),
  },
  txMessage: {
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
