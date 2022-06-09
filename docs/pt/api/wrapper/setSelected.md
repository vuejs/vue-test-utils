## O método setSelected

Selects an option element and updates `v-model` bound data.
Seleciona um elemento de opção e atualiza o dado ligado ao `v-model`.

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

test('setSelected demo', async () => {
  const wrapper = mount(Foo)
  const options = wrapper.find('select').findAll('option')

  await options.at(1).setSelected()

  expect(wrapper.find('option:checked').element.value).toBe('bar')
})
```

- **Nota:**

Quando você tenta definir o valor para o estado via `v-model` pelo `option.element.selected = true; parentSelect.trigger('input')`, o `v-model` não é acionado. O `v-model` é acionado pelo evento `change`.

O `option.setSelected()` é um apelido do seguinte código.

```js
option.element.selected = true
parentSelect.trigger('change')
```
