import * as yup from 'yup'
import { TOOLHEAD } from './config/types/components/ComponentTypeEnum'

const configValidation = () => yup.object()
  .test(
    'material-in-use',
    'materials in use by a toolhead cannot be deleted',
    (config) => {
      const materialIDs = config.materials.map(m => m.id)
      return config.printer.components
        .filter(c => c.type === TOOLHEAD)
        .every((component) => {
          const materialID = component.model.get('materialID')
          return materialIDs.includes(materialID)
        })
    },
  )
  .shape({
    materials: yup.mixed(),
    printer: yup.object().shape({
      components: yup.mixed()
        .test(
          'unique-ids',
          'components cannot have duplicate IDs',
          components => (
            components.size === components.map(c => c.id).toSet().count()
          ),
        ),
      plugins: yup.mixed()
        .test(
          'unique-ids',
          'plugins cannot have duplicate IDs',
          plugins => (
            plugins.size === plugins.map(p => p.id).toSet().count()
          ),
        )
        .test(
          'unique-ids',
          'Duplicate package. Each plugin can only be installed once',
          plugins => (
            plugins.size === plugins.map(p => p.package).toSet().count()
          ),
        ),
    }),
  })

export default configValidation
