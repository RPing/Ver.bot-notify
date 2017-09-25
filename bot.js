const db = require('./lib/db')

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
            query DB project subscriptor
            use Chat platform util to notify subscriber
        */

        callback(null)
    })

}
