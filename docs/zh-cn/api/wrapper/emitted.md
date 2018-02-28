# `emitted()`

返回一个包含由 `Wrapper` `vm` 触发的自定义事件的对象。

- **返回值：**`{ [name: string]: Array<Array<any>> }`

- **示例：**

```js
import { mount } from '@vue/test-utils'

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

你也可以把上面的代码写成这样：

```js
// 断言事件已经被触发
expect(wrapper.emitted('foo')).toBeTruthy()

// 断言事件的数量
expect(wrapper.emitted('foo').length).toBe(2)

// 断言事件的有效数据
expect(wrapper.emitted('foo')[1]).toEqual([123])
```

该 `.emitted()` 方法每次被调用时都返回相同的对象，而不是返回一个新的，所以当新事件被触发时该对象会被更新：

```js
const emitted = wrapper.emitted()

expect(emitted.foo.length).toBe(1)

// 想办法让 `wrapper` 触发 "foo" 事件

expect(emitted.foo.length).toBe(2)
```
