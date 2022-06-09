## O método trigger

Aciona uma evento assincronamente no nó do DOM do `Wrapper` (envolvedor).

O método `trigger` recebe um objeto `options` opcional. As propriedades dentro do objeto `options` são adicionadas ao evento.
O método `trigger` retorna uma promessa (Promise), a qual quando resolvida, garante que o componente seja atualizado.
O méotodo `trigger` apenas funciona com eventos nativos do DOM. Para emitir um evento personalizado, use o `wrapper.vm.$emit('myCustomEvent')`

- **Argumentos:**

  - `{string} eventType` **obrigatório**
  - `{Object} options` **opcional**

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo'

test('trigger demo', async () => {
  const clickHandler = sinon.stub()
  const wrapper = mount(Foo, {
    propsData: { clickHandler }
  })

  await wrapper.trigger('click')

  await wrapper.trigger('click', {
    button: 0
  })

  await wrapper.trigger('click', {
    ctrlKey: true // Para testes de manipuladores de @click.ctrl
  })

  expect(clickHandler.called).toBe(true)
})
```

::: tip
Quando estiver usando o `trigger('focus')` com o [jsdom v16.4.0](https://github.com/jsdom/jsdom/releases/tag/16.4.0), então o acima você de usar a opção [attachTo](../options.md#attachto) quando estiver montando o componente. Isto porque uma resolução de bug no [jsdom v16.4.0](https://github.com/jsdom/jsdom/releases/tag/16.4.0) mudou o `el.focus()` para não fazer nada em elementos que estão disconectados do DOM.
:::

- **Configurando um alvo do evento:**

Nos bastidores, o método `trigger` cria um objeto `Event` e despacha o evento no elemento do `Wrapper` (envolvedor).

Não é possível editar o valor do `target` de um objeto `Event`, assim você não pode definir o `target` dentro do objeto `options`.

Para adicionar um atributo ao `target`, você precisa definir o valor do elemento do `Wrapper` (envolvedor) antes da chamada do método `trigger`. Você pode fazer isso com a propriedade `element`.

```js
const input = wrapper.find('input')
input.element.value = 100
input.trigger('click')
```
