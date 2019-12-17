# マウンティングオプション

`mount` と `shallowMount` に対するオプション。オプションオブジェクトには、`vue-test-utils` のマウントオプションとその他のオプションを含めることができます。

- [`context`](#context)
- [`slots`](#slots)
- [`scopedSlots`](#scopedslots)
- [`stubs`](#stubs)
- [`mocks`](#mocks)
- [`localVue`](#localvue)
- [`attachToDocument`](#attachtodocument)
- [`attrs`](#attrs)
- [`propsData`](#propsdata)
- [`listeners`](#listeners)
- [`parentComponent`](#parentcomponent)
- [`provide`](#provide)

## context

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

## slots

- 型: `{ [name: string]: Array<Component>|Component|string }`

コンポーネントにスロットコンテンツのオブジェクトを渡します。key はスロット名に対応します。値は、コンポーネント、コンポーネントの配列、またはテンプレート文字列のいずれかになります。

例:

```js
import Foo from './Foo.vue'

const bazComponent = {
  name: 'baz-component',
  template: '<p>baz</p>'
}

const wrapper = shallowMount(Component, {
  slots: {
    default: [Foo, '<my-component />', 'text'],
    fooBar: Foo, // `<slot name="FooBar" />` にマッチします。
    foo: '<div />',
    bar: 'bar',
    baz: bazComponent,
    qux: '<my-component />'
  }
})

expect(wrapper.find('div')).toBe(true)
```

## scopedSlots

- 型: `{ [name: string]: string|Function }`

コンポーネントにスコープ付きスロットのオブジェクトを提供します。そのオブジェクトのキーはスロット名になります。

slot-scope 属性を使って props を指定することができます。

```js
shallowMount(Component, {
  scopedSlots: {
    foo: '<p slot-scope="foo">{{foo.index}},{{foo.text}}</p>'
  }
})
```

slot-scope 属性を使って props を指定しない場合、スロットが展開されると `props` という変数名で props を使用することができます。

```js
shallowMount(Component, {
  scopedSlots: {
    default: '<p>{{props.index}},{{props.text}}</p>'
  }
})
```

props を引数に取る関数を渡すことができます。

```js
shallowMount(Component, {
  scopedSlots: {
    foo: function(props) {
      return this.$createElement('div', props.index)
    }
  }
})
```

または、 JSX を使用することができます。メソッド内に JSX を書いた場合、`this.$createElement` は babel-plugin-transform-vue-jsx によって自動的に注入されます。

```js
shallowMount(Component, {
  scopedSlots: {
    foo(props) {
      return <div>{props.text}</div>
    }
  }
})
```

## stubs

- type: `{ [name: string]: Component | boolean } | Array<string>`

子コンポーネントをスタブします。スタブまたはオブジェクトに対するコンポーネント名の配列になります。`stubs` が配列の場合、すべてのスタブは `<${コンポーネント名}-stub>` になります。

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
    // デフォルトのスタブを作成します。
    // このケースではデフォルトのスタブのコンポーネント名は another-component です。
    // デフォルトのスタブは <${デフォルトのスタブのコンポーネント名}-stub> です。
    'another-component': true
  }
})
```

## mocks

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

## localVue

- 型: `Vue`

コンポーネントのマウント時に使用する [createLocalVue](./createLocalVue.md) によって作成された Vue のローカルコピーです。この Vue のコピーにプラグインをインストールすると、元の `Vue` コピーが汚染されなくなります。

例:

```js
import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Foo from './Foo.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)

const routes = [{ path: '/foo', component: Foo }]

const router = new VueRouter({
  routes
})

const wrapper = mount(Component, {
  localVue,
  router
})
expect(wrapper.vm.$route).toBeInstanceOf(Object)
```

## attachToDocument

- 型: `boolean`
- デフォルト: `false`

`true` に設定されている場合、描画時にコンポーネントは DOM にアタッチされます。

DOM にアタッチされた際に、テストの最後で `wrapper.destroy()` を呼び出さなければなりません。レンダリングされた要素をドキュメントから取り除いて、コンポーネントインスタンスを壊さなければならないからです。

## attrs

- 型: `Object`

コンポーネントインスタンスの `$attrs` オブジェクトを設定します。

## propsData

- 型: `Object`

コンポーネントがマウントされる時、コンポーネントインスタンスの props をセットします。

例:

```js
const Component = {
  template: '<div>{{ msg }}</div>',
  props: ['msg']
}
const wrapper = mount(Component, {
  propsData: {
    msg: 'aBC'
  }
})
expect(wrapper.text()).toBe('aBC')
```

::: 注意
`propsData` は Vue Test Utils のマウンティングオプションではなく [Vue API](https://vuejs.org/v2/api/#propsData) です。
この `propsData` は [`extends`](https://vuejs.org/v2/api/#extends) を内部で利用しています。
詳しくは[その他のオプション](#その他のオプション)を参照してください。
:::

## listeners

- 型: `Object`

コンポーネントインスタンスの `$listeners` オブジェクトを設定します。

## parentComponent

- 型: `Object`

マウントされるコンポーネントの親コンポーネントとして使用されるコンポーネントです。

例:

```js
import Foo from './Foo.vue'

const wrapper = shallowMount(Component, {
  parentComponent: Foo
})
expect(wrapper.vm.$parent.$options.name).toBe('foo')
```

## provide

- 型: `Object`

コンポーネントに指定したプロパティを注入します。[provide/inject](https://vuejs.org/v2/api/#provide-inject) を参照してください。

例:

```js
const Component = {
  inject: ['foo'],
  template: '<div>{{this.foo()}}</div>'
}

const wrapper = shallowMount(Component, {
  provide: {
    foo() {
      return 'fooValue'
    }
  }
})

expect(wrapper.text()).toBe('fooValue')
```

## その他のオプション

`mount` と  `shallowMount` にマウンティングオプション以外のオプションが渡されると、コンポーネントのオプションは [extends](https://vuejs.org/v2/api/#extends) を使ってマウンティングオプション以外のオプションに上書きされます。

```js
const Component = {
  template: '<div>{{ foo() }}{{ bar() }}{{ baz() }}</div>',
  methods: {
    foo() {
      return 'a'
    },
    bar() {
      return 'b'
    }
  }
}
const options = {
  methods: {
    bar() {
      return 'B'
    },
    baz() {
      return 'C'
    }
  }
}
const wrapper = mount(Component, options)
expect(wrapper.text()).toBe('aBC')
```
