## renderToString()

- **Arguments:**

  - `{Component} component`
  - `{Object} options`
    - `{Object} context`
      - `{Array<Component|Object>|Component} children`
    - `{Object} slots`
      - `{Array<Component|Object>|Component|String} default`
      - `{Array<Component|Object>|Component|String} named`
    - `{Object} mocks`
    - `{Object|Array<string>} stubs`
    - `{Vue} localVue`

- **Retours:** `{Promise<string>}`

- **Options:**

See [options](./options.md)

- **Usage:**

Rends un composant en HTML.

`renderToString` utilise [`vue-server-renderer`](https://ssr.vuejs.org/en/basic.html) sous le capot, pour rendre un composant en HTML statique.

`renderToString` est inclus dans le paquet `@vue/server-test-utils`.

**Sans les options:**

```js
import { renderToString } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const str = await renderToString(Foo)
    expect(str).toContain('<div></div>')
  })
})
```

**Avec les options de Vue:**

```js
import { renderToString } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const str = await renderToString(Foo, {
      propsData: {
        color: 'red'
      }
    })
    expect(str).toContain('red')
  })
})
```

**Les slots par défaut et nommés:**

```js
import { renderToString } from '@vue/server-test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const str = await renderToString(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // Correspondra à <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(str).toContain('<div></div>')
  })
})
```

**Les propriétés globales des Stubbing :**

```js
import { renderToString } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const $route = { path: 'http://www.example-path.com' }
    const str = await renderToString(Foo, {
      mocks: {
        $route
      }
    })
    expect(str).toContain($route.path)
  })
})
```
