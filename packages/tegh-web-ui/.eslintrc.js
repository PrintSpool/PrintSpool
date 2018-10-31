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
    "settings": {
      "import/core-modules": [ "apollo-react-live-subscriptions" ],
    },
    "rules": {
      "semi": [2, "never"],
      "func-names": ["error", "never"],
      "consistent-return": "off",
      "no-restricted-syntax": 0,
      "immutablejs/no-native-map-set": 2,
      "react/jsx-filename-extension": 0,
      "react/prop-types": 0
    }
};
