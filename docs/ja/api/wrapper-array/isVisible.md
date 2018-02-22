# isVisible()

`WrapperArray` 内のすべての `Wrapper` が表示されているかアサートします。

style が `display: none` か `visibility: hidden` の親要素を持つ `Wrapper` が少なくとも1つある場合、 false を返します。

コンポーネントが `v-show` によって非表示になっているかアサートすることに使用することができます。

- **戻り値:** `{boolean}`

- **例:**

```js
import { mount } from 'vue-test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVisible()).toBe(true)
expect(wrapper.findAll('.is-not-visible').isVisible()).toBe(false)
expect(wrapper.findAll('.is-visible').isVisible()).toBe(true)
```
