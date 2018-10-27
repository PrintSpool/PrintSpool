import { configure } from '@storybook/react'

const loadStories = () => {
  require('../src/pages/connected/queue/components/JobList.story.js')
  require('../src/pages/connected/frame/components/StatusDialog.story.js')
  require('../src/pages/connected/config/Index.story.js')
  require('../src/pages/connected/config/Printer.story.js')
  require('../src/pages/connected/config/components/Index.story.js')
  require('../src/pages/connected/config/components/Controller.story.js')
  require('../src/pages/connected/config/components/Fan.story.js')
  require('../src/pages/connected/config/components/Toolhead.story.js')
  require('../src/pages/connected/config/components/BuildPlatform.story.js')
  require('../src/pages/connected/config/materials/Index.story.js')
  require('../src/pages/connected/config/materials/Form.story.js')
}

configure(loadStories, module)
