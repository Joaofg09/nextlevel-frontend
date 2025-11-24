// No arquivo: src/pages/Home.js
// VERSÃO FINAL - Usa GameCard + Home.module.css

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Carrossel from '../components/Carrossel';
import ExploreCategories from '../components/ExploreCategories';
import GameCard from '../components/GameCard'; // Importa o componente que criámos
import styles from '../components/Home.module.css'; // Importa os estilos para layout

function Home() {
  const [jogos, setJogos] = useState([]);
  const [categorias, setCategorias] = useState([]); 
  const [termoPesquisa, setTermoPesquisa] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const isLogado = !!user;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const urlJogos = isLogado 
        ? 'http://localhost:3000/api/v1/jogos' 
        : 'http://localhost:3000/api/v1/public/jogos';

    const headers = isLogado ? { 'Authorization': `Bearer ${token}` } : {};

    fetch(urlJogos, { headers })
      .then(res => {
        if (res.status === 401 && isLogado) { logout(); navigate('/login'); return; }
        if (res.status === 204) return [];
        return res.json();
      })
      .then(data => { if (Array.isArray(data)) setJogos(data); })
      .catch(err => console.error("Erro ao buscar jogos:", err));

    if (isLogado) {
      fetch('http://localhost:3000/api/v1/categorias', { headers })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setCategorias(data); })
        .catch(err => console.error("Erro ao buscar categorias:", err));
    }
  }, [isLogado, logout, navigate]);

  const categoriaMap = useMemo(() => {
    return categorias.reduce((acc, cat) => {
      acc[cat.id] = cat.nome.trim(); 
      return acc;
    }, {});
  }, [categorias]);

  const getCategoriaNome = (jogo) => {
    if (jogo.categoria) return jogo.categoria.trim();
    if (jogo.fkCategoria) return categoriaMap[jogo.fkCategoria]; 
    return '';
  };

  const jogosExibidos = useMemo(() => {
    if (!termoPesquisa) return jogos;
    return jogos.filter(j => j.nome.toLowerCase().includes(termoPesquisa.toLowerCase()));
  }, [jogos, termoPesquisa]);

  const listaBase = termoPesquisa ? jogosExibidos : jogos;
  const recomendados = listaBase.slice(0, 4);
  const emAlta = listaBase.slice(4, 8);
  const rpgs = listaBase.filter(j => getCategoriaNome(j) === 'RPG').slice(0, 4);

  const listaCategoriasExibicao = useMemo(() => {
    if (isLogado && categorias.length > 0) return categorias;
    const nomesUnicos = [...new Set(jogos.map(j => j.categoria))].filter(Boolean).sort();
    return nomesUnicos.map((nome, index) => ({ id: index, nome: nome, slug: nome.toLowerCase().replace(/\s+/g, "-") }));
  }, [isLogado, categorias, jogos]);

  return (
    <>
      {/* Barra de Pesquisa */}
      <div className={styles.searchContainer}>
        <input 
          type="text" 
          placeholder="Pesquisar jogos..." 
          value={termoPesquisa}
          onChange={(e) => setTermoPesquisa(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {termoPesquisa ? (
        <section className={styles.section}>
          <h2>Resultados da Pesquisa</h2>
          <div className={styles.grid}>
            {jogosExibidos.map(jogo => (
              <GameCard key={jogo.id || jogo.nome} jogo={jogo} isLogado={isLogado} />
            ))}
            {jogosExibidos.length === 0 && <p>Nenhum jogo encontrado.</p>}
          </div>
        </section>
      ) : (
        <>
          <section className={styles['section-h1']}>
            <h1>Recomendados da Semana</h1>
          </section>
          
          <Carrossel jogos={jogos} />

          <hr style={{ margin: '40px 0', borderColor: '#333' }} />

          <section className={styles.section}>
            <h2>Melhores Jogos</h2>
            <div className={styles.grid}>
              {recomendados.map(jogo => (
                <GameCard key={jogo.id || jogo.nome} jogo={jogo} isLogado={isLogado} />
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Em Alta</h2>
            <div className={styles.grid}>
              {emAlta.map(jogo => (
                <GameCard key={jogo.id || jogo.nome} jogo={jogo} isLogado={isLogado} />
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 id="rpg-section">RPG</h2>
            <div className={styles.grid}>
              {rpgs.map(jogo => (
                <GameCard key={jogo.id || jogo.nome} jogo={jogo} isLogado={isLogado} />
              ))}
            </div>
          </section>
        </>
      )}

      {listaCategoriasExibicao.length > 0 && (
        <ExploreCategories
          categories={listaCategoriasExibicao.map(cat => ({
            name: cat.nome || cat.name, // Compatibilidade
            slug: (cat.slug || cat.nome || "").toLowerCase().replace(/\s+/g, "-")
          }))}
        />
      )}
    </>
  );
}

export default Home;