import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'grid',
    gridTemplateColumns: 'auto max-content max-content',
    marginBottom: theme.spacing(2),
  },
  // extruderButtons: {
  //   textAlign: 'right',
  // },
  extruderButton: {
    marginLeft: theme.spacing(1),
    alignSelf: 'center',
    // textDecoration: 'none',
  },
  extruderJogDistances: {

  },
}))

export default useStyles
