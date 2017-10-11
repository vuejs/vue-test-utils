# hasClass(className)

DOMノードに`className`が含まれているか検証します。

`Wrapper`DOMノードにクラスが含まれている場合は` true`を返します。

- **引数:**
  - `{string} className`

- **戻り値:** `{boolean}`

- **例:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasClass('bar')).to.equal(true)
```