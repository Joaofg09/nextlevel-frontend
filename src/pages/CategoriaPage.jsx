// No arquivo: src/pages/CategoriaPage.js
// VERSÃO LIMPA - Sem avisos

import React, { useEffect, useState } from 'react'; // Removido 'useMemo'
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GameCard from '../components/GameCard'; 
import styles from '../components/Home.module.css'; 

function normalizar(text) {
  if (!text) return '';
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function CategoriaPage() {
  const { slug } = useParams(); 
  const [jogosFiltrados, setJogosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isLogado = !!user;

  useEffect(() => {
    const fetchDados = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = isLogado ? { "Authorization": `Bearer ${token}` } : {};

      try {
        const urlJogos = isLogado 
            ? 'http://localhost:3000/api/v1/jogos' 
            : 'http://localhost:3000/api/v1/public/jogos';

        const resJogos = await fetch(urlJogos, { headers });
        
        if (resJogos.status === 401 && isLogado) {
             logout(); navigate('/login'); return;
        }
        
        const listaJogos = await resJogos.json();
        const slugNormalizado = normalizar(slug);
        let filtrados = [];

        if (isLogado) {
          const resCategorias = await fetch("http://localhost:3000/api/v1/categorias", { headers });
          const listaCategorias = await resCategorias.json();

          const categoriaMap = {};
          listaCategorias.forEach(c => {
            categoriaMap[c.id] = normalizar(c.nome);
          });

          filtrados = listaJogos.filter(jogo => 
            categoriaMap[jogo.fkCategoria] === slugNormalizado
          );

        } else {
          filtrados = listaJogos.filter(jogo => 
            normalizar(jogo.categoria) === slugNormalizado
          );
        }

        setJogosFiltrados(filtrados);

      } catch (error) {
        console.error("Erro ao buscar jogos da categoria:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, [slug, isLogado, logout, navigate]);

  if (loading) {
      return <div className="main-container" style={{padding: '40px'}}><p>Carregando categoria...</p></div>;
  }

  return (
    <div className="main-container" style={{ padding: "20px" }}>
      <h1 className="section-h1" style={{ marginBottom: "30px", marginLeft: 0, borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        Categoria: <span style={{color: '#39FF14'}}>{slug.toUpperCase()}</span>
      </h1>

      {jogosFiltrados.length === 0 ? (
        <p style={{color: '#ccc'}}>Nenhum jogo encontrado nesta categoria.</p>
      ) : (
        <div className={styles.grid}>
          {jogosFiltrados.map(jogo => (
            <GameCard key={jogo.id || jogo.nome} jogo={jogo} isLogado={isLogado} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoriaPage;