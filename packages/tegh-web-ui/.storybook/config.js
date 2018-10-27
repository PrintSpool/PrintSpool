import { configure } from '@storybook/react'

function loadStories() {
  require('../src/pages/connected/queue/components/JobList.story.js')
  require('../src/pages/connected/frame/components/StatusDialog.story.js')
  require('../src/pages/connected/config/Index.story.js')
  require('../src/pages/connected/config/Printer.story.js')
  require('../src/pages/connected/config/Components.story.js')
  require('../src/pages/connected/config/Controller.story.js')
  require('../src/pages/connected/config/Fan.story.js')
  require('../src/pages/connected/config/Toolhead.story.js')
  require('../src/pages/connected/config/BuildPlatform.story.js')
  require('../src/pages/connected/config/materials/Index.story.js')
  require('../src/pages/connected/config/materials/Form.story.js')
}

configure(loadStories, module)
