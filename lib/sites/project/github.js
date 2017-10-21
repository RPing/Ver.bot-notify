const request = require('request')
const FeedParser = require('feedparser')

let _singleton

class Github {
    constructor() {
        if (_singleton)
            return _singleton

        this._projectUrlRegex =
            /^(?:https:\/\/|http:\/\/)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/

        _singleton = this
    }

    isMatchUrlPattern(url) {
        if (url.length > 200)
            return false

        return this._projectUrlRegex.test(url)
    }

    getNewVersionInfo(check_date, project, cb) {
        const url = `https://github.com/${project.project_author}/${project.project_name}/releases.atom`
        const req = request(url, { timeout: 1500 })
        const feedparser = new FeedParser({ addmeta: false })

        const info = []

        req.on('error', (error) => {
            cb(error)
        })

        req.on('response', function (res) {
            const stream = this // `this` is `req`, which is a stream
            if (res.statusCode !== 200)
                this.emit('error', new Error('Bad status code'))
            else
                stream.pipe(feedparser)
        })

        feedparser.on('error', (error) => {
            cb(error)
        })

        feedparser.on('readable', function () {
            let item
            const stream = this // `this` is `feedparser`, which is a stream
            // eslint-disable-next-line no-cond-assign
            while (item = stream.read()) {
                const t = new Date(item.date)
                if (t > check_date) {
                    info.push({
                        version: item.title,
                        date: t.toString()
                    })
                }
            }
        })

        feedparser.on('end', () => {
            cb(null, info)
        })
    }

    getReleasesPage(project) {
        return `https://github.com/${project.project_author}/${project.project_name}/releases`
    }
}

module.exports = Github
