import { Response } from 'express';

export const responseHandle = (res: Response, responseCode: number, data: any) => {
    res.send({ responseCode, data });
};

export const responseErrorHandle = (res: Response, responseCode: number, message: string) => {
    res.status(responseCode).send({ responseCode, data: { message, responseCode, success: false } });
};
