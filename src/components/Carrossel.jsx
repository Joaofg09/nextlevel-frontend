import React, { useState } from 'react'; // Adicionar 'useState'
import { Link } from 'react-router-dom';
import styles from './Carrossel.module.css';

// =================================================================
  // LÓGICA DO CARROSSEL
  // =================================================================
 function Carrossel({ jogos }) { 

    // A LÓGICA DO CARROSSEL DEVE ESTAR AQUI DENTRO DO COMPONENTE
    const [currentIndex, setCurrentIndex] = useState(0);
    const VISIBLE_CARDS = 3; 
    const CARD_WIDTH = 200; 
    const GAP = 20;

    // A lógica de corte dos jogos deve vir daqui (slice(8, 16))
    const carouselJogos = jogos.slice(8, 16); 
    
    // As verificações de tamanho de array devem usar o array cortado
    const step = CARD_WIDTH + GAP;
    const offset = -currentIndex * step;
    const maxIndex = Math.max(0, carouselJogos.length - VISIBLE_CARDS);
    
    const handleNext = () => { setCurrentIndex(prevIndex => Math.min(prevIndex + VISIBLE_CARDS, maxIndex)); };
    const handlePrev = () => { setCurrentIndex(prevIndex => Math.max(prevIndex - VISIBLE_CARDS, 0)); };
  return (
    <>
      
      <section className={styles.carousel}>
        <button className={`${styles.arrow} ${styles.left}`} aria-label="Anterior" onClick={handlePrev} disabled={currentIndex === 0}>❮</button>
        <div className={styles['carousel-viewport']}>
          <div className={styles['carousel-track']} style={{ transform: `translateX(${offset}px)` }}>
            {carouselJogos.map(jogo => (
              // === LINK CORRIGIDO ===
              <Link to={`/jogo/${jogo.id}`} key={jogo.id} className={styles['card-link']}>
                <div className={styles.card}>{jogo.nome}</div>
              </Link>
            ))}
          </div>
        </div>
        <button className={`${styles.arrow} ${styles.right}`} aria-label="Próximo" onClick={handleNext} disabled={currentIndex >= maxIndex}>❯</button>
        <div className={styles.dots}></div>
      </section>

      </>
  );
}
export default Carrossel;