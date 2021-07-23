## mount()

- **Arguments:**

  - `{Component} component`
  - `{Object} options`

- **Retours:** `{Wrapper}`

- **Options:**

Voir [options](options.md)

- **Usage:**

Crée un [`Wrapper`](wrapper/) qui contient le composant Vue monté et rendu.

**Sans les options:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo)
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**Avec les options Vue:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
      propsData: {
        color: 'red'
      }
    })
    expect(wrapper.props().color).toBe('red')
  })
})
```

**Attacher au DOM:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    const wrapper = mount(Foo, {
      attachTo: div
    })
    expect(wrapper.contains('div')).toBe(true)
    wrapper.destroy()
  })
})
```

**Les slots par défauts et nommés :**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // Correspondra `<slot name="FooBar" />`.
        foo: '<div />'
      }
    })
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**Les propriétés globales des Stubbing :**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const $route = { path: 'http://www.example-path.com' }
    const wrapper = mount(Foo, {
      mocks: {
        $route
      }
    })
    expect(wrapper.vm.$route.path).toBe($route.path)
  })
})
```

**Les composants Stubbing**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import Faz from './Faz.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
      stubs: {
        BarFoo: true,
        FooBar: Faz,
        Bar: { template: '<div class="stubbed" />' }
      }
    })
    expect(wrapper.contains('.stubbed')).toBe(true)
    expect(wrapper.contains(Bar)).toBe(true)
  })
})
```

**Avis de déprédation:**

Lors du stubbing de composants, la fourniture d'une chaîne de caractères (`ComponentToStub : '<div class="stubbed" />`) n'est plus supportée.

- **Voir aussi :** [Wrapper](wrapper/)
