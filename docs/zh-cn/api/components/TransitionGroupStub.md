# `TransitionGroupStub`

一个用来存根 `transition-group` 组件的组件。与其异步完成过渡动画不同的是，它会同步返回子组件。

它在 Vue Test Utils 默认配置中用来存根所有的 `transition-group` 组件。将 `config.stubs['transition-group']` 设为 `false` 可以使用内建的 `transition-group` 组件：

```js
import { config } from '@vue/test-utils'

config.stubs['transition-group'] = false
```

将其重置可以存根 `transition-group` 组件：

```js
import { config, TransitionGroupStub } from '@vue/test-utils'

config.stubs['transition-group'] = TransitionGroupStub
```

还可以在挂载选项中将其设置为一个存根：

```js
import { mount, TransitionGroupStub } from '@vue/test-utils'

mount(Component, {
  stubs: {
    'transition-group': TransitionGroupStub
  }
})
```
