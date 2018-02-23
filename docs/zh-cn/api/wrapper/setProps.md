# `setProps(props)`

- **参数：**
  - `{Object} props`

- **用法：**

设置 `Wrapper` `vm` 的 prop 并强制更新。

**注意：该包裹器必须包含一个 Vue 示例。**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setProps({ foo: 'bar' })
expect(wrapper.vm.foo).toBe('bar')
```

你也可以传递一个 `propsData` 对象，这会用该对象来初始化 Vue 示例。

``` js
// Foo.vue
export default {
  props: {
    foo: {
      type: String,
      required: true
    }
  }
}
```

``` js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo, {
  propsData: {
    foo: 'bar'
  }
})

expect(wrapper.vm.foo).toBe('bar')
```
