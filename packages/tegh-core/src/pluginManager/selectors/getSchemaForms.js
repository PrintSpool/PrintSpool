import { Map } from 'immutable'
import { createSelector } from 'reselect'
import getPlugins from './getPlugins'
import SchemaForm from '../types/SchemaForm'

const getSchemaForms = createSelector(
  getPlugins,
  (plugins) => {
    /*
    * The tegh-core plugin is included in the plugins list so it's schema form
    * gets combined like every other plugin
    *
    * getSchemaForms returns an object in the form:
    * {
    *   [component.type || plugin.package]: {
    *     schema: {...}
    *     form: [...]
    *   },
    *   ...
    * }
    */
    const pluginsSchemaForms = plugins.map(plugin => (
      (plugin.getSchemaForm && plugin.getSchemaForms()) || {}
    ))

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
    const schemas = pluginsSchemaForms.reduce(
      (pluginSchemaForms, schemasAcc) => ({
        ...schemasAcc,

        ...Object.entries(pluginSchemaForms).reduce(
          ([pluginSchemaFormForType, type]) => ({
            ...(schemasAcc[type] || {}),
            ...pluginSchemaFormForType.schema,
          }),
          {},
        ),
      }),
      {},
    )

    return Map(schemas).map(schema => SchemaForm({
      schema,
      // TODO: form order customization
      form: ['*'],
    }))
  },
)

export default getSchemaForms
