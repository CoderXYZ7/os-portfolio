import chokidar from 'chokidar';

export function createWatcher(store, broadcast, { projectsDir, contentDir, debounceMs = 300 }) {
  let timer = null;

  const scheduleRefresh = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      await store.refresh();
      broadcast({ type: 'changed' });
    }, debounceMs);
  };

  const watcher = chokidar.watch([projectsDir, contentDir], {
    ignoreInitial: true,
  });

  watcher.on('add', scheduleRefresh);
  watcher.on('change', scheduleRefresh);
  watcher.on('unlink', scheduleRefresh);
  watcher.on('addDir', scheduleRefresh);
  watcher.on('unlinkDir', scheduleRefresh);

  return watcher;
}
