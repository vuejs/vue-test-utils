# Mocha + webpackによる単一ファイルコンポーネントのテスト

> このセットアップのサンプルプロジェクトは、 [GitHub](https://github.com/vuejs/vue-test-utils-mocha-webpack-example)にあります。

単一ファイルコンポーネントをテストするためのもう一つの戦略は、webpackを使用してすべてのテストをコンパイルし、それをテストランナーで実行することです。このアプローチの利点は、すべてのwebpackと`vue-loader`機能を完全にサポートしていることです。ソースコードに妥協する必要はありません。

技術的に好きなテストランナーを使用して結びつけることができますが、この特定の作業に非常に合理的な経験を提供するために[`mocha-webpack`](https://github.com/zinserjan/mocha-webpack)を見つけました。

## `mocha-webpack`の設定

既に、webpack、vue-loader、およびBabelが正しく設定されている設定から始めると仮定します。例:`vue-cli`によってscaffoldされた`webpack-simple`テンプレートです。

最初に行うことは、テストの依存関係をインストールすることです。:

``` bash
npm install --save-dev vue-test-utils mocha mocha-webpack
```

次に、`package.json`にスクリプトを定義する必要があります。

```json
// package.json
{
  "scripts": {
    "test": "mocha-webpack --webpack-config webpack.config.js --require test/setup.js test/**/*.spec.js"
  }
}
```

ここで注意すべき点がいくつかあります。:

- `--webpack-config`フラグはテストに使うwebpack設定ファイルを指定します。ほとんどの場合、これは実際のプロジェクトで使用する設定と同じですが、小さな調整が1つあります。これについては後で話します。

- `--require`フラグは、テストの前に`test/setup.js`ファイルが実行されることを保証します。このテストでは、テストを実行するためのグローバル環境を設定できます。

- 最後の引数は、テストバンドルに含まれるテストファイルのグロブです。

### 別のwebpackの設定

#### NPM依存関係の外部化

私たちのテストでは、いくつかのNPM依存関係をインポートする可能性があります。これらのモジュールの中には、ブラウザの使用を念頭に置いて記述されているものもあれば、webpackによって適切にバンドルされていないものもあります。依存関係を外部化することにより、テストの起動速度が大幅に向上するというもう一つの考慮すべき点としてあります。`webpack-node-externals`を使ってNPMの依存関係をすべて外部化することができます。:

```js
// webpack.config.js
const nodeExternals = require('webpack-node-externals')

module.exports = {
  // ...
  externals: [nodeExternals()]
}
```

#### ソースマップ

ソースマップは、`mocha-webpack`によってピックアップされるようにインライン化する必要があります。推奨設定は次のとおりです。:

``` js
module.exports = {
  // ...
  devtool: 'inline-cheap-module-source-map'
}
```

IDE経由でデバッグする場合は、以下を追加することをお勧めします。:

``` js
module.exports = {
  // ...
  output: {
    // ...
    // ソースマップで絶対パスを使用する（IDE経由のデバッグで重要）
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  }
}
```

### ブラウザ環境の設定

`vue-test-utils`はブラウザ環境を必要とします。 `jsdom-global`を使ってNode.jsでシミュレーションすることができます。:

```bash
npm install --save-dev jsdom jsdom-global
```

次に、`test/setup.js`の中で:

``` js
require('jsdom-global')()
```

これにより、nodeにブラウザ環境が追加され、 `vue-test-utils`が正しく動作するようになります。

### 検証ライブラリのピッキング

[Chai](http://chaijs.com/) is Mochaと並行して一般的に使用される一般的なアサーションライブラリです。また、スパイとスタブを作成するための[Sinon](http://sinonjs.org/) をチェックしてみてください。

あるいは、Jestの一部である `expect`を使うことができ、Jest docsにある[まったく同じAPI](http://facebook.github.io/jest/docs/en/expect.html#content)を公開しています。

ここで`expect`を使用してグローバルに利用できるようにして、すべてのテストでインポートする必要はありません。

``` bash
npm install --save-dev expect
```

次に、`test/setup.js`の中で:

``` js
require('jsdom-global')()

global.expect = require('expect')
```

### テストのためのBabelの最適化

JavaScriptを処理するには `babel-loader`を使用しています。あなたが`.babelrc`ファイルを使ってあなたのアプリでそれを使用しているならば、Babelを設定しておくべきです。`babel-loader`は自動的に同じ設定ファイルを使います。

注意すべき点の1つは、ノード6+を使用している場合、ES2015の大部分の機能を既にサポートしているため、使用しているノードのバージョンではサポートされていない機能のみをトランスパイルするBabelの[envオプション](https://babeljs.io/docs/usage/babelrc/#env-option)を設定できます。(例えば`stage-2`やflow syntax supportなど)

### テストを追加する

`Counter.vue`という名前の`src`ファイルを作成します。

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

次のコードを使って`test/Counter.spec.js`という名前のテストファイルを作成します。

```js
import { shallow } from 'vue-test-utils'
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

やったー！,テストを実行している!

### リソース

- [この設定のプロジェクトの例](https://github.com/vuejs/vue-test-utils-mocha-webpack-example)
- [Mocha](https://mochajs.org/)
- [mocha-webpack](http://zinserjan.github.io/mocha-webpack/)
- [Chai](http://chaijs.com/)
- [Sinon](http://sinonjs.org/)
- [jest/expect](http://facebook.github.io/jest/docs/en/expect.html#content)
