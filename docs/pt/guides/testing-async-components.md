## Testando Comportamento Assíncrono

Existem dois tipos de comportamentos assíncronos que você encontrará em seus testes:

1. Atualizações aplicadas pelo Vue
2. Comportamento assíncrono fora do Vue

### Atualizações aplicadas pela Vue

O Vue agrupa atualizações pendentes da DOM e aplica elas assincronamente para prevenir re-renderizações desnecessárias causadas por várias mutações de dados.

_Você pode ler mais sobre atualizações assíncronas na [documentação do Vue](https://vuejs.org/v2/guide/reactivity.html#Async-Update-Queue)_

Na prática, isto significa que depois da mutação de uma propriedade reativa, para confirmar aquela mudança o seu teste tem que aguardar enquanto o Vue estiver desempenhando atualizações.
Uma maneira é usar o `await Vue.nextTick()`, mas uma maneira mais fácil e clara é apenas esperar (`await`) o método que com qual você mudou o estado, tipo `trigger`.

```js
// dentro do conjunto de teste, adicione este caso de teste
it('button click should increment the count text', async () => {
  expect(wrapper.text()).toContain('0')
  const button = wrapper.find('button')
  await button.trigger('click')
  expect(wrapper.text()).toContain('1')
})
```

Esperar o acionador acima é o mesmo que fazer:

```js
it('button click should increment the count text', async () => {
  expect(wrapper.text()).toContain('0')
  const button = wrapper.find('button')
  button.trigger('click')
  await Vue.nextTick()
  expect(wrapper.text()).toContain('1')
})
```

Os métodos que podem ser esperados são:

- [setData](../api/wrapper/README.md#o-método-setdata)
- [setValue](../api/wrapper/README.md#o-método-setvalue)
- [setChecked](../api/wrapper/README.md#o-método-setchecked)
- [setSelected](../api/wrapper/README.md#o-método-setselected)
- [setProps](../api/wrapper/README.md#o-método-setprops)
- [trigger](../api/wrapper/README.md#o-método-trigger)

### Comportamento assíncrono fora do Vue

Um dos comportamentos assíncrono mais comuns fora de Vue é a chamada de API dentro de ações de Vuex. Os seguintes exemplos mostram como testar um método que faz uma chama de API. Este exemplo usa o `Jest` para executar o teste e imitar a biblioteca de HTTP `axios`. Mais sobre as imitações manuais de `Jest` podem ser encontradas [aqui](https://jestjs.io/docs/en/manual-mocks.html#content).

A implementação da imitação do `axios` parece com isto:

```js
export default {
  get: () => Promise.resolve({ data: 'value' })
}
```

O componente abaixo faz uma chamada de API quando um botão é clicado, depois atribui a resposta ao `value`.

```html
<template>
  <button @click="fetchResults">{{ value }}</button>
</template>

<script>
  import axios from 'axios'

  export default {
    data() {
      return {
        value: null
      }
    },

    methods: {
      async fetchResults() {
        const response = await axios.get('mock/service')
        this.value = response.data
      }
    }
  }
</script>
```

Um teste pode ser escrito da seguinte maneira:

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo'
jest.mock('axios', () => ({
  get: Promise.resolve('value')
}))

it('fetches async when a button is clicked', () => {
  const wrapper = shallowMount(Foo)
  wrapper.find('button').trigger('click')
  expect(wrapper.text()).toBe('value')
})
```

Este teste atualmente falha porque a afirmação é chamada antes de resolver a promessa em `fetchResults`. A maioria das bibliotecas de testes unitários fornecem uma _callback (função de resposta)_ para permitir que o executor saiba quando o teste está completo ou terminado. Ambos `Jest` e `Mocha` usam o `done`. Nós podemos usar o `done` em combinação com o `$nextTick` ou `setTimeout` para garantir que quaisquer promessas estão resolvidas antes da afirmação ser feita.

```js
it('fetches async when a button is clicked', done => {
  const wrapper = shallowMount(Foo)
  wrapper.find('button').trigger('click')
  wrapper.vm.$nextTick(() => {
    expect(wrapper.text()).toBe('value')
    done()
  })
})
```

A razão pela qual o `setTimeout` permite o teste passar é porque a fila de micro-tarefa onde as funções de resposta de promessa são processadas executam antes da fila de tarefa, onde as funções de respostas de `setTimeout` são processadas. Isto significa que no momento que a função de resposta de `setTimeout` executa, quaisquer funções de resposta de promessa na fila de micro-tarefa terão que ser executadas. O `$nextTick` por outro lado agenda uma micro-tarefa, mas visto que a fila de micro-tarefa é processada no sentido de que o primeiro a entrar é o primeiro a sair isso também garante que a função de resposta de promessa tem sido executada no momento que a afirmação é feita. Para uma explicação mais detalhada consulte a seguinte [ligação](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/).

Uma outra solução é usar uma função `async` e um pacote como o [flush-promises](https://www.npmjs.com/package/flush-promises). O `flush-promises` libera todos manipuladores de promessa pendentes resolvidas. Você pode `await` a chamada de `flushPromises` para liberar promessas pendentes e melhorar a legibilidade do seu teste.

O teste atualizado parece com isto:

```js
import { shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Foo from './Foo'
jest.mock('axios')

it('fetches async when a button is clicked', async () => {
  const wrapper = shallowMount(Foo)
  wrapper.find('button').trigger('click')
  await flushPromises()
  expect(wrapper.text()).toBe('value')
})
```

Esta mesma técnica pode ser aplicada às ações de Vuex, as quais retornam uma promessa por padrão.

#### Porquê não apenas `await button.trigger()` ?

Como explicado acima, existe uma diferença entre o tempo que leva para o Vue atualizar seus componentes, e o tempo que leva para uma promessa, como aquela de `axios` resolver.

Um ótima regra para seguir é sempre esperar (`await`) em mutações como o `trigger` ou o `setProps`.
Se o seu código depende de algo assíncrono, como a chamada de `axios`, adicione uma espera (`await`) para a chamada `flushPromises` também.
