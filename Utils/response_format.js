// utils/response.js

const sendResponse = (res, statusCode, isSuccess, message, data) => {
    return res.status(statusCode).json({
        isSuccess,
        message,
        data,
        status: isSuccess ? 'Success' : 'Error',
    });
};

module.exports = sendResponse;

