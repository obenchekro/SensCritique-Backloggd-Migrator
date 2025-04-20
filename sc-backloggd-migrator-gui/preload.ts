import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  startMigration: () => {
    return ipcRenderer.invoke('start-migration');
  },
  redirectToDisplay: () => ipcRenderer.invoke('redirect-to-display'),
  runBackloggdRatings: () => ipcRenderer.invoke('run-backloggd-rating')
});