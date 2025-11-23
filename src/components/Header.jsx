// No arquivo: src/components/Header.js
// VERSÃO FINAL - Classes padrão (Corrige o Dropdown)

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import categoriasData from "../data/Categorias.json"; // Importa o JSON
import styles from './Header.module.css';

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
    <header className={`${styles.header} ${!isDarkMode ? styles.light : ''}`}>
      <div className={styles['top-bar']}>
        <Link to="/" className={styles.logo}>Next<span>Level</span></Link>

        <div className={styles['user-actions']} id="user-section">
          {!user ? (
            <>
              <Link to="/login">Iniciar Sessão</Link>
              <Link to="/carrinho" className={styles.icon}>🛒</Link>
              <Link to="/lista-desejos" className={styles.icon}>♥️</Link>
              <span 
                className={styles.icon} 
                onClick={toggleTheme} 
                style={{ cursor: 'pointer' }}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </span>
            </>
          ) : (
            <>
              {isAdmin && (
                <div
                  className={styles['menu-trigger']}
                  id="admin-menu-trigger"
                  onClick={(e) => handleTriggerClick('admin', e)}
                >
                  <span>Painel Admin ({user.nome})</span>
                  <div
                    className={`${styles['profile-dropdown']} ${adminMenuOpen ? styles.show : ''}`}
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
                className={styles['menu-trigger']}
                id="user-menu-trigger"
                onClick={(e) => handleTriggerClick('user', e)}
              >
                <i className={styles.icon}>👤 {!isAdmin ? `(${user.nome})` : ''}</i>
                <div
                  className={`${styles['profile-dropdown']} ${userMenuOpen ? styles.show : ''}`}
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

              <Link to="/carrinho" className={styles.icon}>🛒</Link>
              <Link to="/lista-desejos" className={styles.icon}>♥️</Link>
              <span 
                className={styles.icon} 
                onClick={toggleTheme} 
                style={{ cursor: 'pointer' }}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </span>
            </>
          )}
        </div>
      </div>

      <nav className={styles.menuBar}>
        <ul className={styles.menuList}>
          <li className={styles.menuItem}>
            <Link to="/">Inicio</Link>
          </li>
          {categoriasData.categorias.map((cat, index) => (
            <li key={index} className={styles.menuItem}>
              <Link to={`/categoria/${cat.toLowerCase().replace(/\s/g, '-')}`}>
                {cat}
              </Link>
            </li>
          ))}
        </ul>     
      </nav>

    </header>
  );
}

export default Header;