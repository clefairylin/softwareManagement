import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import makeDir from 'make-dir'


const firstRun = function (): boolean {
    const configPath = path.join(app.getPath('userData'), 'FirstRun', 'xxx-first-run')

    if (fs.existsSync(configPath)) {
        return false;
    }

    try {
        fs.writeFileSync(configPath, '')
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            makeDir.sync(path.join(app.getPath('userData'), 'FirstRun'));
            return firstRun();
        }

        throw error
    }

    return true
}

const clear = function () {
    const configPath = path.join(app.getPath('userData'), 'FirstRun', 'xxx-first-run')

    if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
    }
};

export default firstRun
