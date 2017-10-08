# 入門

## セットアップ

`vue-test-utils`の使い方を体験したい場合は、基本設定としてデモリポジトリをクローンし、依存関係をインストールしてください。

``` bash
git clone https://github.com/vuejs/vue-test-utils-getting-started
cd vue-test-utils-getting-started
npm install
```

**注意:** `vue-test-utils`を利用してVueコンポーネントをテストするには [Karma](https://karma-runner.github.io/1.0/index.html) のようなテストランナー、`jsDOM`(例:[jest](https://facebook.github.io/jest/), [ava](https://github.com/avajs/ava))などの仮想DOMをサポートするnodeの実行環境を使用してください

counterのようなシンプルなVueコンポーネントをテストしてこれらのutilsの使い方を感じてみましょう。


```js
// counter.js

export default {
  template: `
    <div>
      {{ count }}
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

このコンポーネントはとても基本的な機能のコンポーネントです、とは言ってもここでテストはできません。`vue-test-utils`というラッパーを使うことでVueコンポーネントとやり取りをします。このラッパーには便利なヘルパーがたくさんあり、複雑な仕様も簡単に書くことができるはずです。さっそく始めましょう。

### コンポーネントをラップする方法

上に書いたように、ラッパーはコンポーネントと効率よくやり取りをする核となる要素です。手順は以下のようになります。

```js
// test utilsからmount（）メソッドをインポートします
// コンポーネントをテストします

import { mount } from 'vue-test-utils'
import Counter from './counter'

// コンポーネントをマウントすることでラッパーを取得します
const wrapper = mount(Counter)

// ラッパーをより深く調べるためにconsole.logを実行してみましょう
// あなたのvue-test-utilsはここから始まります
console.log(wrapper)
```

既に最初のハードルを越えました。とても簡単にできましたね。このように、ラッパーを上手に使いましょう。

### コンポーネントのレンダリングされたHTML出力をテストする

はじめに、レンダリングされたHTML出力が期待通りに見えることを確認するとよいでしょう。

```js
// html出力を取得するために、ラッパーはhtml（）メソッドを提供します。
describe('Counter', () => {
  it('renders the correct markup', () => {
    expect(wrapper.html()).to.equal('<div>0<button>Increment</button></div>')
  })

  // 要素の存在を調べるのも簡単です。
  it('has a button', () => {
    expect(wrapper.contains('button')).to.equal(true)
  })
})
```

簡単だったので、次に行きましょう。

### Component data

効率のいいテストをするにはコンポーネントのデータを変更することがとても便利です。`setData({...})`メソッドはインスタンス上のデータを変更するためのものです。`vm`を使うことでやり取りすることができます。全てのvalueとcomputed propertyを自動的にgetterとしてルートインスタンスに設定をするため、直接アクセスすることができます。
仕様に応じてデータを変更することが良い場合もある際は、`beforeEach()`を使うと良いでしょう。

```js

describe('Data interactions', () => {
  beforeEach(() => {
    wrapper.setData({ count: 10 })
  })

  it('should be set to 10', () => {
    expect(wrapper.vm.count).to.equal(10)
  })
})

```

### インタラクション

このセクションではラッパーオブジェクトの2つの重要なメソッドを紹介します。
コンポーネントのHTML要素の中でHTML要素を見つけるために`find()`を呼び出し、`trigger()`でイベントを発生させます。

```js

describe('Trigger an event', () => {
  it('button should increment the count', () => {
    expect(wrapper.vm.count).to.equal(0)
    const button = wrapper.find('button')
    button.trigger('click')
    expect(wrapper.vm.count).to.equal(1)
  })
})

```

### 非同期DOMの更新処理

Vueは、内部の `tick` 'に基づいてDOMを更新し、たくさんのデータが変更された場合に不要な再レンダリングを防止します。そのため、`Vue.nextTick（...）`はDOMの変更が正しく適用されたことを確認し、その直後にコールバックを渡すことができます。幸いにも、`vue-test-utils`はここでもカバーされています。`update（）`メソッドは強制的に再レンダリングし、その後で `html（）`を使うと更新されたDOMがreturnされます。

```js

describe('DOM updates', () => {
  it('html() should account for async DOM updates', () => {
    expect(wrapper.html()).to.equal('<div>0<button>Increment</button></div>')
    wrapper.setData({ count: 23 })
    wrapper.update()
    expect(wrapper.html()).to.equal('<div>23<button>Increment</button></div>')
  })
})

```

## 驚き

もちろん`vue-test-utils`はこれだけではありません。[提供されているAPI](SUMMARY.md)の一覧で探すことをおすすめします。

`vue-test-utils`と様々なテストランナーにて問題が起こった場合、公式のリポジトリを見てください。[vue-test-utils](https://github.com/vuejs/vue-test-utils)
