# Mocha + webpack로 싱글 파일 컴포넌트 테스트

> 이 설정의 예제는 [GitHub](https://github.com/vuejs/vue-test-utils-mocha-webpack-example)에 있습니다.

싱글 파일 컴포넌트를 테스트하기 위한 또 다른 전략은 webpack을 통해 모든 테스트를 컴파일한 다음 테스트 러너에서 실행하는 것 입니다. 이 접근 방식의 장점은 모든 webpack 및 `vue-loader` 기능을 완벽히 지원하므로 소스코드를 테스트에 타협하지 않아도 된다는 점 입니다.

기술적으로 테스트 러너를 사용해 수동으로 연결 할 수 있으나, 특정 작업에 매우 유용한 [`mocha-webpack`](https://github.com/zinserjan/mocha-webpack)이 있습니다.

## `mocha-webpack` 설정

이미 webpack, vue-loader 및 Babel이 올바르게 구성되어 있는 것으로 시작한다고 가정합니다. `vue-cli`에 의해 스캐폴딩된 `webpack-simple`템플릿을 사용합니다.

가장 먼저 할 일은 테스트 종속성을 설치하는 것 입니다.:

``` bash
npm install --save-dev @vue/test-utils mocha mocha-webpack
```

다음은 `package.json`에서 스크립트 하나를 추가합니다.:

```json
// package.json
{
  "scripts": {
    "test": "mocha-webpack --webpack-config webpack.config.js --require test/setup.js test/**/*.spec.js"
  }
}
```

몇가지 참고해야 할 주의사항이 있습니다.:

- `--webpack-config` 플래그는 테스트에 사용할 webpack 설정을 지정합니다. 대부분의 경우 이 설정은 실제 프로젝트에 사용하는 설정과 동일하지만, 작은 수정을 하려합니다. 나중에 이것을 다룰 것입니다.

- `--require` 플래그는 테스트 전에 `test/setup.js`가 실행되도록 합니다. 테스트가 실행될 글로벌 환경을 설정할 수 있습니다.

- 마지막 전달 인자는 모든 테스트 파일의 집합(glob) 입니다.

### 추가 webpack 설정

#### NPM 의존성 외부화

우리는 테스트를 하면서 다양한 NPM 의존성을 가져오게 되는 경우가 많이 있습니다. - 이 모듈 중 일부는 브라우저 사용을 염두하고 작성되어 있는 것 도 있기에, 단순하게 webpack으로 패키지 하기엔 적합하지 않습니다. 또 다른 고려사항으로는 의존성을 외부화 하게 되면, 테스트 시작 속도를 크게 향상시킬 수 있습니다. `webpack-node-externals`을 사용하여 모든 NPM 의존성을 외부화할 수 있습니다.:

```js
// webpack.config.js
const nodeExternals = require('webpack-node-externals')

module.exports = {
  // ...
  externals: [nodeExternals()]
}
```

#### 소스맵

소스맵은 `mocha-webpack`에 의해서 포착 될 수 있게 하기 위해, in-line화 할 필요가 있습니다. 권장 설정은 다음과 같습니다.:

``` js
module.exports = {
  // ...
  devtool: 'inline-cheap-module-source-map'
}
```

IDE를 통해 디버깅하는 경우, 다음을 추가하는 것이 좋습니다.:

``` js
module.exports = {
  // ...
  output: {
    // ...
    // 소스맵에 절대 경로 사용 (IDE를 통한 디버깅에서 중요함)
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  }
}
```

### 브라우저 환경 설정

`vue-test-utils`를 실행하려면, 브라우저 환경이 필요합니다. Node.js에서 `jsdom-global`를 이용해 시뮬레이션합니다.:

```bash
npm install --save-dev jsdom jsdom-global
```

`test/setup.js`에 추가합니다.:

``` js
require('jsdom-global')()
```

이는 `vue-test-utils`가 올바르게 동작할 수 있도록 브라우저 환경을 노드에 추가합니다.

### 검증(Assertion) 라이브러리 선택

[Chai](http://chaijs.com/)는 Mocha와 함께 사용하는 인기있는 검증 라이브러리입니다. 스파이와 스텁을 만드는 방법에 대해 [Sinon](http://sinonjs.org/)에서 확인하세요.

대안으로 Jest의 일부인 `expect`를 사용할 수 있으며, Jest 문서에서 [정확히 같은 API](http://facebook.github.io/jest/docs/en/expect.html#content)를 노출합니다.

여기서 `expect`를 사용하여 글로벌로 사용할 수 있도록 만들어, 모든 테스트에서 임포트할 필요는 없습니다.:

``` bash
npm install --save-dev expect
```

`test/setup.js`입니다.

``` js
require('jsdom-global')()

global.expect = require('expect')
```

### 테스트를 위한 Babel 최적화

JavaScript를 처리하기 위해 `babel-loader`를 사용하고 있습니다. 앱에서 Babel을 쓰시는 경우, `.babelrc` 파일이 이미 구성 되어 있을 것입니다. 만약 당신이 별도로 구성하지 않는다면, `babel-loader`는 자동으로 같은 설정 파일을 가져오게 됩니다.

주의 해야 할 한가지는, 이미 ES2015 기능을 대부분 지원하는 Node 6+를 사용하는 경우에 별도의 Babel [env 옵션](https://babeljs.io/docs/usage/babelrc/#env-option)을 설정할 수 있습니다. (예: stage-2 또는 미구현 된 flow 구문을 사용할 수 있도록 지원 등)

### 테스트 추가

`src`에 `Counter.vue` 파일을 만듭니다.:

``` html
<template>
	<div>
	  {{ count }}
	  <button @click="increment">Increment</button>
	</div>
</template>

<script>
export default {
  data () {
    return {
      count: 0
    }
  },

  methods: {
    increment () {
      this.count++
    }
  }
}
</script>
```

다음 `test/Counter.spec.js` 파일을 만들고 아래 내용으로 테스트를 작성하세요.:

```js
import { shallow } from '@vue/test-utils'
import Counter from '../src/Counter.vue'

describe('Counter.vue', () => {
  it('increments count when button is clicked', () => {
    const wrapper = shallow(Counter)
    wrapper.find('button').trigger('click')
    expect(wrapper.find('div').text()).toMatch('1')
  })
})
```

이제 테스트를 할 수 있습니다.:

```
npm run unit
```

테스트가 실행됩니다!

### 리소스

- [위 설정의 예제](https://github.com/vuejs/vue-test-utils-mocha-webpack-example)
- [Mocha](https://mochajs.org/)
- [mocha-webpack](http://zinserjan.github.io/mocha-webpack/)
- [Chai](http://chaijs.com/)
- [Sinon](http://sinonjs.org/)
- [jest/expect](http://facebook.github.io/jest/docs/en/expect.html#content)
