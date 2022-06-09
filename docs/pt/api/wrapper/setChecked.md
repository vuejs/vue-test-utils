## O método setChecked

Define o valor confirmado por um elemento `input` do tipo `checkbox` ou `radio` e atualiza o dado ligado ao `v-model`.

- **Argumentos:**

  - `{Boolean} checked (default: true)`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

test('setChecked demo', async () => {
  const wrapper = mount(Foo)
  const radioInput = wrapper.find('input[type="radio"]')

  await radioInput.setChecked()

  expect(radioInput.element.checked).toBeTruthy()
})
```

- **Nota:**

Quando você tenta definir o valor para o estado via `v-model` pelo `radioInput.element.checked = true; radioInput.trigger('input')`, o `v-model` não é acionado. O `v-model` é acionado pelo evento `change`.

`checkboxInput.setChecked(checked)` é um apelido do seguinte código.

```js
checkboxInput.element.checked = checked
checkboxInput.trigger('click')
checkboxInput.trigger('change')
```
