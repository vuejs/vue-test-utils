# Wrapper

Vue Test Utils is a wrapper based API.

A `Wrapper` is an object that contains a mounted component or vnode and methods to test the component or vnode.

## Properties

### `vm`

`Component` (read-only): This is the `Vue` instance. You can access all the [instance methods and properties of a vm](https://vuejs.org/v2/api/#Instance-Properties) with `wrapper.vm`. This only exists on Vue component wrapper or HTMLElement binding Vue component wrapper.

### `element`

`HTMLElement` (read-only): the root DOM node of the wrapper

### `options`

#### `options.attachedToDocument`

`Boolean` (read-only): True if component is attached to document when rendered.

### `selector`

`Selector`: the selector that was used by [`find()`](./find.md) or [`findAll()`](./findAll.md) to create this wrapper

## Methods

!!!include(docs/api/wrapper/attributes.md)!!!
!!!include(docs/api/wrapper/classes.md)!!!
!!!include(docs/api/wrapper/contains.md)!!!
!!!include(docs/api/wrapper/destroy.md)!!!
!!!include(docs/api/wrapper/emitted.md)!!!
!!!include(docs/api/wrapper/emittedByOrder.md)!!!
!!!include(docs/api/wrapper/exists.md)!!!
!!!include(docs/api/wrapper/find.md)!!!
!!!include(docs/api/wrapper/findAll.md)!!!
!!!include(docs/api/wrapper/html.md)!!!
!!!include(docs/api/wrapper/is.md)!!!
!!!include(docs/api/wrapper/isEmpty.md)!!!
!!!include(docs/api/wrapper/isVisible.md)!!!
!!!include(docs/api/wrapper/isVueInstance.md)!!!
!!!include(docs/api/wrapper/name.md)!!!
!!!include(docs/api/wrapper/props.md)!!!
!!!include(docs/api/wrapper/setChecked.md)!!!
!!!include(docs/api/wrapper/setData.md)!!!
!!!include(docs/api/wrapper/setMethods.md)!!!
!!!include(docs/api/wrapper/setProps.md)!!!
!!!include(docs/api/wrapper/setSelected.md)!!!
!!!include(docs/api/wrapper/setValue.md)!!!
!!!include(docs/api/wrapper/text.md)!!!
!!!include(docs/api/wrapper/trigger.md)!!!
