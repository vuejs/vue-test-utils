## shallowMount()

- **Arguments:**

  - `{Component} component`
  - `{Object} options`
    - `{HTMLElement|string} string`
    - `{boolean} attachToDocument`
    - `{Object} context`
      - `{Array<Component|Object>|Component} children`
    - `{Object} slots`
      - `{Array<Component|Object>|Component|String} default`
      - `{Array<Component|Object>|Component|String} named`
    - `{Object} mocks`
    - `{Object|Array<string>} stubs`
    - `{Vue} localVue`

- **Retours:** `{Wrapper}`

- **Options:**

See [options](./options.md)

- **Usage:**

Comme [`mount`](mount.md), il crée un [`Wrapper`](wrapper/) qui contient le composant Vue monté et rendu, mais avec des composants enfants écrasés.

**Sans les options:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallowMount(Foo)
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**Avec les options de Vue:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallowMount(Foo, {
      propsData: {
        color: 'red'
      }
    })
    expect(wrapper.props().color).toBe('red')
  })
})
```

**Rattacher au DOM:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    const wrapper = shallowMount(Foo, {
      attachTo: div
    })
    expect(wrapper.contains('div')).toBe(true)
    wrapper.destroy()
  })
})
```

**Slots par défaut et nommés:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallowMount(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, //  Correspondra à <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**Les propriétés globales des Stubbing :**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const $route = { path: 'http://www.example-path.com' }
    const wrapper = shallowMount(Foo, {
      mocks: {
        $route
      }
    })
    expect(wrapper.vm.$route.path).toBe($route.path)
  })
})
```
