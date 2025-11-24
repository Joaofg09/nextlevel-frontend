// No arquivo: src/pages/JogoDetalhesPage.js
// VERSÃO 10 - Preparada para Light Mode (Sem estilos inline)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

function JogoDetalhesPage() {
  const { id } = useParams(); 
  const [jogo, setJogo] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [hasGame, setHasGame] = useState(false);

  const [nota, setNota] = useState(0);
  const [hoverNota, setHoverNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [notification, setNotification] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => { setNotification(null); }, 3000);
  };

  const fetchData = useCallback(() => {
    const token = localStorage.getItem('token');
    const secureFetch = (url) => {
      return fetch(url, { headers: { 'Authorization': `Bearer ${token}` }})
        .then(res => {
          if (res.status === 401) { logout(); navigate('/login'); throw new Error('Sessão expirada'); }
          if (res.status === 204) return null; 
          return res.json();
        });
    };

    secureFetch(`http://localhost:3000/api/v1/jogos/${id}`)
      .then(data => setJogo(data))
      .catch(err => console.error("Erro ao buscar jogo:", err.message));
    
    secureFetch(`http://localhost:3000/api/v1/avaliacoes/media/${id}`)
      .then(data => setAvaliacoes(data))
      .catch(err => console.error("Erro ao buscar avaliações:", err.message));

    if (user) {
      secureFetch('http://localhost:3000/api/v1/lista-desejo')
        .then(data => {
          if (Array.isArray(data)) {
            const gameIdNum = parseInt(id);
            setIsFavorited(data.some(item => item.id === gameIdNum)); 
          }
        })
        .catch(err => console.error("Erro ao buscar wishlist:", err.message));

      secureFetch('http://localhost:3000/api/v1/usuarios/my/games')
        .then(data => {
          if (Array.isArray(data)) {
            const gameIdNum = parseInt(id);
            const userHasIt = data.some(item => item.jogo.id === gameIdNum);
            setHasGame(userHasIt);
          }
        })
        .catch(err => console.error("Erro ao buscar biblioteca:", err.message));
    }
  }, [id, user, logout, navigate]);

  useEffect(() => {
    fetchData(); 
  }, [fetchData]); 

  const handleAddToCart = async () => {
    if (!user) return navigate('/login');
    if (hasGame) { showToast("Você já possui este jogo!", 'error'); return; }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/v1/carrinho/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ jogoId: jogo.id })
      });
      const data = await response.json();
      if (response.ok) { showToast(data.message, 'success'); }
      else { showToast(data.message, 'error'); }
    } catch (error) { showToast("Erro de conexão.", 'error'); }
  };

  const handleBuyNow = async () => {
    if (!user) return navigate('/login');
    if (hasGame) return;

    if (!window.confirm("Comprar agora irá substituir os itens atuais do seu carrinho. Deseja continuar?")) {
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const cartRes = await fetch('http://localhost:3000/api/v1/carrinho/ativo', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (cartRes.status !== 204) {
            const cartData = await cartRes.json();
            if (cartData && cartData.carrinho && cartData.carrinho.itens) {
                const deletePromises = cartData.carrinho.itens.map(item => 
                    fetch(`http://localhost:3000/api/v1/carrinho/${item.fkJogo}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                );
                await Promise.all(deletePromises);
            }
        }

        const addRes = await fetch('http://localhost:3000/api/v1/carrinho/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ jogoId: jogo.id })
        });
        
        if (addRes.ok) {
            navigate('/revisar-pedido');
        } else {
            const data = await addRes.json();
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error(error);
        showToast("Erro ao processar compra rápida.", 'error');
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) return navigate('/login');
    const token = localStorage.getItem('token');
    
    if (isFavorited) {
      try {
        const response = await fetch('http://localhost:3000/api/v1/lista-desejo', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ jogoId: jogo.id }) 
        });
        if (response.ok) {
          showToast("Removido da lista de desejos!", 'success');
          setIsFavorited(false); 
        }
      } catch (error) { console.error(error); }
    } else {
      try {
        const response = await fetch('http://localhost:3000/api/v1/lista-desejo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ jogoId: jogo.id })
        });
        if (response.ok) {
          showToast("Adicionado à lista de desejos!", 'success');
          setIsFavorited(true); 
        }
      } catch (error) { console.error(error); }
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!user) return navigate('/login');
    if (nota === 0) { showToast("Selecione uma nota!", 'error'); return; }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/v1/avaliacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ jogoId: jogo.id, nota, comentario })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message, 'success');
        setComentario(""); setNota(0); fetchData(); 
      } else { showToast(data.message, 'error'); }
    } catch (error) { console.error(error); }
  };
  
  if (!jogo) {
    return <div className="main-container"><p>Carregando jogo...</p></div>;
  }

  return (
    <div className="main-container">
      {/* Hero sem estilos inline de cor */}
      <div className="game-hero" id="game-hero">
        <h1 id="game-title">{jogo.nome}</h1>
      </div>

      <div className="game-content-layout">
        <div className="game-main-content">
          <h2>Descrição do Jogo</h2>
          <p id="game-description">{jogo.descricao || "Este jogo não tem descrição."}</p>

          <h2>Avaliar Jogo</h2>
          <form onSubmit={handleSubmitReview}>
            <div className="star-input-container">
                {[1, 2, 3, 4, 5].map((star) => (
                    <i 
                        key={star}
                        className={`fas fa-star star-input ${star <= (hoverNota || nota) ? 'filled' : ''}`}
                        onClick={() => setNota(star)}
                        onMouseEnter={() => setHoverNota(star)}
                        onMouseLeave={() => setHoverNota(0)}
                    ></i>
                ))}
                {/* Classe para o texto da nota */}
                <span className="star-label">
                    {nota > 0 ? `${nota} Estrelas` : 'Toque para avaliar'}
                </span>
            </div>

            <textarea 
              className="review-textarea" 
              placeholder="Escreva o que achou sobre o jogo aqui!"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            ></textarea>
            <button type="submit" className="buy-button" style={{marginTop: '10px'}}>Enviar Avaliação</button>
          </form>

          <h2>Feedback de Usuário ao Jogo</h2>
          <div id="user-reviews-container">
            {avaliacoes && avaliacoes.avaliacoes && avaliacoes.avaliacoes.length > 0 ? (
              avaliacoes.avaliacoes.map(review => (
                <div className="user-review-card" key={review.id}>
                  <div className="review-header">
                    <strong className="review-author">
                        {review.nomeUsuario ? review.nomeUsuario : `Usuário ID: ${review.fkUsuario}`}
                    </strong>
                    <div className="stars">
                      {'★'.repeat(review.nota)}
                      <span className="unfilled">{'☆'.repeat(5 - review.nota)}</span>
                    </div>
                  </div>
                  <p>"{review.comentario}"</p>
                </div>
              ))
            ) : (
              <p>Este jogo ainda não tem avaliações.</p>
            )}
          </div>
        </div>
        
        <aside className="game-sidebar">
          <div className="purchase-box">
            <span className="price-tag" id="game-price">${jogo.preco.toFixed(2)}</span>
            
            {hasGame ? (
                <button className="btn-disabled"><i className="fas fa-check"></i> Adquirido</button>
            ) : (
                <div className="actions-container">
                    <button className="btn-buy-now" onClick={handleBuyNow}>
                        Comprar Agora
                    </button>
                    <button className="btn-add-cart" onClick={handleAddToCart}>
                        + Carrinho
                    </button>
                </div>
            )}
            
            {!hasGame && (
                 <div style={{marginTop: '15px', textAlign: 'center'}}>
                    <i 
                        className={`icon favorite-icon ${isFavorited ? 'active' : ''}`}
                        onClick={handleToggleWishlist} 
                        style={{cursor: 'pointer'}}
                        title="Lista de Desejos"
                    >
                    ❤
                    </i>
                 </div>
            )}
          </div>
          <div className="details-box" id="game-details">
            <p><strong>Lançamento:</strong> {jogo.ano}</p>
          </div>
          <div className="rating-box">
            <strong>{avaliacoes ? avaliacoes.media.toFixed(1) : '-'}</strong>
            <span>Média de {avaliacoes ? avaliacoes.totalAvaliacoes : 0} avaliações</span>
          </div>
        </aside>
      </div>

      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          <div className="toast-icon">
            {notification.type === 'error' ? <i className="fas fa-exclamation-circle"></i> : <i className="fas fa-check-circle"></i>}
          </div>
          <div className="toast-content">
            <h4>{notification.type === 'error' ? 'Ops!' : 'Sucesso!'}</h4>
            <p>{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default JogoDetalhesPage;