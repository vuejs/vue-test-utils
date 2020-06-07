## isEmpty

::: warning 废弃警告
`isEmpty` 已经被废弃并会在未来的发布中被移除。

可以考虑一个诸如 [jest-dom](https://github.com/testing-library/jest-dom#tobeempty) 中提供的自定义匹配。

当使用 `findComponent` 时，可以通过 `findComponent(Comp).element` 访问其 DOM 元素。
:::

断言 `Wrapper` 并不包含子节点。

- **返回值：**`{boolean}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isEmpty()).toBe(true)
```
