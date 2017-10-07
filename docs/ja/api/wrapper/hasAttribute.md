# hasAttribute(attribute, value)

- **引数:**
  - `{string} 属性(attribute)`
  - `{string} 値(value)`

- **戻り値:** `{boolean}`

- **使い方:**

`Wrapper`DOMノードに属性とその値が一致したかアサートします。

`Wrapper`DOMノードに値が一致する属性が含まれている場合は` true`を返します。

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasAttribute('id', 'foo')).to.equal(true)
```

- **その他:**

`Wrapper.element`から属性を取得して、値に基づくアサーションを得ることができます。

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.element.getAttribute('id')).to.equal('foo')
```

これにより、更に有益なアサーションエラーを生み出せます。