# Testing Asynchronous Components

> An example project will be made available.

To simplify testing, `vue-test-utils` applies updates _synchronously_. However, there are some techniques you need to be aware ofwhen testing a component with asynchronous behavior such as callbacks or promises.

One common cases is componentst that use `watch`, which updates asynchronously. Below in an example of a component that renders some content based on a boolean value, which is updated using a watcher:

``` js
Demo....
```
The above test fails - however, when you test it by hand in a browser, it seems fine!  The reason the test is failing is because properties inside of `watch` use promises. In this test, the assertion occurs before the promise is resolved, so the `button` is still not visible.

One solution is to use the npm package, `flush-promises`. This allows you to immediately resolve any promises. Let's update the test:

Now the test passes! Note, because we are using the ES7 keyword `await`, we need to prepend the test with `async`.
