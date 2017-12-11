module.exports = {
    "env": {
        "browser": false,
        "es6": true
    },
    "plugins": [
      "babel",
      "flowtype"
    ],
    "extends": [
      "airbnb-base",
      "plugin:flowtype/recommended"
    ],
    "parser": "babel-eslint",
    "rules": {
      "semi": [2, "never"]
    }
};
