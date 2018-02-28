# Wrapper

vue-test-utils는 래퍼 기반 API입니다.

`Wrapper`는 마운트 된 컴포넌트나 vnode(가상 DOM)를 포함하는 객체이며, 컴포넌트나 vnode를 테스트하는 메소드입니다.

- **속성:**

`vm` `Component`: Vue 인스턴스입니다. `wrapper.vm`을 이용해 모든 [vm의 인스턴스 메소드와 속성](https://vuejs.org/v2/api/#Instance-Properties)에 접근할 수 있습니다. Vue 컴포넌트 래퍼에만 있습니다.

`element` `HTMLElement`: 래퍼의 루트 DOM 노드.

`options` `Object`: `mount` 또는 `shallow`에 전달된 vue-test-utils 옵션을 포함하는 객체

`options.attachedToDom` `Boolean`:  attachToDom이 `mount` 또는 `shallow`에 전달되었을 때 true

- **메소드:**

문서의 래퍼 섹션에 있는 메소드의 자세한 목록이 있습니다.
