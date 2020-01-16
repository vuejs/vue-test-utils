# Wrapper

Vue Test Utils 是一个基于包裹器的 API。

一个 `Wrapper` 是一个包括了一个挂载组件或 vnode，以及测试该组件或 vnode 的方法。

## 属性

### `vm`

`Component` (只读)：这是该 Vue 实例。你可以通过 `wrapper.vm` 访问一个实例所有的[方法和属性](https://vuejs.org/v2/api/#Instance-Properties)。这只存在于 Vue 组件包裹器或绑定了 Vue 组件包裹器的 HTMLElement 中。

### `element`

`HTMLElement` (只读)：包裹器的根 DOM 节点

### `options`

#### `options.attachedToDocument`

`Boolean` (只读)：如果组件在渲染之后被添加到了文档上则为真

## 方法

!!!include(docs/zh/api/wrapper/attributes.md)!!!
!!!include(docs/zh/api/wrapper/classes.md)!!!
!!!include(docs/zh/api/wrapper/contains.md)!!!
!!!include(docs/zh/api/wrapper/destroy.md)!!!
!!!include(docs/zh/api/wrapper/emitted.md)!!!
!!!include(docs/zh/api/wrapper/emittedByOrder.md)!!!
!!!include(docs/zh/api/wrapper/exists.md)!!!
!!!include(docs/zh/api/wrapper/find.md)!!!
!!!include(docs/zh/api/wrapper/findAll.md)!!!
!!!include(docs/zh/api/wrapper/html.md)!!!
!!!include(docs/zh/api/wrapper/is.md)!!!
!!!include(docs/zh/api/wrapper/isEmpty.md)!!!
!!!include(docs/zh/api/wrapper/isVisible.md)!!!
!!!include(docs/zh/api/wrapper/isVueInstance.md)!!!
!!!include(docs/zh/api/wrapper/name.md)!!!
!!!include(docs/zh/api/wrapper/props.md)!!!
!!!include(docs/zh/api/wrapper/setChecked.md)!!!
!!!include(docs/zh/api/wrapper/setData.md)!!!
!!!include(docs/zh/api/wrapper/setMethods.md)!!!
!!!include(docs/zh/api/wrapper/setProps.md)!!!
!!!include(docs/zh/api/wrapper/setSelected.md)!!!
!!!include(docs/zh/api/wrapper/setValue.md)!!!
!!!include(docs/zh/api/wrapper/text.md)!!!
!!!include(docs/zh/api/wrapper/trigger.md)!!!
