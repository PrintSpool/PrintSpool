import * as yup from 'yup'

const configValidation = () => (
  yup.object().shape({
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
)

export default configValidation
