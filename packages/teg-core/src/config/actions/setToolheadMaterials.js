export const SET_TOOLHEAD_MATERIALS = 'teg/config/SET_TOOLHEAD_MATERIALS'

const setToolheadMaterials = ({
  machineID,
  changes,
}) => ({
  type: SET_TOOLHEAD_MATERIALS,
  payload: {
    machineID,
    changes,
  },
})

export default setToolheadMaterials
