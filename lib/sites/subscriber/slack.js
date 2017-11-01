const request = require('request')

const db = require('../../db')

let _singleton

class slack {
    constructor() {
        if (_singleton)
            return _singleton

        this._projectUrlRegex =
            /^(?:https:\/\/|http:\/\/)?www\.npmjs\.com\/package\/[A-Za-z0-9_.-]+\/?$/

        _singleton = this
    }

    send(chat_id, msg, cb) {
        const options = {
            url: 'https://slack.com/api/chat.postMessage',
            method: 'POST',
            timeout: 3000,
            form: {
                text: msg,
                channel: chat_id,
            },
        }

        db.getSlackTokenPromise(chat_id)
            .then((token) => {
                options.form.token = token
                request(options, (err, res) => {
                    if (err)
                        return cb(err)

                    if (typeof res === 'undefined')
                        return cb(new Error(`Timeout Error. res object is ${res}`))
                    else if (res.statusCode !== 200)
                        return cb(new Error(`res code is ${res.statusCode}`))

                    cb(null)
                })
            })
            .catch(err => cb(err))
    }

    notify(chat_id, project_name, release_page, version_info, cb) {
        const options = {
            url: 'https://slack.com/api/chat.postMessage',
            method: 'POST',
            timeout: 3000,
            form: {
                text: this._format(project_name, version_info),
                channel: chat_id,
                attachments: JSON.stringify([{
                    title: 'Check it out!',
                    title_link: release_page,
                    color: '#5942f4',
                }])
            },
        }

        db.getSlackTokenPromise(chat_id)
            .then((token) => {
                options.form.token = token
                request(options, (err, res) => {
                    if (err)
                        return cb(err)

                    if (typeof res === 'undefined')
                        return cb(new Error(`Timeout Error. res object is ${res}`))
                    else if (res.statusCode !== 200)
                        return cb(new Error(`res code is ${res.statusCode}`))

                    cb(null)
                })
            })
            .catch(err => cb(err))
    }

    _format(name, info) {
        let str = `_${name}_ has new version!!\n`
        info.forEach((item) => {
            str += `*${item.version}* released at ${item.date}\n`
        })
        return str
    }
}
module.exports = slack
