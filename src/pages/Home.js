// No arquivo: src/pages/Home.js
// VERSÃO 4 - Com filtro de categoria inteligente

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [jogos, setJogos] = useState([]);

  // =================================================================
  // LÓGICA DO CARROSSEL
  // =================================================================
  const [currentIndex, setCurrentIndex] = useState(0);
  const VISIBLE_CARDS = 3; 
  const CARD_WIDTH = 200; 
  const GAP = 20;
  const carouselJogos = jogos.slice(8, 16);
  const step = CARD_WIDTH + GAP;
  const offset = -currentIndex * step;
  const maxIndex = Math.max(0, carouselJogos.length - VISIBLE_CARDS);

  const handleNext = () => {
    setCurrentIndex(prevIndex => Math.min(prevIndex + VISIBLE_CARDS, maxIndex));
  };
  const handlePrev = () => {
    setCurrentIndex(prevIndex => Math.max(prevIndex - VISIBLE_CARDS, 0));
  };
  // =================================================================
  
  useEffect(() => {
    // A rota pública retorna o nome da categoria
    fetch('http://localhost:3000/api/v1/public/jogos') 
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setJogos(data);
        }
      })
      .catch(err => console.error("Erro ao buscar jogos públicos:", err));
  }, []); 

  // Separa os jogos para as seções
  const recomendados = jogos.slice(0, 4);
  const emAlta = jogos.slice(4, 8);
  
  // === CORREÇÃO AQUI ===
  // Adiciona .trim() para limpar os espaços antes de comparar
  const rpgs = jogos.filter(j => j.categoria && j.categoria.trim() === 'RPG').slice(0, 4);

  return (
    <>
      <section className="section-h1">
        <h1>Recomendados da Semana</h1>
      </section>
      
      <section className="carousel">
        <button 
          className="arrow left" 
          aria-label="Anterior" 
          onClick={handlePrev}
          disabled={currentIndex === 0} 
        >
          ❮
        </button>
        
        <div className="carousel-viewport">
          <div 
            className="carousel-track"
            style={{ transform: `translateX(${offset}px)` }}
          >
            {carouselJogos.map((jogo, index) => (
              // Usando index como key temporária pois a API pública não retorna ID
              <Link to="/" key={jogo.nome + index} className="card-link">
                <div className="card">{jogo.nome}</div>
              </Link>
            ))}
          </div>
        </div>
    
        <button 
          className="arrow right" 
          aria-label="Próximo"
          onClick={handleNext}
          disabled={currentIndex >= maxIndex} 
        >
          ❯
        </button>
        
        <div className="dots"></div>
      </section>

      <section className="section">
        <h2>Melhores Jogos</h2>
        <div className="grid">
          {recomendados.length > 0 ? (
            recomendados.map((jogo, index) => (
              <Link to="/" key={jogo.nome + index} className="card-link">
                <div className="card">{jogo.nome}</div>
              </Link>
            ))
          ) : (
            <p>Carregando jogos...</p>
          )}
        </div>
      </section>

      <section className="section">
        <h2>Em Alta</h2>
        <div className="grid">
          {emAlta.map((jogo, index) => (
            <Link to="/" key={jogo.nome + index} className="card-link">
              <div className="card">{jogo.nome}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 id="rpg-section">RPG</h2>
        <div className="grid">
          {rpgs.map((jogo, index) => (
            <Link to="/" key={jogo.nome + index} className="card-link">
              <div className="card">{jogo.nome}</div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;