# hasClass(className)

- **引数:**
  - `{string} クラス名(className)`

- **戻り値:** `{boolean}`

- **使い方:**


DOMノードに`className`が含まれているかアサートします。

`Wrapper`DOMノードにクラスが含まれている場合は` true`を返します。

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasClass('bar')).to.equal(true)
```