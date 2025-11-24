// No arquivo: src/pages/Home.js
// VERSÃO 6 - Usando a rota protegida para obter IDs

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Carrossel from '../components/Carrossel';
import styles from '../components/Home.module.css';
import ExploreCategories from '../components/ExploreCategories';

function Home() {
  const [jogos, setJogos] = useState([]);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [jogosFiltrados, setJogosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // =================================================================
  // FUNÇÃO PARA BUSCAR DADOS
  // =================================================================
  useEffect(() => {
    if (!user) {
      return;
    }

    const token = localStorage.getItem('token');
    const BASE_URL = 'http://localhost:3000/api/v1'; // Definido para uso mais limpo

    const secureFetch = (url) => {
      return fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => {
          if (res.status === 401) { logout(); navigate('/login'); throw new Error('Sessão expirada'); }
          if (res.status === 204) return null;
          return res.json();
        });
    };

    // 1. Buscar a lista de JOGOS
    secureFetch(`${BASE_URL}/jogos`)
      .then(data => {
        if (Array.isArray(data)) {
          setJogos(data);
          // Inicializa a lista filtrada com todos os jogos
          setJogosFiltrados(data);
        }
      })
      .catch(err => console.error("Erro ao buscar jogos:", err.message));

    // 2. Buscar a lista de CATEGORIAS
    secureFetch(`${BASE_URL}/categorias`)
      .then(data => {
        if (Array.isArray(data)) {
          setCategorias(data);
        }
      })
      .catch(err => console.error("Erro ao buscar categorias:", err.message));

  }, [user, logout, navigate]);

  // =================================================================
  // LÓGICA DA BARRA DE PESQUISA (FILTRAGEM CLIENT-SIDE)
  // =================================================================
  useEffect(() => {
    const termoNormalizado = termoPesquisa.toLowerCase().trim();

    if (termoNormalizado === '') {
      // Se a barra estiver vazia, exibe todos os jogos originais
      setJogosFiltrados(jogos);
      return;
    }

    // Filtra a lista original de 'jogos'
    const resultados = jogos.filter(jogo =>
      jogo.nome.toLowerCase().includes(termoNormalizado)
    );

    setJogosFiltrados(resultados);
  }, [termoPesquisa, jogos]); // Roda quando o termo de pesquisa ou a lista original de jogos muda


  // =================================================================
  // LÓGICA DAS SEÇÕES PADRÕES
  // =================================================================

  const categoriaMap = useMemo(() => {
    return categorias.reduce((acc, cat) => {
      acc[cat.id] = cat.nome.trim();
      return acc;
    }, {});
  }, [categorias]);

  // Os filtros para as seções padrões SÓ USAM a lista original 'jogos'
  // e só são usados quando não há termo de pesquisa
  const recomendados = jogos.slice(0, 4);
  const emAlta = jogos.slice(4, 8);
  const rpgs = jogos.filter(j => categoriaMap[j.fkCategoria] === 'RPG').slice(0, 4);

  const GameCard = ({ jogo }) => (
    <Link to={`/jogo/${jogo.id}`} key={jogo.id} className={styles['card-link']}>
      <div className={styles.card}>{jogo.nome}</div>
      <div className={styles.priceTag}>
        $ {jogo.preco ? jogo.preco.toFixed(2).replace('.', ',') : 'N/A'}
      </div>
    </Link>
  );

  if (!user) {
    return (
      <div className="main-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h1>Bem-vindo à NextLevel</h1>
        <p>Por favor, <Link to="/login">faça login</Link> para ver nosso catálogo de jogos.</p>
      </div>
    );
  }

  return (
    <>
      {/* ====================================================== */}
      {/* INPUT DA BARRA DE PESQUISA (ADICIONADO) */}
      {/* ====================================================== */}

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Pesquisar jogos por nome..."
          value={termoPesquisa}
          onChange={(e) => setTermoPesquisa(e.target.value)}
          className={styles.searchInput}
        // Opcional: Adicione onFocus/onBlur se estiver usando o estado showSuggestions
        />

        {/* Lista de Sugestões */}
        {termoPesquisa.length > 0 && jogosFiltrados.length > 0 && (
          <ul className={styles.suggestionsList}>
            {/* Mapeamos APENAS um número limitado de sugestões */}
            {jogosFiltrados.slice(0, 5).map(jogo => (
              <li
                key={jogo.id}
                className={styles.suggestionItem}
                onClick={() => {
                  // 1. Limpa a barra de pesquisa (opcional, mas recomendado)
                  setTermoPesquisa('');

                  // 2. Navega para a página do jogo usando o ID
                  navigate(`/jogo/${jogo.id}`);
                }}
              >
                {jogo.nome}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ====================================================== */}
      {/* RENDERIZAÇÃO CONDICIONAL DA PESQUISA / SEÇÕES PADRÕES */}
      {/* ====================================================== */}

      {termoPesquisa.length > 0 ? (
        // RENDERIZA A LISTA DE PESQUISA
        <section className={styles.section}>
          <h2>
            Resultados da Pesquisa
            {jogosFiltrados.length === 0 && `: Nenhum jogo encontrado para "${termoPesquisa}"`}
          </h2>
          <div className={styles.grid}>
            {jogosFiltrados.map(jogo => <GameCard key={jogo.id} jogo={jogo} />)}
          </div>
        </section>
      ) : (
        // RENDERIZA AS SEÇÕES PADRÕES
        <>
          <section className={styles['section-h1']}>
            <h1>Recomendados da Semana</h1>
          </section>

          <Carrossel jogos={jogos} />

          <hr style={{ margin: '40px 0' }} />

          <section className={styles.section}>
            <h2>Melhores Jogos</h2>
            <div className={styles.grid}>
              {recomendados.length > 0 ? (
                recomendados.map(jogo => <GameCard key={jogo.id} jogo={jogo} />)
              ) : (<p>Carregando jogos...</p>)}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Em Alta</h2>
            <div className={styles.grid}>
              {emAlta.map(jogo => <GameCard key={jogo.id} jogo={jogo} />)}
            </div>
          </section>

          <section className={styles.section}>
            <h2 id="rpg-section">RPG</h2>
            <div className={styles.grid}>
              {rpgs.map(jogo => <GameCard key={jogo.id} jogo={jogo} />)}
            </div>
          </section>
        </>
      )}

      {/* ExploreCategories permanece no final */}
      {categorias.length > 0 && (
        <ExploreCategories
          categories={categorias.map(cat => ({
            name: cat.nome,
            slug: cat.nome
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .replace(/\s+/g, "-")
          }))}
        />
      )}
    </>
  );
}

export default Home;