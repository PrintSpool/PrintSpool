import { PriorityEnum } from 'tegh-server'
const { EMERGENCY } = PriorityEnum

const reset = () => ['M999']
reset.priority = EMERGENCY

export default reset
