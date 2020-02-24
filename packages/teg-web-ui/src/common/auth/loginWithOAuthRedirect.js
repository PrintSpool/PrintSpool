const clientID = '685652528606-2bi260g0099ho4stjmtlrn1ltvp29ku8.apps.googleusercontent.com'
const redirectURI = 'https://tegapp.io/auth'

const loginWithOAuthRedirect = async () => {
  // Google's OAuth 2.0 endpoint for requesting an access token
  const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth'

  // Create <form> element to submit parameters to OAuth 2.0 endpoint.
  const form = document.createElement('form')
  form.setAttribute('method', 'GET') // Send as a GET request.
  form.setAttribute('action', oauth2Endpoint)

  // Parameters to pass to OAuth 2.0 endpoint.
  const params = {
    client_id: clientID,
    redirect_uri: redirectURI,
    response_type: 'token',
    scope: 'https://www.googleapis.com/auth/userinfo.email',
    include_granted_scopes: 'true',
    state: 'pass-through value',
  }

  // Add form parameters as hidden input values.
  Object.entries(params).forEach(([k, v]) => {
    const input = document.createElement('input')
    input.setAttribute('type', 'hidden')
    input.setAttribute('name', k)
    input.setAttribute('value', v)
    form.appendChild(input)
  })

  // Add form to page and submit it to open the OAuth 2.0 endpoint.
  document.body.appendChild(form)
  form.submit()
}

export default loginWithOAuthRedirect
