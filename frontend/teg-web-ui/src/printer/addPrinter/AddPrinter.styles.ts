import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  loading: {
    minHeight: '60vh',
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
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  submit: {
    marginTop: theme.spacing(2),
    float: 'right',
  }
}))

export default useStyles
