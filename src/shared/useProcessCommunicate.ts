import { ipcRenderer } from 'electron'
import useEmitter from './useEmitter'


const emitter = useEmitter()

export default function useProcessCommunicate() {
  // 启动底层程序
  const backendServerStart = async function (cb?: (port: number) => void) {
    const port = await ipcRenderer.invoke('backendServerStart')
    cb && cb(port)
  }

  // 设置配置值
  const setLocalConfig = function (key: string, value: any) {
    ipcRenderer.invoke('setLocalConfig', key, value)
  }

  // 获取配置值
  const getLocalConfig = async function (key: string) {
    return await ipcRenderer.invoke('getLocalConfig', key)
  }

  // 窗口最小化到任务栏
  const ipcMainMinimize = function () {
    ipcRenderer.send('minimize')
  }

  const getMainMaximizedValue = function () {
    return ipcRenderer.invoke('MaximizedValue')
  }

  // 窗口是否最大化切换
  const ipcMainMaximizeTogger = function () {
    ipcRenderer.send('maximizeTogger')
  }

  // 窗口关闭
  const ipcMainClose = function () {
    ipcRenderer.send('close')
  }

  // 文件下载
  const ipcMainDownload = function (url: string) {
    ipcRenderer.send('fileDownload', url)
  }

  // 下载任务取消
  const ipcMainDownloadCancel = function (url: string) {
    ipcRenderer.send('downloadCancel', url)
  }

  // 解压文件
  const ipcExtractZip = async function (
    filePath: string,
    cb?: (exepath: string) => void
  ) {
    const { result, exePath } = await ipcRenderer.invoke('extractZip', {
      filePath,
      expectName: '.exe',
      unExpectName: 'WIN'
    })
    if (result) {
      cb && cb(exePath)
    } else {
      // if need
    }
  }

  // 执行终端命令
  const ipcExec = async function (command: string, cb?: (stdout: string) => void) {
    const { error, stdout } = await ipcRenderer.invoke('exec', command)
    // to do: 是否需要处理错误？
    cb && cb(stdout)
  }

  // 打开网址
  const openUrl = function (url: string) {
    url && ipcRenderer.send('openUrl', url)
  }

  // 是否首次安装使用
  const ipcIsFirstRun = function () {
    return ipcRenderer.invoke('isFirstRun')
  }

  const ipcEventListen = function () {
    ipcRenderer.on('buildConnect', () => {
      emitter.emit('buildConnect')
    })
  }

  const ipcEventRemove = function () {
    ipcRenderer.removeAllListeners('buildConnect')
  }

  return {
    backendServerStart,
    getLocalConfig,
    setLocalConfig,
    ipcMainMinimize,
    getMainMaximizedValue,
    ipcMainMaximizeTogger,
    ipcMainClose,
    ipcMainDownload,
    ipcMainDownloadCancel,
    ipcExtractZip,
    ipcExec,
    openUrl,
    ipcEventListen,
    ipcEventRemove,
    ipcIsFirstRun
  }
}
