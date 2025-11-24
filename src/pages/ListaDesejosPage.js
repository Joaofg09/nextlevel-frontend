import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

//  IMAGEM GENÉRICA
const GENERIC_IMAGE = "/jogo-padrao.jpg";

function ListaDesejosPage() {
  const [listaDesejos, setListaDesejos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => { setNotification(null); }, 3000);
  };

  const fetchListaDesejos = useCallback(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:3000/api/v1/lista-desejo', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) { logout(); navigate('/login'); throw new Error('Sessão expirada'); }
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        setListaDesejos(data);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error("Erro ao buscar lista:", err.message);
      setLoading(false);
    });
  }, [logout, navigate]);

  useEffect(() => {
    if (!user) { navigate('/login'); } else { fetchListaDesejos(); }
  }, [user, navigate, fetchListaDesejos]);

  const handleRemoveClick = (jogoId) => {
    setItemToDelete(jogoId);
    setShowModal(true);
  };

  const confirmRemove = async () => {
    setShowModal(false);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/v1/lista-desejo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ jogoId: itemToDelete })
      });
      const data = await response.json();
      
      if (response.ok) {
        showToast(data.message, 'success');
        fetchListaDesejos(); 
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      console.error("Erro ao remover:", error);
      showToast("Erro de conexão.", 'error');
    }
  };

  const handleAddToCart = async (jogoId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/v1/carrinho/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ jogoId })
      });
      const data = await response.json();
      
      if (response.ok) {
        showToast(data.message, 'success');
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      console.error("Erro ao adicionar:", error);
      showToast("Erro de conexão.", 'error');
    }
  };

  if (loading) {
    return (
      <div className="main-container">
        <div className="wishlist-container">
          <h1>Sua Lista De Desejos</h1>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="wishlist-container">
        <h1>Sua Lista De Desejos</h1>
        
        <div className="controls-bar">
            <p style={{color: '#ccc', margin: 0}}>Gerencie os seus jogos favoritos</p>
        </div>
        
        <div className="items-list" id="itemsList">
          {listaDesejos.length === 0 ? (
            <p style={{textAlign: 'center', marginTop: '20px', color: '#aaa'}}>Sua lista de desejos está vazia.</p>
          ) : (
            listaDesejos.map(jogo => (
              <div className="wishlist-item" key={jogo.id}>
               
                <img src={GENERIC_IMAGE} alt={jogo.nome} style={{width: '180px', height: '100px', objectFit: 'cover', borderRadius: '3px'}}/>
                
                <div className="item-card-right">
                  <p className="item-title-main">{jogo.nome}</p>
                  <p className="item-price">$ {jogo.preco.toFixed(2)}</p>
                </div>
                <div className="item-actions">
                  <button 
                    className="action-button add-to-cart-button"
                    onClick={() => handleAddToCart(jogo.id)}
                  >
                    +Carrinho
                  </button>
                  <button 
                    className="action-button remove-item-button"
                    onClick={() => handleRemoveClick(jogo.id)}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL Prevenção de erros */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Remover Favorito?</h3>
            <p>Tem certeza que deseja remover este jogo da sua lista de desejos?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-confirm" onClick={confirmRemove}>Sim, Remover</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
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

export default ListaDesejosPage;