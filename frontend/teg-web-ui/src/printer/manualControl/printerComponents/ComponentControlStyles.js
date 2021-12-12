import { makeStyles } from '@material-ui/core/styles'

// eslint-disable-next-line
const useStyles = makeStyles(theme => ({
  root: {
    // marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  extruderButtons: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'right',
  },
  extruderButton: {
    marginLeft: theme.spacing(1),
    // textDecoration: 'none',
  },
  extruderJogDistances: {

  },
}))

export default useStyles
