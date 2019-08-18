## Installing Dependencies

* `sudo apt install libnanomsg-dev python-nanomsg && pip install -r requirements.txt`
* `pip install git+https://github.com/tonysimpson/nanomsg-python.git`

### How to update dependencies in Python

`pip freeze | grep nanomsg== > requirements.txt`

backs up all locally installed python modules. Then you have to manually remove modules that aren't related to the project.

Personally I think it is completely unreasonable for a language in 2019 to not have a Gemfile/Package.json equivalent years ago.
