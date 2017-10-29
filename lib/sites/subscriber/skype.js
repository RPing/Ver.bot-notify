const request = require('requestretry')
const qs = require('querystring')

let _singleton

class skype {
    constructor() {
        if (_singleton)
            return _singleton

        _singleton = this
    }

    send(chat_id, msg, cb) {
        const appId = process.env.SKYPE_APP_ID
        const appSecret = process.env.SKYPE_APP_SECRET

        this._requestToken(appId, appSecret, (err, token) => {
            if (err)
                return cb(err)

            this._sendMsg(token, chat_id, msg, false, cb)
        })
    }

    notify(chat_id, project_name, release_page, version_info, cb) {
        const appId = process.env.SKYPE_APP_ID
        const appSecret = process.env.SKYPE_APP_SECRET

        this._requestToken(appId, appSecret, (err, token) => {
            if (err)
                return cb(err)

            const msg = this._format(project_name, version_info, release_page)
            this._sendMsg(token, chat_id, msg, true, cb)
        })
    }

    _format(name, info, page) {
        let str = `**${name}** has new version!!\n\n`
        info.forEach((item) => {
            str += `*${item.version}* released at ${item.date}\n\n`
        })
        str += `[Check it out!](${page})`
        return str
    }

    _sendMsg(accessToken, chat_id, msg, isMarkdown, cb) {
        const textFormat = isMarkdown ? 'markdown' : 'plain'
        const options = {
            url: `https://smba.trafficmanager.net/apis/v3/conversations/${chat_id}/activities`,
            method: 'POST',
            headers: {
                // eslint-disable-next-line quote-props
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            json: {
                text: msg,
                type: 'message',
                textFormat: textFormat,
            },
            maxAttempts: 3,
            retryDelay: 500,
        }

        request(options, (err, res) => {
            if (err)
                return cb(err)

            if (typeof res === 'undefined')
                return cb(new Error(`Timeout Error. res object is ${res}`))
            else if (res.statusCode !== 201)
                return cb(new Error(`res code is ${res.statusCode}, body is ${res.body}`))

            cb(null)
        })
    }

    _requestToken(appId, appSecret, cb) {
        const data = qs.encode({
            grant_type: 'client_credentials',
            client_id: appId,
            client_secret: appSecret,
            scope: 'https://api.botframework.com/.default'
        })

        const options = {
            url: 'https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token',
            method: 'POST',
            headers: {
                'cache-control': 'no-cache',
                'content-type': 'application/x-www-form-urlencoded',
                'content-length': Buffer.byteLength(data)
            },
            body: data,
            retryDelay: 500,
        }

        request(options, (err, res) => {
            if (err)
                return cb(err)

            const body = JSON.parse(res.body)
            cb(null, body.access_token)
        })
    }
}
module.exports = skype
