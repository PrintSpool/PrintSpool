import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { gql } from '@apollo/client'
import { useForm } from 'react-hook-form'

import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
// import Icon from '@material-ui/core/Icon'
// import ListSubheader from '@material-ui/core/ListSubheader'
// import Divider from '@material-ui/core/Divider'

import Add from '@material-ui/icons/Add'
import Settings from '@material-ui/icons/Settings'

import HostStyles from './HostSettings.style'

import StaticTopNavigation from '../../../common/topNavigation/StaticTopNavigation'
import useLiveSubscription from '../../_hooks/useLiveSubscription'
import Loading from '../../../common/Loading'
import ServerBreadcrumbs from '../../common/ServerBreadcrumbs'
import TextField from '@material-ui/core/TextField'
import { Button } from '@material-ui/core'

const HOST_QUERY = gql`
  fragment QueryFragment on Query {
    serverName
    machines {
      id
      name
      status
    }
  }
`

const HostPage = () => {
  const classes = HostStyles()
  const { hostID } = useParams()

  const { loading, data, error } = useLiveSubscription(HOST_QUERY, {
    fetchPolicy: 'network-only',
  })

  const { handleSubmit, register, errors, reset, watch } = useForm()
  const onSubmit = (args) => console.log(args)

  let slug = watch('name')
    ?.replace(/[_ ]/g, '-')
    ?.replace(/[']/g, '')
    ?.toLowerCase()

  if (slug == null || slug.length == 0) {
    slug = hostID
  }

  if (error) {
    throw new Error(JSON.stringify(error, null, 2))
  }

  if (loading) {
    return <Loading fullScreen />
  }

  const { machines } = data

  return (
    <>
      <StaticTopNavigation />
      <div className={classes.root}>
        <ServerBreadcrumbs>
          <Typography color="textPrimary">Settings</Typography>
        </ServerBreadcrumbs>
        <Typography
          variant="h1"
          style={{ marginTop: 16 }}
        >
          Settings
        </Typography>
        <form
          // className={classes.form}
          onSubmit={handleSubmit(onSubmit)}
        >
          <Typography
            variant="h3"
            style={{ marginTop: 16 }}
          >
            Organization Name
          </Typography>
          <TextField
            label="Name"
            name="name"
            error={errors.name != null}
            helperText={errors.name && errors.name.message}
            inputRef={register({
              required: "Required",
              pattern: /^[a-z0-9_\- ']+$/
            })}
          />
          <div
            style={{ marginTop: 16 }}
          >
            https://printspool.io/m/<b>{slug}</b>/
          </div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: 16 }}
          >
            Save
          </Button>
        </form>
      </div>
    </>
  )
}

export default HostPage
