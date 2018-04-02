function setDepsSync (dep) {
  dep.subs.forEach(setWatcherSync)
}

function setWatcherSync (watcher) {
  if (watcher.sync === true) {
    return
  }
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

  setWatcherSync(vm._watcher)

  vm.$children.forEach(setWatchersToSync)
}
