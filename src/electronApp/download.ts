import fs from 'fs'
import path from 'path'
import os from 'os'
import { download, Progress, File } from 'electron-dl'
import { ipcMain, DownloadItem, IpcMainEvent } from 'electron'
import { BrowserWindow } from 'electron'
import { safeCall } from '@/utils'
import logger from 'electron-log'

class DownLoadTask {
  url: string
  desPath: string
  totalBytes: number
  private item: DownloadItem

  constructor(url: string, desPath: string, item: DownloadItem) {
    this.url = url
    this.desPath = desPath
    this.item = item
    this.totalBytes = item.getTotalBytes()
  }

  cancel() {
    this.item.cancel()
    setTimeout(() => {
      logger.info('DownLoadTask Cancel:', this.url)
      safeCall(fs.existsSync, this.desPath) &&
        safeCall(fs.unlinkSync, this.desPath)
    }, 1000)
  }
}

export default class DownloadManager {
  private win: BrowserWindow
  private tasks: Record<string, DownLoadTask>

  constructor(win: BrowserWindow) {
    this.win = win
    this.tasks = {}
    ipcMain.removeAllListeners('downloadCancel')
    ipcMain.on('downloadCancel', (event: IpcMainEvent, url: string) =>
      this.cancel(url)
    )
  }

  create(url: string) {
    const directory = os.tmpdir()
    const filename = decodeURI(path.basename(url))
    const desPath = path.join(directory, filename)
    safeCall(fs.existsSync, desPath) && safeCall(fs.unlinkSync, desPath)

    return download(this.win, url, {
      directory,
      filename,
      onProgress: (progress: Progress) => {
        this.win.webContents.send('downloadProgress', progress)
      },
      onCompleted: (file: File) => {
        if (file.fileSize === this.tasks[url].totalBytes) {
          this.win.webContents.send('downloadProgress', file)
        } else {
          this.win.webContents.send('downloadFail')
        }
      },
      onStarted: (item: DownloadItem) => {
        this.tasks[url] = new DownLoadTask(url, desPath, item)
      }
    })
  }

  cancel(url: string) {
    if (url === 'ALL') {
      Object.values(this.tasks).forEach((task: DownLoadTask) => {
        task.cancel()
        delete this.tasks[task.url]
      })
    } else if (this.tasks[url]) {
      this.tasks[url].cancel()
      delete this.tasks[url]
    }
  }
}
