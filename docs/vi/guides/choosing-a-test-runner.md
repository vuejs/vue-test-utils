## Lựa chọn test runner

Một test runner là một chương trình dùng để chạy test.

Có rất nhiều thư viện Javascript phổ biến về test runner, và Vue Test Utils làm việc tốt với tất cả các thư viện này. Một nhiệm vụ bất khả thi.

Có vài điểm cần lưu ý khi chọn một test runner: tập feature, hiệu năng, và có hổ trợ single-file component không. Sau khi cẩn thận so sánh các thư viện hiện tại, có 2 thư viện test runner chúng tôi đề nghị sử dụng:

- [Jest](https://jestjs.io/docs/en/getting-started#content) là bộ test runner với đầy đủ tính năng nhất. Yêu cầu cấu hình ít nhất, đã cấu hình JSDOM mặc định, cung cấp các hàm kiểm tra đầy đủ, và có bộ command line rất tốt khi sử dụng. Tuy nhiên, bạn sẽ cần tiền xử lý để có thể import SFC (Single file component) bên trong test. Chúng tôi đã tạo `vue-jest` để tiền xử lý cho bạn, hiện tại vẫn chưa có 100% các tính năng đang có của `vue-loader`.

- [mocha-webpack](https://github.com/zinserjan/mocha-webpack) là một bản sao của webpack + Mocha, nhưng với giao diện trực quan hơn và chế độ watch mode. Lợi ích của cấu hình này là bạn có sự hỗ trợ SFC đầy đủ thông qua webpack + `vue-loader`, tuy nhiên nó cần cài đặt khá nhiều.

### Môi trường trình duyệt

Vue Test Utils phụ thuộc vào môi trường trình duyệt, về kỹ thuật mà nói bạn cần chạy trong trình duyệt thực tế, tuy nhiên nó không bắt buộc, độ phức tạp để chạy trong trình duyệt thât phụ thuộc quá nhiều vào từng hệ thống. Thay vào đó, chúng tôi đề nghị chạy test trong Node với trình duyệt ảo sử dụng [JSDOM](https://github.com/tmpvar/jsdom).

Jest test runner cài đặt tự động JSDOM. Với các test runner khác, bạn có thể cài đặt thủ công với JSDOM sử dụng [jsdom-global](https://github.com/rstacruz/jsdom-global):

```bash
npm install --save-dev jsdom jsdom-global
```

---

```js
// in test setup / entry
require('jsdom-global')()
```

### Test Single-File Components

Single-file Vue components (SFCs) yêu cầu tiền xử lý trước khi chạy trong Node hoặc trong trình duyệt. Có hai đề nghị để thực hiện tiền xử lý: với tiền xử lý của Jest, hoặc sử dụng webpack.

Tiền xử lý `vue-jest` hổ trợ các tính năng căn bản của SFC, nhưng hiện tại hỗ trợ style block hoặc custom block, vốn chỉ được hỗ trợ trong `vue-loader`. Nếu bạn phụ thuộc vào các tính năng này hoặc các cấu hình khác của webpack, bạn sẽ cần sử dụng cài đặt webpack + `vue-loader`.

Đọc hướng dẫn cài đặt sau theo từng test runner:

- [Testing Single-File Components with Jest](./testing-single-file-components-with-jest.md)
- [Testing Single-File Components with Mocha + webpack](./testing-single-file-components-with-mocha-webpack.md)

### Tài nguyên

- [Test runner performance comparison](https://github.com/eddyerburgh/vue-unit-test-perf-comparison)
- [Example project with Jest](https://github.com/vuejs/vue-test-utils-jest-example)
- [Example project with Mocha](https://github.com/vuejs/vue-test-utils-mocha-webpack-example)
- [Example project with tape](https://github.com/eddyerburgh/vue-test-utils-tape-example)
- [Example project with AVA](https://github.com/eddyerburgh/vue-test-utils-ava-example)
- [tyu - Delightful web testing by egoist](https://github.com/egoist/tyu)
