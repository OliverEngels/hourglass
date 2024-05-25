import { ApiResponse } from '@components/schemes/api-entry';
import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../mongo';
import { ObjectId } from 'mongodb';
import CORS from '../middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
    await CORS(req, res);

    const { id } = req.query;
    switch (req.method) {
        case 'DELETE':
            try {
                const client = await clientPromise;
                const db = client.db('hourglass');
                const collection = db.collection('entries');

                if (Array.isArray(id)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid ID format'
                    });
                }

                const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });

                res.status(201).json({
                    success: true,
                    message: 'Entry successfully deleted'
                });
            } catch (e) {
                res.status(500).json({
                    success: false,
                    message: `Failed to insert entry: ${e.message}`
                });
            }
            break;
        case 'PUT':
            try {
                if (Array.isArray(id)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid ID format'
                    });
                }

                const client = await clientPromise;
                const db = client.db('hourglass');
                const collection = db.collection('entries');

                const { ...updateData } = req.body;
                delete updateData.id;
                const dateObject = new Date(updateData.date);
                const result = await collection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { ...updateData, date: dateObject } },
                    { upsert: false }
                );

                res.status(201).json({
                    success: true,
                    message: 'Entry successfully updated'
                });
            } catch (e) {
                res.status(500).json({
                    success: false,
                    message: `Failed to insert entry: ${e.message}`
                });
            }
            break;
        default:
            res.setHeader('Allow', ['DELETE', 'PUT']);
            res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}