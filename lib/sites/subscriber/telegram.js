var request = require('request')

class telegram {
    notify(chat_id, project_name, release_page, version_info) {
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
                console.error(err)
            if (typeof res === 'undefined')
                console.error(new Error(`Timeout Error. res object is ${res}`))
            if (res.statusCode !== 200)
                console.error(new Error(`res code is ${res.statusCode}`))
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
