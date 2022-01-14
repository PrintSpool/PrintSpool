import React, { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { gql } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'

import Typography from '@mui/material/Typography'

import HostStyles from './HostSettings.style'

import StaticTopNavigation from '../../../common/topNavigation/StaticTopNavigation'
import Loading from '../../../common/Loading'
import ServerBreadcrumbs from '../../common/ServerBreadcrumbs'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import useSignallingGraphQL from '../../../common/auth/useSignallingGraphQL'
import { useAsync } from 'react-async-hook'
import Box from '@mui/material/Box'

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

  return <>
    <StaticTopNavigation />
    <div className={classes.root}>
      <ServerBreadcrumbs>
        <Typography color="textPrimary">Settings</Typography>
      </ServerBreadcrumbs>
      <Typography
        variant="h1"
        sx={{ mt: 2 }}
      >
        Settings
      </Typography>
      <form
        // className={classes.form}
        onSubmit={handleSubmit(setNameMutation.execute)}
      >
        <TextField
          label="Server Name"
          name="name"
          error={errors.name != null}
          helperText={errors.name && errors.name.message}
          inputRef={register({
            required: "Required",
            pattern: /^[a-z0-9_\- ']+$/
          })}
          sx={{ mt: 2 }}
        />
        <Box
          sx={{ mt: 2 }}
        >
          https://printspool.io/<b>{slug}</b>/
        </Box>
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Save
        </Button>
      </form>
    </div>
  </>;
}

export default HostPage
