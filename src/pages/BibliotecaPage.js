// No arquivo: src/pages/BibliotecaPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function BibliotecaPage() {
  // 1. Estado para guardar os jogos da biblioteca
  const [jogos, setJogos] = useState([]);
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
    
    // 3. Pega o token e chama a API
    fetch('http://localhost:3000/api/v1/usuarios/my/games', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      // 4. Lida com token expirado
      if (res.status === 401) { logout(); navigate('/login'); throw new Error('Sessão expirada'); }
      // O controller retorna 204 (No Content) se não tiver jogos
      if (res.status === 204) {
        return []; // Retorna um array vazio
      }
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        setJogos(data);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error("Erro ao buscar biblioteca:", err.message);
      setLoading(false);
    });
  }, [user, navigate, logout]); // Dependências

  if (loading) {
    return (
      <div className="main-content-area">
        <h1 className="page-title">Minha Biblioteca</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  // 5. Renderiza o layout baseado no minhaBiblioteca.html
  return (
    <div className="main-content-area">
      <h1 className="page-title">Minha Biblioteca</h1>
      
      <div className="biblioteca-layout">
        <div className="jogos-grid-container">
          <div className="jogos-grid" id="biblioteca-grid">
            
            {jogos.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#aaa', gridColumn: '1 / -1' }}>
                Você ainda não possui jogos.
              </p>
            ) : (
              // 6. Mapeia os jogos e exibe a chave
              jogos.map(item => (
                <div className="jogo-card" key={item.jogo.id} style={{height: 'auto', padding: '15px'}}>
                  <h2>{item.jogo.nome}</h2>
                  <p style={{fontSize: '0.9em', color: '#ccc', margin: '10px 0'}}>Chave de Ativação:</p>
                  <strong style={{color: '#39FF14', fontSize: '1.1em', wordBreak: 'break-all'}}>
                    {item.chaveAtivacao}
                  </strong>
                </div>
              ))
            )}

          </div>
        </div>

        {/* Barra de filtro (ainda não funcional) */}
        <aside className="filtro-sidebar">
          <div className="filtro-card">
            <h2>Filtro</h2>
            <div className="search-input-group">
              <i className="fas fa-search"></i>
              <input type="text" id="input-busca-biblioteca" placeholder="Pesquisar Título" />
            </div>
            {/* ... (outros filtros do protótipo) ... */}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default BibliotecaPage;