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
      + 'Your almost ready to start 3D Printing!\n\n'
      + 'To finish setting up your 3D printer go to https://tegapp.io\n\n'
      + thickLine
      + '\n'
    )
    /* eslint-enable */
  })
}

export default displayInviteInConsole
