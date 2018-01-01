# props()

`Wrapper` の `vm` プロパティの props オブジェクトを返します。

**Wrapper には Vue インスタンスを含む必要があることに注意してください**

- **戻り値:** `{[prop: string]: any}`

- **例:**

```js
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Component, {
  context: {
    props: { show: true },
    children: [Foo, Bar]
  }
})

expect(wrapper.is(Component)).toBe(true)
```
