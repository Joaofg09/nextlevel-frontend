// No arquivo: src/pages/CarrinhoPage.js
// VERSÃO FINAL - Corrigida (useCallback)

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Imagem genérica local
const GENERIC_IMAGE = "/jogo-padrao.jpg";

function CarrinhoPage() {
  const [carrinho, setCarrinho] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [jogosMap, setJogosMap] = useState(new Map());

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

  const handleRemoveItem = (gameId) => {
    if (!window.confirm("Tem certeza que deseja remover este item do carrinho?")) return;
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:3000/api/v1/carrinho/${gameId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      fetchData(); 
    })
    .catch(err => console.error("Erro ao remover item:", err));
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
                    onClick={() => handleRemoveItem(item.fkJogo)}
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
    </div>
  );
}

export default CarrinhoPage;