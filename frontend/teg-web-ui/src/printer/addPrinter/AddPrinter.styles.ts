import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  loading: {
    minHeight: '60vh',
  },
  title: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  loadingPart2: {},
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
    // display: 'flex',
    // flexDirection: 'column',
    // flex: 1,
    margin: theme.spacing(2),
  },
  submit: {
    marginTop: theme.spacing(2),
    float: 'right',
  }
}))

export default useStyles
