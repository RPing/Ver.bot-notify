const RegClient = require('npm-registry-client')
const client = new RegClient({})

let _singleton

class Npm {
    constructor() {
        if (_singleton) {
            return _singleton
        }

        this._projectUrlRegex =
            /^(?:https:\/\/|http:\/\/)?www\.npmjs\.com\/package\/[A-Za-z0-9_.-]+\/?$/

        _singleton = this
    }

    isMatchUrlPattern(url) {
        if (url.length > 200) {
            return false
        }
        return this._projectUrlRegex.test(url)
    }

    getNewVersionInfoPromise(check_date, project) {
        const uri = `https://registry.npmjs.org/${project.project_name}`
        const params = {timeout: 1000}
        const info = []

        return new Promise((resolve, reject) => {
            client.get(uri, params, function (error, data) {
                if (error) {
                    reject(error)
                }

                const time = data['time']
                // FIXME: next line may need sort before reverse to ensure right order
                const keys = Object.keys(time).reverse()
                for(let i = 0; i < keys.length; i++){
                    if (keys[i] === 'modified' || keys[i] === 'created') {
                        continue
                    }

                    const version = keys[i]
                    const t = new Date(time[version])
                    if (t > check_date) {
                        info.push({
                            version: version,
                            date: t.toString()
                        })
                    } else {
                        break
                    }
                }

                resolve(info)
            })
        })

    }
}
module.exports = Npm
