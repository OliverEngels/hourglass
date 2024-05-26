const isProduction = process.env.NEXT_PUBLIC_ENV === 'prod';

module.exports = {
    output: isProduction ? 'export' : undefined,

    reactStrictMode: true
}