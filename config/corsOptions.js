const allowedOrigins = require('./allowedOrigins')

//third party middleware
const corsOptions = {
    origin: (origin , callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin ){
            callback(null, true)
        }
        else{
            callback(new Error('Not allowed by CORS'))
        }
    },
    Credential: true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions