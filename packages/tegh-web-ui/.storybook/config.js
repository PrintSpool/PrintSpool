import { configure } from '@storybook/react'

function loadStories() {
  require('../src/pages/connected/queue/components/JobList.story.js')
  require('../src/pages/connected/frame/components/StatusDialog.story.js')
  require('../src/pages/connected/config/Index.story.js')
  require('../src/pages/connected/config/Printer.story.js')
}

configure(loadStories, module)
