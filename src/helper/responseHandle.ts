import { Response } from 'express';

export const responseHandle = (res: Response, responseCode: number, data) => {
    res.send({ responseCode, data });
};

export const responseErrorHandle = (res: Response, responseCode: number, message) => {
    res.send({ responseCode, data: { message, responseCode, success: false } });
};
