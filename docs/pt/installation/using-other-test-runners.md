## Usando outros executores de Teste

### Executando o Vue Test Utils com o Karma

O [Karma](http://karma-runner.github.io/) é um executor de teste que lança o navegador, executa os testes, e reporta eles de volta para nós.

Adicionalmente ao Karma, você pode desejar usar o framework [Mocha](https://mochajs.org/) para escrever os testes e a biblioteca [Chai](http://chaijs.com/) para afirmação de teste. Também, você talvez também deseja verificar o [Sinon](http://sinonjs.org/) para criação de espiões e forjados.

A seguir é uma configuração básica do Karma para o Vue Test Utils:

```js
// karma.conf.js
var webpackConfig = require('./webpack.config.js')

module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    files: ['test/**/*.spec.js'],
    webpack: webpackConfig,
    reporters: ['spec'],
    browsers: ['Chrome'],
    preprocessors: {
      '**/*.spec.js': ['webpack', 'sourcemap']
    }
  })
}
```

### Executando o Vue Test Utils com o mocha webpack

Uma outra estratégia para testar Componentes de Ficheiro Único (SFCs em Inglês) é compilar todos os nossos testes via webpack e depois executar ele dentro de um executor de teste. A vantagem desta abordagem é que ela dá para nós suporte completo para todas as funcionalidades do webpack e do `vue-loader`, assim nós não temos que fazer acordos dentro do nosso código-fonte.

Nós selecionamos o [`mochapack`](https://github.com/sysgears/mochapack) para fornecer uma experiência toda otimizada para esta tarefa em particular.

A primeira coisa a fazer é a instalação das dependências de teste:

```bash
npm install --save-dev @vue/test-utils mocha mochapack
```

Depois da instalação do Vue Test Utils e o `mochapack`, você precisará definir um roteiro de teste dentro do seu `package.json`:

```json
// package.json
{
  "scripts": {
    "test": "mochapack --webpack-config webpack.config.js --require test/setup.js test/**/*.spec.js"
  }
}
```

### Executando o Vue Test Utils sem uma etapa de construção

Enquanto é comum construir aplicações em Vue usando ferramentas taís como o [webpack](https://webpack.js.org/) para empacotar a aplicação, `vue-loader` para entregar Componentes de Ficheiro Único (SFC em Inglês), é possível usar o Vue Test Utils com muito menos. Os requisitos mínimos para a Vue Test Utils, além dela mesma são:

- Vue
- [vue-template-compiler](https://github.com/vuejs/vue/tree/dev/packages/vue-template-compiler#readme)
- um DOM (seja ele [jsdom](https://github.com/jsdom/jsdom) dentro de um ambiente Node, ou o DOM dentro de um navegador real)

Repare que o `jsdom` (ou qualquer outra implementação do DOM) deve ser exigido e instalado antes da Vue Test Utils, porque ele espera um DOM (DOM real, ou JSDOM) existir.
