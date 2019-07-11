import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    background: theme.palette.error.dark,
    color: 'white',
  },
  header: {
  },
}), { useTheme: true })

export default useStyles
