import Joi from 'joi';
import { TagData, tagScheme } from './api-tag';
import { ObjectId } from 'mongodb';

const entryScheme = Joi.object({
    id: Joi.optional(),
    date: Joi.date().required(),
    starttime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
    endtime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
    description: Joi.string().max(128).required(),
    notes: Joi.string().max(512).allow(''),
    tags: Joi.array().items(tagScheme).min(1)
});

export function validateEntry(document) {
    return entryScheme.validate(document, { abortEarly: false });
}

export type TimeEntryData = {
    id: ObjectId
    date: string
    starttime: string
    endtime: string
    description: string
    notes: string
    tags: TagData[]
}

export type ApiResponse = {
    success: boolean;
    data?: any;
    message?: string;
}

