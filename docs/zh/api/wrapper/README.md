# Wrapper

Vue Test Utils 是一个基于包裹器的 API。

一个 `Wrapper` 是一个包括了一个挂载组件或 vnode，以及测试该组件或 vnode 的方法。

<div class="vueschool"><a href="https://vueschool.io/lessons/the-wrapper-object?friend=vuejs" target="_blank" rel="sponsored noopener" title="Learn about the Wrapper object in a FREE video lesson from Vue School">通过 Vue School 的免费视频学习 Wrapper 对象</a></div>

## 属性

### `vm`

`Component` (只读)：这是该 Vue 实例。你可以通过 `wrapper.vm` 访问一个实例所有的[方法和属性](https://cn.vuejs.org/v2/api/#实例属性)。这只存在于 Vue 组件包裹器或绑定了 Vue 组件包裹器的 HTMLElement 中。

### `element`

`HTMLElement` (只读)：包裹器的根 DOM 节点

### `options`

#### `options.attachedToDocument`

`Boolean` (只读)：如果组件在渲染之后被添加到了文档上则为 `true`

### `selector`

`Selector`: 被 [`find()`](./find.md) 或 [`findAll()`](./findAll.md) 创建这个 wrapper 时使用的选择器。

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
!!!include(docs/zh/api/wrapper/findComponent.md)!!!
!!!include(docs/zh/api/wrapper/findAllComponents.md)!!!
!!!include(docs/zh/api/wrapper/html.md)!!!
!!!include(docs/zh/api/wrapper/get.md)!!!
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
