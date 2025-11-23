// No ficheiro: src/pages/MeusDados.js
// VERSÃO 4 - Visual Moderno (Toasts) e sem Alerts

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function MeusDados() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // --- Estados para Dados Pessoais ---
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [fkPerfil, setFkPerfil] = useState(null);

  // --- Estados para Senha ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // --- Estados para Avaliações ---
  const [minhasAvaliacoes, setMinhasAvaliacoes] = useState([]);
  const [jogosMap, setJogosMap] = useState(new Map());
  const [editingReview, setEditingReview] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. NOVO ESTADO: Notificação (Toast)
  const [notification, setNotification] = useState(null);

  // Função para mostrar o Toast
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // --- Função de Busca de Dados ---
  const fetchData = useCallback(() => {
    if (!user) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    
    const secureFetch = (url) => {
      return fetch(url, { headers: { 'Authorization': `Bearer ${token}` }})
        .then(res => {
          if (res.status === 401) { logout(); navigate('/login'); throw new Error('Sessão expirada'); }
          if (res.status === 204) return [];
          return res.json();
        });
    };

    Promise.all([
      secureFetch(`http://localhost:3000/api/v1/usuarios/${user.id}`),
      secureFetch('http://localhost:3000/api/v1/avaliacoes'),
      secureFetch('http://localhost:3000/api/v1/jogos')
    ])
    .then(([dataUser, dataAvaliacoes, dataJogos]) => {
      if (dataUser) {
        setNome(dataUser.nome);
        setDataNascimento(dataUser.dataNascimento || '');
        setFkPerfil(dataUser.fkPerfil);
      }
      if (Array.isArray(dataAvaliacoes)) {
        setMinhasAvaliacoes(dataAvaliacoes);
      }
      if (Array.isArray(dataJogos)) {
        const mapa = new Map();
        dataJogos.forEach(jogo => mapa.set(jogo.id, jogo.nome));
        setJogosMap(mapa);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error("Erro ao buscar dados:", err.message);
      setLoading(false);
    });
  }, [user, navigate, logout]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getJogoNome = (id) => jogosMap.get(id) || 'Jogo não encontrado';

  // --- Máscara de Data ---
  const handleDataChange = (e) => {
    let valor = e.target.value.replace(/\D/g, ''); 
    if (valor.length > 8) valor = valor.slice(0, 8);
    if (valor.length > 4) valor = valor.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    else if (valor.length > 2) valor = valor.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    setDataNascimento(valor); 
  };
  
  // --- Atualizar Dados Pessoais ---
  const handleUpdateDados = async (event) => {
    event.preventDefault();
    if (dataNascimento.length < 10) {
      showToast('Por favor, preencha a data completa (DD/MM/AAAA).', 'error');
      return;
    }
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:3000/api/v1/usuarios/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nome, dataNascimento, fkPerfil }) 
      });
      const data = await response.json();
      
      // 2. Substituído alert por showToast
      if (response.ok) {
        showToast(data.message, 'success');
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      showToast("Erro de conexão.", 'error');
    }
  };

  // --- Mudar Senha ---
  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      showToast('A nova senha deve ter pelo menos 8 caracteres.', 'error');
      return;
    }
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await response.json();

      if (response.ok) {
        alert(data.message); // Mantemos alert aqui pois vamos deslogar
        logout();
        navigate('/login');
      } else {
        showToast(data.message, 'error');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (error) {
      console.error("Erro ao mudar senha:", error);
      showToast("Erro de conexão.", 'error');
    }
  };

  // --- Editar Avaliação ---
  const handleEditReviewClick = (review) => {
    setEditingReview(review);
    window.scrollTo(0, 0);
  };

  const handleUpdateReviewSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3000/api/v1/avaliacoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          jogoId: editingReview.fkJogo,
          nota: editingReview.nota,
          comentario: editingReview.comentario
        })
      });
      const data = await response.json();
      
      if (response.ok) {
        showToast(data.message, 'success');
        setEditingReview(null);
        fetchData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      console.error("Erro ao atualizar avaliação:", error);
      showToast("Erro de conexão.", 'error');
    }
  };

  if (loading) {
    return (
      <div className="main-content-area">
        <h1 className="page-title">Meus Dados</h1>
        <p>A carregar...</p>
      </div>
    );
  }

  return (
    <div className="main-content-area">
      <div className="admin-container">

        {/* Formulário de Edição de Avaliação */}
        {editingReview && (
          <>
            <h1 className="admin-section-title">Editando Avaliação: {getJogoNome(editingReview.fkJogo)}</h1>
            <div className="cadastro-box" style={{border: '2px solid #39FF14', marginBottom: '30px'}}>
              <form onSubmit={handleUpdateReviewSubmit}>
                <div className="input-group">
                  <label htmlFor="editNota">Nota (1-5)</label>
                  <input 
                    type="number"
                    id="editNota"
                    min="1" max="5"
                    value={editingReview.nota}
                    onChange={(e) => setEditingReview({...editingReview, nota: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="editComentario">Comentário</label>
                  <textarea 
                    id="editComentario"
                    className="review-textarea"
                    value={editingReview.comentario}
                    onChange={(e) => setEditingReview({...editingReview, comentario: e.target.value})}
                    required
                  ></textarea>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-cadastrar">Atualizar Avaliação</button>
                  <button type="button" className="btn-cancelar" onClick={() => setEditingReview(null)}>Cancelar</button>
                </div>
              </form>
            </div>
          </>
        )}

        <h1 className="admin-section-title">Meus Dados</h1>
        <div className="cadastro-box">
          <form onSubmit={handleUpdateDados} className="form-grid" style={{marginBottom: '40px'}}>
            <div className="input-group">
              <label htmlFor="nome">Nome Do Usuário</label>
              <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="input-group">
              <label htmlFor="dataNasc">Data de Nascimento (DD/MM/AAAA)</label>
              <input type="text" id="dataNasc" placeholder="DD/MM/AAAA" value={dataNascimento} onChange={handleDataChange} maxLength="10" />
            </div>
            <div className="form-actions" style={{gridColumn: '1 / -1'}}>
              <button type="submit" className="btn-cadastrar">Atualizar Dados</button>
            </div>
          </form>

          <h2 className="admin-section-title" style={{marginTop: '20px', fontSize: '1.2em'}}>Mudar Senha</h2>
          <form onSubmit={handleChangePassword} className="form-grid">
            <div className="input-group">
              <label htmlFor="currentPass">Senha Atual</label>
              <input type="password" id="currentPass" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="input-group">
              <label htmlFor="newPass">Nova Senha</label>
              <input type="password" id="newPass" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="form-actions" style={{gridColumn: '1 / -1'}}>
              <button type="submit" className="btn-cadastrar">Mudar Senha</button>
            </div>
          </form>
        </div>

        <h1 className="admin-section-title list-title">Minhas Avaliações</h1>
        <div className="listagem-box">
          <div className="tabela-jogos-container">
            <table className="tabela-jogos">
              <thead>
                <tr>
                  <th>Jogo</th>
                  <th>Minha Nota</th>
                  <th>Meu Comentário</th>
                  <th>Editar</th>
                </tr>
              </thead>
              <tbody>
                {minhasAvaliacoes.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>Você ainda não fez nenhuma avaliação.</td>
                  </tr>
                ) : (
                  minhasAvaliacoes.map(review => (
                    <tr key={review.id}>
                      <td>{getJogoNome(review.fkJogo)}</td>
                      <td style={{color: 'gold'}}>{'★'.repeat(review.nota)}</td>
                      <td>{review.comentario}</td>
                      <td>
                        <i 
                          className="fas fa-edit action-icon icon-edit"
                          onClick={() => handleEditReviewClick(review)}
                          style={{cursor: 'pointer'}}
                        ></i>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 3. Componente Toast */}
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

export default MeusDados;