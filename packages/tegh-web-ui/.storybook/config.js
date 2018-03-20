import { configure } from '@storybook/react'

function loadStories() {
  require('../components/jobQueue/JobCard.story.js')
}

configure(loadStories, module)
