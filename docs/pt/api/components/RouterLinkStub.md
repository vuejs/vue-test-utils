## O componente RouterLinkStub

Um componente para forjar o componente `router-link` do Vue Router.

Você pode usar este componente para achar um componente `router-link` dentro da árvore de renderização.

- **Uso:**

Definir ele como um componente forjado dentro das opções de montagem:

```js
import { mount, RouterLinkStub } from '@vue/test-utils'

const wrapper = mount(Component, {
  stubs: {
    RouterLink: RouterLinkStub
  }
})
expect(wrapper.findComponent(RouterLinkStub).props().to).toBe('/some/path')
```
