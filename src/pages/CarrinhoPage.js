// No arquivo: src/pages/CarrinhoPage.js
// VERSÃO FINAL - Imagens + Modal Moderno + Toasts

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 1. A Imagem Genérica é mantida
const GENERIC_IMAGE = "/jogo-padrao.jpg";

function CarrinhoPage() {
  const [carrinho, setCarrinho] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jogosMap, setJogosMap] = useState(new Map());

  // 2. Novos Estados para o Modal e Notificação
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  const { logout } = useAuth();
  const navigate = useNavigate();

  // Função auxiliar de Notificação (Toast)
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const fetchData = useCallback(() => {
    setLoading(true);
    const token = localStorage.getItem('token');

    const secureFetch = (url) => {
      return fetch(url, { headers: { 'Authorization': `Bearer ${token}` }})
        .then(res => {
          if (res.status === 401) { logout(); navigate('/login'); throw new Error('Sessão expirada'); }
          if (res.status === 204) return null; 
          return res.json();
        });
    };

    Promise.all([
      secureFetch('http://localhost:3000/api/v1/carrinho/ativo'),
      secureFetch('http://localhost:3000/api/v1/jogos') 
    ])
    .then(([dataCarrinho, dataJogos]) => {
      if (dataCarrinho && dataCarrinho.carrinho) {
        setCarrinho(dataCarrinho.carrinho);
      } else {
        setCarrinho(null);
      }

      if (Array.isArray(dataJogos)) {
        const mapa = new Map();
        dataJogos.forEach(jogo => {
          mapa.set(jogo.id, jogo); 
        });
        setJogosMap(mapa);
      }
      
      setLoading(false);
    })
    .catch(err => {
      console.error("Erro ao buscar dados:", err.message);
      setLoading(false);
    });
  }, [logout, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); 

  // 3. Função chamada ao clicar em "Remover" (Abre o Modal)
  const handleRemoveClick = (gameId) => {
    setItemToDelete(gameId);
    setShowModal(true);
  };

  // 4. Função chamada ao confirmar no Modal (Faz a exclusão)
  const confirmRemove = async () => {
    setShowModal(false); // Fecha o modal
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:3000/api/v1/carrinho/${itemToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();

      if (response.ok) {
        showToast("Item removido do carrinho!", 'success');
        fetchData(); // Atualiza a lista
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      console.error("Erro ao remover item:", error);
      showToast("Erro de conexão.", 'error');
    } finally {
      setItemToDelete(null);
    }
  };
  
  if (loading) {
    return (
      <div className="main-container">
        <h1>Meu Carrinho</h1>
        <p>Carregando carrinho...</p>
      </div>
    );
  }

  if (!carrinho || !carrinho.itens || carrinho.itens.length === 0) {
    return (
      <div className="main-container">
        <h1>Meu Carrinho</h1>
        <p>Seu carrinho está vazio.</p>
        <div className="cart-layout">
            <div className="cart-items" id="cart-items-container"></div>
            <div className="cart-summary">
              <h2>Subtotal: <span id="subtotal">$0.00</span></h2>
              <a href="/" className="checkout-button" style={{backgroundColor: '#555', cursor: 'not-allowed'}}>Carrinho Vazio</a>
            </div>
        </div>
      </div>
    );
  }

  const subtotal = carrinho.itens.reduce((total, item) => {
    const jogoInfo = jogosMap.get(item.fkJogo);
    return total + (jogoInfo ? jogoInfo.preco : 0);
  }, 0);

  return (
    <div className="main-container">
      <h1>Meu Carrinho</h1>
      <div className="cart-layout">
        <div className="cart-items" id="cart-items-container">
          
          {carrinho.itens.map(item => {
            const jogoInfo = jogosMap.get(item.fkJogo);
            
            return (
              <div className="cart-item" key={item.id} data-id={item.fkJogo}>
                {/* 5. A IMAGEM ESTÁ AQUI */}
                <img src={GENERIC_IMAGE} alt="Capa do Jogo" />
                
                <div className="item-details">
                  {jogoInfo ? (
                    <>
                      <h3>{jogoInfo.nome}</h3>
                      <span className="item-price">$ {jogoInfo.preco.toFixed(2)}</span>
                    </>
                  ) : (
                    <h3>Jogo ID: {item.fkJogo} (Carregando...)</h3>
                  )}
                </div>
                <div className="item-actions">
                  <button 
                    className="remove-btn"
                    // Chama a função que abre o modal
                    onClick={() => handleRemoveClick(item.fkJogo)}
                  >
                    Remover
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        <div className="cart-summary">
          <h2>Subtotal: <span id="subtotal">$ {subtotal.toFixed(2)}</span></h2>
          <Link to="/revisar-pedido" className="checkout-button">Continuar Para Pagamento</Link>
          <div className="coupon-section">
              <label htmlFor="coupon">Coloque Seu Cupom Aqui!</label>
              <div className="coupon-input">
                  <input type="text" id="coupon" placeholder="Cupom" />
                  <button>Aplicar</button>
              </div>
          </div>
        </div>
      </div>

      {/* 6. MODAL DE CONFIRMAÇÃO */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Remover Item?</h3>
            <p>
              Tem certeza que deseja remover este jogo do seu carrinho?
              <br />
              <span style={{color: '#e53935', fontSize: '0.9em'}}>Esta ação não pode ser desfeita.</span>
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-confirm" onClick={confirmRemove}>Sim, Remover</button>
            </div>
          </div>
        </div>
      )}

      {/* 7. NOTIFICAÇÃO TOAST */}
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

export default CarrinhoPage;