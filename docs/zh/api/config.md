## 配置

Vue Test Utils 包含了一个定义其选项的配置对象。

### Vue Test Utils 配置选项

### `stubs`

- 类型：`{ [name: string]: Component | boolean | string }`
- 默认值：`{ transition: TransitionStub, 'transition-group': TransitionGroupStub }`

存储在 `config.stubs` 中的存根会被默认使用。  
用到的组件存根。它们会被传入挂载选项的 `stubs` 覆写。

当把 `stubs` 作为一个数组传入挂载选项时，`config.stubs` 会被转换为一个数组，然后用只返回一个 `<${component name}-stub>` 的基础组件进行存根。

示例：

```js
import { config } from '@vue/test-utils'

config.stubs['my-component'] = '<div />'
```

### `mocks`

- 类型：`Object`
- 默认值：`{}`

默认使用传递给 `config.mocks` 的值，类似 `stubs`。传递给挂载选项中 `mocks` 对象的任何值都会优先于 `config.mocks` 中的同名声明。

示例：

```js
import { config } from '@vue/test-utils'

config.mocks['$store'] = {
  state: {
    id: 1
  }
}
```

### `methods`

- 类型：`{ [name: string]: Function }`
- 默认值：`{}`

你可以使用 `config` 对象配置默认的方法。它可以用于为组件注入方法的插件，例如 [VeeValidate](https://vee-validate.logaretm.com/)。你可以通过在挂载选项中传入 `methods` 来覆写 `config` 中的方法集合。

示例：

```js
import { config } from '@vue/test-utils'

config.methods['getData'] = () => {}
```

### `provide`

- 类型：`Object`
- 默认值：`{}`

默认使用传递给 `config.provide` 的值，类似 `stubs` 或 `mocks`。传递给挂载选项中 `provide` 对象的任何值都会优先于 `config.provide` 中的同名声明。**请注意这里不支持将函数传递给 `config.provide`。**

示例：

```js
import { config } from '@vue/test-utils'

config.provide['$logger'] = {
  log: (...args) => {
    console.log(...args)
  }
}
```

### `logModifiedComponents`

- 类型：`Boolean`
- 默认值：`true`

当被展开的子元素被自动化存根的时候记录下告警日志。设置为 `false` 时则会隐藏告警日志。和其它配置选项不同的是，它不能设置在挂载选项上。

示例：

```js
import { config } from '@vue/test-utils'

config.logModifiedComponents = false
```

### `silent`

- 类型：`Boolean`
- 默认值：`true`

在组件的可观察内容 (如 props) 发生突变时，警告会被 Vue 阻止。当设置为 `false` 时，所有的警告都会出现在控制台中。这是一个 `Vue.config.silent` 的配置方式。

示例；

```js
import { config } from '@vue/test-utils'

config.silent = false
```
