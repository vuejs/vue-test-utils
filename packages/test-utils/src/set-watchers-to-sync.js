function setDepsSync (dep) {
  dep.subs.forEach((watcher) => {
    watcher.sync = true
    if (watcher.sync === true) {
      return
    }
    watcher.deps.forEach(setDepsSync)
  })
}
function setWatcherSync (watcher) {
  watcher.sync = true
  watcher.deps.forEach(setDepsSync)
}

export function setWatchersToSync (vm) {
  if (vm._watchers) {
    vm._watchers.forEach(setWatcherSync)
  }
  if (vm._computedWatchers) {
    Object.keys(vm._computedWatchers).forEach((computedWatcher) => {
      setWatcherSync(vm._computedWatchers[computedWatcher])
    })
  }

  if (vm._watcher) {
    setWatcherSync(vm._watcher)
  }

  vm.$children.forEach(setWatchersToSync)
}
