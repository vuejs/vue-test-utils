// @flow

import { VUE_VERSION } from 'shared/consts'

function setDepsSync (dep): void {
  dep.subs.forEach(setWatcherSync)
}

function setWatcherSync (watcher): void {
  if (watcher.sync === true) {
    return
  }
  watcher.sync = true
  watcher.deps.forEach(setDepsSync)
}

export function setWatchersToSync (vm: Component): void {
  if (vm._watchers) {
    vm._watchers.forEach(setWatcherSync)
  }

  if (vm._computedWatchers) {
    Object.keys(vm._computedWatchers).forEach(computedWatcher => {
      setWatcherSync(vm._computedWatchers[computedWatcher])
    })
  }

  setWatcherSync(vm._watcher)

  vm.$children.forEach(setWatchersToSync)
  // preventing double registration
  if (!vm.$_vueTestUtils_updateInSetWatcherSync) {
    vm.$_vueTestUtils_updateInSetWatcherSync = vm._update
    vm._update = function (vnode, hydrating) {
      this.$_vueTestUtils_updateInSetWatcherSync(vnode, hydrating)
      if (VUE_VERSION >= 2.1 && this._isMounted && this.$options.updated) {
        this.$options.updated.forEach(handler => {
          handler.call(this)
        })
      }
    }
  }
}
