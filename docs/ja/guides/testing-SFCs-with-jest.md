# Jest を使用した単一ファイルコンポーネントのテスト

> このセットアップのサンプルプロジェクトは、 [GitHub](https://github.com/vuejs/vue-test-utils-jest-example) にあります。

Jest は Facebook が開発したテストランナであり、ユニットテストソリューションの提供を目指しています。 Jest の詳細については、[公式ドキュメント](https://facebook.github.io/jest/)を参照してください。

## Jest のセットアップ

既に、webpack、vue-loader、および Babel が正しく設定されている設定から始めると仮定します。例: `vue-cli` によって雛形生成された `webpack-simple` テンプレートです。

まず Jest と `vue-test-utils` をインストールします:

```bash
$ npm install --save-dev jest @vue/test-utils
```

次に、`package.json` にスクリプトを定義する必要があります。

```json
// package.json
{
  "scripts": {
    "test": "jest"
  }
}
```

## Jest における単一ファイルコンポーネントの処理

Jest に `*.vue` ファイルの処理方法を教えるために、`vue-jest` プリプロセッサをインストールして設定する必要があります。：

``` bash
npm install --save-dev vue-jest
```

次に、`package.json` に `jest` ブロックを作成します:

``` json
{
  // ...
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      // *.vue ファイルを処理するように Jest に指示する
      "vue"
    ],
    "transform": {
      // vue-jest で *.vue ファイルを処理する
      ".*\\.(vue)$": "<rootDir>/node_modules/vue-jest"
    },
    "mapCoverage": true
  }
}
```

> **注意:** `vue-jest` は現在、カスタムブロックのサポートやスタイルのロードなど、`vue-loader` のすべての機能をサポートしていません。さらに、コード分割などのWebpack固有の機能はサポートされていません。それらを使用するには、[Mocha + webpackによる単一ファイルコンポーネントのテスト](./testing-SFCs-with-mocha-webpack.md)のガイドをお読みください。

## Webpack エイリアスの処理

webpack 設定で、`@` を `/src` のエイリアスにしたいといった場合、`moduleNameMapper`オプションを使って Jest の設定を追加する必要があります

``` json
{
  // ...
  "jest": {
    // ...
    // ソースコードにある @ を src へと割当てる
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

## Jest のための Babel の設定

Node の最新バージョンではすでにほとんどの ES2015 機能がサポートされていますが、テストでは ES Modules 構文と stage-x 機能を使用することができます。そのために、`babel-jest` をインストールする必要があります。

``` bash
npm install --save-dev babel-jest
```

次に、Jest に `babel-jest` で JavaScript テストファイルを処理するよう、`package.json` の `jest.transform` の中にエントリを追加する必要があります:

``` json
{
  // ...
  "jest": {
    // ...
    "transform": {
      // ...
      // babel-jest で js を処理する
      "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
    },
    // ...
  }
}
```

> デフォルトでは、`babel-jest` はインストールしさえすれば自動的に設定します。しかし、`*.vue` ファイルのための変換を明示的に追加したため、`babel-jest` も明示的に設定する必要があります。

webpack で `babel-preset-env` を使用するとした場合、webpack は ES Modules 処理方法を既に知っているので、デフォルトの Babel 設定は ES Modules のトランスパイルを無効にします。ただし、Jest テストは Node で直接実行されるため、テスト用に有効にする必要があります。

また、`babel-preset-env` に、使用している Node のバージョンを指定するように指示することもできます。これにより不要な機能をスキップし、テストがより速く起動します。

これらのオプションをテストのためだけに適用するには、 `env.test` の下に別の設定をします（これは `babel-jest` によって自動的に選択されます）。

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

## スナップショットテスト

[`vue-server-renderer`](https://github.com/vuejs/vue/tree/dev/packages/vue-server-renderer) を使ってコンポーネントを文字列に描画して保存することができます。[Jest のスナップショットテスト](https://facebook.github.io/jest/docs/en/snapshot-testing.html) のスナップショットとして表示されます。 

`vue-server-renderer` の描画結果には、いくつかの SSR (Server-Side Rendering: サーバサイドレンダリング) 固有の属性が含まれており、空白を無視するため、diff をスキャンするのが難しくなります。カスタムシリアライザを使用して、保存されたスナップショットを改善することができます。

``` bash
npm install --save-dev jest-serializer-vue
```

次に `package.json` で設定します:

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

## テストファイルの配置

デフォルトでは、Jest はプロジェクト全体で `.spec.js` または `.test.js` 拡張子を持つすべてのファイルを再帰的に取得します。これがあなたのニーズに合わない場合は、`package.json` ファイルの config セクションで[testRegex を変更する](https://facebook.github.io/jest/docs/en/configuration.html#testregex-string)ことが可能です。

Jestは、テスト対象のコードのすぐ隣に`__tests__`ディレクトリを作成することを推奨していますが、適切にテストを構造化することは自由です。 Jestがスナップショットテストを実行するテストファイルの隣に`__snapshots__`ディレクトリを作成することに注意してください。

## カバレッジ

Jest は複数のフォーマットでカバレッジを取ることができます。 以下はそれをするための簡単な例です。

`jest` の設定 (普通は `package.json` か `jest.config.js`) に [collectCoverage](https://facebook.github.io/jest/docs/en/configuration.html#collectcoverage-boolean) オプションを加えます。それから、カバレッジを収集する対象のファイルを [collectCoverageFrom](https://facebook.github.io/jest/docs/en/configuration.html#collectcoveragefrom-array) に配列で定義します。 正確なカバレッジデータのために [mapCoverage](https://facebook.github.io/jest/docs/en/configuration.html#mapcoverage-boolean) を `true` にします。

```json
{
  "jest": {
    // ...
    "collectCoverage": true,
    "collectCoverageFrom": [
      "**/*.{js,vue}",
      "!**/node_modules/**"
    ],
    "mapCoverage": true
  }
}
```

[デフォルトのカバレッジレポーター](https://facebook.github.io/jest/docs/en/configuration.html#coveragereporters-array-string)のカバレッジレポートは有効になります。 `coverageReporters` オプションでそれらをカスタマイズすることができます。

```json
{
  "jest": {
    // ...
    "coverageReporters": ["html", "text-summary"]
  }
}
```

より詳しい情報は [Jest configuration documentation](https://facebook.github.io/jest/docs/en/configuration.html#collectcoverage-boolean) にあります。 カバレッジの閾値やターゲットを出力するディレクトリなどのオプションが記載されています。


## Spec の例

あなたが Jasmine をよく知っているなら、Jest の [assertion API](https://facebook.github.io/jest/docs/en/expect.html#content)は自宅のように感じるはずです。

```js
import { mount } from '@vue/test-utils'
import Component from './component'

describe('Component', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(Component)
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})
```

## リソース

- [このセットアップのプロジェクト例](https://github.com/vuejs/vue-test-utils-jest-example)
- [Vue Conf 2017のスライド](https://github.com/codebryo/vue-testing-with-jest-conf17)
- [Jest](https://facebook.github.io/jest/)
- [Babel preset env](https://github.com/babel/babel-preset-env)
