// No arquivo: src/pages/Home.js
// VERSÃO FINAL - Híbrida + Componentes + CSS Modules

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Carrossel from '../components/Carrossel';
import ExploreCategories from '../components/ExploreCategories';
import styles from '../components/Home.module.css'; // Importa seu CSS Module

function Home() {
  const [jogos, setJogos] = useState([]);
  const [categorias, setCategorias] = useState([]); 
  const [termoPesquisa, setTermoPesquisa] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const isLogado = !!user;

  // =================================================================
  // 1. BUSCAR DADOS (Híbrido: Público vs Privado)
  // =================================================================
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Define URL: Privada (com IDs) ou Pública (sem IDs, mas com nomes)
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

    // B. Buscar CATEGORIAS
    // Se logado: busca da API de categorias.
    // Se público: a API de categorias é bloqueada, então extraímos dos próprios jogos depois.
    if (isLogado) {
      fetch('http://localhost:3000/api/v1/categorias', { headers })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setCategorias(data); })
        .catch(err => console.error("Erro ao buscar categorias:", err));
    }
  }, [isLogado, logout, navigate]);

  // =================================================================
  // 2. NORMALIZAÇÃO DE DADOS (Resolver diferença Público/Privado)
  // =================================================================
  
  // Mapa para traduzir ID -> Nome (apenas modo privado)
  const categoriaMap = useMemo(() => {
    return categorias.reduce((acc, cat) => {
      acc[cat.id] = cat.nome.trim(); 
      return acc;
    }, {});
  }, [categorias]);

  // Helper para pegar o nome da categoria de um jogo, independente do modo
  const getCategoriaNome = (jogo) => {
    // Modo Público: A API já manda o nome em 'jogo.categoria'
    if (jogo.categoria) return jogo.categoria.trim();
    // Modo Privado: A API manda 'fkCategoria', traduzimos pelo mapa
    if (jogo.fkCategoria) return categoriaMap[jogo.fkCategoria];
    return '';
  };

  // Se estiver no modo público, geramos a lista de categorias baseada nos jogos carregados
  const listaCategoriasExibicao = useMemo(() => {
    if (isLogado && categorias.length > 0) return categorias;
    
    // Extrai categorias únicas dos jogos públicos
    const nomesUnicos = [...new Set(jogos.map(j => j.categoria))].filter(Boolean).sort();
    return nomesUnicos.map((nome, index) => ({ id: index, nome: nome }));
  }, [isLogado, categorias, jogos]);

  // =================================================================
  // 3. FILTROS E SEÇÕES
  // =================================================================
  
  // Filtro de Pesquisa
  const jogosExibidos = useMemo(() => {
    if (!termoPesquisa) return jogos;
    return jogos.filter(j => j.nome.toLowerCase().includes(termoPesquisa.toLowerCase()));
  }, [jogos, termoPesquisa]);

  const listaBase = termoPesquisa ? jogosExibidos : jogos;

  // Seções
  const recomendados = listaBase.slice(0, 4);
  const emAlta = listaBase.slice(4, 8);
  
  // Filtro RPG usando o helper unificado
  const rpgs = listaBase.filter(j => getCategoriaNome(j) === 'RPG').slice(0, 4);

  // Componente interno de Card para reutilizar lógica de clique
  const GameCard = ({ jogo }) => {
    // Se tem ID (privado ou público corrigido), vai pro jogo. Se não, login.
    const linkTo = jogo.id ? `/loja/jogo/${jogo.id}` : '/login';
    
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
            {/* Formatação de preço segura */}
            $ {jogo.preco !== undefined ? Number(jogo.preco).toFixed(2).replace('.', ',') : '0,00'}
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Barra de Pesquisa (Estilo inline para simplificar ou adicione ao module.css) */}
      <div style={{maxWidth: '600px', margin: '20px auto', padding: '0 20px'}}>
        <input 
          type="text" 
          placeholder="Pesquisar jogos..." 
          value={termoPesquisa}
          onChange={(e) => setTermoPesquisa(e.target.value)}
          style={{
              width: '100%', 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid #444', 
              backgroundColor: '#1a1a1a', 
              color: '#fff',
              outline: 'none'
          }}
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
          
          {/* Seu componente Carrossel */}
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

      {/* Seu componente de Categorias */}
      {listaCategoriasExibicao.length > 0 && (
        <ExploreCategories
          categories={listaCategoriasExibicao.map(cat => ({
            name: cat.nome,
            slug: cat.nome.toLowerCase().replace(/\s+/g, "-")
          }))}
        />
      )}
    </>
  );
}

export default Home;