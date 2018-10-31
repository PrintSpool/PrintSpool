import { PriorityEnum } from 'tegh-core'
const { EMERGENCY } = PriorityEnum

const reset = () => ['M999']
reset.priority = EMERGENCY

export default reset
