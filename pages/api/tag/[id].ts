import { ApiResponse } from '@components/schemes/api-entry';
import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../mongo';
import { ObjectId } from 'mongodb';
import { TagData } from '@components/schemes/api-tag';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
    if (req.method === 'PUT') {
        const { id } = req.query;

        try {
            if (Array.isArray(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid ID format'
                });
            }

            const client = await clientPromise;
            const db = client.db(process.env.DB);
            const collection = db.collection('tags');

            const { ...updateData } = req.body;

            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData },
                { upsert: false }
            );

            if (result.modifiedCount === 0) {
                return res.status(404).json({
                    success: true,
                    message: 'No tag matched the query. Tag not updated.'
                });
            }

            const data = await db.collection("tags").find({}).toArray();
            const tags: TagData[] = [];
            data.map((e, i) => {
                tags[i] = {
                    id: e._id,
                    value: e.value,
                    subtype: e.subtype,
                    color: e.color
                };
            });

            const entries = await db.collection('entries');
            await entries.updateMany(
                { "tags.value": updateData.value },
                { $set: { "tags.$[elem]": updateData } },
                { arrayFilters: [{ "elem.value": updateData.value }] }
            );

            res.status(200).json({
                success: true,
                message: 'Tag updated successfully',
                data: tags
            });
        } catch (e) {
            console.error("Error updating document in MongoDB:", e);
            res.status(500).json({
                success: false,
                message: `Failed to update tag: ${e.message}`
            });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}