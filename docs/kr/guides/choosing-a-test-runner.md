# 테스트 러너 선택하기

테스트 러너는 테스트를 실행하는 프로그램입니다.

JavaScript 에는 유명한 테스트 러너가 많이 있습니다. `vue-test-utils`는 모든 테스트 러너와 함께 사용할 수 있습니다. 이는 테스트 러너 종류와는 상관없습니다.

테스트 러너를 선택할 때는 기능 세트, 성능 및 싱글 파일 컴포넌트, 사전 컴파일 지원 등을 지원하는지 등 몇 가지 사항을 고려해야 합니다. 기존 라이브러리들을 신중하게 비교한 결과, 다음 두 가지 테스트 러너를 권장합니다:

- [Jest](https://facebook.github.io/jest/docs/en/getting-started.html#content)는 완벽한 기능을 갖춘 테스트 러너입니다. 최소한의 설정이 필요하며, 기본적으로 JSDOM을 갖추었고, 내장된 검증 도구를 제공하며, 커맨드 라인 사용성이 뛰어납니다. 그러나 테스트에서 싱글 파일 컴포넌트(SFC: single-file component)를 가져오려면 프리 프로세서(사전 처리 과정)가 필요합니다. 우리는 일반적인 싱글 파일 컴포넌트를 처리할 수 있도록 `vue-jest` 프리프로세서를 만들었습니다. 하지만 vue-loader와 기능적으로 100% 같지는 않습니다.

- [mocha-webpack](https://github.com/zinserjan/mocha-webpack)는 webpack + Mocha에 대한 래퍼이지만 간소화된 인터페이스와 감시 모드를 제공합니다. 이 설정의 장점은 webpack + `vue-loader`를 통해 완전한 싱글 파일 컴포넌트 지원을 할 수 있다는 점입니다. 그러나 더 많은 설정이 필요합니다.

## 브라우저 환경

`vue-test-utils`는 브라우저 환경에 의존합니다. 기술적으로 실제 브라우저에서 실행할 수 있으나 다른 플랫폼에서 실제 브라우저를 실행해야 하는 복잡함 때문에 권장하지 않습니다. 대신 [JSDOM](https://github.com/tmpvar/jsdom)을 사용해 가상 브라우저 환경에서 Node.js의 테스트를 실행하는 것이 좋습니다.

Jest 테스트 러너는 JSDOM을 자동으로 설정합니다. 다른 테스트 러너의 경우 테스트 항목에 [jsdom-global](https://github.com/rstacruz/jsdom-global)을 사용하여 테스트용 JDOM을 수동으로 설정할 수 있습니다:

``` bash
npm install --save-dev jsdom jsdom-global
```
---
``` js
// 테스트 셋업 / 시작점에서
require('jsdom-global')()
```

## 싱글 파일 컴포넌트 테스트

싱글 파일 Vue 컴포넌트 (SFCs)는 노드 또는 브라우저에서 실행하기 전에 미리 컴파일해야합니다. 컴파일하는 두가지 방법을 권장합니다. Jest 프리프로세서를 사용하거나 직접 webpack을 이용하세요

`vue-jest` 프리프로세서의 경우 기본적인 SFC 기능을 지원하나, 현재 `vue-loader`만 지원하는 스타일 블럭이나 커스텀 블럭을 처리하지 않습니다. 이런 기능이나 다른 웹팩 특정 설정에 의존하는 경우 webpack + `vue-loader` 기반으로 설치해야합니다.

아래 내용에 따라 다른 설정을 할 수 있습니다.

- [Jest로 싱글 파일 컴포넌트 테스트](./testing-SFCs-with-jest.md)
- [Mocha + webpack로 싱글 파일 컴포넌트 테스트](./testing-SFCs-with-mocha-webpack.md)

## 리소스

- [테스트 러너 퍼포먼스 비교](https://github.com/eddyerburgh/vue-unit-test-perf-comparison)
- [Jest 예제](https://github.com/vuejs/vue-test-utils-jest-example)
- [Mocha 예제](https://github.com/vuejs/vue-test-utils-mocha-webpack-example)
- [tape 예제](https://github.com/eddyerburgh/vue-test-utils-tape-example)
- [AVA 예제](https://github.com/eddyerburgh/vue-test-utils-ava-example)
