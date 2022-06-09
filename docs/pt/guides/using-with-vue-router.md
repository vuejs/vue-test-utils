## Usando com o Vue Router

### Instalando o Vue Router dentro de testes

Você nunca deve instalar o Vue Router sobre o construtor base de Vue dentro de testes. A instalação de Vue Router adiciona `$route` e `$router` como propriedades de apenas leitura sobre o protótipo de Vue.

Para evitar isso, nós podemos criar um `localVue`, e instalar o Vue Router sobre ele.

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter()

shallowMount(Component, {
  localVue,
  router
})
```

> **Nota:** A instalação de Vue Router sobre um `localVue` também adiciona o `$route` e `$router` como propriedades de apenas leitura ao `localVue`. Isto significa que você não pode usar a opção `mocks` para sobrescrever o `$route` e o `$router` quando estiver montando um componente usando um `localVue` com o Vue Router instalado.

### Testando componentes que usam o `router-link` ou `router-view`

Quando você instalar o Vue Router, os componentes `router-link` e `router-view` são registados. Isto significa que nós podemos usar eles em qualquer lugar dentro da aplicação sem a necessidade de importar eles.

Quando nós executamos os testes, nós precisamos tornar estes componentes de Vue Router disponíveis para o componente que estamos montando. Há dois métodos de fazer isso.

### Usando os stubs

```js
import { shallowMount } from '@vue/test-utils'

shallowMount(Component, {
  stubs: ['router-link', 'router-view']
})
```

### Instalando o Vue Router com o `localVue`

```js
import { mount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
localVue.use(VueRouter)

mount(Component, {
  localVue,
  router
})
```

A instância do roteador está disponível para todos componentes filhos, isto é útil para testes de nível de integração.

### Imitando o `#route` e o `$router`

Algumas vezes você deseja testar aquele componente que faz alguma coisa com parâmetros dos objetos `$route` e `$router`. Para fazer isso, você pode passar imitações personalizadas para a instância de Vue.

```js
import { shallowMount } from '@vue/test-utils'

const $route = {
  path: '/some/path'
}

const wrapper = shallowMount(Component, {
  mocks: {
    $route
  }
})

wrapper.vm.$route.path // /some/path
```

> **Nota:** os valores imitados de `$route` e `$router` não estão disponíveis aos componentes filhos, ou forje estes componentes ou use o método `localVue`.

### Conclusão

A instalação de Vue Router adiciona o `$route` e o `$router` como propriedades de apenas leitura sobre o protótipo de Vue.

Isso significa que quaisquer testes futuros que tentar imitar o `$route` ou o `$router` falhará.

Para evitar isso, nunca instale o Vue Router globalmente quando você estiver executando os testes; use um `localVue` como detalhado acima.
