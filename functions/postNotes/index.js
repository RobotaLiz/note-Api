const AWS = require('aws-sdk');
const {sendResponse} = require('../../responses');
const {validateToken} = require('../../middleware/auth');
const middy = require('@middy/core')
const db = new AWS.DynamoDB.DocumentClient();

const postNotes = async (event) => {

    if(event?.error && event.error === '401'){
        return sendResponse(401,{success: false, message: 'Invalid token'});
    }

    const note = JSON.parse(event.body);

    const timeStamp = new Date().getTime();

    note.id = `${timeStamp}`;
    note.createdAt = new Date().toISOString();
    note.modifiedAt = note.createdAt;
    note.username = event.username;
   
    try{
        
        await db.put({
            TableName: 'Note-db',
            Item: note
        }).promise()
    
        return sendResponse(200, {succes: true});
    } catch (error) {
        return sendResponse(500, {succes: false, errorMessage : error});
    }
}

const handler = middy(postNotes)
                .use(validateToken);

module.exports = {handler};