# Jest로 싱글 파일 컴포넌트 테스트

> 이 설정의 예제는 [GitHub](https://github.com/vuejs/vue-test-utils-jest-example)에 있습니다.

Jest는 페이스북이 개발한 테스트 러너입니다. 잘 갖춰진 유닛 테스팅 솔루션을 목표로 합니다. 자세한 내용은 Jest의 [공식 문서](https://facebook.github.io/jest/)를 살펴보세요.

## Jest 설정

이미 webpack, vue-loader 및 Babel이 올바르게 설정했다고 가정합니다. `vue-cli`로 스캐폴딩된 `webpack-simple` 템플릿을 사용합니다.

가장 먼저 할 일은 Jest와 `vue-test-utils`를 설치하는 것 입니다.:

```bash
$ npm install --save-dev jest vue-test-utils
```

다음은 `package.json`에서 스크립트 하나를 추가합니다.

```json
// package.json
{
  "scripts": {
    "test": "jest"
  }
}
```

## Jest로 싱글 파일 컴포넌트 처리

Jest에게 `*.vue` 파일을 처리하는 방법을 알려주기 위해, `vue-jest` 프리프로세서를 설치하고 설정해야합니다.:

``` bash
npm install --save-dev vue-jest
```

다음으로 `jest` 블럭을 `package.json`에 추가합니다.:

``` json
{
  // ...
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      // Jest가 *.vue 파일을 처리할 수 있도록 합니다.
      "vue"
    ],
    "transform": {
      // vue-jest로 *.vue 파일을 처리합니다.
      ".*\\.(vue)$": "<rootDir>/node_modules/vue-jest"
    },
    "mapCoverage": true
  }
}
```

> **참고:** `vue-jest`는 현재 사용자 정의 블럭 및 스타일 로딩과 같은 `vue-loader`의 모든 기능을 지원하지는 않습니다. 또한, 코드 분할과 같은 일부 webpack 관련 기능은 지원하지 않습니다. 이를 사용하려면, [Mocha + webpack로 싱글 파일 컴포넌트 테스트](./testing-SFCs-with-mocha-webpack.md)를 읽어보세요.

## webpack 알리아스 다루기

webpack 설정에서 `@`를 `/src`로 지정한 알리아스(별칭)를 사용하는 경우, Jest가 알 수 있도록 `moduleNameMapper` 옵션을 사용하여 맞추는 설정을 추가해야 합니다.

``` json
{
  // ...
  "jest": {
    // ...
    // @를 src로 매핑합니다.
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

## Jest를 위한 Babel 설정

Node의 최신 버전이 이미 대부분의 ES2015 기능을 지원하지만 테스트에서 ES 모듈 문법 및 stage-x 기능을 사용하길 원할 수 있습니다. 이를 위해 `babel-jest`를 설치해야합니다.:

``` bash
npm install --save-dev babel-jest
```

다음으로 Jest에게 `babel-jest`로 JavaScript 테스트 파일을 처리하도록 `package.json`에 `jest.transform` 아래에 엔트리를 추가하여 알려줄 필요가 있습니다.:

``` json
{
  // ...
  "jest": {
    // ...
    "transform": {
      // ...
      // babel-jest로 js를 처리한다.
      "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
    },
    // ...
  }
}
```

> 기본적으로 `babel-jest`는 설치 되어있는 한 자동으로 설정됩니다. 그러나 앞서 `*.vue` 파일에 대한 변환을 명시적으로 추가했으므로 이제 `babel-jest`도 명시적으로 구성해야 합니다.

webpack에서 `babel-preset-env`를 사용한다고 가정하면, webpack은 이미 ES 모듈을 처리하는 방법을 알고 있기 때문에 Babel 설정은 ES 모듈 트랜스파일을 비활성화합니다. 그러나 Jest 테스트는 Node에서 직접 실행되기 때문에, 테스트를 위해 이것을 활성해야 합니다.

또한 `babel-preset-env`에 현재 사용하고 있는 Node 버전을 알려줄 수도 있습니다. 이렇게 하면 불필요한 기능을 건너뛰고 테스트가 더 빨리 시작됩니다.

이 옵션을 테스트에만 적용하려면, `env.test` (`babel-jest`를 통해 자동으로 선택)를 아래 설정에 넣으세요.

`.babelrc` 예제:

``` json
{
  "presets": [
    ["env", { "modules": false }]
  ],
  "env": {
    "test": {
      "presets": [
        ["env", { "targets": { "node": "current" }}]
      ]
    }
  }
}
```

### 스냅샷 테스트

[`vue-server-renderer`](https://github.com/vuejs/vue/tree/dev/packages/vue-server-renderer)를 사용해 컴포넌트를 문자열로 렌더링하여 [Jest 스냅샷 테스트](https://facebook.github.io/jest/docs/en/snapshot-testing.html)를 위한 스냅샷으로 제공할 수 있습니다.

`vue-server-renderer`의 렌더링 결과 만으로는 몇개의 SSR 특정 속성을 포함하여 공백 같은 문자열을 무시하므로, diff 부분을 찾아내기가 좀 어렵습니다. 사용자 정의 시리얼라저(custom serializer)를 사용해, 저장된 스냅샷을 개선할 수 있습니다.:

``` bash
npm install --save-dev jest-serializer-vue
```

`package.json` 설정:

``` json
{
  // ...
  "jest": {
    // ...
    // 스냅샷을 위한 시리얼라이저
    "snapshotSerializers": [
      "<rootDir>/node_modules/jest-serializer-vue"
    ]
  }
}
```

### 테스트 파일 배치

기본적으로 Jest는 전체 프로젝트에서 `.spec.js` 또는 `.test.js` 확장자를 갖는 모든 파일을 재귀적으로 선택합니다. 이것이 상황에 맞지 않으면 `package.json` 파일의 config 섹션에서 [testRegex를 변경할 수 있습니다](https://facebook.github.io/jest/docs/en/configuration.html#testregex-string).


Jest는 테스트중인 코드 바로 다음에 `__tests__` 디렉터리를 만들 것을 권장 하지만, 테스트 결과를 적절히 마음대로 구조화할 수 있습니다. Jest는 스냅샷 테스트를 수행하는 파일 옆에 `__snapshots__` 디렉터리를 만듭니다.

### 스펙 예제

Jasmine에 익숙하면 Jest의 [assertion API](https://facebook.github.io/jest/docs/en/expect.html#content)를 사용해 편하게 사용할 수 있습니다.

```js
import { mount } from '@vue/test-utils'
import Component from './component'

describe('Component', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(Component)
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})
```

### 리소스

- [위 설정의 예제](https://github.com/vuejs/vue-test-utils-jest-example)
- [Vue Conf 2017의 예제 및 슬라이드](https://github.com/codebryo/vue-testing-with-jest-conf17)
- [Jest](https://facebook.github.io/jest/)
- [Babel preset env](https://github.com/babel/babel-preset-env)
