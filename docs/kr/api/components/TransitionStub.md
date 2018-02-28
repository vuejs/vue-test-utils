# TransitionStub

`transition` 래퍼 컴포넌트를 스텁하는 컴포넌트입니다. 트랜지션을 비동기로 수행하는 대신 동기적으로 하위 컴포넌트를 반환합니다.


이는 vue-test-utils에서 기본적으로 모든 `transition` 컴포넌트를 스텁하도록 설정됩니다. 내장된 `transition` 래퍼 컴포넌트를 `config.stubs.transition`을 false로 설정하려면:

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.stubs.transition = false
```

트랜지션 컴포넌트를 스텁으로 재설정하려면 다음을 하십시오.

```js
import VueTestUtils, { TransitionStub } from '@vue/test-utils'

VueTestUtils.config.stubs.transition = TransitionStub
```

마운트 옵션에서 스텁으로 설정하려면 다음을 하십시오.


```js
import { mount, TransitionStub } from '@vue/test-utils'

mount(Component, {
  stubs: {
    transition: TransitionStub
  }
})
```
