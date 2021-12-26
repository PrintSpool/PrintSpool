import React, { useEffect } from 'react'
import { Link, useParams, useHistory } from 'react-router-dom'
import { gql } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'

import Typography from '@material-ui/core/Typography'

import HostStyles from './HostSettings.style'

import StaticTopNavigation from '../../../common/topNavigation/StaticTopNavigation'
import useLiveSubscription from '../../_hooks/useLiveSubscription'
import Loading from '../../../common/Loading'
import ServerBreadcrumbs from '../../common/ServerBreadcrumbs'
import TextField from '@material-ui/core/TextField'
import { Button } from '@material-ui/core'
import useSignallingGraphQL from '../../../common/auth/useSignallingGraphQL'
import { useAsync } from 'react-async-hook'

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
  const { query, useMutation } = useSignallingGraphQL()
  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()

  const {
    handleSubmit,
    register,
    errors,
    reset,
    watch,
    // getValues,
  } = useForm()

  const { loading, error }: any = useAsync(async () => {
    const data = await query({
      query: `
        query($hostID: ID) {
          my {
            hosts(hostID: $hostID) {
              id
              orgName
            }
          }
        }
      `,
      variables: {
        hostID,
      },
    })

    reset({ name: data.my.hosts[0].orgName })
  }, null)


  let slug = watch('name')
    ?.replace(/[_ ]/g, '-')
    ?.replace(/[']/g, '')
    ?.toLowerCase()

  if (slug == null || slug.length == 0) {
    slug = hostID
  }

  const setNameMutation: any = useMutation({
    query: `
      mutation($input: SetOrganizationNameInput){
        setOrganizationName(input: $input) {
          id
        }
      }
    `,
    variables: (values) => ({
      input: {
        hostID,
        ...values,
      },
    }),
    onComplete: async () => {
      enqueueSnackbar('Org name saved', {
        variant: 'success',
      })
      history.replace(`/${slug}/settings`)
    }
  })

  useEffect(() => {
    if (setNameMutation.error) {
      enqueueSnackbar(setNameMutation.error.message, {
        variant: 'error',
      })
    }
  }, [setNameMutation.error])

  if (error) {
    throw error
  }

  if (loading) {
    return <Loading fullScreen />
  }

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
          onSubmit={handleSubmit(setNameMutation.execute)}
        >
          <Typography
            variant="h3"
            style={{ marginTop: 16 }}
          >
            Server Name
            {/* Organization Name */}
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
            https://printspool.io/<b>{slug}</b>/
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
