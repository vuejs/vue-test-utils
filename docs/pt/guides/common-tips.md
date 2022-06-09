## Dicas Comuns

### Conhecendo O Que Testar

Para componentes de UI, nós não recomendamos buscar por cobertura completa baseada em linha, porque isto leva focar muito em detalhes de implementação internas dos componentes e poderia resultar em testes frágil.

Ao invés disso, nós recomendamos escrever testes que afirmam a interface publica do seu componente, e tratar seu interior como uma caixa preta. Um único caso de teste afirmaria que alguma entrada (interação de usuário ou mudar de propriedades) fornecida para os resultados do componente na saída esperada (renderizar o resultado ou emitir eventos personalizados).

Por exemplo, imagine um componente `Counter` o que incrementa por 1 o contador exibido toda vez que um botão é clicado. Seu caso de teste simularia o clique e afirmar que a saída renderizada foi incrementada por 1. O teste não deve cuidar em como o `Counter` incrementa o valor – ele apenas cuida da entrada e saída.

O beneficio desta abordagem é que contanto que a interface publica do componente continua o mesmo, os seus testes passarão não importa como implementação interna do componente mude ao longo do tempo.

Este tópico é discutido como mais detalhes em [grande apresentação feita pelo Matt O'Connell](https://www.youtube.com/watch?v=OIpfWTThrK8).

### Montagem Superficial

Algumas vezes, a montagem de um componente inteiro com todas suas dependências pode se tornar lento ou pesado. Por exemplo, componentes que contém vários componentes filho.

A Vue Test Utils permite você montar um componente sem a renderizar seus componentes filhos (ao forjar eles) com o método [`shallowMount`](../api/#shallowmount).

```js
import { shallowMount } from '@vue/test-utils'
import Component from '../Component.vue'

const wrapper = shallowMount(Component)
```

Tal como o método [mount](../api/#mount), ele cria um [Wrapper](../api/wrapper) que contém o componente de Vue renderizado e montado, mas com componentes filhos forjados.

Repare que usando `shallowMount` fará o componente sob testes diferente do componente que você executa em sua aplicação - algumas de suas partes não será renderizada! Isto é porque não é maneira sugerida de testar componentes a menos que você enfrente problemas de desempenho ou precisar simplificar teste os planos.

### Gatilhos do Ciclo de Vida

<div class="vueschool" style="margin-top:1em;"><a href="https://vueschool.io/lessons/learn-how-to-test-vuejs-lifecycle-methods?friend=vuejs" target="_blank" rel="sponsored noopener" title="Aprenda como usar a Vue Test Utils para testar os Gatilhos do Ciclo de Vida com a Vue School">Aprenda como testar os métodos do ciclo de vida e intervalos com a Vue School</a></div>

Quando estiver usando os métodos `mount` ou `shallowMount`, você pode esperar que seu componente para responder para todos eventos ciclos de vida. No entanto, é importante notar que o `beforeDestroy` e `destroyed` _não serão acionadas_ a menos que o componente seja manualmente destruído usando o `Wrapper.destroy()`.

Adicionalmente, o componente não será automaticamente destruído no final de cada `spec`, e está sobre o usuário forjar ou manualmente limpar as tarefas que continuam a executar (`setInterval` ou `setTimeout`, por exemplo) antes do final da `spec`.

### Escrevendo testes assíncronos (novo)

Por padrão, as atualizações dos lotes de Vue executam assincronamente (no próximo "tique"). Isto é para prevenir re-renderizações desnecessárias do DOM, e observar computações ([consulte a documentação](https://vuejs.org/v2/guide/reactivity.html#Async-Update-Queue) para mais detalhes).

Isto significa que você **deve** esperar pelas atualização executam depois de você mudar uma propriedade reativa. Você pode fazer isso ao esperar métodos de mutações como `trigger`:

```js
it('updates text', async () => {
  const wrapper = mount(Component)
  await wrapper.trigger('click')
  expect(wrapper.text()).toContain('updated')
  await wrapper.trigger('click')
  expect(wrapper.text()).toContain('some different text')
})

// Ou se você está sem async/await
it('render text', done => {
  const wrapper = mount(TestComponent)
  wrapper.trigger('click').then(() => {
    expect(wrapper.text()).toContain('updated')
    wrapper.trigger('click').then(() => {
      expect(wrapper.text()).toContain('some different text')
      done()
    })
  })
})
```

Saiba mais em [Testando Comportamento Assíncrono](../guides/README.md#testing-asynchronous-behavior)

### Afirmando Eventos Emitidos

Cada envolvedor (wrapper) montado automaticamente regista todos eventos emitidos por baixo da instância da Vue. Você pode recuperar os eventos registados usando o método `wrapper.emitted()`:

```js
wrapper.vm.$emit('foo')
wrapper.vm.$emit('foo', 123)

/*
`wrapper.emitted()` retorna o seguinte objeto:
{
  foo: [[], [123]]
}
*/
```

Você pode depois fazer afirmações baseadas nestes dados:

```js
// afirma que o evento foi emitido
expect(wrapper.emitted().foo).toBeTruthy()

// afirma a conta do evento
expect(wrapper.emitted().foo.length).toBe(2)

// afirma a carga do evento
expect(wrapper.emitted().foo[1]).toEqual([123])
```

Você pode também receber um arranjo (Array) de eventos na ordem de emissão deles ao chamar [`wrapper.emittedByOrder()`](../api/wrapper/emittedByOrder.md).

### Emitindo Evento a partir do Componente Filho

Você pode emitir um evento personalizado a partir de um componente filho ao acessar a instância.

**Componente sob teste**

```html
<template>
  <div>
    <child-component @custom="onCustom" />
    <p v-if="emitted">Emitted!</p>
  </div>
</template>

<script>
  import ChildComponent from './ChildComponent'

  export default {
    name: 'ParentComponent',
    components: { ChildComponent },
    data() {
      return {
        emitted: false
      }
    },
    methods: {
      onCustom() {
        this.emitted = true
      }
    }
  }
</script>
```

**Teste**

```js
import { mount } from '@vue/test-utils'
import ParentComponent from '@/components/ParentComponent'
import ChildComponent from '@/components/ChildComponent'

describe('ParentComponent', () => {
  it("displays 'Emitted!' when custom event is emitted", () => {
    const wrapper = mount(ParentComponent)
    wrapper.findComponent(ChildComponent).vm.$emit('custom')
    expect(wrapper.html()).toContain('Emitted!')
  })
})
```

### Manipulando o Estado de Componente

Você pode manipular o estado do componente diretamente usando o método `setData` ou o método `setProps` no envolvedor (wrapper):

```js
it('manipulates state', async () => {
  await wrapper.setData({ count: 10 })

  await wrapper.setProps({ foo: 'bar' })
})
```

### Imitando Propriedades

Você pode passar as propriedades para o componente usando opção `propsData` embutida da Vue:

```js
import { mount } from '@vue/test-utils'

mount(Component, {
  propsData: {
    aProp: 'some value'
  }
})
```

Você pode também atualizar as propriedades de um componente já montado com o método `wrapper.setProps({})`.

_Para uma lista completa das opções, consulte a [seção opções de montagem](../api/options.md) da documentação._

### Imitando Transições

Apesar das chamadas de `await Vue.nextTick()` funcionarem bem para a maioria dos casos de uso, existem algumas situações onde soluções adicionais são necessárias. Estes problemas serão resolvidos antes da biblioteca `vue-test-utils` sair da beta. Um destes exemplos é o teste unitário de componentes com o envolvedor `<transition>` fornecido pela Vue.

```vue
<template>
  <div>
    <transition>
      <p v-if="show">Foo</p>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: true
    }
  }
}
</script>
```

Você pode querer escrever um teste que verifica que se Foo está exibido, então quando o `show` é definido para `false`, o Foo não é mais renderizado. Tal teste poderia ser escrito como o seguinte:

```js
test('should render Foo, then hide it', async () => {
  const wrapper = mount(Foo)
  expect(wrapper.text()).toMatch(/Foo/)

  await wrapper.setData({
    show: false
  })

  expect(wrapper.text()).not.toMatch(/Foo/)
})
```

Na prática, apesar de nós estarmos chamando e chamando o `setData` para garantir que o DOM é atualizado, este teste falha. Isto é um problema em andamento relacionado a como a Vue implementa o componente `<transition>`, isto nós gostaríamos de resolver antes da versão 1.0. Por agora, existem algumas soluções:

#### Usando o auxiliar `transitionStub`

```js
const transitionStub = () => ({
  render: function(h) {
    return this.$options._renderChildren
  }
})

test('should render Foo, then hide it', async () => {
  const wrapper = mount(Foo, {
    stubs: {
      transition: transitionStub()
    }
  })
  expect(wrapper.text()).toMatch(/Foo/)

  await wrapper.setData({
    show: false
  })

  expect(wrapper.text()).not.toMatch(/Foo/)
})
```

Isto sobrescreve o comportamento padrão do componente `<transition>` e renderiza os filhos assim que condição booleana relevante mudar, visto que é o oposto de aplicar classes de CSS, que é como componente `<transition>` da Vue funciona.

#### Evitar `setData`

Uma outra alternativa é simplesmente evitar usar o `setData` ao escrever dois testes, com a configuração necessária realizada usando as opções `mount` ou `shallowMount`:

```js
test('should render Foo', async () => {
  const wrapper = mount(Foo, {
    data() {
      return {
        show: true
      }
    }
  })

  expect(wrapper.text()).toMatch(/Foo/)
})

test('should not render Foo', async () => {
  const wrapper = mount(Foo, {
    data() {
      return {
        show: false
      }
    }
  })

  expect(wrapper.text()).not.toMatch(/Foo/)
})
```

### Aplicando Plugins Globais e Mixins

Alguns componentes podem depender de funcionalidades injetadas por um plugin global ou mixin, por exemplo a `vuex` e a `vue-router`.

Se você estiver escrevendo testes para componentes em uma aplicação especifica, você pode configurar os mesmos plugins globais e mixins de uma vez na entrada de seus testes. Mas em alguns casos, por exemplo testando um conjunto de componente genérico que podem ser partilhados entre aplicações diferentes, é melhor testar seus componentes em uma configuração mais isolada, sem poluir o construtor global da `Vue`. Nós podemos usar o método [`createLocalVue`](../api/createLocalVue.md) para alcançar isso:

```js
import { createLocalVue, mount } from '@vue/test-utils'

// cria construtor de `Vue` estendido
const localVue = createLocalVue()

// instala os plugins como normais
localVue.use(MyPlugin)

// passa o `localVue` para as opções do `mount`
mount(Component, {
  localVue
})
```

**Repare que alguns plugins, como a Vue Router, adicionam propriedades de somente leitura ao construtor global da Vue. Isto torna impossível reinstalar o plugin em construtor `localVue`, ou adicionar imitações para estas propriedades de somente leitura.**

### Imitando Injeções

Uma outra estratégia para propriedades injetadas é simplesmente imitá-las. Você fazer isso com a opção `mocks`:

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
    // adiciona objeto `$route` imitado para a instância da Vue
    // antes da montagem do componente
    $route
  }
})
```

### Forjando componentes

Você pode sobrescrever componentes que são registados globalmente ou localmente usando a opção `stubs`:

```js
import { mount } from '@vue/test-utils'

mount(Component, {
  // Resolverá o `globally-registered-component` com o
  // forjado vazio
  stubs: ['globally-registered-component']
})
```

### Lidando com o Roteamento

Visto que o roteamento por definição tem haver com toda estrutura da aplicação e envolve vários componentes, ele é melhor testado através de integração ou testes fim-à-fim (end-to-end). Para componentes individuais que dependem de funcionalidades da `vue-router`, você pode imitá-las usando as técnicas mencionadas acima.

### Detetando estilos

O seu teste apenas pode detetar estilos em linha quando estiver executando no `jsdom`.
