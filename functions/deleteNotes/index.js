const AWS = require('aws-sdk');
const {sendResponse} = require('../../responses');
const {validateToken} = require('../../middleware/auth');
const middy = require('@middy/core')
const db = new AWS.DynamoDB.DocumentClient();

const deleteNotes = async (event) => {

    if(event?.error && event.error === '401'){
        return sendResponse(401,{success: false, message: 'Invalid token'});
    }
    try {

        const noteId = event.pathParameters.id;

        const scanParams = {
            TableName: 'Note-db',
            FilterExpression: 'id = :id AND username = :username',
            ExpressionAttributeValues: {
                ':id': noteId,
                ':username': event.username,
            },
        };
    
        const scanResponse = await db.scan(scanParams).promise();
    
        // Check if the item was found
        if (scanResponse.Items.length === 0) {
            throw new Error('Cannot delete item that does not exist');
        }
    
        const deleteParams = {
            TableName: 'Note-db',
            Key: {
                id: noteId
            },
        };
    
        await db.delete(deleteParams).promise();

    } catch (error) {
        return sendResponse(404, {success: false});
    }
    return sendResponse(200,{success: true});
}

const handler = middy(deleteNotes)
                .use(validateToken);

module.exports = {handler};