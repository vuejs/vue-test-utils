# `TransitionStub`

一个用来存根 `transition` 组件的组件。与其异步完成过渡动画不同的是，它会同步返回子组件。

它在 Vue Test Utils 默认配置中用来存根所有的 `transition` 组件。将 `config.stubs.transition` 设为 `false` 可以使用内建的 `transition` 组件：


```js
import { config } from '@vue/test-utils'

config.stubs.transition = false
```

将其重置可以存根 `transition` 组件：

```js
import { config, TransitionStub } from '@vue/test-utils'

config.stubs.transition = TransitionStub
```

还可以在挂载选项中将其设置为一个存根：

```js
import { mount, TransitionStub } from '@vue/test-utils'

mount(Component, {
  stubs: {
    transition: TransitionStub
  }
})
```
