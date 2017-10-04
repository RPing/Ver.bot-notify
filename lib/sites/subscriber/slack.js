var request = require('request')

class slack {
    notify(chat_id, project_name, release_page, version_info) {
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
                console.error(err)
            if (typeof res === 'undefined')
                console.error(new Error(`Timeout Error. res object is ${res}`))
            if (res.statusCode !== 200)
                console.error(new Error(`res code is ${res.statusCode}`))
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
