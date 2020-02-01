import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  header: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),

    '& h1': {
      lineHeight: '2.3rem',
    },
    '& a': {
      float: 'right',
    },
  },
  printButton: {
  },
  manage: {
    marginRight: '1rem',
  },
  emptyListMessage: {
    textAlign: 'center',
    marginTop: '25vh',
  },
  addFirstPrinterButton: {
    marginTop: '1rem',
  },
}), { withTheme: true })

export default useStyles
