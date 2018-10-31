import { PriorityEnum } from 'tegh-core'
const { EMERGENCY } = PriorityEnum

const eStop = () => ['M112']
eStop.priority = EMERGENCY

export default eStop
