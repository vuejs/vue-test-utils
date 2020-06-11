## find

::: warning 废弃警告
使用 `find` 搜索组件的方式已经被废弃并会被移除。请换用 [`findComponent`](./findComponent.md)。
:::

返回匹配选择器的第一个 DOM 节点或 Vue 组件的 `Wrapper`。

可以使用任何有效的 DOM 选择器 (使用 `querySelector` 语法)。

- **参数：**

  - `{string} selector`

- **返回值：**`{Wrapper}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

const div = wrapper.find('div')
expect(div.exists()).toBe(true)

const byId = wrapper.find('#bar')
expect(byId.element.id).toBe('bar')
```

- **注意：**

  - 你可以链式调用 `find`：

```js
const button = wrapper.find({ ref: 'testButton' })
expect(button.find('.icon').exists()).toBe(true)
```

- **延伸阅读：**[get](./get.md)
