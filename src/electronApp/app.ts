import {
  app,
  Menu,
  Tray,
  protocol,
  BrowserWindow,
  ipcMain,
  globalShortcut
} from 'electron'
import logger from 'electron-log'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'
import ElectronStore from 'electron-store'
import DownloadManager from './download'
import extract from 'extract-zip'
import { exec } from 'child_process'
import BackendServer from './backendServer'
import SoftwareUpgrader from './softwareUpgrader'
import { setI18nLanguage, i18n } from '@/utils/plugins/i18n'

declare const __static: string;

interface extractCongfig {
  filePath: string
  expectName: string
  unExpectName: string
}

const isDevelopment = process.env.NODE_ENV !== 'production'
// const WM_DISPLAYCHANGE = 0x007e
const WM_DEVICECHANGE = 0x219
const SYSTEM_LANGUAGE_MAP: Record<string, string> = {
  'en-us': 'en',
  'de': 'de',
  'de-at': 'de',
  'de-ch': 'de',
  'de-de': 'de',
  'es': 'es',
  'es-419': 'es',
  'fr': 'fr',
  'fr-ca': 'fr',
  'fr-ch': 'fr',
  'fr-fr': 'fr',
  'pt': 'pt',
  'pt-br': 'pt',
  'pt-pt': 'pt',
  'ru': 'ru',
  'uk': 'en',
  'zh-cn': 'zh-cn',
  'zh-tw': 'zh-tw',
  'ja': 'ja',
  'ko': 'ko'
}

/**
 * 根据 processName 杀死进程
 * @param processNames 
 * @returns
 */
function processKill(processNames: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (!processNames.length) resolve()
      const cmd = process.platform == 'win32' ? 'tasklist' : 'ps aux'
      exec(cmd, function (err, stdout) {
        stdout.split('\n').filter(function (line) {
          const [pname, pid] = line.trim().split(/\s+/)
          if (processNames.some(name => pname.indexOf(name) >= 0)) {
            logger.debug(pname, pid)
            parseInt(pid) && process.kill(parseInt(pid))
          }
          resolve()
        })
      })
    } catch (e) {
      reject(e)
    }
  })
}

const backendServer = new BackendServer()

export default class WindowApp {
  language = ''
  port: number
  mainWindow!: BrowserWindow
  private tray!: Tray
  private store: ElectronStore
  private autoStartup: boolean
  private autoUpgrade: boolean
  private softwareUpgrader: SoftwareUpgrader | undefined
  private downloadManager: DownloadManager
  private deviceChangeTimer: NodeJS.Timeout | undefined | null

  constructor(port: number) {
    this.port = port
    ElectronStore.initRenderer()
    this.store = new ElectronStore()
    this.autoStartup = this.store.get('autoStartup') as boolean
    this.autoUpgrade = this.store.get('autoUpgrade') as boolean
    this.downloadManager = new DownloadManager(this.mainWindow)
    logger.transports.file?.getFile()?.clear()
  }

  start() {
    this.appInit()
    this.ipcEventRegist()
  }
  // 初始化
  private appInit() {
    app.on('second-instance', () => {
      // 当运行第二个实例时,将会聚焦到myWindow这个窗口
      if (this.mainWindow) {
        if (!this.mainWindow.isVisible()) {
          this.mainWindow.show();
          this.mainWindow.setSkipTaskbar(false)
        }
        this.mainWindow.focus();
      }
    })
    // Scheme must be registered before the app is ready
    protocol.registerSchemesAsPrivileged([
      { scheme: 'app', privileges: { secure: true, standard: true, stream: true } }
    ])
    // Exit cleanly on request from parent process in development mode.
    if (isDevelopment) {
      if (process.platform === 'win32') {
        process.on('message', (data) => {
          if (data === 'graceful-exit') {
            app.quit()
          }
        })
      } else {
        process.on('SIGTERM', () => {
          app.quit()
        })
      }
    }
    app.whenReady().then(async () => {
      // Install Vue Devtools
      if (isDevelopment && !process.env.IS_TEST) {
        try {
          await installExtension(VUEJS3_DEVTOOLS)
        } catch (e: unknown) {
          console.error('Vue Devtools failed to install:', e)
        }
      }
      // Init Language
      this.language = this.store.get('language') as string || SYSTEM_LANGUAGE_MAP[app.getLocale().toLowerCase()] || 'zh-cn'
      setI18nLanguage(this.language)
      this.store.set('languageTemp', this.language)
      // Register Iamge Protocol
      protocol.registerFileProtocol('load-image', (request, cb) => {
        const url = request.url.substring(14)
        cb(decodeURI(path.normalize(url)))
      })
      // Reigster Shortcut
      app.on('browser-window-focus', () => {
        globalShortcut.registerAll(['CommandOrControl+W'], () => { })
      })
      app.on('browser-window-blur', () => {
        globalShortcut.unregister('CommandOrControl+W')
      })
      // globalShortcut.register("CommandOrControl+R", this.handleRefresh.bind(this))
      // globalShortcut.register("CommandOrControl+shift+R", this.handleRefresh.bind(this))
      // Creat Window And Tray
      this.createWindow()
      this.createTray()
    });
    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
      // On macOS it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) this.createWindow()
    })
    app.on('before-quit', () => {
      logger.debug('before-quit')
    })
  }
  // 主进程渲染进程通信事件
  private ipcEventRegist() {
    // 启动底层程序
    ipcMain.handle('backendServerStart', async () => {
      return backendServer.start(this.port)
    })
    // 最小化到任务栏
    ipcMain.on('minimize', () => {
      this.mainWindow.minimize()
    })

    ipcMain.handle('MaximizedValue', () => {
      return this.mainWindow.isMaximized()
    })
    // 设置（取消）窗口最大化
    ipcMain.on('maximizeTogger', () => {
      if (this.mainWindow.isMaximized()) {
        this.mainWindow.unmaximize()
      } else {
        this.mainWindow.maximize()
      }
    })
    // 关闭到推盘
    ipcMain.on('close', () => {
      this.mainWindow.hide()
      this.mainWindow.setSkipTaskbar(true)
    })
    // 文件下载
    ipcMain.on('fileDownload', (event, url: string) => {
      this.downloadManager.create(url)
    })
    // zip 解压
    ipcMain.handle('extractZip', (event, { filePath, expectName, unExpectName }: extractCongfig) => {
      const extractPath = path.dirname(filePath)
      return new Promise((resolve) => {
        let exePath = ''
        extract(filePath, {
          dir: extractPath,
          onEntry: (entry) => {
            if (entry.fileName.indexOf(expectName) > -1 && entry.fileName.indexOf(unExpectName) < 0) {
              exePath = path.join(extractPath, entry.fileName)
            }
          },
        })
          .then(() => {
            resolve({ result: 1, exePath })
          })
          .catch(() => {
            resolve({ result: 0, exePath })
          })
      })
    })
    // 执行命令行
    ipcMain.handle('exec', async (event, command: string) => {
      return new Promise((resolve) => {
        exec(command, (error, stdout) => {
          resolve({ error, stdout })
        })
      })
    })
    // 修改本机配置
    ipcMain.handle('setLocalConfig', (event, key: string, value: any) => {
      return this.store.set(key, value);
    })
    // 获取本机配置
    ipcMain.handle('getLocalConfig', (event, key: string) => {
      return this.store.get(key);
    })
  }
  // 刷新处理
  private handleRefresh() {
    if (isDevelopment) {
      // 手动处理刷新
    } else {
      logger.debug("CommandOrControl+R is pressed: Shortcut Disabled");
    }
  }
  // 创建窗口
  private async createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1920,
      height: 1080,
      minWidth: 1280,
      minHeight: 720,
      webPreferences: {
        // Use pluginOptions.nodeIntegration, leave this alone
        // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
        nodeIntegration: true,
        contextIsolation: false
      },
      frame: false,
    })

    this.mainWindow.hookWindowMessage(WM_DEVICECHANGE, () => {
      if (this.deviceChangeTimer) {
        clearTimeout(this.deviceChangeTimer)
      }
      this.deviceChangeTimer = setTimeout(() => {
        this.mainWindow.webContents.send('wm_deviceChange')
        this.deviceChangeTimer = null
      }, 1000)
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      await this.mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
      logger.info('loadURL complete')
      if (!process.env.IS_TEST) this.mainWindow.webContents.openDevTools()
    } else {
      createProtocol('app')
      // Load the index.html when not in development
      await this.mainWindow.loadURL('app://./index.html/i18n')
      logger.info('loadURL complete')
    }
    this.softwareUpgrader = new SoftwareUpgrader(this.mainWindow)
    // this.softwareUpgrader.run().then(() => {
    this.mainWindow.webContents.send('buildConnect')
    // })
  }
  // 创建推盘
  private createTray() {
    this.tray = new Tray(path.join(__static, 'favicon.ico'))
    this.tray.setContextMenu(this.creatContextMenu())
    this.tray.setToolTip('Tool Tip')
    this.tray.on('click', () => {
      this.mainWindow.show()
      this.mainWindow.setSkipTaskbar(false)
    })
  }
  // 生成托盘选项
  private creatContextMenu() {
    return Menu.buildFromTemplate([
      // {
      //   label: '自动升级',
      //   type: 'checkbox',
      //   checked: this.autoUpgrade,
      //   click: () => {
      //     this.autoUpgrade = !this.autoUpgrade
      //     this.store.set('autoUpgrade', !this.autoUpgrade)
      //     if (this.autoUpgrade) {
      //       this.softwareUpgrader && this.softwareUpgrader.run()
      //     }
      //   },
      // },
      {
        label: i18n('TrayStartAtBoot'),
        type: 'checkbox',
        checked: this.autoStartup,
        click: () => this.setAutoStartUp(!this.autoStartup)
      },
      {
        label: i18n('TrayQuit'),
        type: 'normal',
        click: () => {
          this.downloadManager.cancel('ALL')
          app.quit()
        },
      }
    ])
  }
  // 切换开机自启
  private setAutoStartUp(value: boolean) {
    this.autoStartup = value
    this.store.set('autoStartup', this.autoStartup)
    if (!app.isPackaged) {
      app.setLoginItemSettings({
        openAtLogin: value,
        openAsHidden: true,
        path: process.execPath
      })
    } else {
      app.setLoginItemSettings({
        openAtLogin: value,
        openAsHidden: true
      })
    }
  }
}
