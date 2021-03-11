import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  moveToTopOfQueue: {
    marginBottom: theme.spacing(4),
  },
  quantityButton: {
    marginLeft: theme.spacing(2),
  },
}))

export default useStyles
