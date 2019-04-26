import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(() => ({
  root: {
    textAlign: 'center',
  },
  firstInstruction: {
    marginTop: '0.5rem',
  },
  code: {
    display: 'block',
    background: '#333',
    color: 'white',
    borderRadius: '0.4rem',
    padding: '0.6rem',
    paddingLeft: '0.8rem',
    paddingRight: '0.8rem',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
  },
}), { withTheme: true })

export default useStyles
