## 配合 TypeScript 使用

> 我们在 [GitHub](https://github.com/vuejs/vue-test-utils-typescript-example) 上放有一个关于这些设置的示例工程。

TypeScript 是一个流行的 JavaScript 超集，它在普通 JS 的基础上加入了类型 (type) 和类 (class)。Vue Test Utils 在发行包中包含了类型信息，因此它可以很好的和 TypeScript 配合使用。

在这份指南中，我们会介绍如何基于 Vue CLI 的 TypeScript 设置，使用 Jest 和 Vue Test Utils 为一个 TypeScript 工程建立测试。

### 加入 TypeScript

首先，你需要创建一个工程。如果你还没有安装 Vue CLI 的话，请先全局安装：

```shell
$ npm install -g @vue/cli
```

然后通过下列命令创建一个工程：

```shell
$ vue create hello-world
```

在 CLI 提示符中，选择 `Manually select features` (手动选择特性)，并选中 TypeScript 回车。这将会创建一个配置好 TypeScript 的工程。

::: tip 注意
如果你想要了解更多用 TypeScript 设置 Vue 的细节，请移步 [TypeScript Vue starter guide](https://github.com/Microsoft/TypeScript-Vue-Starter)。
:::

下一步就是把 Jest 添加到工程中。

### 设置 Jest

Jest 是一个由 Facebook 研发的测试运行器，它致力于提供一个低能耗的测试解决方案。你可以在其[官方文档](https://jestjs.io/)中了解更多 Jest 的情况。

安装 Jest 和 Vue Test Utils：

```bash
$ npm install --save-dev jest @vue/test-utils
```

接下来在 `package.json` 里定义一个 `test:unit` 脚本。

```json
// package.json
{
  // ..
  "scripts": {
    // ..
    "test:unit": "jest"
  }
  // ..
}
```

### 在 Jest 中执行单文件组件

为了讲解 Jest 如何处理 `*.vue` 文件，我们需要安装并配置 `vue-jest` 预处理器：

```bash
npm install --save-dev vue-jest
```

然后在 `package.json` 里创建一个 `jest` 块：

```json
{
  // ...
  "jest": {
    "moduleFileExtensions": [
      "js",
      "ts",
      "json",
      // 告诉 Jest 处理 `*.vue` 文件
      "vue"
    ],
    "transform": {
      // 用 `vue-jest` 处理 `*.vue` 文件
      ".*\\.(vue)$": "vue-jest"
    },
    "testURL": "http://localhost/"
  }
}
```

### 为 Jest 配置 TypeScript

为了在测试中使用 TypeScript 文件，我们需要在 Jest 中设置编译 TypeScript。为此我们需要安装 `ts-jest`：

```bash
$ npm install --save-dev ts-jest
```

接下来，我们需要在 `package.json` 中的 `jest.transform` 中加入一个入口告诉 Jest 使用 `ts-jest` 处理 TypeScript 测试文件：

```json
{
  // ...
  "jest": {
    // ...
    "transform": {
      // ...
      // 用 `ts-jest` 处理 `*.ts` 文件
      "^.+\\.tsx?$": "ts-jest"
    }
    // ...
  }
}
```

### 放置测试文件

默认情况下，Jest 将会在整个工程里递归地找到所有的 `.spec.js` 或 `.test.js` 扩展名文件。

我们需要改变 `package.json` 文件里的 `testRegex` 配置项以运行 `.ts` 扩展名的测试文件。

在 `package.json` 中添加以下 `jest` 字段：

```json
{
  // ...
  "jest": {
    // ...
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$"
  }
}
```

Jest 推荐我们在被测试的代码旁边创建一个 `__tests__` 目录，但你完全可以根据自己的喜好组织你的测试文件。只是要注意 Jest 会在进行截图测试的时候在测试文件旁边创建一个 `__snapshots__` 目录。

### 撰写一个单元测试

现在我们已经把工程设置好了，是时候撰写一个单元测试了。

创建一个 `src/components/__tests__/HelloWorld.spec.ts` 文件，并加入如下代码：

```js
// src/components/__tests__/HelloWorld.spec.ts
import { shallowMount } from '@vue/test-utils'
import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld.vue', () => {
  test('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      propsData: { msg }
    })
    expect(wrapper.text()).toMatch(msg)
  })
})
```

这就是我们让 TypeScript 和 Vue Test Utils 一起工作所需要的全部工作！

### 相关资料

- [该设置的示例工程](https://github.com/vuejs/vue-test-utils-typescript-example)
- [Jest](https://jestjs.io/)
