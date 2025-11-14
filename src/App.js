// No arquivo: src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import AdminJogos from './pages/AdminJogos'; 
import AdminEmpresas from './pages/AdminEmpresas';
import HistoricoCompras from './pages/HistoricoCompras';
import MeusDados from './pages/MeusDados';
import CarrinhoPage from './pages/CarrinhoPage';
import JogoDetalhesPage from './pages/JogoDetalhesPage';

// 1. Importe a nova página
import ListaDesejosPage from './pages/ListaDesejosPage';

import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas que usam o Layout (com Header) */}
        <Route path="/" element={<Layout />}>
          
          <Route index element={<Home />} />
          <Route path="/admin/jogos" element={<AdminJogos />} />
          <Route path="/admin/empresas" element={<AdminEmpresas />} />
          <Route path="/historico" element={<HistoricoCompras />} />
          <Route path="/meus-dados" element={<MeusDados />} />
          <Route path="/carrinho" element={<CarrinhoPage />} />
          <Route path="/jogo/:id" element={<JogoDetalhesPage />} />

          {/* 2. Adicione a nova rota da lista de desejos */}
          <Route path="/lista-desejos" element={<ListaDesejosPage />} />
          
        </Route>

        {/* Rotas que NÃO usam o Layout (tela cheia) */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;