# `hasAttribute(attribute, value)`

断言 `Wrapper` DOM 节点有匹配的特性值。

如果 `Wrapper` DOM 节点包含有值匹配的特性则返回 `true`。

- **参数：**
  - `{string} attribute`
  - `{string} value`

- **返回值：**`{boolean}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasAttribute('id', 'foo')).toBe(true)
```

- **替代方案：**

你可以从 `Wrapper.element` 获取特性并对其值做断言：

```js
import { mount } from '@vue/test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.element.getAttribute('id')).toBe('foo')
```

这使得断言的错误诊断信息更丰富。
