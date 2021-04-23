import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    overflow: 'scroll',
  },
}))

export default useStyles
