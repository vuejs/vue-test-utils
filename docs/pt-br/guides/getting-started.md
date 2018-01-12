# Iniciando

## Configuração

Para obter um exemplo rápido de uso do `vue-test-utils` clone nosso repositório de demonstração que contém as configurações básicas e instale as dependências:

``` bash
git clone https://github.com/vuejs/vue-test-utils-getting-started
cd vue-test-utils-getting-started
npm install
```

Você verá que o projeto inclui um componente simples, chamado `counter.js`:

```js
// counter.js

export default {
  template: `
    <div>
      <span class="count">{{ count }}</span>
      <button @click="increment">Incrementar</button>
    </div>
  `,

  data () {
    return {
      count: 0
    }
  },

  methods: {
    increment () {
      this.count++
    }
  }
}
```

### Montando seus componentes

O `vue-test-utils` testa os componentes do Vue montando-os isoladamente, simulando as entradas necessárias (propriedades, slots e eventos de usuário) e verificando as saídas (renderização, eventos personalizados emitidos).

Os componentes montados são retornados em um wrapper (wrapper) que expõe muitos métodos para manipular, percorrer e consultar a instância do componente Vue correspondente.

Você pode criar essses wrappers usando o método `mount`. Vamos criar um chamado `test.js`:

```js
// test.js

// Importando o método mount() do test utils
// e o componente Counter para ser testado
import { mount } from '@vue/test-utils'
import Counter from './counter'

// Agora montamos o componente e obtermos o wrapper
const wrapper = mount(Counter)

// Você pode acessar a instância atual do Vue através de wrapper.vm
const vm = wrapper.vm

// Para inspecionar a composição do wrapper exiba-o no console
// ...Sua aventura com o vue-test-utils começa agora :)
console.log(wrapper)
```

### Testar a saída HTML do componente

Agora que nós já temos o wrapper, a primeira coisa que podemos fazer é verificar se a saída HTML que componente nos entrega é a esperada.

```js
import { mount } from '@vue/test-utils'
import Counter from './counter'

describe('Counter', () => {
  // Montando o componente e obtendo o wrapper
  const wrapper = mount(Counter)

  it('renderiza o HTML correto', () => {
    expect(wrapper.html()).toContain('<span class="count">0</span>')
  })

  // Também é fácil verificar se um elemento existe
  it('verifica se o botão foi desenhado', () => {
    expect(wrapper.contains('button')).toBe(true)
  })
})
```

Agora execute os testes com o comando `npm tests`. Você deve ver os testes passando.

### Simulando a interação do usuário

Nosso `Counter` deve incrementar o contador quando o usuário clica no botão. Para simular esse comportamento, primeiro precisamos localizar o botão com `wrapper.find()`, que retorna um wrapper (wrapper) para o elemento do botão. Agora nós podemos simular o evento de clique, chamando o método `trigger()` no wrapper do botão:

```js
it('o clique do botão deve incrementar a contagem', () => {
  expect(wrapper.vm.count).toBe(0)
  const button = wrapper.find('button')
  button.trigger('click')
  expect(wrapper.vm.count).toBe(1)
})
```

### E quanto ao `nextTick`?

Os lotes Vue estão pendentes de atualizações do DOM, aplicando-as de forma assíncrona para evitar re-renders desnecessários causados por múltiplas mutações de dados. É por isso que, na prática, muitas vezes temos que usar `Vue.nextTick` para esperar até que o Vue realize a atualização real do DOM, depois de ativar algumas mudanças de estado.

Para simplificar o uso, o `vue-test-utils` aplica todas as atualizações de forma síncrona, então você não precisa usar o `Vue.nextTick` para esperar por atualizações do DOM nos seus testes.

*Nota: o `nextTick` ainda é necessário para quando você precisa avançar explicitamente o ciclo do evento, ou seja, para operações como retorno de chamadas assíncronas ou resultados de uma Promise.*

## A seguir

- Integre o `vue-test-utils` no seu projeto [escolhendo seu executador de testes](./choosing-a-test-runner.md)
- Leia mais sobre [técnicas comuns ao escrever testes](./common-tips.md)
