import deline from 'deline'

const LandingPageEN = {
  hero: {
    // title: '3D Printing. Simplified.',
    // subtitle: 'Print Spool is your all new streamlined 3D printing experience',
    title: 'A bold new way to 3D print over WiFi.',
    callToActionButton: 'Get Started',
  },
  introduction: {
    title: 'Worry Less. Create <1>More</1>.',
    content: deline`
      3D printing is a powerful tool for prototyping and designing new things but managing 3D prints can take up valuable time and energy.\n

      Print Spool is designed from the ground up to streamline your WiFi 3D printing experience. Re-imagining the 3D printer workflow to remove print management obstacles so you can worry less and create more.\n
    `,
  },
  printQueueing: {
    title: 'Print Queueing',
    content: deline`
    Printing multiple parts should be easy. With Print Spool when you click print your part is added to a queue - it's like a playlist for your 3D printer.\n

    Once you've cleared the build platform Print Spool's play button is there for you to start up your next print in the queue - no looking up file names or trying to remember what part was supposed to be next. Printing is always simple, no matter how many parts you have to print.
    `
  },
  fullyAutomatic: {
    title: 'Fully Automatic',
    content: deline`
      Removing each print by hand takes time and it can be a frustrating interuption to your work. Print Spool automates removing prints.\n

      In Automatic Printing mode Print Spool will automatically start, stop and remove each print from your queue for you.\n

      If you have the hardware to support automatically ejecting prints all you have to do is add your designs to the queue and Print Spool will automatically print piles of parts for you.
    `
  },
  features: {
    title: 'And More',
    secure: deline`
      ## Secure & Private\n

      Everything is secured by HTTPS and your prints are never stored anywhere but your Raspberry Pi.
    `,
    multiPrinter: deline`
      ## Multi-Printer\n

      Access all of your 3D printers from one convenient dashboard.
    `,
    openSource: deline`
      ## Open Source\n

      Print Spool will always be free for you to use and mod. Print Spool's AGPL3 free software license guarentees it.
    `,
  },
  contribute: {
    // title: 'Help Print Spool Grow',
    // content: deline`
    // There are many ways to help Print Spool!
    //
    // #### Translations
    //
    // #### Bug Reports
    //
    // #### Pull Requests
    //
    // #### Donations
    // `,
    kofiButton: 'Support Me on Ko-fi',
    cryptoDonationButton: 'Donate {{shortName}}',
    cryptoAddressCopied: 'We copied Print Spool\'s {{shortName}} address to your clipboard. Thanks for supporting Print Spool!',
    cryptoDonationDialogTitle: 'Thank you for supporting Print Spool!',
    cryptoDonationDialogContent: 'You can use the {{longName}} address below to donate to Print Spool\'s development',
  },
  support: {
    title: 'Support Print Spool',
    content: deline`
      Print Spool is about creating awesome 3D printing software and giving it to the world for free. Empowering makers rich and poor, technical and non-technical to 3D print and explore their full creative making potential.\n

      It's an exciting prospect but designing and developing that takes a lot of work. It's like running a startup but without any of the money. Print Spool started as an experiment for me to explore the possibilities of 3D printing workflows but it can't continue indefinitely without funding. The future of Print Spool depends on donations from people like you.\n

      If you like Print Spool consider sending a tip. That would be cool of you.\n
    `,
  },
  footer: {
    privacyPolicy: 'Privacy Policy',
    connectTitle: 'Connect with us at',
  },
}

export default LandingPageEN
