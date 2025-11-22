// No arquivo: src/components/Header.js

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Header.module.css';
import categorias from "../data/Categorias.json";

function Header() {

  const [categoriasList, setCategoriasList] = useState(categorias.categorias);

  const [isDarkMode, setIsDarkMode] = useState(true); // Começa como Dark

  useEffect(() => {
    // Aplica a classe inicial ao body (para manter o estado ao recarregar)
    if (localStorage.getItem('theme') === 'light') {
      document.body.classList.add('light-mode');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    const novoEstado = !isDarkMode;
    setIsDarkMode(novoEstado);

    // Adiciona/Remove a classe 'light-mode' no BODY
    if (novoEstado) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  };

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
    <header className={styles.header}>
      <div className={styles['top-bar']}>
        <Link to="/" className={styles.logo}>Next<span>Level</span></Link>
        <div className={styles['user-actions']} id="user-section">
          {!user ? (
            <>
              <Link to="/login">Iniciar Sessão</Link>
              <Link to="/carrinho" className={styles.icon}>🛒</Link>
              <Link to="/lista-desejos" className={styles.icon}>❤</Link>
              <i className={`icon theme-toggle fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}
                onClick={toggleTheme} id="theme-toggle">
              </i>
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
              <Link to="/lista-desejos" className={styles.icon}>❤</Link>
              <i className={`icon theme-toggle fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}
                onClick={toggleTheme} id="theme-toggle">
              </i>
            </>
          )}
        </div>
      </div>
      <nav className={styles.menu}>
        <ul>
          <li><Link to="/">Início</Link></li>
          <li className={styles['dropdown-menu-item']}>
            <Link to="/" className={styles['dropdown-trigger']}>Categorias</Link>
            <ul className={styles.submenu}>
              {categoriasList.map((cat, index) => (
                <li key={index}>
                  <Link to={`/categoria/${cat}`}>{cat}</Link>
                </li>
              ))}
            </ul>
          </li>
          <li><Link to="/">Mais vendidos</Link></li>
        </ul>
        <div className={styles['search-bar']}>
          <input type="text" placeholder="Procurar na loja" />
        </div>
      </nav>
    </header>
  );
}

export default Header;