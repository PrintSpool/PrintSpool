import deline from 'deline'

const LandingPageEN = {
  hero: {
    // title: '3D Printing. Simplified.',
    // subtitle: 'Tegh is your all new streamlined 3D printing experience',
    title: 'A bold new way to 3D Print over WiFi.',
    callToActionButton: 'Get Started',
  },
  introduction: {
    title: 'Worry Less. Create <1>More</1>.',
    content: deline`
      3D printing is a powerful tool for prototyping and designing new things but managing 3D prints can take up valuable time and energy.\n

      Tegh is designed from the ground up to streamline your WiFi 3D printing experience. Re-imagining the 3D printer workflow to remove print management obstacles so you can worry less and create more.\n

      Tegh is and will always be AGPL3 Free Software built on the distributed web.
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

      Sit back and relax while Tegh uses your [Autodrop auto-scraper](https://www.autodrop3d.com/) to fully automatically print and eject piles of parts.
    `,
    multiPrinter: deline`
      ## Multi-Printer\n

      Access all of your 3D printers from one convenient dashboard.
    `,
    openSource: deline`
      ## 100% Open Source\n

      Tegh is and will always be free. Tegh is open source software under the Affero General Public License (AGPL).
    `,
  },
  contribute: {
    title: 'Help Tegh Grow',
    content: deline`
    There are many ways to help Tegh!

    #### Translations

    #### Bug Reports

    #### Pull Requests

    #### Donations
    `,
    kofiButton: 'Support Me on Ko-fi',
    cryptoDonationButton: 'Donate {{shortName}}',
    cryptoAddressCopied: 'We copied Tegh\'s {{shortName}} address to your clipboard. Thanks for supporting Tegh!',
    cryptoDonationDialogTitle: 'Thank you for supporting Tegh!',
    cryptoDonationDialogContent: 'You can use the {{longName}} address below to donate to Tegh\'s development',
  },
  footer: {
    connectTitle: 'Connect with us at'
  },
}

export default LandingPageEN
