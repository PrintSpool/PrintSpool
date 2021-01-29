use std::collections::HashMap;
// use async_graphql::*;
use serde::{Deserialize, Serialize};
use eyre::{
    eyre,
    Result,
    // Context as _,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct JsonGCode(HashMap<String, HashMap<char, f32>>);

impl JsonGCode {
    pub fn try_to_string(&self, original_line: &str) -> Result<String> {
        let keys = self.0.keys();
        if keys.len() > 1 {
            Err(eyre!(
                "Expected 1 GCode, got {} for JSON: {:?}",
                keys.len(),
                original_line
            ))?;
        };

        let (gcode, args) = self.0.iter()
            .next()
            .ok_or_else(|| {
                eyre!("No GCodes found in JSON: {:?}", original_line)
            })?;

        let gcode = gcode.to_ascii_uppercase();

        let _ = Self::validate_gcode_command(&gcode)?;

        let line = args.into_iter()
            .fold(gcode, |mut acc, (k, v)| {
                acc.push_str(&format!(" {}{}", k.to_ascii_uppercase(), v));
                acc
            });

        Ok(line)
    }

    fn validate_gcode_command<'a>(input: &'a str) -> Result<()> {
        use nom::{
            IResult,
            character::complete::*,
            combinator::*,
            sequence::*,
        };

        let result: IResult<&'a str, ()> = all_consuming(
            value((),
                pair(
                    one_of("GM"),
                    digit1,
                ),
            ),
        )(input);

        result.map_err(|_| eyre!("Invalid GCode: {}", input))?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use std::iter::FromIterator;
    use std::collections::HashMap;
    use eyre::{
        // eyre,
        Result,
        // Context as _,
    };

    use super::JsonGCode;

    #[test]
    fn it_parses_gcode() -> Result<()> {

        let expected = "G1 X10 Y20";

        let gcode = HashMap::from_iter(vec![
            ("G1".into(), HashMap::from_iter(vec![
                ('x', 10.0),
                ('Y', 20.0),
            ])),
        ]);
        let gcode = JsonGCode(gcode);

        let output = gcode.try_to_string("JSON STRING")?;

        assert_eq!(output, expected);

        Ok(())
    }
}
