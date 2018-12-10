import * as yup from 'yup'
import { ComponentTypeEnum } from 'tegh-core'

const { CONTROLLER, AXIS, BUILD_PLATFORM } = ComponentTypeEnum

const configValidation = () => yup.object().shape({
  config: yup.object().shape({
    printer: yup.object().shape({
      components: yup.mixed()
        .test(
          'single-controller',
          'tegh-driver-serial-gcode driver requires exactly one controller per printer',
          components => components.filter(c => c.type === CONTROLLER).size === 1,
        )
        .test(
          'xyz',
          'tegh-driver-serial-gcode driver: only supports printers with x, y and z axes',
          (components) => {
            const axes = components.filter(c => c.type === AXIS)

            const mustBeXYorZ = axes.every(c => (
              ['x', 'y', 'z'].includes(c.model.get('address'))
            ))

            return axes.size === 3 && mustBeXYorZ
          },
        )
        .test(
          'single-build-platform',
          'tegh-driver-serial-gcode driver only supports one build platform per printer',
          components => (
            components
              .filter(c => c.type === BUILD_PLATFORM)
              .size === 1
          ),
        ),
    }),
  }),
})

export default configValidation
