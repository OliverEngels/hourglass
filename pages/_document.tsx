import NextDocument, { Html, Head, Main, NextScript } from 'next/document'

export default class Document extends NextDocument {
    render() {
        return (
            <Html lang='en'>
                <Head>
                    <meta name="msapplication-TileColor" content="#da532c" />
                    <meta name="theme-color" content="#ffffff" />

                </Head>
                <body className={`bg-slate-200 pt-7 m-3`}>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}
