// No arquivo: src/pages/CategoriaPage.js
// VERSÃO FINAL - Híbrida + GameCard

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GameCard from '../components/GameCard'; // Reutiliza o card bonito da Home
import styles from '../components/Home.module.css'; // Reutiliza a grid da Home

// Função auxiliar para normalizar texto (remover acentos, minúsculas)
function normalizar(text) {
  if (!text) return '';
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function CategoriaPage() {
  const { slug } = useParams(); // ex: "rpg", "acao"
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
        // 1. BUSCAR JOGOS (Híbrido)
        const urlJogos = isLogado 
            ? 'http://localhost:3000/api/v1/jogos' 
            : 'http://localhost:3000/api/v1/public/jogos';

        const resJogos = await fetch(urlJogos, { headers });
        
        // Se der erro de sessão
        if (resJogos.status === 401 && isLogado) {
             logout(); navigate('/login'); return;
        }
        
        const listaJogos = await resJogos.json();

        // 2. LÓGICA DE FILTRAGEM
        const slugNormalizado = normalizar(slug);
        let filtrados = [];

        if (isLogado) {
          // MODO PRIVADO: Precisamos buscar as categorias para traduzir o ID
          const resCategorias = await fetch("http://localhost:3000/api/v1/categorias", { headers });
          const listaCategorias = await resCategorias.json();

          // Cria mapa: ID -> Slug Normalizado (ex: 1 -> "rpg")
          const categoriaMap = {};
          listaCategorias.forEach(c => {
            categoriaMap[c.id] = normalizar(c.nome);
          });

          filtrados = listaJogos.filter(jogo => 
            categoriaMap[jogo.fkCategoria] === slugNormalizado
          );

        } else {
          // MODO PÚBLICO: A API já retorna o nome da categoria (ex: "RPG")
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
        // Reutiliza o estilo de Grid da Home
        <div className={styles.grid}>
          {jogosFiltrados.map(jogo => (
            // Usa o componente GameCard para ficar visualmente igual à Home
            <GameCard key={jogo.id || jogo.nome} jogo={jogo} isLogado={isLogado} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoriaPage;