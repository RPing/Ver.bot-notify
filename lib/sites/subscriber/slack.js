const request = require('request')

class slack {
    notify(chat_id, project_name, release_page, version_info, cb) {
        const bot_token = process.env.SLACK_BOT_TOKEN
        const options = {
            url: 'https://slack.com/api/chat.postMessage',
            method: 'POST',
            timeout: 3000,
            form: {
                token: bot_token,
                text: this._format(project_name, version_info),
                channel: chat_id,
                attachments: JSON.stringify([{
                    title: 'Check it out!',
                    title_link: release_page,
                    color: '#5942f4',
                }])
            },
        }

        request(options, (err, res) => {
            if (err)
                return cb(err)

            if (typeof res === 'undefined')
                return cb(new Error(`Timeout Error. res object is ${res}`))
            else if (res.statusCode !== 200)
                return cb(new Error(`res code is ${res.statusCode}`))

            cb(null)
        })
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
