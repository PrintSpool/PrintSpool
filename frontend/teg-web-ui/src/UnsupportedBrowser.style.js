import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'grid',
    gridTemplateColumns: 'auto',
    height: '100vh',

    alignContent: 'center',
    justifyContent: 'center',
    justifyItems: 'center',
    alignItems: 'center',
  },
  paper: {
    width: 500,
    maxWidth: '80vw',
  },
  header: {
    background: '#dd25c4',
    color: 'white',
    padding: theme.spacing(2),
  },
  content: {
    padding: theme.spacing(2),
  },
}))

export default useStyles
