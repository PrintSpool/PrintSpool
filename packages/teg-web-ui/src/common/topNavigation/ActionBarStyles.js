import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    background: 'white',
    borderBottom: '1px solid #CCC',
    justifyContent: 'end',
    display: 'flex',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  actionButton: {
    // color: 'white',
  },
}), { withTheme: true })

export default useStyles
