import getMaterials from '../../config/selectors/getMaterials'

const getMaterialForToolhead = ({ toolhead, combinatorConfig }) => {
  const materialID = toolhead.model.get('materialID')
  const material = getMaterials(combinatorConfig).get(materialID)

  if (material == null) {
    throw new Error(`material ${materialID} does not exists`)
  }

  return material
}

export default getMaterialForToolhead
