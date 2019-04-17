import React from 'react';

import Navbar from '../components/Navbar';

const Layout = ({ children }) => (
  <div>
    <Navbar />
    { children }
  </div>
);

export default Layout;
