# Wrapper

Vue Test Utils is a wrapper based API.

A `Wrapper` is an object that contains a mounted component or vnode and methods to test the component or vnode.

<div class="vueschool"><a href="https://vueschool.io/lessons/the-wrapper-object?friend=vuejs" target="_blank" rel="sponsored noopener" title="Learn about the Wrapper object in a FREE video lesson from Vue School">Learn about the Wrapper object in a FREE video lesson from Vue School</a></div>

## Properties

### `vm`

`Component` (read-only): This is the `Vue` instance. You can access all the [instance methods and properties of a vm](https://vuejs.org/v2/api/#Instance-Properties) with `wrapper.vm`. This only exists on Vue component wrapper or HTMLElement binding Vue component wrapper.

### `element`

`HTMLElement` (read-only): the root DOM node of the wrapper

### `options`

#### `options.attachedToDocument`

`Boolean` (read-only): `true` if component is [attached to document](../options.md) when rendered.

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
!!!include(docs/api/wrapper/get.md)!!!
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
