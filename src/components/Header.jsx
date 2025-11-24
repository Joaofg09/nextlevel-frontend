// No arquivo: src/components/Header.js
// VERSÃO FINAL - Links de categoria corrigidos (/loja/categoria/...)

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import categoriasData from "../data/Categorias.json";
import styles from './Header.module.css';

function Header() {
  const auth = useAuth();
  const navigate = useNavigate();
  const user = auth.user;
  const isAdmin = user && user.perfil === 'Administrador';

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      document.body.classList.remove("light-mode");
      setIsDarkMode(true);
      localStorage.setItem("theme", "dark");
      return;
    }

    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      document.body.classList.add("light-mode");
      setIsDarkMode(false);
    } else {
      document.body.classList.remove("light-mode");
      setIsDarkMode(true);
    }
  }, [user]);

  const toggleTheme = () => {
    if (!user) return;
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    }
  };

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
    } else {
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

  if (!user) {
    return null;
  }

  return (
    <header className={`${styles.header} ${!isDarkMode ? styles.light : ''}`}>
      <div className={styles['top-bar']}>
        <Link to="/loja" className={styles.logo}>
          Next<span>Level</span>
        </Link>

        <div className={styles['user-actions']} id="user-section">
          {isAdmin && (
            <div
              className={styles['menu-trigger']}
              onClick={(e) => handleTriggerClick('admin', e)}
            >
              <span>Painel Admin ({user.nome})</span>
              <div className={`${styles['profile-dropdown']} ${adminMenuOpen ? styles.show : ''}`}>
                <ul>
                  <li><Link to="/loja/admin/jogos">Gerenciamento de Jogos</Link></li>
                  <li><Link to="/loja/admin/empresas">Gerenciamento de Empresas</Link></li>
                  <li><Link to="/loja/admin/usuarios">Gerenciamento de Usuários</Link></li>
                  <li><Link to="/loja/admin/relatorios">Relatório de Vendas</Link></li>
                  <li><a href="/" onClick={handleLogout}>Sair</a></li>
                </ul>
              </div>
            </div>
          )}

          <div
            className={styles['menu-trigger']}
            onClick={(e) => handleTriggerClick('user', e)}
          >
            <i className={styles.icon}>👤 {!isAdmin && `(${user.nome})`}</i>
            <div className={`${styles['profile-dropdown']} ${userMenuOpen ? styles.show : ''}`}>
              <ul>
                <li><Link to="/loja/biblioteca">Minha Biblioteca</Link></li>
                <li><Link to="/loja/historico">Histórico de Compras</Link></li>
                <li><Link to="/loja/lista-desejos">Lista de Desejos</Link></li>
                <li><Link to="/loja/meus-dados">Meus Dados</Link></li>
                <li><a href="/" onClick={handleLogout}>Sair</a></li>
              </ul>
            </div>
          </div>

          <Link to="/loja/carrinho" className={styles.icon}>🛒</Link>
          <Link to="/loja/lista-desejos" className={styles.icon}>♥️</Link>

          <span
            className={styles.icon}
            onClick={toggleTheme}
            style={{ cursor: "pointer" }}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </span>
        </div>
      </div>

      <nav className={styles.menuBar}>
        <ul className={styles.menuList}>
          <li className={styles.menuItem}>
            <Link to="/loja">Início</Link>
          </li>

          {/* AQUI ESTÁ A CORREÇÃO */}
          {categoriasData.categorias.map((cat, index) => (
            <li key={index} className={styles.menuItem}>
              <Link to={`/loja/categoria/${cat.toLowerCase().replace(/\s/g, '-')}`}>
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