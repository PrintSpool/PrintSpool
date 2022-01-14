import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  // palette: {
  //   primary: {
  //     main: '#c420b9',
  //   },
  //   secondary: {
  //     main: '#90caf9',
  //   },
  // },
  // overrides: {
  //   MuiLink: {
  //     root: {
  //       // color: 'rgb(0, 0, 238)',
  //       // color: '#0366d6',
  //       cursor: 'pointer',
  //     },
  //   },
  // },
  typography: {
    h1: {
      fontSize: '2rem',
    },
    h2: {
      fontSize: '1.7rem',
    },
    h3: {
      fontSize: '1.3rem',
      fontWeight: 'normal',
    },
  },
})

export default theme
