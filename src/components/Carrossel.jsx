import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Carrossel.module.css';

function Carrossel({ jogos }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Configurações
  const VISIBLE_CARDS = 3;

  const listaJogos = jogos || [];
  const carouselJogos = listaJogos.slice(8, 16);
  const offset = -currentIndex * 370; 
  const maxIndex = Math.max(0, carouselJogos.length - VISIBLE_CARDS);

  const handleNext = () => {
    if (currentIndex >= maxIndex) {
      setCurrentIndex(0); 
    } else {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex === 0) {
      setCurrentIndex(maxIndex); 
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
      >
        ❮
      </button>

      <div className={styles['carousel-viewport']}>
        <div
          className={styles['carousel-track']}
          style={{ transform: `translateX(${offset}px)` }}
        >
          {carouselJogos.map(jogo => (
            <Link to={`/loja/jogo/${jogo.id}`} key={jogo.id} className={styles['card-link']}>
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

      <button
        className={`${styles.arrow} ${styles.right}`}
        aria-label="Próximo"
        onClick={handleNext}
      >
        ❯
      </button>
    </section>
  );
}

export default Carrossel;