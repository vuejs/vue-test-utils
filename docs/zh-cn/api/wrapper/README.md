# `Wrapper`

Vue Test Utils 是一个基于包裹器的 API。

一个 `Wrapper` 是一个包括了一个挂载组件或 vnode，以及测试该组件或 vnode 的方法。

- **属性：**

`vm` `Component`：这是该 Vue 实例。你可以通过 `wrapper.vm` 访问一个实例所有的[方法和属性](https://vuejs.org/v2/api/#Instance-Properties)。这只存在于 Vue 组件包裹器中  
`element` `HTMLElement`：包裹器的根 DOM 节点  
`options` `Object`：一个对象，包含传递给 `mount` 或 `shallow` 的 Vue Test Utils 选项  
`options.attachedToDom` `Boolean`：如果 `attachToDom` 传递给了 `mount` 或 `shallow` 则为真  

- **方法：**

在文档的 `Wrapper` 章节有详细的方法列表。
