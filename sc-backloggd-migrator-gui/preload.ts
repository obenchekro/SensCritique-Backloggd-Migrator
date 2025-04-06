import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  startMigration: () => {
    return ipcRenderer.invoke('start-migration');
  }
});