import React from 'react';

import Layout from './hoc/Layout';
import Catalog from './containers/Catalog';

const App = () => (
  <div>
    <Layout>
      <Catalog />
    </Layout>
  </div>
);

export default App;
