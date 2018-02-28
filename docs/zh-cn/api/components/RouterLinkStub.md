# `RouterLinkStub`

一个用来存根 Vue Router 中 `router-link` 组件的组件。

你可以在渲染树中使用这个组件查找一个 `router-link` 组件。

- **用法：**

在挂载选项中将其设置为一个存根：

```js
import { mount, RouterLinkStub } from '@vue/test-utils'

const wrapper = mount(Component, {
  stubs: {
    RouterLink: RouterLinkStub
  }
})
expect(wrapper.find(RouterLinkStub).props().to).toBe('/some/path')
```
