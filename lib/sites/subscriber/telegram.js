const request = require('request')

class telegram {
    notify(chat_id, project_name, release_page, version_info, cb) {
        const bot_token = process.env.TELEGRAM_BOT_TOKEN
        const options = {
            url: `https://api.telegram.org/bot${bot_token}/sendMessage`,
            method: 'POST',
            timeout: 3000,
            json: {
                chat_id: chat_id,
                text: this._format(project_name, version_info),
                parse_mode: 'Markdown',
                reply_markup: JSON.stringify({
                    inline_keyboard: [[{
                        text: 'Check it out!',
                        url: release_page
                    }]]
                })
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
        let str = `\`${name}\` has new version!!\n`
        info.forEach((item) => {
            str += `*${item.version}* released at ${item.date}\n`
        })
        return str
    }
}
module.exports = telegram
