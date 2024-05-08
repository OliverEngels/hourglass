import React from 'react';
import Layout from '@components/layout';
import { EntryProvider } from '@contexts/entries-context';
import NewEntryForm from '@components/new-entry-form';

export default function Home() {
  return (
    <Layout title={''}>
      <EntryProvider>
        <NewEntryForm />
      </EntryProvider>
    </Layout>
  );
}