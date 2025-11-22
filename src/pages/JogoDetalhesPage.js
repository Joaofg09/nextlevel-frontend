// No arquivo: src/pages/JogoDetalhesPage.js
// VERSÃO FINAL - SEM IMAGEM (Apenas Gradiente)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

function JogoDetalhesPage() {
  const { id } = useParams(); 
  const [jogo, setJogo] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  
  const [nota, setNota] = useState(0);
  const [hoverNota, setHoverNota] = useState(0);
  const [comentario, setComentario] = useState("");

  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
            const found = data.some(item => item.id === gameIdNum);
            setIsFavorited(found); 
          }
        })
        .catch(err => console.error("Erro ao buscar wishlist:", err.message));
    }
  }, [id, user, logout, navigate]);

  useEffect(() => {
    fetchData(); 
  }, [fetchData]); 

  const handleAddToCart = async () => {
    if (!user) return navigate('/login');
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/v1/carrinho/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ jogoId: jogo.id })
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
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
        const data = await response.json();
        if (response.ok) {
          alert(data.message);
          setIsFavorited(false); 
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error("Erro ao remover da lista:", error);
      }
    } else {
      try {
        const response = await fetch('http://localhost:3000/api/v1/lista-desejo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ jogoId: jogo.id })
        });
        const data = await response.json();
        if (response.ok) {
          alert("Jogo adicionado à lista de desejos!");
          setIsFavorited(true); 
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error("Erro ao adicionar à lista:", error);
      }
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!user) return navigate('/login');
    if (nota === 0) {
        alert("Por favor, selecione uma nota clicando nas estrelas.");
        return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/v1/avaliacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ jogoId: jogo.id, nota, comentario })
      });
      const data = await response.json();
      alert(data.message);
      if (response.ok) {
        setComentario(""); 
        setNota(0);
        fetchData(); 
      }
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
    }
  };
  
  if (!jogo) {
    return (
      <div className="main-container">
        <p>Carregando jogo...</p>
      </div>
    );
  }

  return (
    <div className="main-container">
      {/* === HERO BANNER SEM IMAGEM === */}
      <div 
        className="game-hero" 
        id="game-hero" 
        style={{
          background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)', // Gradiente escuro elegante
          borderBottom: '4px solid #e53935' // Linha vermelha de destaque
        }}
      >
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
                <span style={{marginLeft: '10px', marginTop: '5px', color: '#ccc'}}>
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
                    <strong style={{color: '#39FF14'}}>
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
            <button className="buy-button" id="add-to-cart-btn" onClick={handleAddToCart}>
              Comprar
            </button>
            <i 
              className={`icon favorite-icon ${isFavorited ? 'active' : ''}`}
              onClick={handleToggleWishlist} 
              style={{cursor: 'pointer'}}
            >
              ❤
            </i>
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
    </div>
  );
}

export default JogoDetalhesPage;