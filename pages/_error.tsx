import React from 'react';
import { NextPage, NextPageContext } from 'next';

interface ErrorProps {
    statusCode?: number;
}

const ErrorPage: NextPage<ErrorProps> = ({ statusCode }) => {
    return (
        <div>
            <h1>{statusCode === 404 ? '404 - Page Not Found' : 'An error occurred'}</h1>
            <p>{statusCode === 404 ? 'The requested page does not exist.' : 'Sorry, something went wrong.'}</p>
        </div>
    );
};

ErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default ErrorPage;
