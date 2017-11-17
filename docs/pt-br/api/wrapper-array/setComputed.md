# setComputed(propriedadesComputadas)

Define as propriedades computadas e força a atualização de cada um dos embrulhos no array.

**Nota: cada embrulho deve ser uma instância do Vue.**
**Nota2: cada instância de cada embrulho deve ter as propriedades computadas já declaradas, pois esse método apenas mocka o seu valor.**

- **Argumentos:**
  - `{Object} propriedadesComputadass`

- **Exemplo:**

```js
import { mount } from 'vue-test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)

barArray.setComputed({
  propriedade1: 'nova-propriedade1',
  propriedade2: 'nova-propriedade2'
})
```
