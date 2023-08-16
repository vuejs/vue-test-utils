## Começar agora

<div class="vueschool"><a href="https://vueschool.io/lessons/installing-vue-test-utils?friend=vuejs" target="_blank" rel="sponsored noopener" title="Aprenda a como começar usar o Vue Test Utils, Jest, e testar componentes de Vue.js com a Vue School">Aprenda a como começar usar a Vue Test Utils, Jest, e testar componentes de Vue.js com a Vue School</a></div>

### O que é o Vue Test Utils?

A Vue Test Utils (VTU) é um conjunto de funções utilitárias com o fim de simplificar os testes de componentes de Vue.js. Ele fornece alguns métodos para **montar** e **interagir** com componentes de Vue.js em um modo isolado.

Vamos ver um exemplo:

```js
// Importa o método `mount()` do Vue Test Utils
import { mount } from '@vue/test-utils'

// O componente para testar
const MessageComponent = {
  template: '<p>{{ msg }}</p>',
  props: ['msg']
}

test('displays message', () => {
  // mount() retorna um componente de Vue envolvido com qual podemos interagir
  const wrapper = mount(MessageComponent, {
    propsData: {
      msg: 'Hello world'
    }
  })

  // Afirma o texto renderizado do componente
  expect(wrapper.text()).toContain('Hello world')
})
```

Os componentes montados são retornados dentro de um [Wrapper (envolvedor)](../api/wrapper/), o qual expõe métodos para consulta e interação com o componente sob teste.

### Simulando a Interação do Usuário

Vamos imaginar um componente contador que incrementa quando o usuário clica no botão:

```js
const Counter = {
  template: `
    <div>
      <button @click="count++">Add up</button>
      <p>Total clicks: {{ count }}</p>
    </div>
  `,
  data() {
    return { count: 0 }
  }
}
```

Para simular o comportamento, nós precisamos primeiro localizar o botão com o `wrapper.find()`, o qual retorna um **envolvedor para o elemento `button`**. Nós podemos então simular o clique ao chamar `.trigger()` no envolvedor do botão:

```js
test('increments counter value on click', async () => {
  const wrapper = mount(Counter)
  const button = wrapper.find('button')
  const text = wrapper.find('p')

  expect(text.text()).toContain('Total clicks: 0')

  await button.trigger('click')

  expect(text.text()).toContain('Total clicks: 1')
})
```

Repare como o teste deve ser `async` e que o `trigger` precisa ser esperado. Consulte o guia [Testando Comportamento Assíncronos](./README.md#testing-asynchronous-behavior) para entender porquê isto é necessário e outras coisas a considerar quando estiver testando cenários assíncronos.

### O que se segue

Consulte as nossas [dicas comuns para quando estiver escrevendo testes](./README.md#knowing-what-to-test).

Por outro lado, você pode explorar a [API completa](../api/).
