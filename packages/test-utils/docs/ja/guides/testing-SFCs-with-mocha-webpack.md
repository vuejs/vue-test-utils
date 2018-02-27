# Mocha + webpack による単一ファイルコンポーネントのテスト

> このセットアップのサンプルプロジェクトは、 [GitHub](https://github.com/vuejs/vue-test-utils-mocha-webpack-example) にあります。

単一ファイルコンポーネントをテストするためのもう一つの戦略は、webpack を使用してすべてのテストをコンパイルし、それをテストランナで実行することです。このアプローチの利点は、すべての webpack と `vue-loader` 機能を完全にサポートしていることです。ソースコードに妥協する必要はありません。

技術的に好きなテストランナを使用して結びつけることができますが、この特定の作業に非常に合理的な経験を提供するために [`mocha-webpack`](https://github.com/zinserjan/mocha-webpack) を見つけました。

## `mocha-webpack` の設定

既に、webpack、vue-loader、および Babel が正しく設定されている設定から始めると仮定します。例: `vue-cli` によって雛形生成された `webpack-simple` テンプレートです。

最初に行うことは、テストの依存関係をインストールすることです:

``` bash
npm install --save-dev @vue/test-utils mocha mocha-webpack
```

次に、`package.json` にスクリプトを定義する必要があります。

```json
// package.json
{
  "scripts": {
    "test": "mocha-webpack --webpack-config webpack.config.js --require test/setup.js test/**/*.spec.js"
  }
}
```

ここで注意すべき点がいくつかあります:

- `--webpack-config` フラグはテストに使う webpack 設定ファイルを指定します。ほとんどの場合、これは実際のプロジェクトで使用する設定と同じですが、小さな調整が 1 つあります。これについては後で話します。

- `--require` フラグは、テストの前に `test/setup.js` ファイルが実行されることを保証します。このテストでは、テストを実行するためのグローバル環境を設定できます。

- 最後の引数は、テストバンドルに含まれるテストファイルのグロブです。

### 別の webpack の設定

#### NPM 依存関係の外部化

私たちのテストでは、いくつかの NPM 依存関係をインポートする可能性があります。これらのモジュールの中には、ブラウザの使用を念頭に置いて記述されているものもあれば、webpack によって適切にバンドルされていないものもあります。依存関係を外部化することにより、テストの起動速度が大幅に向上するというもう一つの考慮すべき点としてあります。`webpack-node-externals` を使って NPM の依存関係をすべて外部化することができます:

```js
// webpack.config.js
const nodeExternals = require('webpack-node-externals')

module.exports = {
  // ...
  externals: [nodeExternals()]
}
```

#### ソースマップ

ソースマップは、`mocha-webpack` によってピックアップされるようにインライン化する必要があります。推奨設定は次のとおりです:

``` js
module.exports = {
  // ...
  devtool: 'inline-cheap-module-source-map'
}
```

IDE 経由でデバッグする場合は、以下を追加することをお勧めします:

``` js
module.exports = {
  // ...
  output: {
    // ...
    // ソースマップで絶対パスを使用する（IDE 経由のデバッグで重要）
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  }
}
```

### ブラウザ環境の設定

`vue-test-utils` はブラウザ環境を必要とします。`jsdom-global`を 使って Node.js でシミュレーションすることができます:

```bash
npm install --save-dev jsdom jsdom-global
```

次に、`test/setup.js` の中で:

``` js
require('jsdom-global')()
```

これにより、node にブラウザ環境が追加され、 `vue-test-utils` が正しく動作するようになります。

### 検証ライブラリのピッキング

[Chai](http://chaijs.com/) は Mocha と並んで一般的に使用される一般的な検証ライブラリです。また、スパイとスタブを作成するための [Sinon](http://sinonjs.org/)  をチェックしてみてください。

あるいは、Jest の一部である `expect` を使うことができ、Jest のドキュメントにある[まったく同じAPI](http://facebook.github.io/jest/docs/en/expect.html#content)を公開しています。

ここで `expect` を使用してグローバルに利用できるようにして、すべてのテストでインポートする必要はありません。

``` bash
npm install --save-dev expect
```

次に、`test/setup.js` の中で:

``` js
require('jsdom-global')()

global.expect = require('expect')
```

### テストのための Babel の最適化

JavaScript を処理するには `babel-loader` を使用しています。`.babelrc` ファイルを使ってあなたのアプリでそれを使用しているならば、Babel を設定しておくべきです。`babel-loader` は自動的に同じ設定ファイルを使います。

注意すべき点の 1 つは、Node バージョン 6 以降を使用している場合、ES2015 の大部分の機能を既にサポートしているため、使用している Node のバージョンではサポートされていない機能のみをトランスパイルする Babel の [env オプション](https://babeljs.io/docs/usage/babelrc/#env-option)を設定できます。(例えば`stage-2`や flow 構文のサポートなど)

### テストを追加する

`Counter.vue` という名前の `src` ファイルを作成します。

``` html
<template>
	<div>
	  {{ count }}
	  <button @click="increment">Increment</button>
	</div>
</template>

<script>
export default {
  data () {
    return {
      count: 0
    }
  },

  methods: {
    increment () {
      this.count++
    }
  }
}
</script>
```

次のコードを使って `test/Counter.spec.js` という名前のテストファイルを作成します。

```js
import { shallow } from '@vue/test-utils'
import Counter from '../src/Counter.vue'

describe('Counter.vue', () => {
  it('increments count when button is clicked', () => {
    const wrapper = shallow(Counter)
    wrapper.find('button').trigger('click')
    expect(wrapper.find('div').text()).toMatch('1')
  })
})
```

これでテストを実行できます:

```
npm run unit
```

やったー！テストを実行している!

### カバレッジ

mocha-webpack にコードカバレッジをセットしたい場合は、 [the mocha-webpack code coverage guide](https://github.com/zinserjan/mocha-webpack/blob/master/docs/guides/code-coverage.md) に従ってください。

### リソース

- [この設定のプロジェクトの例](https://github.com/vuejs/vue-test-utils-mocha-webpack-example)
- [Mocha](https://mochajs.org/)
- [mocha-webpack](http://zinserjan.github.io/mocha-webpack/)
- [Chai](http://chaijs.com/)
- [Sinon](http://sinonjs.org/)
- [jest/expect](http://facebook.github.io/jest/docs/en/expect.html#content)
