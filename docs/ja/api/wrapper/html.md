# html()

- **戻り値:** `{string}`

- **使い方:**

`Wrapper`のDOMノードのHTMLを文字列として返します。

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.html()).to.equal('<div><p>Foo</p></div>')
```