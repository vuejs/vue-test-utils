# Testando componentes de arquivo único com Jest

> Um projeto de exemplo para esta configuração está disponível no [GitHub](https://github.com/vuejs/vue-test-utils-jest-example).

Jest é um executador de teste desenvolvido pelo Facebook, visa entregar uma bateria de testes de unidade. Você pode aprender mais sobre o Jets na sua [documentanção oficial](https://facebook.github.io/jest/).

## Configurando o Jest

Nós vamos assumir que você está iniciando com a configuração que já possui o webpack, vue-loader e Babel configurados corretamente - por exemplo o template `webpack-simple` fornecido pelo `vue-cli`.

A primeira coisa para se fazer é instalar o Jest e o `vue-test-utils`:

```bash
$ npm install --save-dev jest vue-test-utils
```

Posteriormente, devemos definir um script novo no `package.json`:

```json
// package.json
{
  "scripts": {
    "test": "jest"
  }
}
```

## Processando SFCs com o Jest

Para ensinar o Jest cmo processar arquivos `*.vue`, precisamos instalar e configurar o pré-processador `vue-jest`:

``` bash
npm install --save-dev vue-jest
```

Agora, crie um bloco chamado `jest` no `package.json`:

``` json
{
  // ...
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      // diga que o Jest irá reconhecer arquivos vue
      "vue"
    ],
    "transform": {
      // processa arquivos vue com o vue-jest
      ".*\\.(vue)$": "<rootDir>/node_modules/vue-jest"
    },
    "mapCoverage": true
  }
}
```

> **Nota:** o `vue-jest` atualmente não suporta todos os recursos do `vue-loader`, por exemplo, blocos personalizados e estilo de carregamento. Além disso, alguns recursos específicos do webpack, como o [code-splitting](http://www.vuejs-brasil.com.br/separando-codigo-vue), também não são suportados. Para usá-los, leia o guia [testando SFCs com Mocha + webpack](./testing-SFCs-with-mocha-webpack.md).

## Manipulação de alias do webpack

Se você usa um alias de resolução na configuração do webpack, por exemplo usar `@` como atalho para `/src`, você precisará adicionar uma configuração correspondente para o Jest, usando a opção `moduleNameMapper`:

``` json
{
  // ...
  "jest": {
    // ...
    // suporta o mapeamento @ para /src do código fonte
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

## Configurando o Babel no Jest

Apesar das últimas versões do Node já suportar muitos recursos do ES2015, você ainda pode querer usar a síntaxe e stage-x nos módulos ES em seus testes. Para isso, precisamos instalar o `babel-jest`:

``` bash
npm install --save-dev babel-jest
```

Agora, nos precisamos dizer ao Jest para processar o arquivos de teste em Javascript com o `babel-jest`. Para isso, adicionamos uma entrada `jest.transform` no `package.json`:

``` json
{
  // ...
  "jest": {
    // ...
    "transform": {
      // ...
      // processar arquivos .js com o babel-jest
      "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
    },
    // ...
  }
}
```

> Por padrão, o `babel-jest` configura-se automaticamente enquanto estiver instalado. Contudo, adicionamos explicitamente uma transformação para arquivos `*.vue`, então agora precisamos configurar isso no `babel-jest` também.

Assumindo que você usa o `babel-preset-env` com o webpack, a configuração padrão do Babel desabilitará a transpilação dos módulos ES porque o webpack já sabe como lidar com módulos ES. Entretanto, precisamos habilitar isso para nossos testes, porque o Jest executa seus testes diretamente no Node.

Além disso, podemos dizer ao `babel-preset-env` para segmentar a versão do Node que estamos usando. Isso ignora a transposição de recursos desnecessários e faz com que nossos testes sejam mais rápidos.

Para aplicar todas essas opções apenas para os testes, coloque-as em uma configuração separada em `env.test` (isso será automaticamente pego pelo `babel-jest`).

Exemplo do novo `.babelrc`:

``` json
{
  "presets": [
    ["env", { "modules": false }]
  ],
  "env": {
    "test": {
      "presets": [
        ["env", { "targets": { "node": "current" }}]
      ]
    }
  }
}
```

### Teste instantâneo

Você pode usar o [`vue-server-renderer`](https://github.com/vuejs/vue/tree/dev/packages/vue-server-renderer) para transformar um componente em uma String para que ele possa ser salvo como instântaneo para o [teste instântaneo com Jest](https://facebook.github.io/jest/docs/en/snapshot-testing.html).

O resultado do `vue-server-renderer` inclui alguns atributos específicos de SSR e ignora espaços em branco, dificultando a detecção de um diff. Podemos melhorar o instantâneo salvo com um serializador personalizado:

``` bash
npm install --save-dev jest-serializer-vue
```

Em seguida, configure-o no `package.json`:

``` json
{
  // ...
  "jest": {
    // ...
    // serializador para o instantâneo
    "snapshotSerializers": [
      "<rootDir>/node_modules/jest-serializer-vue"
    ]
  }
}
```

### Colocando arquivos de teste

Por padrão, o Jest irá recursivamente pegar todos os arquivosque tenham uma extensão `.spec.js` ou `.test.js` em todo o seu projeto. Se isso não for de acordo com o seu esperado, é possível [alterar o testRegex](https://facebook.github.io/jest/docs/en/configuration.html#testregex-String) na seção `config` no arquivo `package.json`.

O Jest recomenda a criação de um diretório `__tests__` logo ao lado do código que está sendo testado, mas sinta-se livre para estruturar seus testes conforme entender. Apenas tenha cuidado com o fato de o Jest criar um diretório `__snapshots__` ao lado dos arquivos de teste que executam testes instantâneos. 

### Exemplo de spec

Se você está familiarizado com o Jasmine, você deve se sentir em casa com a [API de asserção](https://facebook.github.io/jest/docs/en/expect.html#content) do Jest:

```js
import { mount } from '@vue/test-utils'
import Componente from './componente'

describe('Componente', () => {
  test('é uma instância do Vue', () => {
    const wrapper = mount(Componente)
    expect(wrapper.ehInstanciaVue()).toBeTruthy()
  })
})
```

### Recursos

- [Exemplo de projeto para esta configuração](https://github.com/vuejs/vue-test-utils-jest-example)
- [Exemplos e slides do Vue Conf 2017](https://github.com/codebryo/vue-testing-with-jest-conf17)
- [Jest](https://facebook.github.io/jest/)
- [Babel preset env](https://github.com/babel/babel-preset-env)
