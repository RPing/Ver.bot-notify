const request = require('request')

let _singleton

class Pypi {
    constructor() {
        if (_singleton) {
            return _singleton
        }

        this._projectUrlRegex =
            /^(?:https:\/\/|http:\/\/)?pypi\.python\.org\/pypi\/[A-Za-z0-9_.-]+\/?$/

        _singleton = this
    }

    isMatchUrlPattern(url) {
        if (url.length > 200) {
            return false
        }
        return this._projectUrlRegex.test(url)
    }

    getNewVersionInfo(check_date, project, cb) {
        const info = []

        request(`https://pypi.python.org/pypi/${project.project_name}/json`, function (error, response, body) {
            if (error) {
                cb(error)
            }

            const data = JSON.parse(body)
            const releases = data.releases

            Object.keys(releases).forEach((version) => {
                if (releases[version].length > 0) {
                    const t = new Date(releases[version][0].upload_time)
                    if (t > check_date) {
                        info.push({
                            version: version,
                            date: t.toString()
                        })
                    }
                }
            })
            cb(null, info)
        })
    }

    getReleasesPage(project) {
        return `https://pypi.org/project/${project.project_name}/#history`
    }
}
module.exports = Pypi
