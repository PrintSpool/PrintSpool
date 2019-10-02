import * as qrcode from 'qrcode-terminal'

const displayInviteInConsole = ({ invite }) => {
  const thickLine = `${'='.repeat(80)}\n`

  qrcode.generate(invite.code, { small: true }, (qr) => {
    /* eslint-disable no-console, prefer-template, comma-dangle */
    console.error(
      '\n\n\n'
      + 'Invite Code\n'
      + thickLine + '\n'
      + `${qr}\n`
      + `${invite.code}\n\n`
      + thickLine + '\n'
      + 'Your almost ready to start 3D Printing! To connect to your printer\n\n'
      + 'go to https://tegapp.io and use the Invite Code above.\n\n'
      + thickLine
      + '\n'
    )
    /* eslint-enable */
  })
}

export default displayInviteInConsole
