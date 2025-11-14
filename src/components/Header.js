// No arquivo: src/components/Header.js
// VERSÃO 5 - Mostra ambos os menus para o Admin

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  const user = auth.user;
  const isAdmin = user && user.perfil === 'Administrador';

  return (
    <header>
      <div className="top-bar">
        <Link to="/" className="logo">Next<span>Level</span></Link>
        
        <div className="user-actions" id="user-section">
          {!user ? (
            // --- SE ESTIVER DESLOGADO ---
            <> 
              <Link to="/login">Iniciar Sessão</Link>
              <Link to="/carrinho" className="icon">🛒</Link>
              <Link to="/lista-desejos" className="icon">❤</Link>
              <i className="icon theme-toggle" id="theme-toggle">☼</i>
            </>
          ) : (
            // --- SE ESTIVER LOGADO ---
            <>
              {/* 1. Painel Admin (Aparece SOMENTE se for admin) */}
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
                      <li><Link to="/admin/avaliacoes">Moderação de Avaliações</Link></li>
                    </ul>
                  </div>
                </div>
              )}

              {/* 2. Menu de Usuário (Aparece SEMPRE que estiver logado) */}
              <div 
                className="menu-trigger" 
                id="user-menu-trigger"
                onClick={(e) => handleTriggerClick('user', e)}
              >
                {/* Mostra o nome só se NÃO for admin (para não repetir) */}
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

              {/* 3. Ícones (Aparecem SEMPRE que estiver logado) */}
              <Link to="/carrinho" className="icon">🛒</Link>
              <Link to="/lista-desejos" className="icon">❤</Link>
              <i className="icon theme-toggle" id="theme-toggle">☼</i>
            </>
          )}
        </div>
      </div>
      <nav className="menu">
        {/* ... (o resto da <nav> continua igual) ... */}
        <ul>
          <li><Link to="/">Início</Link></li>
          <li className="dropdown-menu-item">
            <Link to="/" className="dropdown-trigger">Categorias</Link>
            <ul className="submenu">
              <li><Link to="/">RPG</Link></li>
              <li><Link to="/">Ação</Link></li>
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