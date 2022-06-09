## Bibliotecas Úteis para Testes

A Vue Test Utils fornece métodos úteis para testes de componentes de Vue.js. Os membros da comunidade tem também escrito algumas bibliotecas adicionais as quais ou estendem a `vue-test-utils` com métodos extras úteis, ou fornecem ferramentas para testes de outras coisas encontradas dentro de aplicações de Vue.js.

### A Biblioteca de Testes de Vue

A [Vue Testing Library ou Biblioteca de Testes de Vue](https://github.com/testing-library/vue-testing-library) é um conjunto de ferramentas focadas em testes de componentes sem depender de detalhes de implementação. Construida com a acessibilidade em mente, sua abordagem também torna a refatoração uma brisa.

É construida sobre a Vue Test Utils.

### `vuex-mock-store`

A [`vuex-mock-store`](https://github.com/posva/vuex-mock-store) fornece uma simples e direta imitação da memória para simplificar os testes de componentes consumindo uma memória de Vuex.

### `jest-matcher-vue-test-utils`

A [`jest-matcher-vue-test-utils`](https://github.com/hmsk/jest-matcher-vue-test-utils) adiciona correspondentes adicionais para o executor de teste Jest com o propósito de tornar as afirmações mais expressivas.

### `jest-mock-axios`

A [`jest-mock-axios`](https://github.com/knee-cola/jest-mock-axios) permite você imitar facilmente o `axios`, um cliente de HTTP comum, dentro de seus testes. Ele funciona fora da caixa com Jest, e o autor fornece um guia de como suportar outros executores de teste dentro da documentação.
