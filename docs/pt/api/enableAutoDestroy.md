## O método enableAutoDestroy(hook)

- **Argumentos:**

  - `{Function} hook`

- **Uso:**

O método `enableAutoDestroy` destruirá todas as instâncias de `Wrapper` (envolvedor) usando a função gatilho passada (por exemplo o [`afterEach`](https://jestjs.io/docs/en/api#aftereachfn-timeout)). Depois de chamar o método, você pode reverter para o comportamento padrão ao chamar o método `resetAutoDestroyState`.

```js
import { enableAutoDestroy, mount } from '@vue/test-utils'
import Foo from './Foo.vue'

// chama wrapper.destroy() depois de cada teste
enableAutoDestroy(afterEach)

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo)
    expect(wrapper.contains('div')).toBe(true)
    // não há necessidade de chamar wrapper.destroy() aqui
  })
})
```

## A função resetAutoDestroyState

- **Uso:**

Depois de chamar `enableAutoDestroy` você pode precisar desativar o comportamento de autodestruição (por exemplo quando algum do seu conjunto de testes depender do wrapper (envolvedor) ser persistente através de testes separados)

Para alcançar isso você pode chamar `resetAutoDestroyState` para desativar o gatilho registado anteriormente

```js
import {
  enableAutoDestroy,
  resetAutoDestroyState,
  mount
} from '@vue/test-utils'
import Foo from './Foo.vue'

// chama wrapper.destroy() depois de cada teste
enableAutoDestroy(afterEach)
// redefine a autodestruição depois do conjunto terminar
afterAll(resetAutoDestroyState)

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo)
    expect(wrapper.contains('div')).toBe(true)
    // não há necessidade de chamar wrapper.destroy() aqui
  })
})
```
