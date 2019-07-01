export const SET_TOOLHEAD_MATERIALS = 'tegh/config/SET_TOOLHEAD_MATERIALS'

const setToolheadMaterials = ({
  config,
}) => ({
  type: SET_TOOLHEAD_MATERIALS,
  payload: {
    config,
  },
})

export default setToolheadMaterials
