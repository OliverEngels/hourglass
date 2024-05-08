import Joi from 'joi';
import { ObjectId } from 'mongodb';

export const tagScheme = Joi.object({
    _id: Joi.string(),
    value: Joi.string().alphanum().max(30).required(),
    color: Joi.string(),
    subtype: Joi.string()
});

export function validateTag(document) {
    return tagScheme.validate(document, { abortEarly: false });
}

export type TagData = {
    id: ObjectId;
    value: string;
    color: string;
}

export type ApiResponse = {
    success: boolean;
    data?: any;
    message?: string;
}