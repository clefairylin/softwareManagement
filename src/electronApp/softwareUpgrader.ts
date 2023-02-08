import axios from 'axios'
import path from 'path'
import os from 'os'
import fs from 'fs'
import logger from 'electron-log'
import { download } from 'electron-dl'
import { BrowserWindow, DownloadItem } from 'electron'
import { promisify } from 'util'
import { app, dialog } from 'electron'
import cProcess from 'child_process'
import isOnline from 'is-online'
import getmac from 'getmac'
import packageJson from '../../package.json'


interface SoftwarePackageInfo {
  description: string
  downloadUrl: string
  force: boolean
  newVersionName: string
  newVersionNum: string
  pkg: string
  size: number
  upgId: string
  upgNm: string
}

const domain = 'https://saas.zeasn.tv'
const tokenApi = domain + '/auth-api/api/v1/auth/deviceSign'
const fetchUpgradeApi = domain + '/sp/api/device/v1/clientUpg'

export default class SoftwareUpgrader {
  private brandId = 75
  private productId = 857
  private pkg = 'Philips Precision Center'
  private channelId = '1'
  private mainWindow: BrowserWindow
  private packageInfo: SoftwarePackageInfo = {
    description: '',
    downloadUrl: '',
    force: false,
    newVersionName: '',
    newVersionNum: '',
    pkg: '',
    size: 0,
    upgId: '',
    upgNm: ''
  }
  private token = ''
  private cachePath = ''
  private isDownloading = false

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    return this
  }

  run(): Promise<void> {
    return new Promise((resolve) => {
      isOnline().then(async online => {
        if (online) {
          await this.getToken()
          await this.getSoftwareLatest()
          if (this.packageInfo.newVersionNum) {
            this.cachePath = path.join(
              os.tmpdir(),
              `${this.packageInfo.upgNm.replaceAll(' ', '')}Update`
            )
            const confirmValue = await this.upgradeConfirm()
            if (confirmValue) {
              return this.packageDownload()
            }
          }
        } else {
          logger.error('no internet')
        }
        resolve()
      }).catch((error) => {
        logger.error('check online error', error)
        resolve()
      })
    })
  }

  // 获取 token
  private getToken(): Promise<string> {
    return new Promise((resolve) => {
      axios.get(tokenApi, {
        params: {
          brandId: this.brandId,
          productId: this.productId,
          mac: getmac(),
        }
      }).then(({ data }) => {
        if (data.errorCode === '0') {
          this.token = data.data.token || ''
          resolve(this.token)
        } else {
          logger.info('get token fail')
          resolve('')
        }
      }).catch((error) => {
        logger.error('get token error:', error)
      })
    })
  }

  // 获取最新版本信息
  private getSoftwareLatest(): Promise<SoftwarePackageInfo | void> {
    return new Promise((resolve) => {
      axios.get(fetchUpgradeApi, {
        params: {
          token: this.token,
          pkg: this.pkg,
          channelId: this.channelId,
          versionNum: packageJson.version.replaceAll('.', '')
        }
      }).then(({ data }) => {
        if (data.data) {
          this.packageInfo = data.data
          resolve(data.data)
        } else {
          logger.info('upgrade package not found')
          resolve()
        }
      }).catch((error) => {
        logger.error('get software latest error:', error)
        resolve()
      })
    })
  }

  // 升级确认弹窗
  private async upgradeConfirm(): Promise<boolean> {
    const msgBoxValue = await dialog.showMessageBox({
      type: 'info',
      buttons: ['Upgrade', 'Later'],
      title: 'Application Update',
      defaultId: 0,
      cancelId: 1,
      message: "A new version has been downloaded",
      detail: 'A new version has been downloaded.'
    })
    return msgBoxValue.response === 0
  }

  // 软件升级包下载
  private async packageDownload() {
    if (!this.isDownloading && this.packageInfo) {
      if (this.cachePath && !fs.existsSync(this.cachePath)) {
        fs.mkdirSync(this.cachePath, { recursive: true })
      }
      const { upgNm, newVersionName, downloadUrl } = this.packageInfo
      // 文件命名
      const fileName = `${upgNm} Setup ${newVersionName}.exe`
      const tempFileName = fileName + '.temp'
      const tempFilePath = path.join(this.cachePath, tempFileName)
      // 下载
      this.isDownloading = true
      await download(
        this.mainWindow,
        downloadUrl,
        {
          directory: this.cachePath,
          filename: tempFileName,
          onStarted: (item: DownloadItem) => {
            // 更正安装包实际大小
            this.packageInfo.size = item.getTotalBytes()
          },
          // onProgress: (progress) => {
          // console.log(progress)
          // }
        }
      )
      this.isDownloading = false
      // 判断安装包大小是否正确后安装
      promisify(fs.stat)(tempFilePath).then((stats) => {
        const exePath = path.join(this.cachePath, fileName)
        if (stats.size === this.packageInfo.size) {
          fs.renameSync(tempFilePath, exePath);
        }
        if (fs.existsSync(exePath)) {
          if (fs.statSync(exePath).size === this.packageInfo.size) {
            logger.info('installation package is ready ...')
            this.install(exePath)
            return true
          } else {
            fs.unlinkSync(exePath)
          }
        }
      })
    }
  }

  // 升级包安装
  private install(filePath: string) {
    const installPorcess = cProcess.spawn(filePath, ['--updated', '--force-run'], {
      detached: true,
      stdio: 'ignore',
    })
    installPorcess.on('error', error => {
      logger.error('install error', error)
    })
    installPorcess.unref()
    setTimeout(() => { app.exit() }, 2000)
  }
}