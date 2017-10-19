# Vue Router と一緒に使用する

## テストへ Vue Router のインストール

テストで Vue のコンストラクタベースの Vue Router をインストールしないでください。Vue Router をインストールすると Vue のプロトタイプの読み取り専用プロパティとして `$route` と `$router` が追加されます。

これを回避するために、localeVue を作成し、その上に Vue Router をインストールすることができます。

```js
import VueRouter from 'vue-router'
const localVue = createLocalVue()

localVue.use(VueRouter)

shallow(Component, {
  localVue
})
```

## `router-link` または `router-view` を使用するコンポーネントテスト

Vue Router をインストールする時、`router-link` と `router-view` コンポーネントが登録されます。これは、それらをアプリケーションにインポートする必要がなく、アプリケーションのどこでも使用することができます。

テストを実行する際には、マウントしているコンポーネントにこれら Vue Router のコンポーネントを使用できるようにする必要があります。これらを行うには 2 つの方法があります。

### スタブを使用する

```js
shallow(Component, {
  stubs: ['router-link', 'router-view']
})
```

### localVue による Vue Router のインストール

```js
import VueRouter from 'vue-router'
const localVue = createLocalVue()

localVue.use(VueRouter)

shallow(Component, {
  localVue
})
```

## `$route` と `$router` のモック

時々、コンポーネントが `$route` と `$router` オブジェクトから引数によって何かをするテストをしたいときがあります。これをするためには、Vue インスタンスにカスタムモックを渡すことができます。

```js
const $route = {
  path: '/some/path'
}

const wrapper = shallow(Component, {
  mocks: {
    $route
  }
})

wrapper.vm.$router // /some/path
```

## よくある落とし穴

Vue Router をインストールすると Vue のプロトタイプに読み取り専用プロパティとして `$route` と `$router` が追加されます。

これは、`$route` または `$router` をモックを試みるテストが将来失敗することを意味します。

これを回避するために、テストを実行するときに、Vue Router をインストールしないでください。
