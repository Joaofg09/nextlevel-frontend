// No ficheiro: src/pages/RevisarPedidoPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RevisarPedidoPage() {
  const [carrinho, setCarrinho] = useState(null);
  const [jogosMap, setJogosMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // 1. Busca os dados do carrinho e o mapa de jogos (tal como o CarrinhoPage)
  useEffect(() => {
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

  // 2. Função para FINALIZAR O PEDIDO
  const handleCheckout = async () => {
    if (!window.confirm("Confirmar a compra deste(s) jogo(s)?")) return;
    
    const token = localStorage.getItem('token');
    try {
      // 3. Chame a API de checkout
      const response = await fetch('http://localhost:3000/api/v1/vendas/checkout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        alert(data.message); // Ex: "Compra realizada com sucesso!"
        // 4. Envia o utilizador para a biblioteca para ver as chaves
        navigate('/biblioteca');
      } else {
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
    }
  };

  // --- Renderização ---

  if (loading) {
    return (
      <div className="main-container">
        <h1>Finalizar Pedido</h1>
        <p>A carregar resumo...</p>
      </div>
    );
  }

  if (!carrinho || !carrinho.itens || carrinho.itens.length === 0) {
    return (
      <div className="main-container">
        <h1>Finalizar Pedido</h1>
        <p>O seu carrinho está vazio. Não há nada para finalizar.</p>
        <Link to="/">Voltar à loja</Link>
      </div>
    );
  }

  // Calcula o total
  const subtotal = carrinho.itens.reduce((total, item) => {
    const jogoInfo = jogosMap.get(item.fkJogo);
    return total + (jogoInfo ? jogoInfo.preco : 0);
  }, 0);

  // Baseado no seu revisar-pedido.html
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
                  <img src="https://via.placeholder.com/120x60/888/FFFFFF?text=Game" alt="Capa do Jogo" />
                  <div className="item-details">
                    <h3>{jogoInfo ? jogoInfo.nome : `Jogo ID: ${item.fkJogo}`}</h3>
                    <span className="item-price">$ {jogoInfo ? jogoInfo.preco.toFixed(2) : '0.00'}</span>
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
          
          {/* 5. Botão de Finalizar Pedido ligado à função */}
          <button 
            id="finalize-order-btn" 
            className="checkout-button"
            onClick={handleCheckout}
          >
            Finalizar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}

export default RevisarPedidoPage;