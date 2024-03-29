import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'grid',
    gridTemplateRows: 'auto auto auto 1fr',
    // width: '100%',
    padding: theme.spacing(2),
    paddingBottom: 0,
    overflow: 'hidden',
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
    marginTop: theme.spacing(2),
  },
  input: {
    flexGrow: 1,
    marginRight: theme.spacing(2),
  },
  terminalEntry: {
  },
  tx: {
    '& $direction': {
      color: '#9602A7',
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
