# はじめる

## セットアップ

`vue-test-utils` の使い方を体験したい場合は、基本設定としてデモリポジトリをクローンし、依存関係をインストールしてください。

``` bash
git clone https://github.com/vuejs/vue-test-utils-getting-started
cd vue-test-utils-getting-started
npm install
```

プロジェクトには単純なコンポーネント、`counter.js` が含まれています。

```js
// counter.js

export default {
  template: `
    <div>
      <span class="count">{{ count }}</span>
      <button @click="increment">Increment</button>
    </div>
  `,

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
```

### マウンティングコンポーネント

`vue-test-utils` は Vue コンポーネントを隔離してマウントし、必要な入力(プロパティ、注入、そしてユーザイベント)をモックし、そして出力(描画結果、カスタムイベントの発行)を検証することでテストします。

マウントされたコンポーネントは [Wrapper](./api/wrapper.md) の内部に返されます。これは、基の Vue コンポーネントインスタンスを操作、トラバース、クエリ処理するための多くの便利なメソッドを公開しています。

`mount` メソッドを使ってラッパを作成することができます。`test.js` というファイルを作りましょう:

```js
// test.js

// test utils から mount() メソッドをインポート
// テストするコンポーネント
import { mount } from '@vue/test-utils'
import Counter from './counter'

// コンポーネントがマウントされ、ラッパが作成されます。
const wrapper = mount(Counter)

// wrapper.vmを 介して実際の Vue インスタンスにアクセスできます
const vm = wrapper.vm

// ラッパをより深く調べるためにコンソールに記録してみましょう。
// vue-test-utils でのあなたの冒険はここから始まります。
console.log(wrapper)
```

### コンポーネントの描画された HTML 出力をテストする

ラッパが完成したので、コンポーネントの描画された HTML 出力が、期待されるものと一致することを確認します。

```js
import { mount } from '@vue/test-utils'
import Counter from './counter'

describe('Counter', () => {
  // コンポーネントがマウントされ、ラッパが作成されます。
  const wrapper = mount(Counter)

  it('renders the correct markup', () => {
    expect(wrapper.html()).toContain('<span class="count">0</span>')
  })

  // 要素の存在を確認することも簡単です
  it('has a button', () => {
    expect(wrapper.contains('button')).toBe(true)
  })
})
```

次に、`npm test` でテストを実行します。テストが合格になるはずです。

### ユーザのインタラクションをシミュレーションする

ユーザがボタンをクリックすると、カウンタがカウントをインクリメントする必要があります。この振る舞いをシミュレートするには、まず**button 要素のラッパ**を返す `wrapper.find()` を使ってボタンを見つける必要があります。ボタンのラッパで `.trigger()` を呼び出すことでクリックをシミュレートできます:

```js
it('button click should increment the count', () => {
  expect(wrapper.vm.count).toBe(0)
  const button = wrapper.find('button')
  button.trigger('click')
  expect(wrapper.vm.count).toBe(1)
})
```

### `nextTick` はどうですか?

Vue は保留した DOM 更新をまとめて処理し、非同期に適用して、複数のデータのミューテーションに起因する不要な再描画を防ぎます。実際には、Vue が何らかの状態変更をトリガした後に Vue が実際の DOM 更新を実行するまで待つために、`Vue.nextTick` を使用しなければならないからです。

使い方を簡単にするため、 `vue-test-utils` はすべての更新を同期的に適用するので、テストで DOM を更新するために `Vue.nextTick` を使う必要はありません。

*注意: 非同期コールバックやプロミスの解決などの操作のために、イベントループを明示的に進める必要がある場合は、まだ `nextTick` が必要です。*

テストファイルで `nextTick` をまだ使う必要がある場合は、 `nextTick` の内部で Promise を使っているので、 `nextTick` 内で発生したエラーはテストランナーによって捕捉されないことに注意してください。これを解決するには2つの方法があります。 1つ目はテストの最初でVueのグローバルエラーハンドラに `done` コールバックをセットする方法です。2つ目は `nextTick` を引数なしで実行して、それを Promise としてテストランナーに返す方法です。

```js
// これは捕捉されない
it('will time out', (done) => {
  Vue.nextTick(() => {
    expect(true).toBe(false)
    done()
  })
})

// 以下の2つのテストは期待通り動作します
it('will catch the error using done', (done) => {
  Vue.config.errorHandler = done
  Vue.nextTick(() => {
    expect(true).toBe(false)
    done()
  })
})

it('will catch the error using a promise', () => {
  return Vue.nextTick()
    .then(function () {
      expect(true).toBe(false)
    })
})
```

## 次は何をするのか

- [テストランナを選ぶ](./choosing-a-test-runner.md)で `vue-test-utils` をプロジェクトに組み込む
- [テストを書くときの一般的なヒント](./common-tips.md)についてもっと知る
