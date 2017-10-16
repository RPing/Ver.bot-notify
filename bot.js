const async = require('async')

const db = require('./lib/db')
const site = require('./lib/site-utils')

const checkTime = new Date()
checkTime.setDate(checkTime.getDate() - process.env.CHECK_DAYS) // current time - CHECK_DAYS

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

function survey_notify (projectList, cb) {
    /*
        use Project platform util to get new version info
        query DB project subscriber
        use Chat platform util to notify subscriber
     */
    const fnList = []
    projectList.forEach((project) => {
        fnList.push((outer_cb) => {
            const projectPlatform = db.projectPlatform(project.platform)
            const projectName = project.project_name

            async.series({
                info: function (inner_cb) {
                    site.siteUtil(projectPlatform).getNewVersionInfo(checkTime, project, inner_cb)
                },
                subscribers: function (inner_cb) {
                    db.getAllSubscriber(projectName, inner_cb)
                },
            },
            function (err, results) {
                if (err) {
                    console.error('---- error when survey the project ----')
                    console.error(projectPlatform, projectName)
                    console.error(err)
                    return outer_cb(err)
                }

                const hasNewVer = results.info.length > 0
                const hasSubscriber = results.subscribers.length > 0
                const releasePage = site.siteUtil(projectPlatform).getReleasesPage(project)

                if (hasNewVer && hasSubscriber) {
                    async.waterfall([
                        function (cb) {
                            notify(projectPlatform, projectName, releasePage, results, cb)
                        },
                        function (hasSomeError) {
                            if (hasSomeError)
                                outer_cb(new Error(`failed: ${projectName}`))
                        },
                    ])
                } else {
                    outer_cb(null, `success: ${projectName}`)
                }
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

async.waterfall([
    db.getAllProject,
    survey_notify,
], function (err, result) {
    if (err) {
        console.error(err)
        process.exit(1)
    }

    process.exit()
})
