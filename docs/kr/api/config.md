# Config

vue-test-utils는 내부에서 사용할 설정 객체를 포함합니다.

## `vue-test-utils` 설정 옵션

### `stubs`

- 타입: `Object`
- 기본값: `{
  transition: TransitionStub,
  'transition-group': TransitionGroupStub
}`

컴포넌트에서 사용할 스텁. 전달된 마운트 옵션 안에 `stubs`가 있으면 덮어씁니다.

`stubs`를 마운트 옵션에 배열로 전달하면 `config.stubs`는 배열로 변환되고 div를 반환하는 기본 컴포넌트로 컴포넌트를 스텁합니다.

예:

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.stubs['my-compomnent'] = '<div />'
```
