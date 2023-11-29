const AWS = require('aws-sdk');
const {sendResponse} = require('../../responses');
const {validateToken} = require('../../middleware/auth');
const middy = require('@middy/core')
const db = new AWS.DynamoDB.DocumentClient();

const putNotes = async (event) => {

    if(event?.error && event.error === '401'){
        return sendResponse(401,{success: false, message: 'Invalid token'});
    }

    try{
        const noteId = event.pathParameters.id;

        const note = JSON.parse(event.body);


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
            return sendResponse(404, {succes: false});
        }
        
        const noteToUpdate = scanResponse.Items[0];
        
        noteToUpdate.modifiedAt = new Date().toISOString();
        noteToUpdate.title = note.title;
        noteToUpdate.text = note.text;

        await db.put({
            TableName: 'Note-db',
            Item: noteToUpdate
        }).promise();
    
        return sendResponse(200, {succes: true});
    } catch (error) {
        return sendResponse(500, {succes: false, errorMessage : error});
    }
}

const handler = middy(putNotes)
                .use(validateToken);

module.exports = {handler};