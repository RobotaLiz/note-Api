const { nanoid } = require("nanoid");
const {sendResponse} = require("../../responses")
const bcrypt = require('bcryptjs');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

async function createAccount(username,hashedPassword, userid, firstname, lastname){
    
    try{
        await db.put({
            TableName: 'note-accounts',
            Item : {
                username : username,
                password : hashedPassword,
                firstname : firstname,
                lastname : lastname,
                userId : userid
            }
        }).promise();
        return {success : true, userid : userid};
    }
    catch(error){
        console.log(error);
        return {success : false, message : 'Could not Create Account!'}
    }
    
}

async function signup(username, password, firstname, lastname){

    //TODO Felhantering på username ,  kolla om det finns redan osv
    // if username finns i databasen => return {success : false, message : "user already exists"}

    const hashedPassword = await bcrypt.hash(password, 10);
    const userid = nanoid();

    const result = await createAccount(username,hashedPassword,userid,firstname,lastname);
    return result;
}




exports.handler = async (event) => {

    const {username, password, firstname, lastname} = JSON.parse(event.body);
 
    const result = await signup(username,password,firstname,lastname);

    if(result.success){
        return sendResponse(200,result);
    }
    else{
        return sendResponse(400, result);
    }
}