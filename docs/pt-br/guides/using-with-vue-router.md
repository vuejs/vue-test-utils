# Usando com o Vue Router

## Instalando o Vue Router nos testes

Você nunca deveria instalar o Vue Router no construtor base do Vue dos seus testes. A instalação do Vue Router adiciona `$route` e `$router` como propriedades de somente leitura no protótipo dos componentes Vue.

Para evitar isso, nós criamos o `localVue` e instalamos o Vue Router no seu interior.

```js
import VueRouter from 'vue-router'
const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter()

shallow(Component, {
  localVue,
  router
})
```

## Testando componentes que usam `router-link` ou `router-view`

Quando você instala o Vue Router, os componentes `router-link` e `router-view` são registrados. Isso significa que podemos usa-los em qualquer lugar da nossa aplicação sem precisar importá-los.

Quando executamos os testes, nós precisamos disponibilizar os componentes do Vue Router para os componentes que estamos montando. Existem dois métodos para se fazer isso.

### Usando esboços

```js
shallow(Componente, {
  stubs: ['router-link', 'router-view']
})
```

### Instalando o Vue Router com o localVue

```js
import VueRouter from 'vue-router'
const localVue = createLocalVue()

localVue.use(VueRouter)

shallow(Componente, {
  localVue
})
```

## Simulando o `$route` e o `$router`

Às vezes você quer testar que um componente faz algo com os parâmetros dos objetos `$route` e `$router`. Para fazer isso você pode passar mocks personalizados para a instância do Vue.

```js
const $route = {
  path: '/rota/qualquer'
}

const wrapper = shallow(Component, {
  mocks: {
    $route
  }
})

wrapper.vm.$router // /rota/qualquer
```

## Obstáculos comuns

A instalação do Vue Router adiciona `$route` e `$router` como propriedades de somente leitura do protótipo Vue.

Isso significa que todos os testes futuros que tentam simular o `$route` ou o `$router` irão falhar.

Para evitar isso, nunca instale o Vue Router quando estiver executando seus testes.
