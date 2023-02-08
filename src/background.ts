import { app } from 'electron'
import net from 'net'
import logger from 'electron-log'
import WindowApp from '@/electronApp/app'


if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  portDetector(10000).then((port: number) => {
    new WindowApp(port).start()
  }).catch((err) => {
    logger.error('port detector error', err)
  })
}

function portDetector(port: number): Promise<number> {
  const server = net.createServer().listen(port)
  return new Promise((resolve, reject) => {
    server.on('listening', () => {
      logger.info(`port ${port} is availiable.`)
      server.close()
      resolve(port)
    })
    server.on('error', () => {
      port >= 65535 ? reject('port exhausted') : resolve(portDetector(port + 1))
    })
  })
}
