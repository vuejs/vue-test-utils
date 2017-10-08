# ラッパ

vue-test-utilsはラッパベースのAPIです。
 
`Wrapper`は、マウントされたコンポーネントと仮想DOM、またはコンポーネントと仮想DOMをテストするメソッドを含むオブジェクトです。

- **プロパティ:**

`vm` `Component`：これはvueのインスタンスです。`wrapper.vm`を使って[vmのプロパティとインスタンスメソッド](https://vuejs.org/v2/api/#Instance-Properties)にアクセスできます。これは、Vueコンポーネントラッパーにのみ存在します。
`element` `HTMLElement`: ラッパーのルートDOM
`options` `Object`: `mount`または`shallow`に渡されたvue-test-utilsオプションを含むオブジェクト
`options.attachedToDom` `Boolean`: `mount` か `shallow`に渡された場合はTrueです。

- **メソッド:**

docs/wrapperのセクションにはメソッドの詳細が一覧になっています。
