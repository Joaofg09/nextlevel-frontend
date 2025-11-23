// src/components/Carrossel.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Carrossel.module.css';

function Carrossel({ jogos }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Configurações
  const VISIBLE_CARDS = 3;
  const CARD_WIDTH = 200;
  const GAP = 20;

  // Proteção: Se 'jogos' vier vazio ou indefinido, usa array vazio para não quebrar
  const listaJogos = jogos || [];

  // Lógica de corte (slice)
  const carouselJogos = listaJogos.slice(8, 16);

  // Cálculos de navegação
  const step = CARD_WIDTH + GAP;
  const offset = -currentIndex * step;
  const maxIndex = Math.max(0, carouselJogos.length - VISIBLE_CARDS);

  const handleNext = () => {
    setCurrentIndex(prevIndex => Math.min(prevIndex + 1, maxIndex));
  };

  const handlePrev = () => {
    setCurrentIndex(prevIndex => Math.max(prevIndex - 1, 0));
  };

  return (
    <section className={styles.carousel}>
      <button
        className={`${styles.arrow} ${styles.left}`}
        aria-label="Anterior"
        onClick={handlePrev}
        disabled={currentIndex === 0}
      >
        ❮
      </button>

      <div className={styles['carousel-viewport']}>
        <div
          className={styles['carousel-track']}
          style={{ transform: `translateX(${offset}px)` }}
        >
          {carouselJogos.map(jogo => (
            <Link to={`/jogo/${jogo.id}`} key={jogo.id} className={styles['card-link']}>
              <div className={styles.card}>
                {jogo.nome}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <button
        className={`${styles.arrow} ${styles.right}`}
        aria-label="Próximo"
        onClick={handleNext}
        disabled={currentIndex >= maxIndex}
      >
        ❯
      </button>
    </section>
  );
}

export default Carrossel;