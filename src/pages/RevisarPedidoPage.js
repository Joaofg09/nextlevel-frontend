import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GENERIC_IMAGE = "/jogo-padrao.jpg";

function RevisarPedidoPage() {
  const [carrinho, setCarrinho] = useState(null);
  const [jogosMap, setJogosMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  
  // Estados para Modal e Toast
  const [showModal, setShowModal] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => { setNotification(null); }, 3000);
  };

  //Recarregar após deletar
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
        dataJogos.forEach(jogo => mapa.set(jogo.id, jogo));
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

  // Lógica para remover itens
  const handleRemoveClick = (gameId) => {
    setItemToDelete(gameId);
    setShowModal('remove'); 
  };

  const confirmRemove = async () => {
    setShowModal(null);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/v1/carrinho/${itemToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        showToast("Item removido do pedido.", 'success');
        fetchData(); 
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      console.error("Erro ao remover:", error);
      showToast("Erro de conexão.", 'error');
    }
  };

  // lógica para finalizar pedido
  const handleCheckoutClick = () => {
    setShowModal('checkout'); 
  };

  const confirmCheckout = async () => {
    setShowModal(null);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/v1/vendas/checkout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        showToast("Compra realizada com sucesso!", 'success');
        setTimeout(() => { navigate('/loja/biblioteca'); }, 1500);
      } else {
        showToast(`Erro: ${data.message}`, 'error');
      }
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
      showToast("Erro de conexão.", 'error');
    }
  };

  // Renderização da pagina
  
  if (loading) {
    return <div className="main-container"><h1>Finalizar Pedido</h1><p>Carregando resumo...</p></div>;
  }

  if (!carrinho || !carrinho.itens || carrinho.itens.length === 0) {
    return (
      <div className="main-container">
        <h1>Finalizar Pedido</h1>
        <p>O seu carrinho está vazio.</p>
        <Link to="/" style={{color: '#39FF14'}}>Voltar à loja</Link>
      </div>
    );
  }

  const subtotal = carrinho.itens.reduce((total, item) => {
    const jogoInfo = jogosMap.get(item.fkJogo);
    return total + (jogoInfo ? jogoInfo.preco : 0);
  }, 0);

  return (
    <div className="main-container">
      <h1>Finalizar Pedido</h1>
      <div className="cart-layout">
        <div className="cart-items">
          <h2>Resumo do Pedido</h2>
          <div id="review-items-list">
            {carrinho.itens.map(item => {
              const jogoInfo = jogosMap.get(item.fkJogo);
              return (
                <div className="cart-item" key={item.id}>
                   <img src={GENERIC_IMAGE} alt="Capa do Jogo" />
                  <div className="item-details">
                    <h3>{jogoInfo ? jogoInfo.nome : `Jogo ID: ${item.fkJogo}`}</h3>
                    <span className="item-price">$ {jogoInfo ? jogoInfo.preco.toFixed(2) : '0.00'}</span>
                  </div>
                  
                  <div className="item-actions">
                    <button 
                      className="remove-btn" 
                      onClick={() => handleRemoveClick(item.fkJogo)}
                      title="Remover item"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        <div className="cart-summary">
          <div className="order-total-details">
            <div><span>Itens</span> <span id="review-subtotal">$ {subtotal.toFixed(2)}</span></div>
            <div><span>Desconto</span> <span>$0.00</span></div>
            <div className="total-line"><strong>Total do Pedido:</strong> <strong id="review-total">$ {subtotal.toFixed(2)}</strong></div>
          </div>
          
          <button 
            id="finalize-order-btn" 
            className="checkout-button"
            onClick={handleCheckoutClick}
          >
            Finalizar Pedido
          </button>
        </div>
      </div>

      {/* Confirmação ou Remover */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{showModal === 'checkout' ? 'Confirmar Compra' : 'Remover Item'}</h3>
            
            <p>
              {showModal === 'checkout' ? (
                <>
                  Valor Total: <strong style={{color: '#e53935'}}>${subtotal.toFixed(2)}</strong>
                  <br/>
                  Deseja finalizar o pedido agora?
                </>
              ) : (
                <>Tem certeza que deseja remover este jogo do pedido?</>
              )}
            </p>
            
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(null)}>Cancelar</button>
              <button 
                className="btn-confirm" 
                onClick={showModal === 'checkout' ? confirmCheckout : confirmRemove}
                style={showModal === 'remove' ? {backgroundColor: '#e53935', color: 'white'} : {}}
              >
                {showModal === 'checkout' ? 'Sim, Comprar' : 'Sim, Remover'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP estilizado */}
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

export default RevisarPedidoPage;