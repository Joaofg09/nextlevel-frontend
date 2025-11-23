// src/components/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header'; // Importa o Header que você criou
import Footer from './Footer';

function Layout() {
  return (
    <div>
        <Header />
      <main>
        <Outlet />
      </main>
        <Footer />
    </div>
  );
}

export default Layout;