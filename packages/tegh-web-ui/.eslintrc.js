module.exports = {
    "env": {
        "browser": false,
        "es6": true,
        "jest/globals": true,
    },
    "plugins": [
      "jest",
      "immutablejs",
    ],
    "extends": [
      "airbnb",
      "plugin:jest/recommended",
    ],
    "parser": "babel-eslint",
    "rules": {
      "semi": [2, "never"],
      "func-names": ["error", "never"],
      "consistent-return": "off",
      "no-restricted-syntax": 0,
      "immutablejs/no-native-map-set": 2,
      "react/jsx-filename-extension": 0
    }
};
