## Config

Vue Test Utils bao gồm một object để tùy biến khi sử dụng Vue Test Utils.

### Các tùy biến config Vue Test Utils

### `stubs`

- loại: `{ [name: string]: Component | boolean | string }`
- mặc định: `{ transition: TransitionStub, 'transition-group': TransitionGroupStub }`

Khi truyền `stubs` như một array vào trong tùy chọn mount, `config.stubs` được chuyển thành array, và sẽ xóa component với với một component căn bản.

Example:

```js
import { config } from '@vue/test-utils'

config.stubs['my-component'] = '<div />'
```

### `mocks`

- loại: `Object`
- mặc định: `{}`

Giống như `stubs`, các giá trị truyền vào cho `config.mocks` được sử dụng làm mặc định. Tất cả những giá trị tuyền vào cho `mocks` sẽ được ưu tiên cao hơn những object được khai báo trong `config.mocks`.

Ví dụ:

```js
import { config } from '@vue/test-utils'

config.mocks['$store'] = {
  state: {
    id: 1
  }
}
```

### `methods`

- loại: `{ [name: string]: Function }`
- mặc định: `{}`

Bạn có thể thay đổi các phương mặc định sử dụng object `config`. Nó rất hữa dụng với những plugin có nhúng một số phương thức cho component, như [VeeValidate](https://vee-validate.logaretm.com/). Bạn có thể ghi đè các phướng thức trong `config` bằng cách truyền vào tùy chọn `methods`.

Ví dụ:

```js
import { config } from '@vue/test-utils'

config.methods['getData'] = () => {}
```

### `provide`

- loại: `Object`
- mặc định: `{}`

Giống như `stubs` hoặc `mocks`, giá trị truyền vào `config.provide` sẽ được sử dụng làm mặc định. Bất kỳ giá trị nào truyền vào cho `provide` sẽ được ưu tiên cao hơn những biến được khai báo trong `config.provide`. **Lưu ý rằng không hỗ trợ việc gắn function thằng vào `config.provide`**

Ví dụ:

```js
import { config } from '@vue/test-utils'

config.provide['$logger'] = {
  log: (...args) => {
    console.log(...args)
  }
}
```

### `silent`

- loại: `Boolean`
- mặc định: `true`

Nó sẽ chặn các cảnh bảo của Vue khi mutate các observable component (ví dụ như props). Khi đặt `false`, tất cả cảnh báo sẽ hiển thị trong console. Tùy chọn này phụ thuộc vào `Vue.config.silent`.

Ví dụ:

```js
import { config } from '@vue/test-utils'

config.silent = false
```
