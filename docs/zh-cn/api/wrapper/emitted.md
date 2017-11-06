# `emitted()`

返回一个包含由 `Wrapper` `vm` 触发的自定义事件的对象。

- **返回值：**`{ [name: string]: Array<Array<any>> }`

- **示例：**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'

const wrapper = mount(Component)

wrapper.vm.$emit('foo')
wrapper.vm.$emit('foo', 123)

/*
`wrapper.emitted()` 返回如下对象：
{
  foo: [[], [123]]
}
*/

// 断言事件已经被触发
expect(wrapper.emitted().foo).toBeTruthy()

// 断言事件的数量
expect(wrapper.emitted().foo.length).toBe(2)

// 断言事件的有效数据
expect(wrapper.emitted().foo[1]).toEqual([123])
```
