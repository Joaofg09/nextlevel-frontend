// No arquivo: src/pages/BibliotecaPage.js
// VERSÃO 3 - Tratamento visual para jogos sem chave (pendentes)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function BibliotecaPage() {
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');
    
    fetch('http://localhost:3000/api/v1/usuarios/my/games', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) { logout(); navigate('/login'); throw new Error('Sessão expirada'); }
      if (res.status === 204) return [];
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data)) setJogos(data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Erro ao buscar biblioteca:", err.message);
      setLoading(false);
    });
  }, [user, navigate, logout]);

  if (loading) {
    return (
      <div className="main-content-area">
        <h1 className="page-title">Minha Biblioteca</h1>
        <p>Carregando seus jogos...</p>
      </div>
    );
  }

  return (
    <div className="main-content-area">
      <h1 className="page-title">Minha Biblioteca</h1>
      
      {jogos.length === 0 ? (
        <div className="history-container" style={{textAlign: 'center', padding: '50px'}}>
            <p style={{color: '#ccc', fontSize: '1.2rem'}}>Sua biblioteca está vazia.</p>
            <button onClick={() => navigate('/')} className="btn-novo-jogo" style={{margin: '20px auto'}}>
                Ir para a Loja
            </button>
        </div>
      ) : (
        <div className="library-grid">
          {jogos.map(item => (
            <div className="library-card" key={item.jogo.id}>
              <div className="library-card-header">
                <i className="fas fa-gamepad"></i>
              </div>
              
              <div className="library-card-body">
                <h2>{item.jogo.nome}</h2>
                
                {/* === LÓGICA CONDICIONAL AQUI === */}
                {item.chaveAtivacao ? (
                    // CASO 1: TEM CHAVE (Compra Finalizada)
                    <div className="key-container">
                        <span className="key-label">Chave de Ativação</span>
                        <div className="activation-key-box" title="Clique ou passe o mouse para ver">
                            <span className="key-text">{item.chaveAtivacao}</span>
                        </div>
                    </div>
                ) : (
                    // CASO 2: SEM CHAVE (Ainda no Carrinho)
                    <div className="key-container" style={{textAlign: 'center', padding: '10px', background: 'rgba(229, 57, 53, 0.1)', borderRadius: '6px', border: '1px dashed #e53935'}}>
                        <p style={{color: '#e53935', fontWeight: 'bold', margin: '0 0 5px 0'}}>
                            <i className="fas fa-clock"></i> Pagamento Pendente
                        </p>
                        <p style={{fontSize: '0.8rem', color: '#ccc', marginBottom: '10px'}}>
                            Finalize sua compra para obter a chave de ativação.
                        </p>
                        <button 
                            onClick={() => navigate('/loja/carrinho')}
                            style={{
                                background: 'transparent',
                                border: '1px solid #e53935',
                                color: '#e53935',
                                padding: '5px 15px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}
                        >
                            Ir para Carrinho
                        </button>
                    </div>
                )}
                
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BibliotecaPage;