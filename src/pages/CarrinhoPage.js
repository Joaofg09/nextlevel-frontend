// No arquivo: src/pages/CarrinhoPage.js
// VERSÃO 3 - Busca jogos para exibir nome e preço

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function CarrinhoPage() {
  const [carrinho, setCarrinho] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // 1. NOVO ESTADO: Guarda um "mapa" de todos os jogos (ID => Jogo)
  const [jogosMap, setJogosMap] = useState(new Map());

  // 2. Função para buscar TUDO (Carrinho e Lista de Jogos)
  const fetchData = () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    const secureFetch = (url) => {
      return fetch(url, { headers: { 'Authorization': `Bearer ${token}` }})
        .then(res => {
          if (res.status === 401) { logout(); navigate('/login'); throw new Error('Sessão expirada'); }
          if (res.status === 204) return null; // 204 = Sem conteúdo (Carrinho vazio)
          return res.json();
        });
    };

    // 3. Faz as duas chamadas à API ao mesmo tempo
    Promise.all([
      secureFetch('http://localhost:3000/api/v1/carrinho/ativo'),
      secureFetch('http://localhost:3000/api/v1/jogos') // Rota de jogos
    ])
    .then(([dataCarrinho, dataJogos]) => {
      // Processa o carrinho
      if (dataCarrinho && dataCarrinho.carrinho) {
        setCarrinho(dataCarrinho.carrinho);
      } else {
        setCarrinho(null);
      }

      // 4. Processa a lista de jogos e cria o "mapa"
      if (Array.isArray(dataJogos)) {
        const mapa = new Map();
        dataJogos.forEach(jogo => {
          mapa.set(jogo.id, jogo); // Ex: 1 => { id: 1, nome: "Witcher 3", ... }
        });
        setJogosMap(mapa);
      }
      
      setLoading(false);
    })
    .catch(err => {
      console.error("Erro ao buscar dados:", err.message);
      setLoading(false);
    });
  };

  // Busca os dados quando a página carrega
  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Função para remover (sem mudança)
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
      fetchData(); // Atualiza a lista
    })
    .catch(err => console.error("Erro ao remover item:", err));
  };

  // --- Renderização ---
  
  if (loading) {
    return (
      <div className="main-container">
        <h1>Meu Carrinho</h1>
        <p>Carregando carrinho...</p>
      </div>
    );
  }

  // Se o carrinho estiver vazio ou não existir
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

  // 5. Calcula o subtotal USANDO o mapa
  const subtotal = carrinho.itens.reduce((total, item) => {
    const jogoInfo = jogosMap.get(item.fkJogo);
    return total + (jogoInfo ? jogoInfo.preco : 0);
  }, 0);

  return (
    <div className="main-container">
      <h1>Meu Carrinho</h1>
      <div className="cart-layout">
        <div className="cart-items" id="cart-items-container">
          
          {/* 6. Renderiza os itens USANDO o mapa */}
          {carrinho.itens.map(item => {
            // Pega o nome e preço do mapa
            const jogoInfo = jogosMap.get(item.fkJogo);
            
            return (
              <div className="cart-item" key={item.id} data-id={item.fkJogo}>
                <img src="https://via.placeholder.com/120x60/888/FFFFFF?text=Game" alt="Capa do Jogo" />
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