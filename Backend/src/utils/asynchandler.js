const asynchandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            // Send a clear error response
            res.status(400).json({
                success: false,
                message: err.message || 'An error occurred'
            });
        });
    }
}

export { asynchandler };


// const asynchandler = (fn) => async(req,res,next) =>{
// try{
// await fn(req,res,next)
// }
// catch(error){
//     res.status(err.code || 500).json({
//         success: false,
//         message: err.message
//     })
// }} 

