// No arquivo: src/pages/JogoDetalhesPage.js
// VERSÃO 3 - Corrige o erro 'fetchData is not defined'

import React, { useState, useEffect, useCallback } from 'react'; // 1. Importe o 'useCallback'
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

function JogoDetalhesPage() {
  const { id } = useParams(); 
  const [jogo, setJogo] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // =================================================================
  // 2. FUNÇÃO 'fetchData' DEFINIDA FORA DO useEffect
  // =================================================================
  // Usamos useCallback para que esta função não seja recriada a cada
  // renderização, evitando loops infinitos no useEffect.
  const fetchData = useCallback(() => {
    const token = localStorage.getItem('token');
    
    const secureFetch = (url) => {
      return fetch(url, { headers: { 'Authorization': `Bearer ${token}` }})
        .then(res => {
          if (res.status === 401) { logout(); navigate('/login'); throw new Error('Sessão expirada'); }
          // Retorna null se for 204 (Sem conteúdo), senão, retorna o JSON
          if (res.status === 204) return null; 
          return res.json();
        });
    };

    // 1. Buscar o Jogo específico
    secureFetch(`http://localhost:3000/api/v1/jogos/${id}`)
      .then(data => setJogo(data))
      .catch(err => console.error("Erro ao buscar jogo:", err.message));
    
    // 2. Buscar as Avaliações e a Média
    secureFetch(`http://localhost:3000/api/v1/avaliacoes/media/${id}`)
      .then(data => setAvaliacoes(data))
      .catch(err => console.error("Erro ao buscar avaliações:", err.message));

    // 3. Verificar se o jogo já está na lista de desejos
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
  // 3. Adicione 'id', 'user', 'logout', 'navigate' como dependências
  }, [id, user, logout, navigate]);

  // =================================================================
  // 4. useEffect AGORA SÓ CHAMA O fetchData
  // =================================================================
  useEffect(() => {
    fetchData(); // Chama a função ao carregar a página
  }, [fetchData]); // Roda sempre que o fetchData (ou suas dependências) mudar

  // =================================================================
  // FUNÇÕES DE AÇÃO (Carrinho, Desejos, Avaliar)
  // =================================================================

  const handleAddToCart = async () => {
    // (Sem mudanças)
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
    // (Sem mudanças)
    if (!user) return navigate('/login');
    const token = localStorage.getItem('token');
    
    if (isFavorited) {
      // Remover (DELETE)
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
      // Adicionar (POST)
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
        
        // 5. O ERRO ESTAVA AQUI. Agora 'fetchData' está acessível!
        fetchData(); // Atualiza as avaliações
      }
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
    }
  };

  // --- Renderização ---
  
  if (!jogo) {
    return (
      <div className="main-container">
        <p>Carregando jogo...</p>
      </div>
    );
  }

  // O JSX abaixo não mudou
  return (
    <div className="main-container">
      <div className="game-hero" id="game-hero" style={{backgroundImage: 'url(https://via.placeholder.com/800x300/B22222/FFFFFF?text=Imagem+do+Jogo)'}}>
        <h1 id="game-title">{jogo.nome}</h1>
      </div>
      <div className="game-content-layout">
        <div className="game-main-content">
          <h2>Descrição do Jogo</h2>
          <p id="game-description">{jogo.descricao || "Este jogo não tem descrição."}</p>

          <h2>Requisitos de Sistema</h2>
          <div className="requirements-grid">
            <div>
              <h3>Mínimo</h3>
              <ul id="min-reqs"><li>Não especificado.</li></ul>
            </div>
            <div>
              <h3>Recomendado</h3>
              <ul id="rec-reqs"><li>Não especificado.</li></ul>
            </div>
          </div>

          <h2>Avaliar Jogo</h2>
          <form onSubmit={handleSubmitReview}>
            <select value={nota} onChange={(e) => setNota(e.target.value)} style={{margin: '10px 0', padding: '5px'}}>
              <option value={5}>5 Estrelas</option>
              <option value={4}>4 Estrelas</option>
              <option value={3}>3 Estrelas</option>
              <option value={2}>2 Estrelas</option>
              <option value={1}>1 Estrela</option>
            </select>
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
                    <strong>Usuário ID: {review.fkUsuario}</strong>
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