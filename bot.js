const db = require('./lib/db')
const site = require('./lib/site-utils')

exports.handler = function(event, context, callback) {
    const checkTime = new Date()
    checkTime.setDate(checkTime.getDate() - process.env.CHECK_DAYS) // current time - CHECK_DAYS

    // scan DB get project info
    db.getAllProject(function (err, projectList) {
        if (err) {
            callback(err)
        }

        /*
            loop:
            use Project platform util to get new version info
            query DB project subscriber
            use Chat platform util to notify subscriber
        */
        Promise.all(projectList.map((project) => {
            const projectPlatform = db.projectPlatform(project.platform)

            return site.siteUtil(projectPlatform).getNewVersionInfoPromise(checkTime, project)
            .then((info) => {
                if (info.length !== 0) {
                    return db.getAllSubscriberPromise(project.project_name)
                }
            })
            .then((subscribers) => {

            })
        }))
        .then((result) => {
            callback(null)
        })
        .catch((err) => callback(err))
    })

}
