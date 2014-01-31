modKeys = (source, transform) ->
  if Array.isArray source
    return ( modKeys obj, transform for obj in source )
  return source unless typeof source == "object"
  target = {}
  target[transform(k2)] = modKeys(v2, transform) for k2, v2 of source
  return target

module.exports =
  mod: modKeys
  underscore: (source) =>
    modKeys source, (k) -> k.underscore()
  camelize: (source) ->
    modKeys source, (k) -> k.camelize(false)
