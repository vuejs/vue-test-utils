# visible()

`WrapperArray` 内のすべての `Wrapper` が表示されているかアサートします。

style が `display: none` か `visibility: hidden` の親要素を持つ `Wrapper` が少なくとも1つある場合、 false を返します。

コンポーネントが `v-show` によって非表示になっているかアサートすることに使用することができます。

- **戻り値:** `{boolean}`

- **例:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.visible()).toBe(true)
expect(wrapper.findAll('.is-not-visible').visible()).toBe(false)
expect(wrapper.findAll('.is-visible').visible()).toBe(true)
```
