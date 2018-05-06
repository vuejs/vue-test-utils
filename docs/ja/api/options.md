# マウンティングオプション

`mount` と `shallowMount` に対するオプション。オプションオブジェクトには、`vue-test-utils` のマウントオプションとその他のオプションを含めることができます。

## `vue-test-utils` の詳細なマウンティングオプション

- [`context`](#context)
- [`slots`](#slots)
- [`scopedSlots`](#scopedslots)
- [`stubs`](#stubs)
- [`mocks`](#mocks)
- [`localVue`](#localvue)
- [`attachToDocument`](#attachtodocument)
- [`attrs`](#attrs)
- [`listeners`](#listeners)
- [`provide`](#provide)
- [`sync`](#sync)

### `context`

- 型: `Object`

コンテキストを関数型コンポーネントに渡します。 関数型コンポーネントのみで使用できます。

例:

```js
const wrapper = mount(Component, {
  context: {
    props: { show: true }
  }
})

expect(wrapper.is(Component)).toBe(true)
```

### `slots`

- 型: `{ [name: string]: Array<Component>|Component|string }`

コンポーネントにスロットコンテンツのオブジェクトを渡します。key はスロット名に対応します。値は、コンポーネント、コンポーネントの配列、またはテンプレート文字列のいずれかになります。

例:

```js
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallowMount(Component, {
  slots: {
    default: [Foo, Bar],
    fooBar: Foo, // Will match <slot name="FooBar" />,
    foo: '<div />'
  }
})
expect(wrapper.find('div')).toBe(true)
```

#### テキストを渡す

テキストを値として `slots` に渡すことはできますが、1つ制限事項があります。  
PhantomJS をサポートしません。  
代わりに [Puppeteer](https://github.com/karma-runner/karma-chrome-launcher#headless-chromium-with-puppeteer) を使用してください。

### `scopedSlots`

- 型: `{ [name: string]: string }`

コンポーネントにスコープ付きスロットのコンテンツのオブジェクトを渡します。key はスロット名に対応します。値はテンプレート文字列を指定します。

3つ制限事項があります。

* vue@2.5+ のみをサポートします。

* `<template>` タグを `scopedSlots` オプションのルート要素として使用することはできません。

* PhantomJS をサポートしません。  
代わりに [Puppeteer](https://github.com/karma-runner/karma-chrome-launcher#headless-chromium-with-puppeteer) を使用してください。

例:

```js
const wrapper = shallowMount(Component, {
  scopedSlots: {
    foo: '<p slot-scope="props">{{props.index}},{{props.text}}</p>'
  }
})
expect(wrapper.find('#fooWrapper').html()).toBe('<div id="fooWrapper"><p>0,text1</p><p>1,text2</p><p>2,text3</p></div>')
```

### `stubs`

- type: `{ [name: string]: Component | boolean } | Array<string>`

子コンポーネントをスタブします。スタブまたはオブジェクトに対するコンポーネント名の配列になります。`stubs` が配列の場合、すべてのスタブは `<!---->` になります。

例:

```js
import Foo from './Foo.vue'

mount(Component, {
  stubs: ['registered-component']
})

shallowMount(Component, {
  stubs: {
    // 特定の実装によるスタブ
    'registered-component': Foo,
    // デフォルトのスタブを作成します
    'another-component': true
  }
})
```

### `mocks`

- 型: `Object`

インスタンスに追加のプロパティを追加します。グローバル注入をモックするのに便利です。

例:

```js
const $route = { path: 'http://www.example-path.com' }
const wrapper = shallowMount(Component, {
  mocks: {
    $route
  }
})
expect(wrapper.vm.$route.path).toBe($route.path)
```

### `localVue`

- 型: `Vue`

コンポーネントのマウント時に使用する [createLocalVue](./createLocalVue.md) によって作成された Vue のローカルコピーです。この Vue のコピーにプラグインをインストールすると、元の `Vue` コピーが汚染されなくなります。

例:

```js
import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Foo from './Foo.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)

const routes = [
  { path: '/foo', component: Foo }
]

const router = new VueRouter({
  routes
})

const wrapper = mount(Component, {
  localVue,
  router
})
expect(wrapper.vm.$route).toBeInstanceOf(Object)
```

### `attachToDocument`

- 型: `boolean`
- デフォルト: `false`

`true` に設定されている場合、描画時にコンポーネントは DOM にアタッチされます。

### `attrs`

- 型: `Object`

コンポーネントインスタンスの `$attrs` オブジェクトを設定します。

### `listeners`

- 型: `Object`

コンポーネントインスタンスの `$listeners` オブジェクトを設定します。

### `provide`

- 型: `Object`

コンポーネントに指定したプロパティを注入します。[provide/inject](https://vuejs.org/v2/api/#provide-inject) を参照してください。

### `sync`

- 型: `boolean`
- デフォルト: `true`

`sync` を `true` にすると、Vue コンポーネントは同期的に描画されます。  
`sync` を `false` にすると、Vue コンポーネントは非同期的に描画されます。  

## その他のオプション

`mount` と `shallowMount` にマウンティングオプション以外のオプションが渡されると、コンポーネントのオプションは [extends](https://vuejs.org/v2/api/#extends) を使ってマウンティングオプション以外のオプションに上書きされます。

```js
const Component = {
  template: '<div>{{ foo() }}{{ bar() }}{{ baz() }}</div>',
  methods: {
    foo () {
      return 'a'
    },
    bar () {
      return 'b'
    }
  }
}
const options = {
  methods: {
    bar () {
      return 'B'
    },
    baz () {
      return 'C'
    }
  }
}
const wrapper = mount(Component, options)
expect(wrapper.text()).toBe('aBC')
```
