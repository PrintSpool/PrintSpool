import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    // Scrolling needs an absolute height for it's container to work. Setting the root's position
    // to absolute gives an absolute height. Removing this will break the terminal scrolling.
    position: 'absolute',
    top: 80 + 53,
    bottom: 0,
    // End of scrolling hack

    display: 'grid',
    gridTemplateRows: 'auto auto 1fr',
    // width: '100%',
    padding: theme.spacing(2),
    paddingBottom: 0,
  },
  reference: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  terminalHistory: {
    // maxHeight: 'calc(100vh - 200px)',
    overflowY: 'scroll',
    /* for Firefox */
    minHeight: 0,
  },
  inputRow: {
    display: 'flex',
    width: '100%',
  },
  input: {
    flexGrow: 1,
    marginRight: theme.spacing(2),
  },
  terminalEntry: {
  },
  tx: {
    '& $direction': {
      color: '#DD25C4',
    },
    background: '#EEE',
  },
  rx: {
    '& $direction': {
      color: theme.palette.primary.dark,
    },
  },
  direction: {
    marginRight: theme.spacing(1),
  },
  content: {},
  createdAt: {
    color: '#666',
    marginRight: theme.spacing(1),
  },
  message: {
  },
}))

export default useStyles
