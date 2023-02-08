const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      alias: {
        "@assets": path.resolve(__dirname, 'src/assets')
      }
    }
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: '@import "./src/styles/global.scss";'
      }
    }
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      customFileProtocol: 'app://../',
      builderOptions:{
        productName:"electronTemplate",
        appId: "electronTemplate",
        // extraResources: [
        //   {
        //     from: '',
        //     to: 'bin',
        //     filter: ['**/*','!**/*.pdb'],
        //   },
        // ],
        win: {
          icon: 'public/favicon.ico',
        },
        nsis: {
          oneClick: false, // 一键安装
          allowToChangeInstallationDirectory: true, // 允许修改安装目录
          uninstallDisplayName: 'electronTemplate',
          perMachine: false,
          // license: "build/Monitor EULA_20200731_v1.0.rtf",
          allowElevation: true,
          // include: 'public/installer.nsh',
          packElevateHelper: true,
        },
      },
    }
  }
})