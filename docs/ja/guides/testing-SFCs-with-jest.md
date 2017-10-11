# Jestを使用した単一ファイルコンポーネントのテスト

> このセットアップのサンプルプロジェクトは、 [GitHub](https://github.com/vuejs/vue-test-utils-jest-example)にあります。

JestはFacebookが開発したテストランナーであり、ユニットテストソリューションの提供を目指しています。 Jestの詳細については、[公式ドキュメント](https://facebook.github.io/jest/)を参照してください。

## Jestのセットアップ

既に、webpack、vue-loader、およびBabelが正しく設定されている設定から始めると仮定します。例:`vue-cli`によってscaffoldされた`webpack-simple`テンプレートです。

まずJestと `vue-test-utils`をインストールします。:

```bash
$ npm install --save-dev jest vue-test-utils
```

次に、`package.json`にスクリプトを定義する必要があります。

```json
// package.json
{
  "scripts": {
    "test": "jest"
  }
}
```

## Jestにおける単一ファイルコンポーネントの処理

Jestに `*.vue`ファイルの処理方法を教えるために、`jest-vue`プリプロセッサをインストールして設定する必要があります。：

``` bash
npm install --save-dev jest-vue
```

次に、`package.json`に`jest`ブロックを作成します:

``` json
{
  // ...
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      // *.vueファイルを処理するようにJestに指示する
      "vue"
    ],
    "transform": {
      // jest-vueで*.vueファイルを処理する
      ".*\\.(vue)$": "<rootDir>/node_modules/jest-vue"
    },
    "mapCoverage": true
  }
}
```

> **注意:** `jest-vue`は現在、カスタムブロックのサポートやスタイルのロードなど、`vue-loader`のすべての機能をサポートしていません。さらに、コード分割などのWebpack固有の機能はサポートされていません。それらを使用するには、[Mocha + webpackによる単一ファイルコンポーネントのテスト](./testing-SFCs-with-mocha-webpack.md)のガイドをお読みください。

## Webpackエイリアスの処理

webpack設定で、`@`を`/src`のエイリアスにしたいといった場合、`moduleNameMapper`オプションを使ってJestの設定を追加する必要があります

``` json
{
  // ...
  "jest": {
    // ...
    // ソースコードにある@ を src へと割当てる
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

## JestのためのBabelの設定

nodeの最新バージョンではすでにほとんどのES2015機能がサポートされていますが、テストではESモジュール構文とstage-x機能を使用することができます。そのために、`babel-jest`をインストールする必要があります。

``` bash
npm install --save-dev babel-jest
```

次に、Jestに`babel-jest`でJavaScriptテストファイルを処理するよう、`package.json`の`jest.transform`の中にエントリを追加する必要があります。:

``` json
{
  // ...
  "jest": {
    // ...
    "transform": {
      // ...
      // babel-jestでjsを処理する
      "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
    },
    // ...
  }
}
```

> デフォルトでは、`babel-jest`はインストールされている間自動的に設定します。しかし、`*.vue`ファイルのための変換を明示的に追加したため、`babel-jest`も明示的に設定する必要があります。

webpackで `babel-preset-env`を使用するとした場合、webpackはESモジュールの処理方法を既に知っているので、デフォルトのBabel configはESモジュールのトランスパイルを無効にします。ただし、JestテストはNodeで直接実行されるため、テスト用に有効にする必要があります。

また、`babel-preset-env`に、使用しているNodeのバージョンを指定するように指示することもできます。これにより不要な機能をスキップし、テストがより速く起動します。

これらのオプションをテストのためだけに適用するには、 `env.test`の下に別の設定をします（これは`babel-jest`によって自動的に選択されます）。

例 `.babelrc`:

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

### スナップショットテスト

[`vue-server-renderer`](https://github.com/vuejs/vue/tree/dev/packages/vue-server-renderer) を使ってコンポーネントを文字列にレンダリングして保存することができます。[Jestのスナップショットテスト](https://facebook.github.io/jest/docs/en/snapshot-testing.html) のスナップショットとして表示されます。 

`vue-server-renderer`のレンダリング結果には、いくつかのSSR固有の属性が含まれており、空白を無視するため、diffをスキャンするのが難しくなります。カスタムシリアライザを使用して、保存されたスナップショットを改善することができます。

``` bash
npm install --save-dev jest-serializer-vue
```

次に`package.json`で設定します:

``` json
{
  // ...
  "jest": {
    // ...
    // スナップショットのシリアライザ
    "snapshotSerializers": [
      "<rootDir>/node_modules/jest-serializer-vue"
    ]
  }
}
```

### テストファイルの配置

デフォルトでは、jestはプロジェクト全体で `.spec.js`または`.test.js`拡張子を持つすべてのファイルを再帰的に取得します。これがあなたのニーズに合わない場合は、`package.json`ファイルのconfigセクションで[testRegexを変更する](https://facebook.github.io/jest/docs/en/configuration.html#testregex-string)ことが可能です。

Jestは、テスト対象のコードのすぐ隣に`__tests__`ディレクトリを作成することを推奨していますが、適切にテストを構造化することは自由です。 Jestがスナップショットテストを実行するテストファイルの隣に`__snapshots__`ディレクトリを作成することに注意してください。

### 仕様例

あなたがJasmineをよく知っているなら、Jestの[assertion API](https://facebook.github.io/jest/docs/en/expect.html#content)は自宅のように感じるはずです。

```js
import { mount } from 'vue-test-utils'
import Component from './component'

describe('Component', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(Component)
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})
```

### Resources

- [このセットアップのプロジェクト例](https://github.com/vuejs/vue-test-utils-jest-example)
- [Vue Conf 2017のスライド](https://github.com/codebryo/vue-testing-with-jest-conf17)
- [Jest](https://facebook.github.io/jest/)
- [Babel preset env](https://github.com/babel/babel-preset-env)
