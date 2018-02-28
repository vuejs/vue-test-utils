# Testando componentes de arquivo único com o Mocha + webpack

> Um projeto de exemplo com essa configuração está disponível no [GitHub](https://github.com/vuejs/vue-test-utils-mocha-webpack-example).

Outra estratégia para testar SFCs é compilar todos os seus testes via webpack e depois rodar em um *test runner*. A vantagem dessa abordagem é poder ter o suporte total para todos os recursos do webpack e `vue-loader`, por isso não temos que fazer compromissos em nosso código-fonte.

Tecnicamente você pode usar qualquer executador de teste que você goste e alinhar as coisas de forma manual, mas descobrimos o [`mocha-webpack`](https://github.com/zinserjan/mocha-webpack) para fornecer uma experiência muito simplificada para essa tarefa específica.

## Configurando o `mocha-webpack`

Assumiremos que você está começando com o webpack, vue-loader e babel corretamente configurados, por exemplo com o template `webpack-simple` fornecido pelo `vue-cli`.

A primeira coisa a se fazer é instalar as dependências dos testes:

``` bash
npm install --save-dev @vue/test-utils mocha mocha-webpack
```

Posteriormente, defina o script `test` no `package.json`:

```json
// package.json
{
  "scripts": {
    "test": "mocha-webpack --webpack-config webpack.config.js --require test/setup.js test/**/*.spec.js"
  }
}
```

Temos algumas coisas a serem observadas aqui:

- A flag `--webpack-config` especifica o arquivo de configuração do webpack para seus testes. Na maioria dos casos, ele é idêntico à configuração que você usa para o projeto real, mas com um pequeno ajuste que falaremos mais tarde.

- A flag `--require` garante que o arquivo `test/setup.js` seja executado antes de qualquer teste, nele nós podemos configurar o ambiente global para nossos testes que irão ser executados.

- O último argumento é um glob para os arquivos de teste a serem incluídos no pacote de teste.

### Configurações extras do webpack

#### Externalização das dependências do NPM

Em nossos testes, provavelmente importaremos uma série de dependências do NPM - algumas dessas dependências podem ser escritas sem o uso do navegador em mente e simplesmente não serão empacotadas corretamente pelo webpack. Então consideramos a externalização das dependências, que melhora consideravelmente a velocidade na inicialização dos testes. Podemos externalizar todas as dependências do NPM com o `webpack-node-externals`:

```js
// webpack.config.js
const nodeExternals = require('webpack-node-externals')

module.exports = {
  // ...
  externals: [nodeExternals()]
}
```

#### Mapas de origem

Os mapas de origem precisam ser incorporados pra ser capturados pelo `mocha-webpack`. A configuração recomendada é:

``` js
module.exports = {
  // ...
  devtool: 'inline-cheap-module-source-map'
}
```

Se for depurar pela IDE, também recomendamos adicionar o seguinte:

``` js
module.exports = {
  // ...
  output: {
    // ...
    // use caminhos absolutos nos mapas de origem (depuração via IDE)
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  }
}
```

### Configurando o ambiente de navegador

O `vue-test-utils` requere um ambiente de navegador para ser executado. Nos simulamos isso no Node.js usando o `jsdom-global`:

```bash
npm install --save-dev jsdom jsdom-global
```

Então, em `test/setup.js`:

``` js
require('jsdom-global')()
```

Isso adiciona um ambiente de navegador ao Node, de modo que o `vue-test-utils` possa ser executado corretamente.

### Escolhendo uma biblioteca de asserção

[Chai](http://chaijs.com/) é uma biblioteca popular que é comumente usada ao lado do Mocha. Você também pode querer usar o [Sinon](http://sinonjs.org/) para criar spies e esboços.

Como alternativa, você pode usar o `expect` que agora é uma parte do Jest e expõe [exatamente a mesma API](http://facebook.github.io/jest/docs/en/expect.html#content) na documentação do Jest.

Estaremos usando o `expect`aqui e o tornaremos disponível globlamente para que não tenhamos que importá-lo em cada teste:

``` bash
npm install --save-dev expect
```

Então, em `test/setup.js`:

``` js
require('jsdom-global')()

global.expect = require('expect')
```

### Otimizando o Babel para os testes

Observe que estamos usando o `babel-loader` para lidar com o JavaScript. Você já deve ter o Babel configurado se existir um arquivo `.babelrc` no seu projeto. O `babel-loader` usará automaticamente o mesmo arquivo para realizar a configuração.

Uma coisa deve ser observada se você está usando o Node 6+, a partir dessa versão ele suporta a maioria dos recursos do ES2015, então você pode configurar separadamente a opção Babel [env option](https://babeljs.io/docs/usage/babelrc/#env-option) que transpila somente os recursos que ainda não são suportados na versão do Node instalada, por exemplo o stage-2 ou o suporte de síntaxe de fluxo, entre outros.

### Adicionando um teste

Crie um arquivo no diretório `src` chamado `Contador.vue`:

``` html
<template>
	<div>
	  {{ contador }}
	  <button @click="incrementar">Incrementar</button>
	</div>
</template>

<script>
export default {
  data () {
    return {
      contador: 0
    }
  },

  methods: {
    incrementar () {
      this.contador++
    }
  }
}
</script>
```

Agora crie um arquivo de teste chamado `test/Contador.spec.js` com o código a seguir:

```js
import { shallow } from '@vue/test-utils'
import Contador from '../src/Contador.vue'

describe('Contador.vue', () => {
  it('incrementa o contador quando o botão é clicado', () => {
    const wrapper = shallow(Contador)
    wrapper.find('button').trigger('click')
    expect(wrapper.find('div').text()).toMatch('1')
  })
})
```

Agora nós podemos executar o teste usando:

```
npm run unit
```

Woohoo :o, nossos testes estão rodando!

### Recursos

- [Projeto de exemplo com essa configuração](https://github.com/vuejs/vue-test-utils-mocha-webpack-example)
- [Mocha](https://mochajs.org/)
- [mocha-webpack](http://zinserjan.github.io/mocha-webpack/)
- [Chai](http://chaijs.com/)
- [Sinon](http://sinonjs.org/)
- [jest/expect](http://facebook.github.io/jest/docs/en/expect.html#content)
