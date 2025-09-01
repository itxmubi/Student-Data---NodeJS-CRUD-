const admin = require('../config/firebase');
const sendResponse = require('../Utils/response_format');

const sendNotification = async(req, res)=>{
    try {
        const {token, title, body} = req.body;

        if(!token || !title || !body){
            return sendResponse(res,400,false,"token, title, and body are required",null)
        }

        const message = {
            token, 
            notification: {title, body,},
        };

        const response = await admin.messaging().send(message);
        return sendResponse(res,200, true,"Notification sent successfully",response);
    } catch (error) {
        console.log(error);
         return sendResponse(res, 500, false, "Failed to send notification", null);
        
    }
}

module.exports = {sendNotification}