exports.responseHandle = (res, responseCode, data) => {
    res.send({
        responseCode: responseCode,
        data: data
    });
};

exports.responseErrorHandle = (res, responseCode, message) => {
    res.send({
        responseCode: responseCode,
        data: {
            message: message
        }
    });
};
