## enableAutoDestroy(hook)

- **Arguments:**

  - `{Function} hook`

- **Usage:**

`enableAutoDestroy` détruira toutes les instances de `Wrapper` en utilisant la fonction de hook passée (par exemple [`afterEach`](https://jestjs.io/docs/en/api#aftereachfn-timeout)). Après avoir appelé la méthode, vous pouvez revenir au comportement par défaut en appelant la méthode `resetAutoDestroyState`.

```js
import { enableAutoDestroy, mount } from '@vue/test-utils'
import Foo from './Foo.vue'

// appelle wrapper.destroy() après chaque test
enableAutoDestroy(afterEach)

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo)
    expect(wrapper.contains('div')).toBe(true)
    // pas besoin d'appeler wrapper.destroy() ici
  })
})
```
