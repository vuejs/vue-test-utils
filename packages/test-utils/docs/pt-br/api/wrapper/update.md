# update()

Força o componente Vue a ser redesenhado.

Se você chamar esse método em um wrapper que contém `vm`, ele forçará o `vm` do wrapper a se redesenhar.

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.vm.bar).toBe('bar')
wrapper.vm.bar = 'novo valor'
wrapper.update()
expect(wrapper.vm.bar).toBe('novo valor')
```
