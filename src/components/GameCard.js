// No arquivo: src/components/GameCard.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Importa o SEU arquivo de estilos
import styles from './Home.module.css'; 

function GameCard({ jogo, isLogado }) {
  const navigate = useNavigate();

  // Lógica de clique: Se não tem ID ou não tá logado, vai pro login
  const handleClick = (e) => {
      if (!isLogado || !jogo.id) {
          e.preventDefault();
          navigate('/login');
      }
  };

  // Link de destino (se tiver ID e estiver logado)
  const linkTo = isLogado && jogo.id ? `/loja/jogo/${jogo.id}` : '/login';

  return (
    <Link to={linkTo} className={styles['card-link']} onClick={handleClick}>
      <div className={styles.card}>
         {/* Container flex column para alinhar titulo e preço */}
         <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <span>{jogo.nome}</span>
            
            <div className={styles.priceTag}>
               $ {jogo.preco ? Number(jogo.preco).toFixed(2).replace('.', ',') : '0,00'}
            </div>
         </div>
      </div>
    </Link>
  );
}

export default GameCard;