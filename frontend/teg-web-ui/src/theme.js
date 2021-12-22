import { createMuiTheme } from '@material-ui/core/styles'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#05CB0D',
      contrastText: '#FFF',
    },
  },
  overrides: {
  //   MuiButton: {
  //     label: {
  //       fontWeight: 'bold',
  //       textTransform: 'none',
  //     },
  //   },
    MuiLink: {
      root: {
        // color: 'rgb(0, 0, 238)',
        // color: '#0366d6',
        cursor: 'pointer',
      },
    },
  },
  typography: {
    useNextVariants: true,
    h1: {
      fontSize: '2rem',
    },
    h2: {
      fontSize: '1.7rem',
    },
  //   fontSize: 18,
  //   h4: {
  //     fontSize: '2.1rem',
  //     letterSpacing: '0.05em',
  //     fontWeight: 600,
  //   },
  }
})

export default theme
