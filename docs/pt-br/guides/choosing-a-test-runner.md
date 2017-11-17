# Escolhendo um executador de testes

Um *test runner* é um programa com objetivo de executar seus testes.

Existem muitos executadores de testes populares no Javascript, o `vue-test-utils` funciona com todos eles.

Há algumas coisas a considerar ao escolher um *test runner*: conjunto de recursos, desempenho e suporte a pré-compilação de componentes de arquivo único (SFC). Depois de comparar cuidadosamente as bibliotecas existentes, aqui estão dois *test runner* que recomendamos:

- [Jest](https://facebook.github.io/jest/docs/en/getting-started.html#content) é o executador de testes mais completo. Ele requer menos configuração, usa JSDOM por padrão, e fornece uma ótima experiência de usuário na linha de comando. Contudo, você vai precisar de um pré-processador para ser possível importar componentes SFC em seus testes. Nos criamos o pré-processador `vue-jest`, para lidar com os recursos SFC mais comuns, mas atualmente não possuímos 100% de compatibilidade com o `vue-loader`.

- [mocha-webpack](https://github.com/zinserjan/mocha-webpack) é um 
wrapper que envolve o webpack e o Mocha, mas com uma interface simplificada e um modo observador. O benefício dessa configuração é o suporte SFC completo via webpack + `vue-loader`, mas isso requer maiores configurações antecipadas.

## Ambiente de navegador

O `vue-test-utils` depende de um ambiente de navegador. Tecnicamente, você pode executa-lo em um navegador real, mas não recomendamos isso por causa da complexidade de executar navegadores reais em diferentes plataformas. Portanto, recomendamos que execute seus testes no Node.js com um ambiente virtual de navegador usando o [JSDOM](https://github.com/tmpvar/jsdom).

O Jets configura automaticamente o JSDOM. Para outros *test runners*, você pode configurar o JSDOM manualmente para os seus testes usando o [jsdom-global](https://github.com/rstacruz/jsdom-global) na entrada dos testes:

``` bash
npm install --save-dev jsdom jsdom-global
```
---
``` js
// na entrada ou configurações dos testes
require('jsdom-global')()
```

## Testando componentes de arquivo único (SFC)

Os componentes de arquivo único do Vue requerem uma pré-compilação antes que possam ser executados no Node ou no navegador. Há duas maneiras recomendadas para executar essa compilação: com o pré-processador Jest ou diretamente usando o webpack.

O pré-processador `vue-jest` suporta as funcionalidades básicas dos SFCs, mas atualmente não manipula blocos de estilos ou personalizados, que são suportados apenas no `vue-loader`. Se você depender desses recursos ou de outras configurações específicas do webpack, você precisará usar uma configuração baseada no webpack + `vue-loader`.

Leia os guias a seguir para cofigurações diferentes:

- [Testando SFCs com Jest](./testing-SFCs-with-jest.md)
- [Testando SFCs com Mocha + webpack](./testing-SFCs-with-mocha-webpack.md)

## Recursos

- [Comparação de desempenho entre test runners](https://github.com/eddyerburgh/vue-unit-test-perf-comparison)
- [Projeto de exemplo com o Jest](https://github.com/vuejs/vue-test-utils-jest-example)
- [Projeto de exemplo com o Mocha](https://github.com/vuejs/vue-test-utils-mocha-webpack-example)
- [Projeto de exemplo com o tape](https://github.com/eddyerburgh/vue-test-utils-tape-example)
- [Projeto de exemplo com o AVA](https://github.com/eddyerburgh/vue-test-utils-ava-example)
