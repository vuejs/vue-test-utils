# テストランナーを選ぶ

テストランナーは、テストを実行するプログラムです。

多くの一般的なJavaScriptテストランナーがあり、`vue-test-utils`はそれらすべてで動作します。テストランナーにとらわれません。

テストランナーを選択する際には、フィーチャセット、パフォーマンス、およびシングルファイルコンポーネント（SFC）の事前コンパイルのサポートが考慮されます。既存のライブラリを慎重に比較した上で、以下の2つのテストランナーをお勧めします。:

- [Jest](https://facebook.github.io/jest/docs/en/getting-started.html#content) は最も充実したテストランナーです。最小の設定が必要で、デフォルトでJSDOMを設定し、組み込みのアサーションを提供し、コマンドラインのユーザーエクスペリエンスが優れています。ただし、テストでSFCコンポーネントをインポートできるようにするには、プリプロセッサが必要です。最も一般的なSFC機能を処理できる `jest-vue`プリプロセッサを作成しましたが、現在`vue-loader`に100％の機能パリティを持っていません。

- [mocha-webpack](https://github.com/zinserjan/mocha-webpack) はwebpack + Mochaのラッパですが、より合理的なインターフェースとwatchモードを備えています。この設定のメリットは、webpack + `vue-loader`を使用して完全なSFCサポートを得ることができるということですが、より多くの設定を行う必要があります。

## ブラウザ環境

`vue-test-utils`はブラウザ環境に依存します。技術的には、実際のブラウザで実行することはできますが、異なるプラットフォーム上で実際のブラウザを起動するという複雑さのため、お勧めできません。代わりに、[JSDOM](https://github.com/tmpvar/jsdom)を使用して仮想ブラウザ環境でNode.jsでテストを実行することをお勧めします。

JestテストランナーはJSDOMを自動的に設定します。他のテストランナーの場合は、[jsdom-global](https://github.com/rstacruz/jsdom-global) を使用してテスト用のJSDOMを手動で設定できます。:

``` bash
npm install --save-dev jsdom jsdom-global
```
---
``` js
// テストのセットアップと登録
require('jsdom-global')()
```

## 単一ファイルコンポーネントをテストする

単一ファイルコンポーネントは、ノードまたはブラウザで実行する前に事前コンパイルが必要です。コンパイルを実行するには、Jestプリプロセッサを使用する方法とwebpackを直接使用する方法が推奨されます。

The `jest-vue`プリプロセッサは基本的なSFC機能をサポートしていますが、現在`vue-loader`でのみサポートされているスタイルブロックやカスタムブロックは扱いません。これらの機能やその他のWebpack固有の設定に依存する場合は、webpack + `vue-loader`ベースの設定を使用する必要があります。

さまざまな設定については、次のガイドをお読みください。:
- [Jestによる単一ファイルコンポーネントのテスト](./testing-SFCs-with-jest.md)
- [Mocha + webpackによる単一ファイルコンポーネントのテスト](./testing-SFCs-with-mocha-webpack.md)

## リソース

- [テストランナーの性能比較](https://github.com/eddyerburgh/vue-unit-test-perf-comparison)
- [Jestのプロジェクト例](https://github.com/vuejs/vue-test-utils-jest-example)
- [Mochaのプロジェクト例](https://github.com/vuejs/vue-test-utils-mocha-webpack-example)
- [tapeのプロジェクト例](https://github.com/eddyerburgh/vue-test-utils-tape-example)
- [AVAのプロジェクト例](https://github.com/eddyerburgh/vue-test-utils-ava-example)
