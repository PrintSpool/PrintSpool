import { configure } from '@storybook/react'

function loadStories() {
  require('../components/jobQueue/JobCard.story.js')
  require('../components/jobQueue/JobList.story.js')
  require('../components/StatusDialog.story.js')
}

configure(loadStories, module)
