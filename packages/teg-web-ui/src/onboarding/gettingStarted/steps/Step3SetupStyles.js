import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(() => ({
  loading: {
    minHeight: '60vh',
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '60vh',
  },
  part1: {
    display: 'flex',
    flexDirection: 'column',
    // textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  introText: {
    paddingBottom: 8,
  },
  config: {
    // marginTop: 8 * 4,
    display: 'flex',
    flexDirection: 'column',
  },
  configForm: {
    // marginTop: -8 * 3,
  },
  stretchedContent: {
    justifyContent: 'stretch',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
}), { withTheme: true })

export default useStyles
