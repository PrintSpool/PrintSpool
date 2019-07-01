import { Map } from 'immutable'
import { createSelector } from 'reselect'
import getPlugins from './getPlugins'
import SchemaForm from '../types/SchemaForm'
import { initialState } from '../reducers/schemaFormsReducer'

const getSchemaForms = createSelector(
  getPlugins,
  (plugins) => {
    /*
    * The @tegapp/core plugin is included in the plugins list so it's schema form
    * gets combined like every other plugin
    *
    * getSchemaForms returns an object in the form:
    * {
    *   [component.type || plugin.package]: {
    *     schema: (previousSchema) => nextSchema
    *     form: [...]
    *   },
    *   ...
    * }
    */
    /*
     * merge all the schema forms.
     *
     * plugin packages and component types key unique configurable classes
     * of objects (not ES6 classes, classes in the non-technical sense).
     *
     * There are zero or one schema forms per plugin and config object class
     * combination.
     *
     * ie if there was 1 component type and 2 plugin packages (3 total config
     * object classes) there would be up to
     *
     * 3 config object classes * 2 plugins = 6 schema forms.
     *
     * inner reducer = each plugin has zero or one schema form for each
     * `component.type||plugin.package` resulting in many schema forms overall
     * for the plugin. Merge each `component.type||plugin.package` schema
     * into the schemas accumulator object at that key.
     *
     * outer reducer = each plugin will have many schema forms. Iterate through
     * the plugins to get to their schema forms.
     *
     */
    let schemas = initialState
    let machineConfigPaths = {}

    const addSchemaForm = (keypath, nextSchemaForm) => {
      schemas = schemas.updateIn(keypath, previousSchema => (
        // executing the schemaForm's schema function against the
        // previous schema value and saving it's output as the
        // new schema value
        nextSchemaForm.schema(previousSchema || {})
      ))
    }

    plugins.forEach((plugin) => {
      // iterating over the plugins and getting all their schema forms
      const {
        machine,
        ...schemaFormMaps
      } = (plugin.getSchemaForms && plugin.getSchemaForms()) || {}

      // add the machine schema form
      if (machine != null) {
        addSchemaForm(['machine'], machine)
        if (machine.configPaths != null) {
          machineConfigPaths = machine.configPaths(machineConfigPaths)
        }
      }

      // add the plugins and components schemaForms
      Object.entries(schemaFormMaps).forEach(([category, schemaForms]) => (
        // iterating over the categories defined in the plugin
        Object.entries(schemaForms).forEach(
          ([type, pluginSchemaFormForType]) => {
            // adding each individual schemaForms in the category
            addSchemaForm([category, type], pluginSchemaFormForType)
          },
        )
      ))
    })

    // wrap each schema in a SchemaForm Record
    Map(schemas).keySeq().forEach((categoryKey) => {
      if (categoryKey === 'machine') {
        schemas = schemas.update('machine', schema => (
          SchemaForm({
            id: 'machine',
            schema,
            configPaths: Map(machineConfigPaths),
            // TODO: form order customization
            form: ['*'],
          })
        ))
        return
      }

      schemas = schemas.update(categoryKey, category => (
        category.map((schema, type) => SchemaForm({
          id: type,
          schema,
          // TODO: form order customization
          form: ['*'],
        }))
      ))
    })

    return schemas
  },
)

export default getSchemaForms
