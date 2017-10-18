const async = require('async')

const db = require('./lib/db')
const site = require('./lib/site-utils')

const checkTime = new Date()
checkTime.setDate(checkTime.getDate() - process.env.CHECK_DAYS) // current time - CHECK_DAYS

function needToNotify (results) {
    const hasNewVer = results.info.length > 0
    const hasSubscriber = results.subscribers.length > 0

    return hasNewVer && hasSubscriber
}

function notify (projectPlatform, projectName, releasePage, results, cb) {
    // notify every subscriber, return true if all succeed
    let hasSomeError = null
    results.subscribers.forEach((subscriber) => {
        site.siteUtil(subscriber.platform)
        .notify(subscriber.id, projectName, releasePage, results.info, (err) => {
            if (err) {
                hasSomeError = true
                console.error('---- error when send to a subscriber ----')
                console.error(projectPlatform, projectName, subscriber.id)
                console.error(err)
            }
        })
    })

    cb(hasSomeError)
}

function checkAndNotify (results, projectInfo, projectName, projectPlatform, cb) {
    if (needToNotify(results)) {
        async.waterfall([
            function (cb) {
                const releasePage = site.siteUtil(projectPlatform).getReleasesPage(projectInfo)
                notify(projectPlatform, projectName, releasePage, results, cb)
            },
            function (hasSomeError) {
                if (hasSomeError)
                    cb(new Error(`failed: ${projectName}`))
            },
        ])
    } else {
        cb(null, `success: ${projectName}`)
    }
}

/*
    use Project platform util to get new version info
    query DB project subscriber
    use Chat platform util to notify subscriber
 */
function survey_notify (projectList, cb) {
    const fnList = []
    projectList.forEach((projectInfo) => {
        fnList.push((outer_cb) => {
            const projectPlatform = db.projectPlatform(projectInfo.platform)
            const projectName = projectInfo.project_name

            async.series({
                info: function (inner_cb) {
                    site.siteUtil(projectPlatform).getNewVersionInfo(checkTime, projectInfo, inner_cb)
                },
                subscribers: function (inner_cb) {
                    db.getAllSubscriber(projectName, inner_cb)
                },
            },
            function afterSurvey (err, results) {
                if (err) {
                    console.error('---- error when survey the project ----')
                    console.error(projectPlatform, projectName)
                    console.error(err)
                    return outer_cb(err)
                }

                checkAndNotify(results, projectInfo, projectName, projectPlatform, outer_cb)
            })
        })
    })

    async.parallel(async.reflectAll(fnList),
    function (err, results) {
        const hasSomeError = results.some((result) => {
            return result.error !== undefined
        })

        if (hasSomeError)
            return cb(new Error('Some error happened'))

        cb(null)
    })
}

exports.handler = function(event, context, callback) {
    async.waterfall([
        db.getAllProject,
        survey_notify,
    ], function (err, result) {
        if (err) {
            callback(err)
        }

        callback(null)
    })
}
