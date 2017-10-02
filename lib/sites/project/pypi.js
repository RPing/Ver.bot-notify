const request = require('request')

class Pypi {
    constructor() {
        this._projectUrlRegex =
            /^(?:https:\/\/|http:\/\/)?pypi\.python\.org\/pypi\/[A-Za-z0-9_.-]+\/?$/
    }

    isMatchUrlPattern(url) {
        if (url.length > 200) {
            return false
        }
        return this._projectUrlRegex.test(url)
    }

    getNewVersionInfoPromise(check_date, project) {
        const info = []

        return new Promise((resolve, reject) => {
            request(`https://pypi.python.org/pypi/${project.project_name}/json`, function (error, response, body) {
                const data = JSON.parse(body)
                const releases = data.releases

                Object.keys(releases).forEach((version) => {
                    let t = new Date(releases[version][0].upload_time)
                    if (t > check_date) {
                        info.push({
                            version: version,
                            date: t.toString()
                        })
                    }
                })
                resolve(info)
            });
        })
    }
}
module.exports = Pypi
