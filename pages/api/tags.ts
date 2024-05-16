import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, TagData } from '../../components/schemes/api-tag';
import clientPromise from './mongo';
import CORS from './middleware';
import { TimeEntryData } from '@components/schemes/api-entry';


export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
    await CORS(req, res);

    switch (req.method) {
        case 'GET':
            try {
                const client = await clientPromise;
                const db = client.db(process.env.DB);
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

                res.status(200).json({ success: true, data: tags });
            }
            catch (e) {
                res.status(405).json({ success: false, message: `Server Error: ${e}` });
            }
            break;
        case 'DELETE':
            try {
                const client = await clientPromise;
                const db = client.db(process.env.DB);

                const tagCollection = db.collection('tags');
                const entryCollection = db.collection<TimeEntryData>('entries');

                const { tags } = req.body;

                await tagCollection.deleteMany(
                    { value: { $in: tags } }
                );
                const deleteResult = await entryCollection.updateMany(
                    { "tags.value": { $in: tags } },
                    { $pull: { tags: { value: { $in: tags } } } }
                );

                console.log(deleteResult);
                res.status(200).json({ success: true, data: deleteResult });
            }
            catch (e) {
                res.status(405).json({ success: false, message: `Server Error: ${e}` });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'DELETE']);
            res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}