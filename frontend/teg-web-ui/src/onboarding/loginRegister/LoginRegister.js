import React, { useState } from 'react'
// import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Button from '@mui/material/Button'
// import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
// import Hidden from '@mui/material/Hidden'
import AppBar from '@mui/material/AppBar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'

import StaticTopNavigation from '../../common/topNavigation/StaticTopNavigation'
import { useAuth } from '../../common/auth'

import useStyles from './LoginRegisterStyles'

const a11yProps = (index) => ({
  id: `login-register-${index}`,
  'aria-controls': `login-register-${index}`,
})

const ThemedInput = ({ name, errors, ...props }) => (
  <TextField
    name={name}
    fullWidth
    error={errors[name] != null}
    helperText={errors[name] && errors[name].message}
    margin="normal"
    {...props}
  />
)

const LoginRegister = ({ t }) => {
  const classes = useStyles()

  const {
    logInWithGoogle,
    loginWithPassword,
    registerUserWithPassword,
  } = useAuth()

  const { handleSubmit, register, errors, reset, watch } = useForm()

  const [tab, setTab] = useState(0)
  const [error, setError] = useState()
  const handleTabChange = (event, newValue) => {
    reset()
    setError(null)
    setTab(newValue)
  }

  const onSubmit = async (data) => {
    try {
      if (tab === 0) {
        await loginWithPassword(data)
      } else {
        await registerUserWithPassword(data)
      }
    } catch(e) {
      console.error(e)
      setError(e)
    }
  }

  // <StaticTopNavigation title={() => 'Teg'} className={classes.navigation} />

  return (
    <div className={classes.root}>
      <form
        className={classes.form}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Card>
          <AppBar position="static" className={classes.header}>
            <Typography
              variant="h6"
              color="inherit"
            >
              Print Spool
            </Typography>
          </AppBar>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            aria-label="login or register"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Login" {...a11yProps(0)} />
            <Tab label="Register" {...a11yProps(1)} />
          </Tabs>

          <div className={classes.tabContent}>
            <ThemedInput
              errors={errors}
              name="email"
              placeholder="Email"
              inputRef={register({
                required: 'Required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                  message: "invalid email address"
                }
              })}
            />

            <ThemedInput
              errors={errors}
              name="password"
              placeholder="Password"
              type="password"
              inputRef={register({
                required: "Required",
              })}
            />

            { tab === 0 && (
              <>
                { error && (
                  <Typography color="error">
                    {error.message}
                  </Typography>
                )}

                <Button
                  type="submit"
                  className={classes.passwordLoginButton}
                  variant="outlined"
                  fullWidth
                >
                  Log in
                </Button>
              </>
            )}

            { tab === 1 && (
              <>
                <ThemedInput
                  errors={errors}
                  name="passwordConfirmation"
                  placeholder="Password Confirmation"
                  type="password"
                  inputRef={register({
                    required: "Required",
                    validate: (value) => (
                      value === watch('password') || 'Passwords don\'t match'
                    ),
                  })}
                />

                { error && (
                  <Typography color="error">
                    {error.message}
                  </Typography>
                )}

                <Button
                  type="submit"
                  className={classes.passwordLoginButton}
                  variant="outlined"
                  fullWidth
                >
                  Sign up
                </Button>
              </>
            )}

            <Typography variant="body1" className={classes.or}>
              or
            </Typography>

            <Button
              onClick={logInWithGoogle}
              className={classes.googleLoginButton}
              variant="outlined"
              fullWidth
            >
              <div className={classes.googleIcon}/>
              Login with Google
            </Button>

          </div>
        </Card>
      </form>
    </div>
  );
}

export default LoginRegister
