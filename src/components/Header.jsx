// No arquivo: src/components/Header.js
// VERSÃO FINAL - Classes padrão (Corrige o Dropdown)

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import categoriasData from "../data/Categorias.json"; // Importa o JSON

function Header() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const auth = useAuth();
  const navigate = useNavigate();
  const user = auth.user;
  const isAdmin = user && user.perfil === 'Administrador';

  // --- Lógica do Tema (Dark/Light) ---
  useEffect(() => {
    if (localStorage.getItem('theme') === 'light') {
      document.body.classList.add('light-mode');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    const novoEstado = !isDarkMode;
    setIsDarkMode(novoEstado);
    if (novoEstado) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  // --- Lógica dos Menus de Usuário ---
  const handleLogout = (event) => {
    event.preventDefault();
    auth.logout();
    navigate('/login');
  };

  const handleTriggerClick = (menuType, e) => {
    e.stopPropagation();
    if (menuType === 'admin') {
      setAdminMenuOpen(!adminMenuOpen);
      setUserMenuOpen(false);
    } else if (menuType === 'user') {
      setUserMenuOpen(!userMenuOpen);
      setAdminMenuOpen(false);
    }
  };

  useEffect(() => {
    const closeMenus = () => {
      setAdminMenuOpen(false);
      setUserMenuOpen(false);
    };
    window.addEventListener('click', closeMenus);
    return () => window.removeEventListener('click', closeMenus);
  }, []);

  return (
    // Usamos 'header' normal em vez de styles.header para pegar o CSS global
    <header>
      <div className="top-bar">
        <Link to="/" className="logo">Next<span>Level</span></Link>
        
        <div className="user-actions" id="user-section">
          {!user ? (
            <>
              <Link to="/login">Iniciar Sessão</Link>
              <Link to="/carrinho" className="icon">🛒</Link>
              <Link to="/lista-desejos" className="icon">❤</Link>
              <i 
                className={`icon theme-toggle fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}
                onClick={toggleTheme} 
                id="theme-toggle"
                style={{fontStyle: 'normal', cursor: 'pointer'}}
              >
                {isDarkMode ? '☼' : '☾'}
              </i>
            </>
          ) : (
            <>
              {isAdmin && (
                <div 
                  className="menu-trigger" 
                  id="admin-menu-trigger"
                  onClick={(e) => handleTriggerClick('admin', e)}
                >
                  <span>Painel Admin ({user.nome})</span>
                  <div 
                    className={`profile-dropdown ${adminMenuOpen ? 'show' : ''}`} 
                    id="admin-menu-dropdown"
                  >
                    <ul>
                      <li><Link to="/admin/jogos">Gerenciamento de Jogos</Link></li>
                      <li><Link to="/admin/empresas">Gerenciamento de Empresas</Link></li>
                      <li><Link to="/admin/usuarios">Gerenciamento de Usuários</Link></li>
                      <li><Link to="/admin/relatorios">Relatório de Vendas</Link></li>
                      <li><a href="/" onClick={handleLogout}>Sair</a></li>
                    </ul>
                  </div>
                </div>
              )}

              <div 
                className="menu-trigger" 
                id="user-menu-trigger"
                onClick={(e) => handleTriggerClick('user', e)}
              >
                <i className="icon">👤 {!isAdmin ? `(${user.nome})` : ''}</i>
                <div 
                  className={`profile-dropdown ${userMenuOpen ? 'show' : ''}`} 
                  id="user-menu-dropdown"
                >
                  <ul>
                    <li><Link to="/biblioteca">Minha Biblioteca</Link></li>
                    <li><Link to="/historico">Histórico de Compras</Link></li>
                    <li><Link to="/lista-desejos">Lista de Desejos</Link></li>
                    <li><Link to="/meus-dados">Meus Dados</Link></li>
                    <li><a href="/" onClick={handleLogout}>Sair</a></li>
                  </ul>
                </div>
              </div>

              <Link to="/carrinho" className="icon">🛒</Link>
              <Link to="/lista-desejos" className="icon">❤</Link>
              <i 
                className={`icon theme-toggle fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}
                onClick={toggleTheme} 
                id="theme-toggle"
                style={{fontStyle: 'normal', cursor: 'pointer'}}
              >
                {isDarkMode ? '☼' : '☾'}
              </i>
            </>
          )}
        </div>
      </div>

      <nav className="menu">
        <ul>
          <li><Link to="/">Início</Link></li>
          
          {/* --- DROPDOWN DE CATEGORIAS --- */}
          {/* Aqui usamos as classes padrão para o CSS do index.css funcionar */}
          <li className="dropdown-menu-item">
            <Link to="/" className="dropdown-trigger">Categorias</Link>
            <ul className="submenu">
              {categoriasData.categorias.map((cat, index) => (
                <li key={index}>
                  {/* Nota: Ainda não temos rota para /categoria/:nome, então vai para home */}
                  <Link to={`/`}>{cat}</Link>
                </li>
              ))}
            </ul>
          </li>
          
          <li><Link to="/">Mais vendidos</Link></li>
        </ul>
        <div className="search-bar">
          <input type="text" placeholder="Procurar na loja" />
        </div>
      </nav>
    </header>
  );
}

export default Header;