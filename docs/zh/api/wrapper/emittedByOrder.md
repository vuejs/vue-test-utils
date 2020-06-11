## emittedByOrder

::: warning 废弃警告
`emittedByOrder` 已经被废弃并会在未来的发布中被移除。

请换用 `wrapper.emitted`。
:::

返回一个包含由 `Wrapper` `vm` 触发的自定义事件的数组。

- **返回值：**`Array<{ name: string, args: Array<any> }>`

- **示例：**

```js
import { mount } from '@vue/test-utils'

const wrapper = mount(Component)

wrapper.vm.$emit('foo')
wrapper.vm.$emit('bar', 123)

/*
`wrapper.emittedByOrder() 返回如下数组：
[
  { name: 'foo', args: [] },
  { name: 'bar', args: [123] }
]
*/

// 断言事件的触发顺序
expect(wrapper.emittedByOrder().map(e => e.name)).toEqual(['foo', 'bar'])
```
