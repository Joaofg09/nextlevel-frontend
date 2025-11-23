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
import AdminUsuariosPage from './pages/AdminUsuariosPage';

import ProtectedRoute from "./components/ProtectedRoute";

import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rotas com Header */}
        <Route path="/" element={<Layout />}>

          {/* HOME → só abre logado */}
          <Route
            index
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Rotas ADMIN - só Admin acessa */}
          <Route
            path="/admin/jogos"
            element={
              <ProtectedRoute adminOnly>
                <AdminJogos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/empresas"
            element={
              <ProtectedRoute adminOnly>
                <AdminEmpresas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/relatorios"
            element={
              <ProtectedRoute adminOnly>
                <RelatoriosPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute adminOnly>
                <AdminUsuariosPage />
              </ProtectedRoute>
            }
          />

          {/* Rotas NORMAIS — só logado acessa */}
          <Route
            path="/historico"
            element={
              <ProtectedRoute>
                <HistoricoCompras />
              </ProtectedRoute>
            }
          />

          <Route
            path="/meus-dados"
            element={
              <ProtectedRoute>
                <MeusDados />
              </ProtectedRoute>
            }
          />

          <Route
            path="/carrinho"
            element={
              <ProtectedRoute>
                <CarrinhoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/jogo/:id"
            element={
              <ProtectedRoute>
                <JogoDetalhesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lista-desejos"
            element={
              <ProtectedRoute>
                <ListaDesejosPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/biblioteca"
            element={
              <ProtectedRoute>
                <BibliotecaPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/revisar-pedido"
            element={
              <ProtectedRoute>
                <RevisarPedidoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/categoria/:slug"
            element={
              <ProtectedRoute>
                <CategoriaPage />
              </ProtectedRoute>
            }
          />

        </Route>

        {/* Login e Cadastro (sem header) */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
