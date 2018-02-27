# テストランナを選ぶ

テストランナは、テストを実行するプログラムです。

多くの一般的な JavaScript テストランナがあり、`vue-test-utils` はそれらすべてで動作します。テストランナにとらわれません。

ですが、テストランナを選択する際には、機能セット、パフォーマンス、および単一ファイルコンポーネント (SFC) の事前コンパイルのサポートなどを考慮すべきです。既存のライブラリを慎重に比較した上で、以下の2つのテストランナをお勧めします:

- [Jest](https://facebook.github.io/jest/docs/en/getting-started.html#content) は最も充実したテストランナです。最小の設定が必要で、デフォルトで JSDOM を設定し、組み込みの検証を提供し、コマンドラインのユーザーエクスペリエンスが優れています。ただし、テストで SFC コンポーネントをインポートできるようにするには、プリプロセッサが必要です。最も一般的な SFC 機能を処理できる `vue-jest` プリプロセッサを作成しましたが、現在 `vue-loader` と 100% 同じ機能を持っていません。

- [mocha-webpack](https://github.com/zinserjan/mocha-webpack) は webpack + Mocha のラッパですが、より合理的なインタフェースと watch モードを備えています。この設定のメリットは、webpack + `vue-loader` を使用して完全な SFC サポートを得ることができるということですが、より多くの設定を行う必要があります。

## ブラウザ環境

`vue-test-utils` はブラウザ環境に依存します。技術的には、実際のブラウザで実行することはできますが、異なるプラットフォーム上で実際のブラウザを起動するという複雑さのため、お勧めできません。代わりに、[JSDOM](https://github.com/tmpvar/jsdom) を使用して仮想ブラウザ環境で Node.js でテストを実行することをお勧めします。

Jest テストランナーは JSDOM を自動的に設定します。他のテストランナーの場合は、[jsdom-global](https://github.com/rstacruz/jsdom-global) を使用してテスト用の JSDOM を手動で設定できます:

``` bash
npm install --save-dev jsdom jsdom-global
```
---
``` js
// テストのセットアップと登録
require('jsdom-global')()
```

## 単一ファイルコンポーネントをテストする

単一ファイルコンポーネントは、ノードまたはブラウザで実行する前に事前コンパイルが必要です。コンパイルを実行するには、Jest プリプロセッサを使用する方法と webpack を直接使用する方法が推奨されます。

`vue-jest` プリプロセッサは基本的な SFC 機能をサポートしていますが、現在 `vue-loader` でのみサポートされているスタイルブロックやカスタムブロックは扱いません。これらの機能やその他の Webpack 固有の設定に依存する場合は、webpack + `vue-loader` ベースの設定を使用する必要があります。

さまざまな設定については、次のガイドをお読みください:
- [Jest による単一ファイルコンポーネントのテスト](./testing-SFCs-with-jest.md)
- [Mocha + webpack による単一ファイルコンポーネントのテスト](./testing-SFCs-with-mocha-webpack.md)

## リソース

- [テストランナの性能比較](https://github.com/eddyerburgh/vue-unit-test-perf-comparison)
- [Jest のプロジェクト例](https://github.com/vuejs/vue-test-utils-jest-example)
- [Mocha のプロジェクト例](https://github.com/vuejs/vue-test-utils-mocha-webpack-example)
- [tape のプロジェクト例](https://github.com/eddyerburgh/vue-test-utils-tape-example)
- [AVA のプロジェクト例](https://github.com/eddyerburgh/vue-test-utils-ava-example)
