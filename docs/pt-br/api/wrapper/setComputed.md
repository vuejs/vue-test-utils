# setComputed(computedProperties)

Define as propriedades computadas do `vm` do wrapper e força a sua atualização.

**Nota: o wrapper deve ser uma instância do Vue.**
**Nota2: a instância já deve ter as propriedades computadas passadas para o setComputed declaradas.**


- **Argumentos:**
  - `{Object} computedProperties`

- **Exemplo:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'

const wrapper = mount({
  template: '<div>{{ propriedade1 }} {{ propriedade2 }}</div>',
  data () {
    return {
      inicial: 'inicial'
    }
  },
  computed: {
    propriedade1 () {
      return this.inicial
    },
    propriedade2 () {
      return this.inicial
    }
  }
})

expect(wrapper.html()).toBe('<div>inicial inicial</div>')

wrapper.setComputed({
  propriedade1: 'nova-propriedade1',
  propriedade2: 'nova-propriedade2'
})

expect(wrapper.html()).toBe('<div>nova-propriedade1 nova-propriedade2</div>')
```
