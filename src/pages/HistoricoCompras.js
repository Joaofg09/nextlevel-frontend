import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HistoricoCompras() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');
    
    fetch('http://localhost:3000/api/v1/vendas', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) { logout(); navigate('/login'); throw new Error('Sessão expirada'); }
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data)) setVendas(data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Erro ao buscar histórico:", err.message);
      setLoading(false);
    });
  }, [user, navigate, logout]);

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="main-content-area">
        <h1 className="page-title">Histórico de Compras</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="main-content-area">
      <h1 className="admin-section-title">Histórico de Compras</h1>
      
      <div className="history-container">
        {vendas.length === 0 ? (
            <p style={{textAlign: 'center', color: '#aaa'}}>Você ainda não realizou nenhuma compra.</p>
        ) : (
            <div className="tabela-jogos-container" style={{boxShadow: 'none'}}>
                <table className="tabela-jogos">
                <thead>
                    <tr>
                    <th>ID da Venda</th>
                    <th>Data</th>
                    <th>Qtd. Jogos</th>
                    <th>Status</th>
                    <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                  {/*Criação da tabela*/}
                    {vendas.map(venda => (
                    <tr key={venda.id}>
                        <td style={{color: '#888'}}>#{venda.id}</td>
                        <td>{formatarData(venda.data)}</td>
                        <td>{venda.quantidade}</td>
                        <td><span className="status-badge">Concluído</span></td>
                        <td className="preco-tabela">$ {venda.valor_total.toFixed(2)}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}

export default HistoricoCompras;