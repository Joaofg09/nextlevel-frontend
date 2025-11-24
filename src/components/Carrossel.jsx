// No arquivo: src/components/Carrossel.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importe useNavigate
import styles from './Carrossel.module.css';

function Carrossel({ jogos }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate(); // Hook para navegação

  // ... (código de configuração VISIBLE_CARDS, etc. mantido igual) ...
  const VISIBLE_CARDS = 3;
  const CARD_WIDTH = 350; 
  const GAP = 20;
  const listaJogos = jogos || [];
  const carouselJogos = listaJogos.slice(8, 16);
  const step = CARD_WIDTH + GAP;
  const offset = -currentIndex * (350 + 20); 
  const maxIndex = Math.max(0, carouselJogos.length - VISIBLE_CARDS);

  const handleNext = () => {
    if (currentIndex >= maxIndex) setCurrentIndex(0);
    else setCurrentIndex(prevIndex => prevIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex === 0) setCurrentIndex(maxIndex);
    else setCurrentIndex(prevIndex => prevIndex - 1);
  };

  // Função para tratar o clique
  const handleCardClick = (e, jogoId) => {
    if (!jogoId) {
        e.preventDefault();
        navigate('/login');
    }
  };

  return (
    <section className={styles.carousel}>
      <button className={`${styles.arrow} ${styles.left}`} onClick={handlePrev}>❮</button>

      <div className={styles['carousel-viewport']}>
        <div className={styles['carousel-track']} style={{ transform: `translateX(${offset}px)` }}>
          {carouselJogos.map((jogo, index) => (
            <Link 
                // Key com fallback para index
                key={jogo.id || index} 
                // Link condicional
                to={jogo.id ? `/loja/jogo/${jogo.id}` : '/login'} 
                className={styles['card-link']}
                onClick={(e) => handleCardClick(e, jogo.id)}
            >
              <div className={styles.card}>
                <h3>{jogo.nome}</h3>
                <span className={styles.price}>
                  $ {jogo.preco ? jogo.preco.toFixed(2).replace('.', ',') : '0,00'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <button className={`${styles.arrow} ${styles.right}`} onClick={handleNext}>❯</button>
    </section>
  );
}

export default Carrossel;