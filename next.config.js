const isProduction = process.env.ENV === 'production';

module.exports = {
    output: isProduction ? 'export' : undefined,

    reactStrictMode: true
}