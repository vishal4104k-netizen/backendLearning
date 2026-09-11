class ApiError extends Error {
    constructor(
        message = "Something went wrong",
        statusCode,
        error =[],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.error = this.error;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        } 
    }
}

export {ApiError};