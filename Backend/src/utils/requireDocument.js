import AppError from "./AppError.js";

export const requireDocument = async (query, message, statusCode = 404) => {
    const document = await query;
    if (!document) {
        throw new AppError(message, statusCode);
    }
    return document;
};
