import deline from 'deline'

const LandingPageEN = {
  hero: {
    title: '3D Printing. Simplified.',
    subtitle: 'Tegh is your all new streamlined 3D printing experience',
    callToActionButton: 'Get Started',
  },
  introduction: {
    title: 'Worry Less. <1>Create</1> More.',
    content: deline`
      Tegh is a printing software designed from the ground up to streamline your 3D printing experience. Easily queue up prints without managing complicated file systems.
    `,
  },
  features: {
    title: 'Features',
    printQueueing: deline`
      ## Simple\n

      Print parts now or queue them up for later with Tegh's easy to use print queue.
    `,
    easySetup: deline`
      ## Easy to Setup\n

      No python scripts to run. No SD Cards to flash. No static IPs to route. Just [download the app](https://snapcraft.io/tegh) and [get started](#/get-started/).
    `,
    secure: deline`
      ## Secure\n

      Protect your prints with the worlds first end-to-end encrypted 3D printing software.
    `,
    automatic: deline`
      ## Automatic\n

      Sit back and enjoy a coffee while Tegh uses your [Autodrop auto-scraper](https://www.autodrop3d.com/) to fully automatically print and eject piles of parts.
    `,
    multiPrinter: deline`
      ## Multi-Printer\n

      Access all of your 3D printers from one convenient dashboard.
    `,
    openSource: deline`
      ## 100% Open Source\n

      Tegh is and will always be free! Tegh is open source software under the Affero General Public License (AGPL).
    `,
  },
  footer: {
    connectTitle: 'Connect with us at'
  },
}

export default LandingPageEN
