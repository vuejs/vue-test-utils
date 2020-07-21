## isVisible()

::: warning Deprecation warning
`isVisible` は非推奨となり、将来のリリースで削除される予定です。

[jest-dom](https://github.com/testing-library/jest-dom#custom-matchers) で提供されているようなカスタムマッチャの使用を検討してください。

findComponent で使用する場合は、 `findComponent(Comp).element` で DOM 要素にアクセスします。
:::

`Wrapper` が表示されているかアサートします。

style が `display: none` か  `visibility: hidden` の親要素がある場合、 false を返します。

コンポーネントが `v-show` によって非表示になっているかアサートすることに使用することができます。

- **戻り値:** `{boolean}`

- **例:**

```js
import { mount } from 'vue-test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVisible()).toBe(true)
expect(wrapper.find('.is-not-visible').isVisible()).toBe(false)
```
