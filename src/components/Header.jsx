// No arquivo: src/components/Header.js
// VERSÃO SOMENTE PARA USUÁRIOS LOGADOS

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

  // --- MODO ESCURO SEMPRE ATIVO ATÉ FAZER LOGIN ---
  useEffect(() => {
    if (!user) {
      document.body.classList.remove("light-mode");
      setIsDarkMode(true);
      localStorage.setItem("theme", "dark");
      return;
    }

    // Aplica o tema salvo APÓS logar  
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      document.body.classList.add("light-mode");
      setIsDarkMode(false);
    } else {
      document.body.classList.remove("light-mode");
      setIsDarkMode(true);
    }
  }, [user]);

  // --- Trocar Tema (somente logado) ---
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

  // --- Logout ---
  const handleLogout = (event) => {
    event.preventDefault();
    auth.logout();
    navigate('/login');
  };

  // --- Dropdowns ---
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

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const closeMenus = () => {
      setAdminMenuOpen(false);
      setUserMenuOpen(false);
    };
    window.addEventListener('click', closeMenus);
    return () => window.removeEventListener('click', closeMenus);
  }, []);

  // --- Se o usuário NÃO estiver logado, exibe nada (header vazio) ---
  if (!user) {
    return null;
  }

  return (
    <header className={`${styles.header} ${!isDarkMode ? styles.light : ''}`}>
      <div className={styles['top-bar']}>
        <Link to="/" className={styles.logo}>
          Next<span>Level</span>
        </Link>

        <div className={styles['user-actions']} id="user-section">

          {/* --- ADM MENU --- */}
          {isAdmin && (
            <div
              className={styles['menu-trigger']}
              onClick={(e) => handleTriggerClick('admin', e)}
            >
              <span>Painel Admin ({user.nome})</span>
              <div className={`${styles['profile-dropdown']} ${adminMenuOpen ? styles.show : ''}`}>
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

          {/* --- USER MENU --- */}
          <div
            className={styles['menu-trigger']}
            onClick={(e) => handleTriggerClick('user', e)}
          >
            <i className={styles.icon}>👤 {!isAdmin && `(${user.nome})`}</i>

            <div className={`${styles['profile-dropdown']} ${userMenuOpen ? styles.show : ''}`}>
              <ul>
                <li><Link to="/biblioteca">Minha Biblioteca</Link></li>
                <li><Link to="/historico">Histórico de Compras</Link></li>
                <li><Link to="/lista-desejos">Lista de Desejos</Link></li>
                <li><Link to="/meus-dados">Meus Dados</Link></li>
                <li><a href="/" onClick={handleLogout}>Sair</a></li>
              </ul>
            </div>
          </div>

          {/* Ícones fixos */}
          <Link to="/carrinho" className={styles.icon}>🛒</Link>
          <Link to="/lista-desejos" className={styles.icon}>♥️</Link>

          {/* Tema somente logado */}
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
            <Link to="/">Início</Link>
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
