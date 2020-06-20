import { makeStyles } from '@material-ui/styles'

// eslint-disable-next-line
const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  extruderButtons: {
    textAlign: 'right',
  },
  extruderButton: {
    marginLeft: theme.spacing(1),
    // textDecoration: 'none',
  },
  extruderJogDistances: {

  },
}), { withTheme: true })

export default useStyles
