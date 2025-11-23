// No arquivo: src/components/Carrossel.js
// VERSÃO FINAL - Loop Infinito (Circular)

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Carrossel.module.css';

function Carrossel({ jogos }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Configurações
  const VISIBLE_CARDS = 3;
  const CARD_WIDTH = 350; 
  const GAP = 20;

  const listaJogos = jogos || [];
  // Pega os jogos de destaque
  const carouselJogos = listaJogos.slice(8, 16);

  const step = CARD_WIDTH + GAP;
  
  // Calcula o deslocamento visual
  const offset = -currentIndex * (350 + 20); 

  // Índice máximo possível
  const maxIndex = Math.max(0, carouselJogos.length - VISIBLE_CARDS);

  // === LÓGICA INFINITA (Próximo) ===
  const handleNext = () => {
    if (currentIndex >= maxIndex) {
      setCurrentIndex(0); // Se chegou no fim, volta para o início
    } else {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  };

  // === LÓGICA INFINITA (Anterior) ===
  const handlePrev = () => {
    if (currentIndex === 0) {
      setCurrentIndex(maxIndex); // Se está no início, vai para o fim
    } else {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  };

  return (
    <section className={styles.carousel}>
      <button
        className={`${styles.arrow} ${styles.left}`}
        aria-label="Anterior"
        onClick={handlePrev}
        // Removido o 'disabled' para permitir o loop
      >
        ❮
      </button>

      <div className={styles['carousel-viewport']}>
        <div
          className={styles['carousel-track']}
          style={{ transform: `translateX(${offset}px)` }}
        >
          {carouselJogos.map(jogo => (
            // Adicionado '/loja' ao link conforme a nova estrutura
            <Link to={`/loja/jogo/${jogo.id}`} key={jogo.id} className={styles['card-link']}>
              <div className={styles.card}>
                {/* Título */}
                <h3>{jogo.nome}</h3>
                
                {/* Preço no canto inferior esquerdo */}
                <span className={styles.price}>
                  $ {jogo.preco ? jogo.preco.toFixed(2).replace('.', ',') : '0,00'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <button
        className={`${styles.arrow} ${styles.right}`}
        aria-label="Próximo"
        onClick={handleNext}
        // Removido o 'disabled' para permitir o loop
      >
        ❯
      </button>
    </section>
  );
}

export default Carrossel;