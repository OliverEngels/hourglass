const isProduction = process.env.ENV === 'prod';

module.exports = {
    output: isProduction ? 'export' : undefined,

    reactStrictMode: true
}