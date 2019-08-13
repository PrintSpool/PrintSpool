const GCODE_FEEDBACK = 'GCODE_FEEDBACK'

[
{
  op: 'replace',
  path: `/components/e0/axis/actualPosition`,
  value: 10,
}
{
  op: 'replace',
  path: `/components/e1/axis/actualPosition`,
  value: 10,
}
]


{
  setsActualTemperatures: true
  components: {
    e0: { actualTemperature: v }
    b: { actualTemperature: v }
  }
}

{
  components: {
    x: { actualPosition: v }
    y: { actualPosition: v }
    z: { actualPosition: v }
  }
}

// NEW FORMAT!!

{
  type: 'GCODE_FEEDBACK',
  despooled: ["g1 x10.12390 y30.145"],
}

{
  type: 'GCODE_FEEDBACK',
  despooled: ["g1 x10"],
  setsTargetTemperatures: true,
  components: [
    {
      address: 'e0',
      targetTemperature: 10,
    }
  ],
}

type GCodeFeedbackParams = {
    value?: number,
    status?: Status,
};

export class GCodeFeedback extends Record({
  value: 0,
  status: OK,
}) {
  value: number;
  status: Status;

  constructor(params?: GCodeFeedbackParams) {
    params ? super(params) : super();
  }
}
