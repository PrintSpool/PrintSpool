import * as qrcode from 'qrcode-terminal'
import base64url from 'base64url'

const isDev = process.env.NODE_ENV || 'development' === 'development'
const webAppDomain = isDev ? 'http://localhost:1234' : 'https://tegapp.io'

const displayInviteInConsole = ({ invite }) => {
  const thickLine = `${'='.repeat(80)}\n`

  const inviteURL = `${webAppDomain}/i/${base64url.fromBase64(invite.code)}`

  qrcode.generate(inviteURL, { small: true }, (qr) => {
    /* eslint-disable no-console, prefer-template, comma-dangle */
    console.error(
      '\n\n\n'
      + 'Invite Code\n'
      + thickLine + '\n'
      + `${qr}\n`
      + `${inviteURL}\n\n`
      + thickLine + '\n'
      + 'Your almost ready to start 3D Printing!\n\n'
      + 'To finish setting up your 3D printer go to https://tegapp.io\n\n'
      + thickLine
      + '\n'
    )
    /* eslint-enable */
  })
}

export default displayInviteInConsole
