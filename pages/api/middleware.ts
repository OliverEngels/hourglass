import Cors from 'cors';

const cors = Cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
    origin: `*`,
    optionsSuccessStatus: 200
});

function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

export default async function CORS(req, res) {
    await runMiddleware(req, res, cors);
}