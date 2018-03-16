import { PriorityEnum } from 'tegh-server'
const { EMERGENCY } = PriorityEnum

const eStop = () => ['M112']
eStop.priority = EMERGENCY

export default eStop
