import { configure } from '@storybook/react'

function loadStories() {
  require('../components/jobQueue/JobCard.story.js')
  require('../components/jobQueue/JobList.story.js')
}

configure(loadStories, module)
