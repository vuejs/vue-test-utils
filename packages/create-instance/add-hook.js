// This is used instead of Vue.mixin. The reason is that
// Vue.mixin is slower, and remove modfied options
// https://github.com/vuejs/vue/issues/8710

export function addHook (options, hook, fn) {
  if (options[hook] && !Array.isArray(options[hook])) {
    options[hook] = [options[hook]]
  }
  (options[hook] || (options[hook] = [])).push(fn)
}
