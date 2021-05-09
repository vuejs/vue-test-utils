## RouterLinkStub

Компонент для заглушки компонента Vue Router `router-link`.

Вы можете использовать этот компонент для поиска компонента router-link в дереве рендеринга.

- **Использование:**

Чтобы установить его как заглушку в опциях монтирования:

```js
import { mount, RouterLinkStub } from '@vue/test-utils'

const wrapper = mount(Component, {
  stubs: {
    RouterLink: RouterLinkStub
  }
})
expect(wrapper.findComponent(RouterLinkStub).props().to).toBe('/some/path')
```
