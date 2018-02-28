# Wrapper

vue-test-utils はラッパベースの API です。
 
`Wrapper` は、マウントされたコンポーネントと仮想 DOM 、またはコンポーネントと仮想 DOM をテストするメソッドを含むオブジェクトです。

- **プロパティ:**

`vm` `Component`：これは vue のインスタンスです。`wrapper.vm` を使って [vm のプロパティとインスタンスメソッド](https://jp.vuejs.org/v2/api/#インスタンスプロパティ)にアクセスできます。これは、Vue コンポーネントラッパにのみ存在します。  
`element` `HTMLElement`: ラッパのルート DOM  
`options` `Object`: `mount` または `shallow` に渡された vue-test-utils オプションを含むオブジェクト  
`options.attachedToDom` `Boolean`: `mount` か `shallow` に渡された場合は True です。  

- **メソッド:**

ドキュメントの wrapper セクションにはメソッドの詳細が一覧になっています。
