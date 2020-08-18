## setProps(props)

`WrapperArray` の `Wrapper` ごとに `Wrapper` に `vm` プロパティをセットし、強制的に更新します。

**すべての `Wrapper` は Vue インスタンスを含んでいなければならないことに注意してください。**

- **引数:**

  - `{Object} props`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

test('setProps demo', async () => {
  const wrapper = mount(Foo)
  const barArray = wrapper.findAll(Bar)
  await barArray.setProps({ foo: 'bar' })
  expect(barArray.at(0).vm.foo).toBe('bar')
})
```
