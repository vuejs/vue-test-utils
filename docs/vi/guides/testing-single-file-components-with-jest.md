## Test Single-File Component với Jest

> Project ví dụ với thiết đặt này có thể tìm thấy trên [GitHub](https://github.com/vuejs/vue-test-utils-jest-example).

Jest là một test runner được phát triển bởi Facebook, để cung cấp một giải pháp unit test toàn diện. Bạn có thể đọc thêm về Jest ở [trang tài liệu chính thức](https://jestjs.io/).

#### Thiết đặt Jest

Chúng tôi xem như bạn đã thiết đặt xong webpack, vue-load và Babel, ví dụ template `webpack-simple` được dựng bởi `vue-cli`

Điều đầu tiên chúng ta cần làm là cài đặt Jest và Vue Test Utils:

```bash
$ npm install --save-dev jest @vue/test-utils
```

Tiếp theo chúng ta cần định nghĩa test script trong `package.json`.

```json
// package.json
{
  "scripts": {
    "test": "jest"
  }
}
```

### Xử lý Single-File Component trong Jest

Để _dạy_ Jest làm sao để xử lý file `*.vue`, chúng ta sẽ cần cài và cấu hình bộ tiền xử lý `vue-jest`:

```bash
npm install --save-dev vue-jest
```

Tiếp theo, tạo khối `jest` trong `package.json`:

```json
{
  // ...
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      // tell Jest to handle `*.vue` files
      "vue"
    ],
    "transform": {
      // process `*.vue` files with `vue-jest`
      ".*\\.(vue)$": "vue-jest"
    }
  }
}
```

> **Lưu ý:** `vue-jest` hiện tại không hỗ trợ tất cả tính năng của `vue-loader`, ví dụ custom block vá style loading. Thêm vào đó, một vài tính năng riêng của webpack như code-splitting không được hỗ trợ. Để sử dụng các tính năng chưa được hỗ trợ này, bạn cần sử dụng Mocha thay vì Jest để chạy test, và webpack để compile component. Để bắt đầu, đọc [test SFC với Mocha + webpack](./testing-single-file-components-with-mocha-webpack.md).

### Xử lý webpack Alias

Nếu đang config trong webpack để sử dụng cá alias như `@` thay cho `/src`, bạn cần lấy các cài đặt này vào Jest, sử dụng phần cấu hình `moduleNameMapper`:

```json
{
  // ...
  "jest": {
    // ...
    // support the same @ -> src alias mapping in source code
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

### Cấu hình Babel cho Jest

<!-- todo ES module chưa được hỗ trợ bởi phiên bản mới nhất của Node -->

Mặc dù phiên bản mới nhất của Node đã hỗ trợ hầu như các tính năng của ES2015, nếu bạn vẫn muốn sử dụng cú pháp ES module và stage-x trong test, trong trường hợp đó bạn cần cài thêm `babel-jest`:

```bash
npm install --save-dev babel-jest
```

Tiếp theo, chúng ta cần báo với Jest làm sao để xử lý Javascript test file với `babel-jest` bằng cách thêm `jest.transform` trong `package.json`:

```json
{
  // ...
  "jest": {
    // ...
    "transform": {
      // ...
      // process js with `babel-jest`
      "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
    }
    // ...
  }
}
```

> Theo mặc định, `babel-jest` tự động cấu hình khi được cài đặt. Tuy nhiên, bởi vì chúng ta cần thêm một thiết đặt để transform tất cả file `*.vue`, chúng ta sẽ cần thiết đặt riêng cho `babel-jest`.

Xem như bạn sử dụng `babel-preset-env` với webpack, mặc định cấu hình của Babel tắt ES module transpiler vì webpack đã biết làm thế nào với các ES module này. Tuy nhiên, bạn cần bật nó lên trong test vì Jest test chạy trực tiếp trong Node.

Thêm nữa, chúng ta cần báo `babel-preset-env` để chỉ rõ version Node đang sử dụng. Để bỏ qua việc transpile các tính năng không cần thiết và làm cho test chạy nhanh hơn.

Để áp dụng những thiết đặt này chỉ riêng cho test, đặt chúng trong `env.test` (nó sẽ được tự động chọn bởi `babel-jest`)

Ví dụ `.babelrc`:

```json
{
  "presets": [["env", { "modules": false }]],
  "env": {
    "test": {
      "presets": [["env", { "targets": { "node": "current" } }]]
    }
  }
}
```

### Đặt file Test

Theo mặc định, Jest sẽ lấy tất cả file `.spec.js` hoặc `.test.js` trong toàn bộ project, xem đó là test file. Nếu nó không phù hợp với nhu cầu của bạn, có thể thay đổi [`testRegex`](https://jestjs.io/docs/en/configuration#testregex-string-array-string) trong file `package.json`.

Jest khuyến khích tạo thư mục `__tests__` ngay tại đoạn code được test, tuy nhiên bạn có thể tự do đặt đâu tùy thích. Cần biết một điều là Jest sẽ tạo thư mục `__snapshots__` bên canh các test file có thực hiện snapshot test.

### Coverage

Jest có thể sử dụng để tạo ra report coverage với nhiều định dạng. Bên dưới là ví dụ đơn giản để bạn bắt đầu làm quen:

Mở rộng cấu hình `jest` (thường là ở trong `package.json` hoặc `jest.config.js`) với tùy biến [`collectCoverage`](https://jestjs.io/docs/en/configuration#collectcoverage-boolean) và sau đó thêm mảng [`collectCoverageFrom`](https://jestjs.io/docs/en/configuration#collectcoveragefrom-array) để định nghĩa các file sẽ chứa thông tin coverage muốn thu thập.

```json
{
  "jest": {
    // ...
    "collectCoverage": true,
    "collectCoverageFrom": ["**/*.{js,vue}", "!**/node_modules/**"]
  }
}
```

Nó sẽ bật report Coverage với [thiết đặt mặc định](https://jestjs.io/docs/en/configuration#coveragereporters-array-string). Bạn có thể tùy biến với tùy chọn `coverageReporters`.

```json
{
  "jest": {
    // ...
    "coverageReporters": ["html", "text-summary"]
  }
}
```

Tài liệu khác có thể tìm thấy ở [Tài liệu cấu hình Jest](https://jestjs.io/docs/en/configuration#collectcoverage-boolean), ở đây bạn có thể tìm thấy các tùy biến cho coverage, thư mục sẽ output, đại loại như vậy.

### Spec ví dụ

Nếu bạn đã quen với Jasmine, bạn sẽ cảm thấy như ở nhà với các [hàm kiểm định của Jest](https://jestjs.io/docs/en/expect#content)

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

### Snapshot Test

Khi bạn mount một component với Vue Test Utils, bạn cần truy cập vào HTML root element. Nó có thể được lưu thành snapshot cho [Jest snapshot test](https://jestjs.io/docs/en/snapshot-testing):

```js
test('renders correctly', () => {
  const wrapper = mount(Component)
  expect(wrapper.element).toMatchSnapshot()
})
```

Chúng ta có thể nâng cấp snapshot với tùy biến serializer:

```bash
npm install --save-dev jest-serializer-vue
```

Sau đó thiết đặt trong `package.json`:

```json
{
  // ...
  "jest": {
    // ...
    // serializer for snapshots
    "snapshotSerializers": ["jest-serializer-vue"]
  }
}
```

### Tài nguyên

- [Example project for this setup](https://github.com/vuejs/vue-test-utils-jest-example)
- [Examples and slides from Vue Conf 2017](https://github.com/codebryo/vue-testing-with-jest-conf17)
- [Jest](https://jestjs.io/)
- [Babel preset env](https://github.com/babel/babel-preset-env)
