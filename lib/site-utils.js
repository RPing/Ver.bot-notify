/* eslint-disable global-require */
const request = require('request')

const siteClass = {
    GitHub: require('./sites/project/github'),
    PyPI: require('./sites/project/pypi'),
    npm: require('./sites/project/npm'),
    telegram: require('./sites/subscriber/telegram'),
    slack: require('./sites/subscriber/slack'),
    skype: require('./sites/subscriber/skype'),
}

/* Remember to take a look at sites/ directory to know what api you can use. */
exports.siteUtil = function (site) {
    return new siteClass[site]()
}
