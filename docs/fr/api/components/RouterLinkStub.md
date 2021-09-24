## RouterLinkStub

Un composant pour mettre en place le composant Vue Router `router-link`.

Vous pouvez utiliser ce composant pour trouver un composant router-link dans l'arbre de rendu.

- **Usage:**

Pour le définir comme un stub dans les options de montage :

```js
import { mount, RouterLinkStub } from '@vue/test-utils'

const wrapper = mount(Component, {
  stubs: {
    RouterLink: RouterLinkStub
  }
})
expect(wrapper.find(RouterLinkStub).props().to).toBe('/some/path')
```
