# セレクタ

多くのメソッドがセレクタを引数とします。セレクタは、CSS セレクタ、 Vue コンポーネント、または find メソッドのオプションオブジェクトのいずれかです。

## CSS セレクタ

マウントは有効な CSS セレクタを処理します。

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

## Vue コンポーネント

Vue コンポーネントもセレクタとして有効です。

```js
// Foo.vue

export default{
  name: 'FooComponent'
}
```

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallow(Foo)
expect(wrapper.is(Foo)).toBe(true)
```

## find メソッドのオプションオブジェクト

### name

find メソッドのオプションオブジェクトを使用すると、Wrapper コンポーネント内にあるコンポーネントの `name` に一致する要素を取得することができます。

```js
const buttonWrapper = wrapper.find({ name: 'my-button' })
buttonWrapper.trigger('click')
```

### ref

find メソッドのオプションオブジェクトを使用すると、Wrapper コンポーネントの `$ref` プロパティに一致する要素を取得することができます。

```js
const buttonWrapper = wrapper.find({ ref: 'myButton' })
buttonWrapper.trigger('click')
```
