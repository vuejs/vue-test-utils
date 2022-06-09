## Usando o Vue Test Utils com o Jest (recomendado)

O Jest é um executor de teste desenvolvido pelo Facebook (agora Meta), com o objetivo de entregar uma solução de testes unitários com baterias inclusas. Você pode aprender mais sobre o Jest em sua [documentação oficial](https://jestjs.io/).

<div class="vueschool"><a href="https://vueschool.io/courses/learn-how-to-test-vuejs-components?friend=vuejs" target="_blank" rel="sponsored noopener" title="Aprenda como usar o Jest e a Vue Test Utils para testar Componentes de Ficheiro Único com Vue School">Aprenda como usar o Jest e a Vue Test Utils para testar Componentes de Ficheiro Único com Vue School</a></div>

### Instalação com a Vue CLI (recomendado)

Se você estiver usando a Vue CLI para construir o seu projeto, você pode usar o plugin [cli-plugin-unit-jest](https://cli.vuejs.org/core-plugins/unit-jest.html) para executar testes do Jest.

```bash
$ vue add unit-jest
```

O plugin empurra todas dependências obrigatórias (incluindo o jest), cria um ficheiro `jest.config.js` com padrões sensíveis, e gera um exemplo de conjunto de teste.

Depois disso, tudo o que você precisa fazer é instalar a Vue Test Utils.

```bash
$ npm install --save-dev @vue/test-utils
```

### Instalação Manual

Depois de configurar o Jest, a primeira coisa que você precisa fazer é instalar a Vue Test Utils e a [`vue-jest`](https://github.com/vuejs/vue-jest) para processar os Componentes de Ficheiro Único:

```bash
$ npm install --save-dev @vue/test-utils vue-jest
```

A seguir, você precisa dizer ao Jest para transformar ficheiros `.vue` usando `vue-jest`. Você pode fazer isso ao adicionar a seguinte configuração dentro do `package.json` ou dentro de um [ficheiro dedicado de configuração do Jest](https://jestjs.io/docs/en/configuration):

```json
{
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      // dizer ao Jest para manipular ficheiros `*.vue`
      "vue"
    ],
    "transform": {
      // processar ficheiros `*.vue` com o `vue-jest`
      ".*\\.(vue)$": "vue-jest"
    }
  }
}
```

#### Usando com o Babel

Se você for usar o `babel` e importar componentes de vue de ficheiro único com a extensão `.vue` dentro dos seus testes, você precisará instalar o babel e transformar os ficheiros com o `babel-jest`.

```bash
npm install --save-dev babel-jest @babel/core @babel/preset-env babel-core@^7.0.0-bridge.0
```

Depois, você precisa dizer ao Jest para transformar ficheiros os `.js` usando o `babel-jest`. Você pode fazer isso adicionando a seguinte configuração dentro do `package.json` ou dentro de um [ficheiro dedicado de configuração do Jest](https://jestjs.io/docs/en/configuration):

```json
{
  "jest": {
    "transform": {
      // processa ficheiros `*.js` com o `babel-jest`
      ".*\\.(js)$": "babel-jest"
    }
  }
}
```

A seguir você precisa criar a configuração de babel usando os ficheiros de configuração [babel.config.json](https://babeljs.io/docs/en/configuration#babelconfigjson) ou o [.babelrc.json](https://babeljs.io/docs/en/configuration#babelrcjson):

```json
{
  "presets": ["@babel/preset-env"]
}
```

Você pode também adicionar estas opções ao `package.json`:

```json
{
  "babel": {
    "presets": ["@babel/preset-env"]
  }
}
```

#### Manipulando os apelidos (aliases) do webpack

Se você usar um resolvedor de apelidos dentro da configuração do webpack, por exemplo apelidando o `@` para o `/src`, você precisa adicionar uma configuração de correspondência para o Jest também, usando a opção `moduleNameMapper`:

```json
{
  "jest": {
    // suportar o mesmo mapeamento de apelido de `@ -> src` dentro do código fonte.
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

### Cobertura de Código

O Jest pode ser usado para gerar relatórios de cobertura em vários formatos. Isto está desativado por padrão (para ambas instalação via vue-cli e para uma manual). A seguir está um exemplo simples para começar com:

Estenda a sua configuração `jest` com a opção [`collectCoverage`](https://jestjs.io/docs/en/configuration#collectcoverage-boolean), e depois adicione o arranjo [`collectCoverageFrom`](https://jestjs.io/docs/en/configuration#collectcoveragefrom-array) para definir os ficheiros para os quais a informações de cobertura devem ser coletadas.

```json
{
  "jest": {
    "collectCoverage": true,
    "collectCoverageFrom": ["**/*.{js,vue}", "!**/node_modules/**"]
  }
}
```

Isto ativará os relatórios de cobertura com os [relatórios de cobertura padrão](https://jestjs.io/docs/en/configuration#coveragereporters-array-string). A documentação mais avançada pode ser encontrada dentro da [documentação da configuração do Jest](https://jestjs.io/docs/en/configuration#collectcoverage-boolean), onde você pode encontrar opções para os limites de cobertura, alvo de diretórios de saída, etc.
