# update()

Força a atualização e redesenho do componente Vue de cada wrapper do Array.

Se for chamado a partir de um componente Vue, força a atualização de cada componente do Array.

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')

expect(divArray.at(0).vm.bar).toBe('bar')
divArray.at(0).vm.bar = 'novo valor'
divArray.update()

expect(divArray.at(0).vm.bar).toBe('novo valor')
```
