# セレクタ

多くのメソッドがセレクタを引数とします。セレクタは、CSSセレクタまたはVueコンポーネントのいずれかです。

## CSSセレクタ

マウントは有効なCSSセレクタを処理します。

- タグセレクタ (div, foo, bar)
- クラスセレクタ (.foo, .bar)
- 属性セレクタ ([foo], [foo="bar"])
- idセレクタ (#foo, #bar)
- 疑似セレクタ (div:first-of-type)

これらを組み合わせることも可能です:

- 直接子孫を組み合わせる (div > #bar > .foo)
- 一般子孫セレクタを組み合わせる (div #bar .foo)
- 隣接する兄弟のセレクタ (div + .foo)
- 一般兄弟セレクタ (div ~ .foo)

## Vueコンポーネント

Vueコンポーネントもセレクタとして有効です。

vue-test-utilsは `name`プロパティを使用して、一致するVueコンポーネントのインスタンスツリーを検索します。

```js
// Foo.vue

export default{
  name: 'FooComponent'
}
```

```js
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = shallow(Foo)
expect(wrapper.is(Foo)).to.equal(true)
```
