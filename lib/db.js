/* eslint-disable prefer-arrow-callback, import/no-extraneous-dependencies */
const AWS = require('aws-sdk')
AWS.config.update({region:'us-east-1'})

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
    for(let prop in obj) {
        if(obj.hasOwnProperty(prop)) {
             if(obj[prop] === val) return prop
        }
    }
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
        if (err) {
            cb(err)
        } else {
            // continue scanning if previous scanning reach 1MB limit
            if (typeof data.LastEvaluatedKey !== "undefined") {
                scanParams.ExclusiveStartKey = data.LastEvaluatedKey;
                dynamoDb.scan(scanParams, onScan)
            }
            cb(null, data.Items)
        }
    }

    dynamoDb.scan(scanParams, onScan)
}

exports.getAllSubscriberPromise = function (project_name) {
    const queryParams = {
        TableName: 'SubscribedProject',
        IndexName: 'ProjectSubscriber',
        KeyConditionExpression: 'project_name = :x',
        ExpressionAttributeValues: {
            ':x': project_name
        },
        ProjectionExpression: 'subscriber_and_platform'
    }

    return new Promise((resolve, reject) => {
        dynamoDb.query(queryParams, function onQuery(err, data) {
            if (err) {
                reject(err)
            }

            const list = []
            data.Items.forEach((item) => {
                const a = item.subscriber_and_platform.split('-')
                const platform = subscriberPlatform(parseInt(a[1]))
                const id = a[0]

                list.push({
                    platform: platform,
                    id: id
                })
            })

            resolve(list)
        })
    })
}
