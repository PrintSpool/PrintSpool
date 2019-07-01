import getMaterials from '../../config/selectors/getMaterials'

const getMaterialForToolhead = ({ toolhead, config }) => {
  const materialID = toolhead.model.get('materialID')
  const material = getMaterials(config).get(materialID)

  if (material == null) {
    throw new Error(`material ${materialID} does not exists`)
  }

  return material
}

export default getMaterialForToolhead
