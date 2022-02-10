// From  mozilla-services/python-canonicaljson-rs
use pyo3::{prelude::*, types::{PyDict, PyList, PyFloat, PyTuple}};

pub fn to_json(py: Python, obj: &PyObject) -> serde_json::Value {
    macro_rules! return_cast {
        ($t:ty, $f:expr) => {
            if let Ok(val) = obj.cast_as::<$t>(py) {
                return $f(val).unwrap();
            }
        };
    }

    macro_rules! return_to_value {
        ($t:ty) => {
            if let Ok(val) = obj.extract::<$t>(py) {
                return serde_json::value::to_value(val).unwrap();
            }
        };
    }

    if obj == &py.None() {
        return serde_json::Value::Null;
    }

    return_to_value!(String);
    return_to_value!(bool);
    return_to_value!(u64);
    return_to_value!(i64);

    return_cast!(PyDict, |x: &PyDict| {
        let mut map = serde_json::Map::new();
        for (key_obj, value) in x.iter() {
            let key = if key_obj == py.None().as_ref(py) {
                Result::<_, ()>::Ok("null".to_string())
            } else if let Ok(val) = key_obj.extract::<bool>() {
                Ok(if val {
                    "true".to_string()
                } else {
                    "false".to_string()
                })
            } else if let Ok(val) = key_obj.str() {
                Ok(val.to_string())
            } else {
                panic!(
                    "{:?}",
                    key_obj
                        .to_object(py)
                        .as_ref(py)
                        .get_type()
                        .name(),
                );
            };
            map.insert(key.unwrap(), to_json(py, &value.to_object(py)));
        }
        Result::<_, ()>::Ok(serde_json::Value::Object(map))
    });

    return_cast!(PyList, |x: &PyList| Result::<_, ()>::Ok(serde_json::Value::Array(x
        .iter()
        .map(|x| to_json(py, &x.to_object(py)))
        .collect())));

    return_cast!(PyTuple, |x: &PyTuple| Result::<_, ()>::Ok(serde_json::Value::Array(
        x.iter().map(|x| to_json(py, &x.to_object(py))).collect()
    )));

    return_cast!(PyFloat, |x: &PyFloat| {
        match serde_json::Number::from_f64(x.value()) {
            Some(n) => Result::<_, ()>::Ok(serde_json::Value::Number(n)),
            None => panic!(
                "Invalid float: {:?}",
                x.to_object(py),
            ),
        }
    });

    // At this point we can't cast it, set up the error object
    panic!(
        "Invalid cast: {:?}",
        obj.as_ref(py).get_type().name(),
    );
}
