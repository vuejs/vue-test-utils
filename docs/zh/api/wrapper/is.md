## is

::: warning 废弃警告
使用 `is` 断言 DOM 结点或 `vm` 匹配选择器的方式已经被废弃并会被移除。

可以考虑一个诸如 [jest-dom](https://github.com/testing-library/jest-dom#custom-matchers) 提供的自定义匹配。或为 DOM 元素类型断言换用原生的 [`Element.tagName`](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName)。

为了保留这些测试，一个有效替换：

- `is('DOM_SELECTOR')` 的方式是一个 `wrapper.element.tagName` 的断言。
- `is('ATTR_NAME')` 的方式是一个 `wrapper.attributes('ATTR_NAME')` 的 truthy 断言。
- `is('CLASS_NAME')` 的方式是一个 `wrapper.classes('CLASS_NAME')` 的 truthy 断言。

当使用 `findComponent` 时，通过 `findComponent(Comp).element` 访问 DOM 元素。
:::

断言 `Wrapper` DOM 节点或 `vm` 匹配[选择器](../selectors.md)。

- **参数：**

  - `{string|Component} selector`

- **返回值：**`{boolean}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.is('div')).toBe(true)
```
