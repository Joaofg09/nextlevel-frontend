// No arquivo: src/components/Carrossel.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Carrossel.module.css';

function Carrossel({ jogos }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const VISIBLE_CARDS = 3;
  const CARD_WIDTH = 350;
  const GAP = 20;

  const listaJogos = jogos || [];
  const carouselJogos = listaJogos.slice(8, 16);

  const maxIndex = Math.max(0, carouselJogos.length - VISIBLE_CARDS);
  const offset = -currentIndex * (CARD_WIDTH + GAP);

  const handleNext = () => {
    setCurrentIndex(prev =>
      prev >= maxIndex ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex(prev =>
      prev === 0 ? maxIndex : prev - 1
    );
  };

  return (
    <>
      {/* === CARROSSEL PRINCIPAL === */}
      <section className={styles.carousel}>

        <button
          className={`${styles.arrow} ${styles.left}`}
          aria-label="Anterior"
          onClick={handlePrev}
        >
          ❮
        </button>

        <div className={styles['carousel-viewport']}>
          <div
            className={styles['carousel-track']}
            style={{ transform: `translateX(${offset}px)` }}
          >
            {carouselJogos.map(jogo => (
              <Link
                to={`/jogo/${jogo.id}`}
                key={jogo.id}
                className={styles['card-link']}
              >
                <div className={styles.card}>
                  <h3>{jogo.nome}</h3>
                  <span className={styles.price}>
                    ${' '}
                    {jogo.preco
                      ? jogo.preco.toFixed(2).replace('.', ',')
                      : '0,00'}
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
        >
          ❯
        </button>

      </section>

      {/* === PONTINHOS ABAIXO DO CARROSSEL (Fora do <section>) === */}
      <div className={styles.dotsWrapper}>
        <div className={styles.dotsContainer}>
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${
                i === currentIndex ? styles.activeDot : ''
              }`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Ir para o slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default Carrossel;
