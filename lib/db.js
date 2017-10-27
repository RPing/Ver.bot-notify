/* eslint-disable prefer-arrow-callback, import/no-extraneous-dependencies */
const AWS = require('aws-sdk')
AWS.config.update({
    region:'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
})

const dynamoDb = new AWS.DynamoDB.DocumentClient()

const projectPlatformConstant = {
    GitHub: 1,
    PyPI: 2,
    npm: 3,
}
const subscriberPlatformConstant = {
    telegram: 1,
    skype: 2,
    slack: 3,
}

function getKeyByValue(obj, val) {
    let k = null
    Object.keys(obj).forEach((key) => {
        if (obj[key] === val) k = key
    })
    return k
}

function subscriberPlatform(constant) {
    return getKeyByValue(subscriberPlatformConstant, constant)
}

exports.projectPlatform = function (constant) {
    return getKeyByValue(projectPlatformConstant, constant)
}

exports.getAllProject = function (cb) {
    const scanParams = {
        TableName: 'ProjectDetail',
        ConsistentRead: true
    }

    function onScan(err, data) {
        if (err)
            return cb(err)

        // continue scanning if previous scanning reach 1MB limit
        if (typeof data.LastEvaluatedKey !== 'undefined') {
            scanParams.ExclusiveStartKey = data.LastEvaluatedKey
            dynamoDb.scan(scanParams, onScan)
        }
        cb(null, data.Items)
    }

    dynamoDb.scan(scanParams, onScan)
}

exports.getAllSubscriber = function (project_name, cb) {
    const queryParams = {
        TableName: 'SubscribedProject',
        IndexName: 'ProjectSubscriber',
        KeyConditionExpression: 'project_name = :x',
        ExpressionAttributeValues: {
            ':x': project_name
        },
        ProjectionExpression: 'subscriber_id, subscriber_platform'
    }

    function onQuery(err, data) {
        if (err)
            return cb(err)

        const list = []
        data.Items.forEach((item) => {
            list.push({
                platform: subscriberPlatform(item.subscriber_platform),
                id: item.subscriber_id
            })
        })

        cb(null, list)
    }

    dynamoDb.query(queryParams, onQuery)
}
