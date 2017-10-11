# マウンティングオプション

`mount`と`shallow`に対するオプション。optionsオブジェクトには、`vue-test-utils`のマウントオプションと生のVueオプションの両方を含めることができます。

新しくインスタンスが作成されると、Vueオプションがコンポーネントに渡されます。例：`store`、`propsData`など。完全なリストについては[Vue API docs](https://vuejs.org/v2/api/)を参照してください。

## `vue-test-utils`の詳細なマウンティングオプション

- [context](#context)
- [slots](#slots)
- [stubs](#stubs)
- [mocks](#mocks)
- [localVue](#localvue)
- [attachToDocument](#attachtodocument)
- [attrs](#attrs)
- [listeners](#listeners)
- [clone](#clone)

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

コンポーネントにスロットコンテンツのオブジェクトを渡します。keyはスロット名に対応します。値は、コンポーネント、コンポーネントの配列、またはテンプレート文字列のいずれかになります。

例:

```js
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallow(Component, {
  slots: {
    default: [Foo, Bar],
    fooBar: Foo, // Will match <slot name="FooBar" />,
    foo: '<div />'
  }
})
expect(wrapper.find('div')).toBe(true)
```

### `stubs`

- type: `{ [name: string]: Component | boolean } | Array<string>`

子のコンポーネントをスタブします。スタブまたはオブジェクトに対するコンポーネント名の配列になります。

例:

```js
import Foo from './Foo.vue'

mount(Component, {
  stubs: ['registered-component']
})

shallow(Component, {
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
import { expect } from 'chai'

const $route = { path: 'http://www.example-path.com' }
const wrapper = shallow(Component, {
  mocks: {
    $route
  }
})
expect(wrapper.vm.$route.path).toBe($route.path)
```

### `localVue`

- 型: `Vue`

コンポーネントのマウント時に使用する[createLocalVue](./createLocalVue.md)によって作成されたVueのローカルコピーです。このVueのコピーにプラグインをインストールすると、元の`Vue`コピーが汚染されなくなります。

例:

```js
import { createLocalVue, mount } from 'vue-test-utils'
import VueRouter from 'vue-router'
import { expect } from 'chai'
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

`true`に設定されている場合、レンダリング時にコンポーネントはDOMにアタッチされます。これは複数の要素やCSSセレクタをチェックするための[`hasStyle`](wrapper/hasStyle.md)とも使用できます。

### `attrs`

- 型: `Object`

コンポーネントインスタンスの`$attrs`オブジェクトを設定します。

### `listeners`

- 型: `Object`

コンポーネントインスタンスの`$listeners`オブジェクトを設定します。

### `clone`

- 型: `boolean`
- デフォルト: `true`

`true`に設定されている場合、マウント前にコンポーネントを複製し、元のコンポーネントの定義を変更することはありません。

`options.mocks` (`Object`): Vueインスタンスにグローバルを追加します。

`options.localVue` (`Object`): `mount`で使うVueクラスです。[createLocalVue](createLocalVue.md)を参照してください。
