// No arquivo: src/pages/Home.js
// VERSÃO 6 - Usando a rota protegida para obter IDs

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Precisamos do auth
import Carrossel from '../components/Carrossel';
import styles from '../components/Home.module.css';
import ExploreCategories from '../components/ExploreCategories';

function Home() {
  const [jogos, setJogos] = useState([]);
  const [categorias, setCategorias] = useState([]); // Para filtrar a seção RPG

  const { user, logout } = useAuth(); // Pega o usuário e a função de logout
  const navigate = useNavigate();

  // =================================================================
  // FUNÇÃO PARA BUSCAR DADOS
  // =================================================================
  useEffect(() => {
    // Se não há usuário, não busca nada.
    if (!user) {
      return;
    }

    const token = localStorage.getItem('token');

    const secureFetch = (url) => {
      return fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => {
          if (res.status === 401) { logout(); navigate('/login'); throw new Error('Sessão expirada'); }
          if (res.status === 204) return null;
          return res.json();
        });
    };

    // 1. Buscar a lista de JOGOS (a rota protegida, que tem ID)
    secureFetch('http://localhost:3000/api/v1/jogos')
      .then(data => {
        if (Array.isArray(data)) {
          setJogos(data);
        }
      })
      .catch(err => console.error("Erro ao buscar jogos:", err.message));

    // 2. Buscar a lista de CATEGORIAS (para o filtro de RPG)
    secureFetch('http://localhost:3000/api/v1/categorias')
      .then(data => {
        if (Array.isArray(data)) {
          setCategorias(data);
        }
      })
      .catch(err => console.error("Erro ao buscar categorias:", err.message));

  }, [user, logout, navigate]); // Roda quando o usuário (login) mudar

  // =================================================================
  // LÓGICA DAS SEÇÕES
  // =================================================================

  // Mapa para traduzir ID de categoria em Nome
  const categoriaMap = useMemo(() => {
    return categorias.reduce((acc, cat) => {
      acc[cat.id] = cat.nome.trim(); // Ex: { 3: 'RPG' }
      return acc;
    }, {});
  }, [categorias]);


  // Separa os jogos para as seções
  const recomendados = jogos.slice(0, 4);
  const emAlta = jogos.slice(4, 8);

  // Filtro de RPG "inteligente" (usando o mapa)
  const rpgs = jogos.filter(j => categoriaMap[j.fkCategoria] === 'RPG').slice(0, 4);

  // Se o usuário não estiver logado, mostre uma mensagem
  if (!user) {
    return (
      <div className="main-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h1>Bem-vindo à NextLevel</h1>
        <p>Por favor, <Link to="/login">faça login</Link> para ver nosso catálogo de jogos.</p>
      </div>
    );
  }
  
  // Se estiver logado, mostra os jogos
  return (
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
            recomendados.map(jogo => (
              // === LINK CORRIGIDO ===
              <Link to={`/jogo/${jogo.id}`} key={jogo.id} className={styles['card-link']}>
                <div className={styles.card}>{jogo.nome}</div>
                <div className={styles.priceTag}>
                  {/* Formate o preço conforme necessário (ex: R$ 162,00) */}
                  $ {jogo.preco ? jogo.preco.toFixed(2).replace('.', ',') : 'N/A'}
                </div>
              </Link>
            ))
          ) : (<p>Carregando jogos...</p>)}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Em Alta</h2>
        <div className={styles.grid}>
          {emAlta.map(jogo => (
            // === LINK CORRIGIDO ===
            <Link to={`/jogo/${jogo.id}`} key={jogo.id} className={styles['card-link']}>
              <div className={styles.card}>{jogo.nome}</div>
              <div className={styles.priceTag}>
                {/* Formate o preço conforme necessário (ex: R$ 162,00) */}
                $ {jogo.preco ? jogo.preco.toFixed(2).replace('.', ',') : 'N/A'}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 id="rpg-section">RPG</h2>
        <div className={styles.grid}>
          {rpgs.map(jogo => (
            // === LINK CORRIGIDO ===
            <Link to={`/jogo/${jogo.id}`} key={jogo.id} className={styles['card-link']}>
              <div className={styles.card}>{jogo.nome}</div>
              <div className={styles.priceTag}>
                {/* Formate o preço conforme necessário (ex: R$ 162,00) */}
                $ {jogo.preco ? jogo.preco.toFixed(2).replace('.', ',') : 'N/A'}
              </div>
            </Link>
          ))}
        </div>
      </section>

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