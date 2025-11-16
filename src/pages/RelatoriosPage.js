// No ficheiro: src/pages/RelatoriosPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RelatoriosPage() {
  const [jogosMaisVendidos, setJogosMaisVendidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 1. Busca os dados do relatório
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');
    
    // 2. Chama a API de relatórios
    fetch('http://localhost:3000/api/v1/relatorios/jogos-mais-vendidos', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) { logout(); navigate('/login'); throw new Error('Sessão expirada'); }
      // O controller retorna 204 se não houver dados
      if (res.status === 204) {
        return []; 
      }
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        setJogosMaisVendidos(data);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error("Erro ao buscar relatório:", err.message);
      setLoading(false);
    });
  }, [user, navigate, logout]);

  if (loading) {
    return (
      <div className="main-content-area">
        <h1 className="page-title">Relatório de Vendas</h1>
        <p>A carregar...</p>
      </div>
    );
  }

  // 3. Renderiza a tabela
  return (
    <div className="main-content-area">
      <div className="admin-container">
        <h1 className="admin-section-title">Relatório de Jogos Mais Vendidos</h1>
        
        <div className="listagem-box">
          <div className="tabela-jogos-container">
            <table className="tabela-jogos">
              <thead>
                <tr>
                  <th>Nome do Jogo</th>
                  <th>Empresa</th>
                  <th>Total de Vendas</th>
                </tr>
              </thead>
              <tbody>
                {jogosMaisVendidos.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>Nenhuma venda registrada ainda.</td>
                  </tr>
                ) : (
                  // 4. Mapeia os dados do DTO
                  jogosMaisVendidos.map((jogo, index) => (
                    <tr key={index}> 
                      <td>{jogo.nome}</td>
                      <td>{jogo.empresa}</td>
                      <td style={{fontWeight: 'bold', color: '#39FF14'}}>{jogo.total}</td>
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

export default RelatoriosPage;