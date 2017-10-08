# 入門

## セットアップ

`vue-test-utils`の使い方を体験したい場合は、基本設定としてデモリポジトリをクローンし、依存関係をインストールしてください。

``` bash
git clone https://github.com/vuejs/vue-test-utils-getting-started
cd vue-test-utils-getting-started
npm install
```

プロジェクトには単純なコンポーネント、`counter.js`が含まれています。

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

`vue-test-utils`はVueコンポーネントを隔離してマウントし、必要な入力(props,注入、ユーザイベント)をモックにし出力されたものを検証することで結果を出力します。

マウントされたコンポーネントは[Wrapper](./api/wrapper.md)の内部に返されます。これは、基のVueコンポーネントインスタンスを操作、トラバース、クエリングするための多くの便利なメソッドを公開しています。

`mount`メソッドを使ってラッパを作成することができます。 `test.js`というファイルを作りましょう。：

```js
// test.js

// test utilsからmount()メソッドをインポート
// テストするコンポーネント
import { mount } from 'vue-test-utils'
import Counter from './counter'

//コンポーネントがマウントされ、ラッパが作成されます。
const wrapper = mount(Counter)

// wrapper.vmを介して実際のVueインスタンスにアクセスできます
const vm = wrapper.vm

// ラッパをより深く調べるためにコンソールに記録してみましょう。
// vue-test-utilsでのあなたの冒険はここから始まります。
console.log(wrapper)
```

### コンポーネントのレンダリングされたHTML出力をテストする

ラッパが完成したので、コンポーネントのレンダリングされたHTML出力が、期待されるものと一致することを確認します。

```js
import { mount } from 'vue-test-utils'
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

次に、`npm test`でテストを実行します。テストが合格になるはずです。

### ユーザのインタラクションをシミュレーションする

ユーザがボタンをクリックすると、カウンターがカウントをインクリメントする必要があります。この振る舞いをシミュレートするには、まず**button要素のラッパ**を返す`wrapper.find()`を使ってボタンを見つける必要があります。ボタンのラッパで`.trigger()`を呼び出すことでクリックをシミュレートできます。:

```js
it('button click should increment the count', () => {
  expect(wrapper.vm.count).toBe(0)
  const button = wrapper.find('button')
  button.trigger('click')
  expect(wrapper.vm.count).toBe(1)
})
```

### `nextTick`はどうですか?

VueバッチはDOM更新を保留し、非同期的に適用して、複数のデータのミューテーションに起因する不要な再レンダリングを防ぎます。実際には、Vueが何らかの状態変更をトリガーした後にVueが実際のDOM更新を実行するまで待つために、`Vue.nextTick`を使用しなければならないからです。

使い方を簡単にするため、 `vue-test-utils`はすべての更新を同期的に適用するので、テストで`Vue.nextTick`を使う必要はありません。

## 次はなにをするのか

- [テストランナーを選ぶ](./choosing-a-test-runner.md)で`vue-test-utils`をプロジェクトに組み込みます。
- [テストを書くときの一般的なテクニック](./common-tips.md)についてもっと知る。
