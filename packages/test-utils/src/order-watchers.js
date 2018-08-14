// @flow

let i = 0

function orderDeps (watcher): void {
  watcher.deps.forEach(dep => {
    if (dep._sortedId === i) {
      return
    }
    dep._sortedId = i
    dep.subs.forEach(orderDeps)
    dep.subs = dep.subs.sort((a, b) => a.id - b.id)
  })
}

function orderVmWatchers (vm: Component): void {
  if (vm._watchers) {
    vm._watchers.forEach(orderDeps)
  }

  if (vm._computedWatchers) {
    Object.keys(vm._computedWatchers).forEach(computedWatcher => {
      orderDeps(vm._computedWatchers[computedWatcher])
    })
  }

  vm._watcher && orderDeps(vm._watcher)

  vm.$children.forEach(orderVmWatchers)
}

export function orderWatchers (vm: Component): void {
  orderVmWatchers(vm)
  i++
}
