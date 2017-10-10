# hasAttribute(attribute, value)

`Wrapper` DOM ノードが値と一致した属性を持つか検証します。

`Wrapper` DOM ノードが値と一致する属性が含まれている場合は `true` を返します。

- **引数:**
  - `{string} attribute`
  - `{string} value`

- **戻り値:** `{boolean}`

- **例:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasAttribute('id', 'foo')).toBe(true)
```

- **代替:**

`Wrapper.element` から属性を取得して、値に基づく検証を得ることができます。

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.element.getAttribute('id')).toBe('foo')
```

これにより、更に有益な検証エラーを生み出せます。
