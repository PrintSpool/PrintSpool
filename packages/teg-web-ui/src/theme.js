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
        color: '#0366d6',
        cursor: 'pointer',
      },
    },
  },
  typography: {
    useNextVariants: true,
  //   fontSize: 18,
  //   h4: {
  //     fontSize: '2.1rem',
  //     letterSpacing: '0.05em',
  //     fontWeight: 600,
  //   },
  }
})

export default theme
