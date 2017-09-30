# よくある問題

## createLocalVue

`createLocalVue`は拡張Vueクラスを返すため、グローバルVueクラスに影響を与えることなく、ミックスイン、ディレクティブ、コンポーネント、プラグインを追加することができます。

残念ながら、多くのプラグインは内部チェックがあるため複数のプラグインをインストールすることができません。

現在、 **Vuexは複数回インスタンスにインストールができません。** しかし、 ストアを変更することができます。そのため、1回インストールすれば大丈夫です。[Vuexとの使い方](guides/using-with-vuex.md)を参照してください。

また、**Vue Routerは2回以上インストールする際は2つのオプションをfalseに設定する必要があります。**

```js
import createLocalVue from 'vue-test-utils'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
VueRouter.installed = false
VueRouter.install.installed = false
localVue.use(VueRouter)
```

プラグインをインストールする代わりにテストするプロパティをスタブする方法もあります。

たとえば、テストが`this.$route.params.id`に依存している場合、[intercept](mount.md)を使って`$route`をスタブします。

```js
mount(Component, {
  intercept: {
    $route: {
      params: {
        id: true
      }
    }
  }
})
```