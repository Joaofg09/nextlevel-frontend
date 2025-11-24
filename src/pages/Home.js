// No arquivo: src/pages/Home.js
// VERSÃO: Home Híbrida com Banner de Login

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Carrossel from '../components/Carrossel';
import styles from '../components/Home.module.css';
import ExploreCategories from '../components/ExploreCategories';

function Home() {
  const [jogos, setJogos] = useState([]);
  const [categorias, setCategorias] = useState([]); 
  const [termoPesquisa, setTermoPesquisa] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const isLogado = !!user;

  // =================================================================
  // 1. BUSCA DE DADOS (Híbrida: Público ou Privado)
  // =================================================================
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Define qual URL usar
    const urlJogos = isLogado 
        ? 'http://localhost:3000/api/v1/jogos' 
        : 'http://localhost:3000/api/v1/public/jogos';

    const headers = isLogado ? { 'Authorization': `Bearer ${token}` } : {};

    // A. Buscar JOGOS
    fetch(urlJogos, { headers })
      .then(res => {
        if (res.status === 401 && isLogado) { logout(); navigate('/login'); return; }
        if (res.status === 204) return [];
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setJogos(data);
      })
      .catch(err => console.error("Erro ao buscar jogos:", err));

    // B. Buscar CATEGORIAS (Só se estiver logado, pois a pública não tem esse endpoint)
    if (isLogado) {
      fetch('http://localhost:3000/api/v1/categorias', { headers })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setCategorias(data); })
        .catch(err => console.error("Erro ao buscar categorias:", err));
    }
  }, [isLogado, logout, navigate]);

  // =================================================================
  // LÓGICA DE FILTROS
  // =================================================================
  
  // Mapa de Categorias (ID -> Nome) - Só existe se logado
  const categoriaMap = useMemo(() => {
    return categorias.reduce((acc, cat) => {
      acc[cat.id] = cat.nome.trim(); 
      return acc;
    }, {});
  }, [categorias]);

  // Helper para pegar o nome da categoria
  const getCategoriaNome = (jogo) => {
    if (jogo.categoria) return jogo.categoria.trim(); // Modo Público
    if (jogo.fkCategoria) return categoriaMap[jogo.fkCategoria]; // Modo Privado
    return '';
  };

  // Filtro de Pesquisa
  const jogosExibidos = useMemo(() => {
    if (!termoPesquisa) return jogos;
    return jogos.filter(j => j.nome.toLowerCase().includes(termoPesquisa.toLowerCase()));
  }, [jogos, termoPesquisa]);

  const listaBase = termoPesquisa ? jogosExibidos : jogos;

  const recomendados = listaBase.slice(0, 4);
  const emAlta = listaBase.slice(4, 8);
  const rpgs = listaBase.filter(j => getCategoriaNome(j) === 'RPG').slice(0, 4);

  // Se não estiver logado, gera categorias baseadas nos jogos visíveis
  const categoriasExibicao = useMemo(() => {
      if (isLogado && categorias.length > 0) return categorias.map(c => ({ name: c.nome, slug: c.id }));
      // Extrai categorias únicas dos jogos
      const cats = [...new Set(jogos.map(j => j.categoria))].filter(Boolean).sort();
      return cats.map(c => ({ name: c, slug: c.toLowerCase() }));
  }, [isLogado, categorias, jogos]);

  // Componente Card Interno (com lógica de clique)
  const GameCard = ({ jogo }) => {
    const linkTo = jogo.id ? `/jogo/${jogo.id}` : '/login';
    
    const handleClick = (e) => {
        if (!jogo.id) {
            e.preventDefault();
            navigate('/login');
        }
    };

    return (
      <Link to={linkTo} className={styles['card-link']} onClick={handleClick}>
        <div className={styles.card}>{jogo.nome}</div>
        <div className={styles.priceTag}>
            $ {jogo.preco ? Number(jogo.preco).toFixed(2).replace('.', ',') : '0,00'}
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* === NOVO: BANNER DE BOAS-VINDAS (Só aparece se NÃO estiver logado) === */}
      {!isLogado && (
        <div style={{
            textAlign: 'center', 
            padding: '40px 20px', 
            background: 'linear-gradient(180deg, #0d0d0d 0%, #1a1a1a 100%)', 
            borderBottom: '2px solid #333',
            marginBottom: '20px'
        }}>
            {/* LOGO GRANDE */}
            <h1 style={{fontSize: '3rem', fontWeight: '800', color: '#fff', marginBottom: '10px'}}>
                Next<span style={{color: '#e53935'}}>Level</span>
            </h1>
            <p style={{color: '#ccc', marginBottom: '25px', fontSize: '1.1rem'}}>
                Explore os melhores jogos digitais. Faça login para comprar e jogar.
            </p>
            {/* BOTÃO INICIAR SESSÃO */}
            <Link to="/login" style={{
                display: 'inline-block',
                padding: '12px 30px',
                backgroundColor: '#39FF14',
                color: '#000',
                fontWeight: 'bold',
                borderRadius: '50px',
                textDecoration: 'none',
                fontSize: '1.1rem',
                boxShadow: '0 0 15px rgba(57, 255, 20, 0.4)',
                transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                Iniciar Sessão
            </Link>
        </div>
      )}

      {/* BARRA DE PESQUISA */}
      <div className={styles.searchContainer} style={{maxWidth: '600px', margin: '0 auto 30px auto'}}>
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
              <GameCard key={jogo.id || jogo.nome} jogo={jogo} />
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
                <GameCard key={jogo.id || jogo.nome} jogo={jogo} />
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Em Alta</h2>
            <div className={styles.grid}>
              {emAlta.map(jogo => (
                <GameCard key={jogo.id || jogo.nome} jogo={jogo} />
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 id="rpg-section">RPG</h2>
            <div className={styles.grid}>
              {rpgs.map(jogo => (
                <GameCard key={jogo.id || jogo.nome} jogo={jogo} />
              ))}
            </div>
          </section>
        </>
      )}

      {categoriasExibicao.length > 0 && (
        <ExploreCategories categories={categoriasExibicao} />
      )}
    </>
  );
}

export default Home;