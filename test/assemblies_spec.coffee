chai = require("chai")
spies = require('chai-spies')
require("sugar")
_ = require 'lodash'

Assembly       = require("../lib/components/assembly.coffee")

chai.use(spies)
chai.should()
expect = chai.expect

