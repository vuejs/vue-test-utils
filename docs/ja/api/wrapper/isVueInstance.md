## isVueInstance()

::: warning Deprecation warning
`isVueInstance` は非推奨となり、将来のリリースで削除される予定です。

`isVueInstance` アサーションに依存するテストは、ほとんどまたは全く価値を提供しません。それらを意図のあるアサーションに置き換えることをお勧めします。

テストを維持するために、`isVueInstance()` を置き換える場合は、 `wrapper.find(...).vm` のアサーションが有効です。
:::

`Wrapper` が Vue インスタンスか検証します。

- **戻り値:** `{boolean}`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVueInstance()).toBe(true)
```
