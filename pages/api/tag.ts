import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, validateTag } from '../../components/schemes/api-tag';
import clientPromise from './mongo';
import { ObjectId } from 'mongodb';
import CORS from './middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
    await CORS(req, res);

    const { error, value } = validateTag(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: `Validation Failed: ${error.details.map(x => x.message).join(', ')}`
        });
    }

    switch (req.method) {
        case 'POST':
            try {
                const client = await clientPromise;
                const db = client.db('hourglass');
                const collection = db.collection('tags');

                value['subtype'] = 'misc';

                const result = await collection.insertOne(value);
                const objectId = result.insertedId;

                res.status(201).json({
                    success: true,
                    message: 'Tag inserted successfully',
                    data: { objectId: objectId.toString() }
                });
            } catch (e) {
                res.status(500).json({
                    success: false,
                    message: `Failed to insert tag: ${e.message}`
                });
            }
            break;
        case 'PUT':
            try {
                const client = await clientPromise;
                const db = client.db('hourglass');
                const collection = db.collection('tags');

                const { _id, ...updateData } = req.body;

                const result = await collection.updateOne(
                    { _id: new ObjectId(_id) },
                    { $set: updateData },
                    { upsert: false }
                );

                if (result.modifiedCount === 0) {
                    return res.status(404).json({
                        success: true,
                        message: 'No tag matched the query. Tag not updated.'
                    });
                }

                res.status(200).json({
                    success: true,
                    message: 'Tag updated successfully'
                });
            } catch (e) {
                console.error("Error updating document in MongoDB:", e);
                res.status(500).json({
                    success: false,
                    message: `Failed to update tag: ${e.message}`
                });
            }
            break;
        default:
            res.setHeader('Allow', ['POST', 'PUT']);
            res.status(405).json({
                success: false,
                message: 'Method Not Allowed'
            });
    }
}