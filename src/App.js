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
import ListaDesejosPage from './pages/ListaDesejosPage';
import BibliotecaPage from './pages/BibliotecaPage';
import RevisarPedidoPage from './pages/RevisarPedidoPage';
import RelatoriosPage from './pages/RelatoriosPage';
import CategoriaPage from './pages/CategoriaPage';

// 1. Importe a nova página
import AdminUsuariosPage from './pages/AdminUsuariosPage';

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
          <Route path="/admin/relatorios" element={<RelatoriosPage />} />

          {/* 2. Adicione a nova rota de usuários */}
          <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />

          <Route path="/historico" element={<HistoricoCompras />} />
          <Route path="/meus-dados" element={<MeusDados />} />
          <Route path="/carrinho" element={<CarrinhoPage />} />
          <Route path="/jogo/:id" element={<JogoDetalhesPage />} />
          <Route path="/lista-desejos" element={<ListaDesejosPage />} />
          <Route path="/biblioteca" element={<BibliotecaPage />} />
          <Route path="/revisar-pedido" element={<RevisarPedidoPage />} />
          <Route path="/categoria/:slug" element={<CategoriaPage />} />


        </Route>

        {/* Rotas que NÃO usam o Layout (tela cheia) */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;