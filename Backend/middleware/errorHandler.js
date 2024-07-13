const {ValidationError} = require('joi')

const erorHandling = (error, req, res, next) => {
    let status = 500;
    let data = { message: "Internal Error"  }

    if(error instanceof ValidationError){
        status = 401;
        data.message = error.message
        return res.status(status).json(data)
    }
    if(error.message){
        data.message = error.message
    }
    if(error.status){
        status = error.status;
    }
    return res.status(status).json(data)

}
module.exports = erorHandling;