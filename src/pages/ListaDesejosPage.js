// No arquivo: src/pages/ListaDesejosPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ListaDesejosPage() {
  const [listaDesejos, setListaDesejos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 1. Função para buscar a lista de desejos
  const fetchListaDesejos = () => {
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
      console.error("Erro ao buscar lista de desejos:", err.message);
      setLoading(false);
    });
  };

  // 2. Busca a lista quando a página carrega
  useEffect(() => {
    if (!user) { // Se não há usuário, não busca
      navigate('/login');
    } else {
      fetchListaDesejos();
    }
  }, [user, navigate, logout]); // Dependências

  // 3. Função para REMOVER da lista
  const handleRemove = async (jogoId) => {
    if (!window.confirm("Remover este jogo da sua lista de desejos?")) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/v1/lista-desejo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ jogoId })
      });
      const data = await response.json();
      alert(data.message);
      if (response.ok) {
        fetchListaDesejos(); // Atualiza a lista
      }
    } catch (error) {
      console.error("Erro ao remover:", error);
    }
  };

  // 4. Função para ADICIONAR AO CARRINHO
  const handleAddToCart = async (jogoId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/v1/carrinho/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ jogoId })
      });
      const data = await response.json();
      alert(data.message);
      // Opcional: remover da lista de desejos após adicionar ao carrinho
      // handleRemove(jogoId); 
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
    }
  };


  // --- Renderização ---
  
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

  // Baseado no seu listaDesejos.html
  return (
    <div className="main-container">
      <div className="wishlist-container">
        <h1>Sua Lista De Desejos</h1>
        
        {/* A barra de controles do protótipo (filtros) ainda não é funcional */}
        <div className="controls-bar">
          <label className="select-all-label">
            <input type="checkbox" id="selectAllCheckbox" />
            Selecionar Tudo
          </label>
          <div className="search-box">
            <input type="text" id="searchInput" placeholder="Procurar na lista" />
          </div>
          <div className="utility-buttons">
            <button className="remove-all-button" id="removeAllButton">
              Remover Selecionados
            </button>
          </div>
        </div>
        
        <div className="items-list" id="itemsList">
          {listaDesejos.length === 0 ? (
            <p style={{textAlign: 'center', marginTop: '20px'}}>Sua lista de desejos está vazia.</p>
          ) : (
            listaDesejos.map(jogo => (
              <div className="wishlist-item" data-title={jogo.nome} key={jogo.id}>
                {/* O checkbox ainda não é funcional */}
                <input type="checkbox" className="item-checkbox" />
                
                {/* O protótipo tinha um card vermelho, mas usaremos uma <img> placeholder */}
                <img src="https://via.placeholder.com/180x60/888/FFFFFF?text=Game" alt={jogo.nome} style={{width: '180px', borderRadius: '3px'}}/>
                
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
                    onClick={() => handleRemove(jogo.id)}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ListaDesejosPage;