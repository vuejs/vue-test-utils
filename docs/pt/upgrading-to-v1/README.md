### Atualizando para V1.0

Depois de um longo período em Beta, a Vue Test Utils finalmente lançou a versão 1.0! Nós depreciamos alguns métodos que não eram úteis, então você poderá ver vários avisos de depreciação depois da atualização. Este guia ajudará você a migrar para longe deles.

Você pode ler as notas de lançamentos para versão 1 [aqui](https://github.com/vuejs/vue-test-utils/releases) ou as discussões sobre as depreciações [aqui](https://github.com/vuejs/rfcs/pull/161).

### O método `find`

Na beta, o método `find` poderia ser usado para buscar ambos nós do DOM (usando a sintaxe de `querySelector`) ou um componente (através de uma referência de componente, uma opção `ref` ou uma opção `name`). Este comportamento agora está dividido em dois métodos: `find` e `findComponent`.

Se você estava usando esta sintaxe:

- `find(Foo)`
- `find({ name: 'foo' })`
- `find({ ref: 'my-ref' })`

Mude-os para serem `findComponent`.

Você pode continuar usando o `find` em nós do DOM usando a sintaxe de `querySelector`.

### O método `isVueInstance`

Este método foi depreciado porque ele tende a encorajar detalhes de implementação de testes, o que é uma má prática. As afirmações usando isto podem simplesmente ser removidas; se você realmente precisar de um substituto, você pode usar o `expect((...).vm).toBeTruthy()`, o que é basicamente o que o método `isVueInstance` está fazendo.

### O método `contains`

Os testes usando o método `contains` podem ser substituídos por `find` ou `findComponent` ou `get`. Por exemplo, `expect(wrapper.contains('#el')).toBe(true)` pode ser escrito como `wrapper.get('#el')`, o que lançará um erro se o seletor não for correspondido. Um outra maneira de escrever isto usando o `find` é `expect(wrapper.find('#el').element).toBeTruthy()`.

### O método `is`

Você pode sobrescrever os testes usando o `is` para usar `element.tagName` no lugar. Por exemplo, `wrapper.find('div').is('div')` pode ser escrito como `wrapper.find('div').element.tagName`.

### O método `isEmpty`

Saber se um nó do DOM está vazio não é uma funcionalidade especifica da Vue, e não é algo que é difícil de saber. No lugar de reinventar a roda, nós decidimos que é melhor delegar para uma solução bem testa existente por padrão. Considere o excelente correspondente `toBeEmpty` da [jest-dom](https://github.com/testing-library/jest-dom#tobeempty), por exemplo, se você estiver usando o Jest.

### O método `name`

Afirmações contra o método `name` encorajam detalhes de implementação de testes, o que é uma má prática. Se você precisar desta funcionalidade, você pode usar o `vm.$options.name` para componentes de Vue ou `element.tagName` para nós do DOM. Novamente, considere se você realmente precisa deste teste - é provável que você não precisa.

### As opções `setMethods` e `mountingOptions.methods`

Ao usar `setMethods`, você está fazendo mutação da instância da Vue - isto não é algo que a Vue suporte, e pode levar para testes escamosos e acoplados.

Não existe uma substituição direta para isto. Se você tiver um método complexo você gostaria de apagar, considere mover ele para um outro ficheiro e usando a funcionalidade de imitar ou forjar do seu executor de teste.

Por exemplo, você pode querer evitar uma chamada de API:

```js
const Foo = {
  created() {
    this.getData()
  },
  methods: {
    getData() {
      axios.get('...')
    }
  }
}
```

Em lugar de fazer:

```js
mount(Foo, {
  methods: {
    getData: () => {}
  }
})
```

Imite a dependência `axios`. No Jest, por exemplo, você pode fazer isso com `jest.mock('axios')`. Isto evitará a chamada da API, sem mutação da seu componente de Vue.

Se você precisar de mais ajuda para a migração, você pode juntar-se ao [servidor VueLand](https://chat.vuejs.org/) no Discord.

### Avisos de Depreciação

Os avisos de depreciação podem ser silenciados.

```js
import { config } from '@vue/test-utils'

config.showDeprecationWarnings = false
```
