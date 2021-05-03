import { Response } from 'express';

export const responseSuccessHandle = (res: Response, responseCode: number, data: any) => {
    res.status(responseCode).send({ responseCode, data });
};

export const responseErrorHandle = (res: Response, responseCode: number, message: string) => {
    res.status(responseCode).send({ responseCode, message });
};
