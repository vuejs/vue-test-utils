# Dicas comuns

## Sabendo o que testar

Para componentes com interface não recomendamos o foco na cobertura completa baseada em linha, porque ela leva muito o foco para detalhes internos da implementação dos componentes, podendo resultar em testes frágeis.

Em vez disso, nós recomendamos escrever testes que verifiquem seus componentes com interface pública e trate os internos como uma caixa preta. Um caso de teste único irá verificar se a entrada (interações do usuário ou troca de props) forneceu o resultado (renderização ou emissão de eventos) esperado para o componente.

Por exemplo, para o componente `Counter` que incrementa um contador em cada vez que um botão é clicado, seu caso de teste teria que silumar o clique e verificar se a saída renderizada se incrementou. O teste não se importa sobre como `Counter` incrementou o valor, ele apenas se preocupa com a entrada e a saída dos dados.

O benefício desta abordagem é que enquanto a interface pública do seu componente permanece a mesma, seus testes irão passar sem se importar de como o componente faz a implementação do código interno e se houve ou não mudanças por lá.

Esse tópico é discutido com mais detalhes em uma [excelente apresentação de Matt O'Connell](http://slides.com/mattoconnell/deck#/).

## Renderização superficial

Em testes de unidade, normalmente queremos nos focar no componente a ser testeado, isolando-o como uma unidade e evitando verificações indiretas em comportamentos dos seus filhos.

Além disso, para componentes que possuem muitos componentes filhos, toda a árvore de renderização pode ficar realmente grande. A repetição de renderização de todos componentes filhos vão deixar seus testes lentos.

O `vue-test-utils` permite que você monte um componente sem renderizar seus componentes filhos, para isso, use o método `shallow`:

```js
import { shallow } from '@vue/test-utils'

// obtém o wrapper contendo a instância montada de Componente
const wrapper = shallow(Componente)
wrapper.vm // instância do Vue já montada
```

## Verificando os eventos emitidos

Cada wrapper montado grava automaticamente todos os eventos emitidos pela instância Vue contida. Você pode recuperar os eventos registrados usando o método `emitted`:

``` js
wrapper.vm.$emit('foo')
wrapper.vm.$emit('foo', 123)

/*
wrapper.emitted() retorna o objeto a seguir:
{
  foo: [ [], [123] ]
}
*/
```

Então você pode criar asserções baseadas nesses dados:

``` js
// verifica se o evento 'foo' foi emitido
expect(wrapper.emitted().foo).toBeTruthy()

// verifica as vezes que o evento 'foo' doi emitido
expect(wrapper.emitted().foo.length).toBe(2)

// verifica a carga do segundo evento 'foo' emitido
expect(wrapper.emitted().foo[1]).toEqual([123])
```

Além disso, você pode pegar um Array dos eventos emitidos em ordem de chamada com o método [wrapper.emittedByOrder()](../api/wrapper/emittedByOrder.md).

## Manipulando o estado do componente

Você pode manipular diretamente o estado do componente usando os métodos `setData` ou `setProps` no wrapper:

```js
wrapper.setData({ contador: 10 })

wrapper.setProps({ foo: 'bar' })
```

## Simulando propriedades

Você pode passar propriedades para o componente usando a opção `propsData` integrada no Vue:

```js
import { mount } from '@vue/test-utils'

mount(Component, {
  propsData: {
    umaProp: 'qualquer valor'
  }
})
```

Você também pode atualizar as propriedades mesmo com o componente já montado, para isso use o método `wrapper.setProps({})`.

*Para ver a lista completa de opções, por favor veja a seção [opções de montagem](../api/options.md) nessa documentação.*

## Aplicando plugins e mixins globais

Alguns dos seus componentes podem ter características injetadas por um plugin ou mixin global, por exemplo o `vuex`, `vue-router` e `vue-multilanguage`.

Se você está escrevendo testes para componentes de uma aplicação específica, você pode configurar os plugins e mixins globais uma vez na entrada dos seus testes. Mas, em alguns casos, por exemplo, testando um pacote de componentes genéricos que podem ser compartilhados em diferentes aplicações, será melhor testar seus componentes com uma configuração mais isolada, sem popular o construtor global do Vue. Nós podemos usar o método [createLocalVue](../api/createLocalVue.md) para conseguir isso:

``` js
import { createLocalVue } from '@vue/test-utils'

// criando um construtor ampliado do Vue
const localVue = createLocalVue()

// Instalando normalmente os seus plugins
localVue.use(MeuPlugin)

// Passe o localVue para o wrapper do componente
mount(Componente, {
  localVue
})
```

## Simulando injeções

Outra estratégia para injetar propriedades é simplesmente simular ela. Você pode fazer isso com a opção `mocks`:

```js
import { mount } from '@vue/test-utils'

const $route = {
  path: '/',
  hash: '',
  params: { id: '123' },
  query: { q: 'hello' }
}

mount(Component, {
  mocks: {
    // adiciona o objeto $route simulado na instância Vue
    // antes da montagem do componente
    $route
  }
})
```

## Lidando com o roteamento

Uma vez que o roteamento, por definição, tem a ver com a estrutura geral da aplicação e envolve muitos componentes, é melhor testado atráves de testes de integração ou de ponta a ponta. Para componentes individuais que dependem dos recursos do `vue-router`, você pode simula-lo usando as técnicas mencionadas acima.
