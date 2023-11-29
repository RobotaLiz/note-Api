const AWS = require('aws-sdk');
const {sendResponse} = require('../../responses');
const {validateToken} = require('../../middleware/auth');
const middy = require('@middy/core')
const db = new AWS.DynamoDB.DocumentClient();

const getNotes = async (event) => {

    if(event?.error && event.error === '401'){
        return sendResponse(401,{success: false, message: 'Invalid token'})
    }

    const params = {
        TableName: 'Note-db',
        FilterExpression: '#username = :username',
        ExpressionAttributeNames: {
            '#username': 'username'
        },
        ExpressionAttributeValues: {
            ':username': event.username
        }
    };
    
    const result = await db.scan(params).promise();

    return sendResponse(200,{success: true,notes : result.Items});
}

const handler = middy(getNotes)
                .use(validateToken);

module.exports = {handler};