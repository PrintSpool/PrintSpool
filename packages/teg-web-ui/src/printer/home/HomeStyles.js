import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  header: {
    paddingTop: theme.spacing(3),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    color: '#FFF',
    background: '#dd25c4',
    // background: '#ff7a00', //theme.palette.secondary.main,
  },
  addButton: {
    marginTop: theme.spacing(4),
    marginRight: theme.spacing(2),
    float: 'left',
  },
  card: {
    marginTop: theme.spacing(4),
    [theme.breakpoints.up('md')]: {
      maxWidth: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
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
