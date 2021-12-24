import { useAsync, useAsyncCallback } from 'react-async-hook'
import { useAuth } from '.'

const useSignallingGraphQL = () => {
  const { getFetchOptions } = useAuth()

  const query = async ({
    onComplete = async (_data) => {},
    ...operation
  }) => {
    const { url, ...fetchOptions } = (await getFetchOptions())({})

    const res = await fetch(url, {
      ...fetchOptions,
      method: 'POST',
      body: JSON.stringify(operation),
    })

    if (!res.ok) {
      throw new Error(
        "Unnable to connect. Please verify that your internet is working."
      )
    }

    const { errors, data } = await res.json()

    if (errors != null) {
      console.warn({ errors })
      throw new Error(errors[0].message)
    }

    await onComplete(data)

    return data
  }

  const useQuery = (operation) => {
    const { result, ...otherProps } = useAsync(async () => (
      query(operation)
    ), null)

    return { data: result, ...otherProps }
  }

  const useMutation = (operation) => {
    let getVariables = operation.variables

    if (typeof getVariables !== 'function') {
      getVariables = (variables) => ({
        ...(operation.variables || {}),
        ...(variables || {}),
      })
    }

    const { result, ...otherProps } = useAsyncCallback(async (input) => (
      query({
        ...operation,
        variables: getVariables(input)
      })
    ))

    return { data: result, ...otherProps }
  }

  return {
    query,
    useQuery,
    useMutation,
  }
}

export default useSignallingGraphQL;
