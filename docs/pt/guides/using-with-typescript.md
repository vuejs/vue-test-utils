## Usando com o TypeScript

> Um exemplo de projeto para este configuração está disponível no [GitHub](https://github.com/vuejs/vue-test-utils-typescript-example).

O TypeScript é um superconjunto popular de JavaScript que adiciona tipos e classes sobre o JavaScript habitual. A Vue Test Utils inclui tipos dentro do pacote distribuído, assim ela funciona bem com o TypeScript.

Neste guia, nós iremos caminhar através de como definir uma configuração de estes para um projeto de TypeScript usando Jest e a Vue Test Utils a partir de uma configuração básica de TypeScript da Vue CLI.

### Adicionado o TypeScript

Primeiro, você precisa criar um projeto. Se você não tiver a Vue CLI instalada, instale ela globalmente:

```shell
$ npm install -g @vue/cli
```

E crie um projeto ao executar:

```shell
$ vue create hello-world
```

No pronto da CLI, escolha a opção `Manually select features`, selecione TypeScript, e pressione Enter. Isto criará um projeto com o TypeScript já configurado.

::: tip NOTA
Se você quiser mais um guia mais detalhado sobre a configuração de Vue com o TypeScript, consulte o [guia de iniciação de Vue com TypeScript](https://github.com/Microsoft/TypeScript-Vue-Starter).
:::

O próximo passo é adicionar o Jest ao projeto.

### Configurando o Jest

O Jest é um executor de teste desenvolvido pelo Facebook, com o propósito de entregar uma solução de testes unitários com baterias incluídas. Você pode aprender mais sobre o Jest na sua [documentação oficial](https://jestjs.io/).

Instale o Jest e a Vue Test Utils:

```bash
$ npm install --save-dev jest @vue/test-utils
```

Depois defina um roteiro `test:unit` dentro de `package.json`.

```json
// package.json
{
  // ..
  "scripts": {
    // ..
    "test:unit": "jest"
  }
  // ..
}
```

### Processando Componentes de Único Ficheiro dentro do Jest

Para ensinar o Jest a como processar ficheiros `*.vue`, nós precisamos instalar e configurar o pré-processador `vue-jest`:

```bash
npm install --save-dev vue-jest
```

Depois, criar um bloco de `jest` dentro de `package.json`:

```json
{
  // ...
  "jest": {
    "moduleFileExtensions": [
      "js",
      "ts",
      "json",
      // diz ao Jest para manipular ficheiros `*.vue`
      "vue"
    ],
    "transform": {
      // processa ficheiros `*.vue` com o `vue-jest`
      ".*\\.(vue)$": "vue-jest"
    },
    "testURL": "http://localhost/"
  }
}
```

### Configurando o TypeScript para o Jest

No sentido de usar ficheiros de TypeScript dentro de testes, nós precisamos configurar o Jest para compilar o TypeScript. Para isso nós precisamos instalar o `ts-jest`:

```bash
$ npm install --save-dev ts-jest
```

Depois, nós precisamos dizer ao Jest para processar os ficheiros de teste em TypeScript com o `ts-jest` ao adicionar um entrada sob `jest.transform` dentro de `package.json`:

```json
{
  // ...
  "jest": {
    // ...
    "transform": {
      // ...
      // processar os ficheiros `*.ts` com o `ts-jest`
      "^.+\\.tsx?$": "ts-jest"
    }
    // ...
  }
}
```

### Colocação de Ficheiros de Teste

Por padrão, o Jest selecionará recursivamente todos ficheiros que têm uma extensão `.spec.js` ou `.test.js` dentro do projeto inteiro.

Para executar o teste de ficheiros com uma extensão `.ts`, nós precisamos mudar a `testRegex` na secção de configuração dentro do ficheiro `package.json`.

Adicione o seguinte ao campo `jest` dentro de `package.json`:

```json
{
  // ...
  "jest": {
    // ...
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$"
  }
}
```

O Jest recomenda a criação de um diretório `__tests__` exatamente próximo ao código a ser testado, mas esteja à vontade para estruturar os seus testes como você desejar. Apenas saiba que o Jest criaria um diretório `__snapshots__` próximo aos ficheiros de teste que executam testes instantâneos.

### Escrevendo um Teste Unitário

Agora que nós temos o projeto configurado, é hora de escrever um teste unitário.

Crie um ficheiro `src/components/__tests__/HelloWorld.spec.ts`, e adicione o seguinte código:

```js
// src/components/__tests__/HelloWorld.spec.ts
import { shallowMount } from '@vue/test-utils'
import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld.vue', () => {
  test('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      propsData: { msg }
    })
    expect(wrapper.text()).toMatch(msg)
  })
})
```

É tudo o que nós precisamos fazer para ter o TypeScript e a Vue Test Utils trabalhando juntos!

### Recursos

- [Exemplo de projeto para esta configuração](https://github.com/vuejs/vue-test-utils-typescript-example)
- [Jest](https://jestjs.io/)
