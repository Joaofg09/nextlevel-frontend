// No ficheiro: src/pages/HistoricoCompras.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HistoricoCompras() {
  // 1. Estado para guardar o histórico
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 2. useEffect para buscar os dados
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');
    
    // 3. Pega o token e chama a API de vendas
    fetch('http://localhost:3000/api/v1/vendas', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      // 4. Lida com token expirado
      if (res.status === 401) { logout(); navigate('/login'); throw new Error('Sessão expirada'); }
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        setVendas(data);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error("Erro ao buscar histórico:", err.message);
      setLoading(false);
    });
  }, [user, navigate, logout]); // Dependências

  // Função para formatar a data (vem como string ISO)
  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR'); // Formato BR (ex: 16/11/2025 15:30:00)
  };

  if (loading) {
    return (
      <div className="main-content-area">
        <h1 className="page-title">Meu Histórico de Compras</h1>
        <p>A carregar...</p>
      </div>
    );
  }

  // 5. Renderiza o layout
  return (
    <div className="main-content-area">
      <div className="admin-container">
        <h1 className="admin-section-title">Meu Histórico de Compras</h1>
        
        <div className="listagem-box">
          <div className="tabela-jogos-container">
            {/* Usamos a mesma classe de tabela do admin */}
            <table className="tabela-jogos">
              <thead>
                <tr>
                  <th>ID da Venda</th>
                  <th>Data da Compra</th>
                  <th>Nº de Jogos</th>
                  <th>Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {vendas.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>Você ainda não fez nenhuma compra.</td>
                  </tr>
                ) : (
                  // 6. Mapeia os dados da venda
                  vendas.map(venda => (
                    <tr key={venda.id}>
                      <td>{venda.id}</td>
                      <td>{formatarData(venda.data)}</td>
                      <td>{venda.quantidade}</td>
                      <td className="preco-tabela">$ {venda.valor_total.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoricoCompras;