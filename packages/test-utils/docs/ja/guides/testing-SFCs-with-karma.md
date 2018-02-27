# Karma による単一ファイルコンポーネントのテスト

> このセットアップの例は [GitHub](https://github.com/eddyerburgh/vue-test-utils-karma-example) にあり、利用可能です。

Karma はブラウザを起動し、テストを実行しそれをレポートするテストランナーです。ここではテストを書くために Mocha を使用します。テストアサーションのために Chai を使用します。

## Mocha をセットアップする

セットアップを始めるにあたって `vue-cli` でスキャフォールドされた `webpack-simple` テンプレートのように Webpack 、vue-loader 、 Babel が既に設定されていることを想定しています。

最初にテストに必要なライブラリをインストールします。

``` bash
npm install --save-dev @vue/test-utils karma karma-chrome-launcher karma-mocha karma-sourcemap-loader karma-spec-reporter karma-webpack mocha
```

次に test スクリプトを `package.json` に定義します。

```json
// package.json
{
  "scripts": {
    "test": "karma start --single-run"
  }
}
```

- `--single-run` フラグは Karma にテストスウィートを1回実行するように指定します。

### Karma の設定

プロジェクトディレクトリのトップに karma.conf.js ファイルを作成します。

```js
// karma.conf.js

var webpackConfig = require('./webpack.config.js')

module.exports = function (config) {
  config.set({
    frameworks: ['mocha'],

    files: [
      'test/**/*.spec.js'
    ],

    preprocessors: {
      '**/*.spec.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    reporters: ['spec'],

    browsers: ['Chrome']
  })
}
```

このファイルは Karma を設定するために使用されます。

ファイルを Webpack で前処理する必要があります。そのために、 Webpack をプリプロセッサとして加えます。そして、 Webpack の設定を含めます。プロジェクトに元々あった Webpack の設定ファイルを変更なしで使用することができます。

この設定では、 Chrome でテストを実行します。他のブラウザを加える方法は [Karma のドキュメントにあるブラウザセクション](http://karma-runner.github.io/2.0/config/browsers.html) を見てください。

### アサーションライブラリを選ぶ

[Chai](http://chaijs.com/) はよく Mocha と一緒に使用される人気のあるアサーションライブラリです。spy と stub を生成するために [Sinon](http://sinonjs.org/) を見てみるとよいかもしれません。

テストで `Chai` を使うために `karma-chai` プラグインをインストールします。

``` bash
npm install --save-dev karma-chai
```

### テストを加える

`Counter.vue` ファイルを `src` ディレクトリに作成します。

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

そして、以下のようなコードの `test/Counter.spec.js` という名前のテストファイルを作成します。

```js
import { expect } from 'chai'
import { shallow } from '@vue/test-utils'
import Counter from '../src/Counter.vue'

describe('Counter.vue', () => {
  it('increments count when button is clicked', () => {
    const wrapper = shallow(Counter)
    wrapper.find('button').trigger('click')
    expect(wrapper.find('div').text()).contains('1')
  })
})
```

テストを実行できるようになりました。

```
npm run test
```

やった!テストが走った。

### カバレッジ

Karma にコードカバレッジをセットアップするために、 `karma-coverage` プラグインを使います。

デフォルトでは、 `karma-coverage` はソースマップをカバレッジレポートをマップすることに使用しません。だから、確実に正しくカバレッジがマップされるために `babel-plugin-istanbul` を使用します。

`karma-coverage` と `babel-plugin-istanbul` と `cross-env` をインストールします。

```
npm install --save-dev karma-coverage cross-env
```

環境変数の `BABEL_ENV` をセットするために `cross-env` を使います。テストをコンパイルする時に `babel-plugin-istanbul` を使用します。プロダクションコードをコンパイルする時は `babel-plugin-istnabul` を含めるべきではありません。

```
npm install --save-dev babel-plugin-istanbul
```

`BABEL_ENV` に test がセットされた時、 `babel-plugin-istanbul` を使用するために `.babelrc` ファイルを変更します。

```json
{
  "presets": [
    ["env", { "modules": false }],
    "stage-3"
  ],
  "env": {
    "test": {
      "plugins": ["istanbul"]
    }
  }
}
```

カバレッジを取るために karma.conf.js ファイルを変更します。 `coverage` を reporters 配列に加えます。そして、 coverageReporter を加えます。

```js
// karma.conf.js

module.exports = function (config) {
  config.set({
  // ...

    reporters: ['spec', 'coverage'],

    coverageReporter: {
      dir: './coverage',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' }
      ]
    }
  })
}
```

そして、 `BABEL_ENV` をセットするために `test` スクリプトを変更します。

```json
// package.json
{
  "scripts": {
    "test": "cross-env BABEL_ENV=test karma start --single-run"
  }
}
```

### リソース

- [このセットアップの例](https://github.com/eddyerburgh/vue-test-utils-karma-example)
- [Karma](http://karma-runner.github.io/)
- [Mocha](https://mochajs.org/)
- [Chai](http://chaijs.com/)
- [Sinon](http://sinonjs.org/)
