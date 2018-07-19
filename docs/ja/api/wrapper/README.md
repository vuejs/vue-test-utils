# Wrapper

vue-test-utils はラッパベースの API です。

`Wrapper` は、マウントされたコンポーネントと仮想 DOM 、またはコンポーネントと仮想 DOM をテストするメソッドを含むオブジェクトです。

## プロパティ

### `vm`

`Component`：これは vue のインスタンスです。`wrapper.vm` を使って [vm のプロパティとインスタンスメソッド](https://jp.vuejs.org/v2/api/#インスタンスプロパティ)にアクセスできます。これは、Vue コンポーネントラッパにのみ存在します。

### `element`

`HTMLElement`: ラッパのルート DOM

### `options`

#### `options.attachedToDocument`

`Boolean`: マウンティングオプションで `attachedToDocument` が `true` だった場合は True です。


#### `options.sync`

`Boolean`: マウンティングオプションで `sync` が `false` ではなかった場合は True です。  

## メソッド

!!!include(docs/ja/api/wrapper/attributes.md)!!!
!!!include(docs/ja/api/wrapper/classes.md)!!!
!!!include(docs/ja/api/wrapper/contains.md)!!!
!!!include(docs/ja/api/wrapper/destroy.md)!!!
!!!include(docs/ja/api/wrapper/emitted.md)!!!
!!!include(docs/ja/api/wrapper/emittedByOrder.md)!!!
!!!include(docs/ja/api/wrapper/exists.md)!!!
!!!include(docs/ja/api/wrapper/find.md)!!!
!!!include(docs/ja/api/wrapper/findAll.md)!!!
!!!include(docs/ja/api/wrapper/html.md)!!!
!!!include(docs/ja/api/wrapper/is.md)!!!
!!!include(docs/ja/api/wrapper/isEmpty.md)!!!
!!!include(docs/ja/api/wrapper/isVisible.md)!!!
!!!include(docs/ja/api/wrapper/isVueInstance.md)!!!
!!!include(docs/ja/api/wrapper/name.md)!!!
!!!include(docs/ja/api/wrapper/props.md)!!!
!!!include(docs/ja/api/wrapper/setChecked.md)!!!
!!!include(docs/ja/api/wrapper/setData.md)!!!
!!!include(docs/ja/api/wrapper/setMethods.md)!!!
!!!include(docs/ja/api/wrapper/setProps.md)!!!
!!!include(docs/ja/api/wrapper/setSelected.md)!!!
!!!include(docs/ja/api/wrapper/setValue.md)!!!
!!!include(docs/ja/api/wrapper/text.md)!!!
!!!include(docs/ja/api/wrapper/trigger.md)!!!
