# 配置

Vue Test Utils 包含了一个定义其选项的配置对象。

## Vue Test Utils 配置选项

### `stubs`

- 类型：`Object`
- 默认值：`{
  transition: TransitionStub,
  'transition-group': TransitionGroupStub
}`

存储在 `config.stubs` 中的存根会被默认使用。  
用到的组件存根。它们会被传入挂载选项的 `stubs` 复写。

当把 `stubs` 作为一个数组传入挂载选项时，`config.stubs` 会被转换为一个数组，然后用只返回一个 `<!---->` 的基础组件进行存根。

示例：

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.stubs['my-component'] = '<div />'
```
