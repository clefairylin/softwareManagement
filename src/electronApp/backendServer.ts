import cProcess from 'child_process'
import path from 'path'
import logger from 'electron-log'


export default class BackendServer {
  private exeName = ''
  private exePath = path.join(path.dirname(__dirname), 'bin', this.exeName)

  start(port: number) {
    if (!this.exePath || !port) {
      return logger.error("can not find execFile")
    }
    cProcess.exec(`tasklist | findstr ${this.exeName}`, (err, stdout: string) => {
      if (!stdout.length) {
        const args = ['--urls', `http://*:${port}`];
        logger.debug(`open backserver ${this.exePath}`, 'port', port);
        cProcess.execFile(this.exePath, args, (err, data) => { logger.error(err, data.toString()) });
      }
    })
  }
}
