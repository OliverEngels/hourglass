import Head from 'next/head'

interface props {
  children: any,
  title: string
}

const Layout = ({ children, title }: props) => (
  <>
    {title && (
      <Head>
        <title>{`${title}`}</title>
        <meta property='og:title' content={`${title}`} />
      </Head>
    )}
    {children}
  </>
)

export default Layout
