# html()

`Wrapper`のDOMノードのHTMLを文字列として返します。

- **戻り値:** `{string}`

- **例:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.html()).to.equal('<div><p>Foo</p></div>')
```