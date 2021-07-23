## render()

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

- **Retours:** `{Promise<CheerioWrapper>}`

- **Options:**

Voir [les options](./options.md)

- **Usage:**

Rend un objet en chaîne de caractères et retourne un [cheerio wrapper](https://github.com/cheeriojs/cheerio).

Cheerio est une bibliothèque de type jQuery pour parcourir le DOM dans Node.js. Elle possède une API similaire à celle de [`Wrapper`](wrapper/) Vue Test Utils .

`render` utilise [`vue-server-renderer`](https://ssr.vuejs.org/en/basic.html) sous le capot, pour rendre un composant en HTML statique.

`render` est inclus dans le paquet `@vue/server-test-utils`.

**Sans les options:**

```js
import { render } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const wrapper = await render(Foo)
    expect(wrapper.text()).toContain('<div></div>')
  })
})
```

**Avec les options de Vue:**

```js
import { render } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const wrapper = await render(Foo, {
      propsData: {
        color: 'red'
      }
    })
    expect(wrapper.text()).toContain('red')
  })
})
```

**Les slots par défaut et nommés:**

```js
import { render } from '@vue/server-test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const wrapper = await render(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // Correspondra à <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(wrapper.text()).toContain('<div></div>')
  })
})
```

**Les propriétés globales des Stubbing:**

```js
import { render } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const $route = { path: 'http://www.example-path.com' }
    const wrapper = await render(Foo, {
      mocks: {
        $route
      }
    })
    expect(wrapper.text()).toContain($route.path)
  })
})
```
