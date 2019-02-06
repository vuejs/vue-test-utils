## TypeScript と一緒に使う

> この記事のサンプルプロジェクトは、 [GitHub](https://github.com/vuejs/vue-test-utils-typescript-example) にあります。

TypeScript は JavaScript に型とクラスを加えた人気のある JavaScript のスーパーセットです。 Vue Test Utils の型定義は、配布されている Vue Test Utils のパッケージに含まれています。だから、Vue Test Utils と TypeScript はうまく動作します。

ここでは、基本的な Vue CLI を使った TypeScript のセットアップから Jest と Vue Test Utils を使用した TypeScript のテストの作成までを解説します。

### TypeScript の追加

最初にプロジェクトを作成します。もし、Vue CLI をインストールしていないなら、 Vue CLI をグローバルにインストールしてください。

```shell
$ npm install -g @vue/cli
```

以下のようにプロジェクトを作成します。

```shell
$ vue create hello-world
```

CLI プロンプトで `Manually select features` を選択します。そして、 TypeScript を選択して Enter キーを押します。これで TypeScript の設定がされているプロジェクトが生成されます。

::: tip 注意
Vue と TypeScript を一緒に使うためのセットアップの詳細は、 [TypeScript Vue starter guide](https://github.com/Microsoft/TypeScript-Vue-Starter) を確認してください。
:::

次にプロジェクトに Jest を加えます。

### Jest のセットアップ

Jest はバッテリー付属のユニットテストソリューションを提供するために Facebook が開発したテストランナです。 Jest の詳細については[公式ドキュメント](https://jestjs.io/) を参照してください。

Jest と Vue Test Utils をインストールします。

```bash
$ npm install --save-dev jest @vue/test-utils
```

次に `test:unit` スクリプトを `package.json` に定義します。

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

### Jest での単一ファイルコンポーネントの処理

Jest が `*.vue` ファイルを処理するために `vue-jest` プリプロセッサをインストールして設定します。

```bash
npm install --save-dev vue-jest
```

次に `jest` ブロックを `package.json` に追加します。

```json
{
  // ...
  "jest": {
    "moduleFileExtensions": [
      "js",
      "ts",
      "json",
      // `*.vue` ファイルを Jest で取り扱います。
      "vue"
    ],
    "transform": {
      // `vue-jest` で　`*.vue` ファイルを処理します。
      ".*\\.(vue)$": "vue-jest"
    },
    "testURL": "http://localhost/"
  }
}
```

### Jest に対応するための TypeScript の設定

テストで TypeScript ファイルを使うために Jest が TypeScript をコンパイルするようにセットアップする必要があります。そのために `ts-jest` をインストールします。

```bash
$ npm install --save-dev ts-jest
```

次に Jest が TypeScript のテストファイルを `ts-jest` で処理するために `package.json` の `jest.transform` に設定を追加します。

```json
{
  // ...
  "jest": {
    // ...
    "transform": {
      // ...
      // `ts-jest` で `*.ts` ファイルを処理します。
      "^.+\\.tsx?$": "ts-jest"
    }
    // ...
  }
}
```

### テストファイルの配置

デフォルトでは、 Jest はプロジェクトにある拡張子が `.spec.js` もしくは `.test.js` のすべてのファイルを対象にします。

拡張子が `.ts` のテストファイルを実行するために、`package.json` ファイルの `testRegex` を変更する必要があります。

以下を `package.json` の `jest` フィールドに追加します。

```json
{
  // ...
  "jest": {
    // ...
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$"
  }
}
```

Jest はテストされるコードと同じディレクトリに `__tests__` ディレクトリを作成することを推奨していますが、あなたにとってテストに適したディレクトリ構造にして構いません。ただ、Jest は `__snapshots__` ディレクトリをスナップショットテストを実施するテストファイルと同じディレクトリに作成することに注意してください。

### ユニットテストを書く

これでプロジェクトのセットアップが完了しました。今度はユニットテストを作成します。

`src/components/__tests__/HelloWorld.spec.ts` ファイルを作成して、以下のコードを加えます。

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

これが TypeScript と Vue Test Utils を協業させるために必要なことすべてです!

### リソース

- [この記事のサンプルプロジェクト](https://github.com/vuejs/vue-test-utils-typescript-example)
- [Jest](https://jestjs.io/)
