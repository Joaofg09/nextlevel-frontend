// No arquivo: src/components/Layout.js

import React from 'react';
// O "Outlet" é um espaço reservado onde o React Router irá colocar
// a página que o usuário está visitando (ex: Home, Cadastro).
import { Outlet } from 'react-router-dom'; 
import Header from './Header'; // Importa o cabeçalho que acabamos de criar

function Layout() {
  return (
    <div>
      <Header />
      <main>
        {/* O "Outlet" renderiza o componente da rota atual */}
        <Outlet /> 
      </main>
      {/* Você pode adicionar um <Footer /> aqui mais tarde */}
    </div>
  );
}

export default Layout;