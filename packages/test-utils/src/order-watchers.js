let i = 0

function orderDeps (watcher) {
  watcher.deps.forEach(dep => {
    if (dep._sortedId === i) {
      return
    }
    dep._sortedId = i
    dep.subs.forEach(orderDeps)
    dep.subs = dep.subs.sort((a, b) => a.id - b.id)
  })
}

function orderVmWatchers (vm) {
  if (vm._watchers) {
    vm._watchers.forEach(orderDeps)
  }

  if (vm._computedWatchers) {
    Object.keys(vm._computedWatchers).forEach((computedWatcher) => {
      orderDeps(vm._computedWatchers[computedWatcher])
    })
  }

  orderDeps(vm._watcher)

  vm.$children.forEach(orderVmWatchers)
}

export function orderWatchers (vm) {
  orderVmWatchers(vm)
  i++
}
