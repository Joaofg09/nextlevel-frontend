// No arquivo: src/pages/AdminUsuariosPage.js
// VERSÃO FINAL - Com Toasts

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [perfis, setPerfis] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [novoPerfilNome, setNovoPerfilNome] = useState('');

  const [editingUser, setEditingUser] = useState(null); 
  const [formNome, setFormNome] = useState('');
  const [formDataNasc, setFormDataNasc] = useState('');
  const [formFkPerfil, setFormFkPerfil] = useState('');
  
  // Estado do Toast
  const [notification, setNotification] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => { setNotification(null); }, 3000);
  };

  const fetchData = useCallback(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    const secureFetch = (url) => {
      return fetch(url, { headers: { 'Authorization': `Bearer ${token}` }})
        .then(res => {
          if (res.status === 401) { 
              alert('Sessão expirada.'); // Mantém alert aqui pois é crítico
              logout(); navigate('/login'); 
              throw new Error('Sessão expirada'); 
          }
          if (res.status === 204) return [];
          return res.json();
        });
    };

    Promise.all([
      secureFetch('http://localhost:3000/api/v1/usuarios'), 
      secureFetch('http://localhost:3000/api/v1/profiles') 
    ])
    .then(([dataUsuarios, dataPerfis]) => {
      if (Array.isArray(dataUsuarios)) setUsuarios(dataUsuarios);
      if (Array.isArray(dataPerfis)) setPerfis(dataPerfis);
      setLoading(false);
    })
    .catch(err => {
      console.error("Erro ao buscar dados:", err.message);
      setLoading(false);
    });
  }, [logout, navigate]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [user, navigate, fetchData]);

  const perfilMap = useMemo(() => {
    return perfis.reduce((acc, perfil) => {
      acc[perfil.id] = perfil.nome;
      return acc;
    }, {});
  }, [perfis]);

  // Criar Perfil com Toast
  const handleCriarPerfil = async (event) => {
    event.preventDefault();
    if (!novoPerfilNome) {
      showToast('O nome do perfil não pode estar vazio.', 'error');
      return;
    }
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://localhost:3000/api/v1/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nome: novoPerfilNome })
      });
      const data = await response.json();
      
      if (response.ok) {
        showToast(data.message, 'success');
        setNovoPerfilNome(''); 
        fetchData(); 
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      console.error("Erro ao criar perfil:", error);
      showToast("Erro de conexão.", 'error');
    }
  };

  const handleDataChange = (e) => {
    let valor = e.target.value.replace(/\D/g, ''); 
    if (valor.length > 8) valor = valor.slice(0, 8);
    if (valor.length > 4) valor = valor.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    else if (valor.length > 2) valor = valor.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    setFormDataNasc(valor); 
  };

  const handleEditClick = (usuario) => {
    setEditingUser(usuario);
    setFormNome(usuario.nome);
    setFormDataNasc(usuario.dataNascimento || '');
    setFormFkPerfil(usuario.fkPerfil);
    window.scrollTo(0, 0); 
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setFormNome('');
    setFormDataNasc('');
    setFormFkPerfil('');
  };

  // Atualizar Usuário com Toast
  const handleUpdateUserSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');

    if (formDataNasc && formDataNasc.length > 0 && formDataNasc.length < 10) {
        showToast('Data incompleta (DD/MM/AAAA).', 'error');
        return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/v1/usuarios/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          nome: formNome,
          dataNascimento: formDataNasc || null, 
          fkPerfil: parseInt(formFkPerfil)
        })
      });
      const data = await response.json();
      
      if (response.ok) {
        showToast(data.message, 'success');
        handleCancelEdit(); 
        fetchData(); 
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      console.error("Erro ao atualizar utilizador:", error);
      showToast("Erro de conexão.", 'error');
    }
  };

  if (loading) {
    return (
      <div className="main-content-area">
        <h1 className="page-title">Gerenciamento de Usuários</h1>
        <p>A carregar...</p>
      </div>
    );
  }

  return (
    <div className="main-content-area">
      <div className="admin-container">

        {editingUser && (
          <>
            <h1 className="admin-section-title">Editando Utilizador: {editingUser.nome} (ID: {editingUser.id})</h1>
            <div className="cadastro-box" style={{border: '2px solid #39FF14', marginBottom: '30px'}}>
              <form onSubmit={handleUpdateUserSubmit} className="form-grid">
                <div className="input-group">
                  <label htmlFor="editNome">Nome:</label>
                  <input type="text" id="editNome" value={formNome} onChange={(e) => setFormNome(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label htmlFor="editDataNasc">Data de Nascimento (DD/MM/AAAA)</label>
                  <input type="text" id="editDataNasc" value={formDataNasc} onChange={handleDataChange} placeholder="DD/MM/AAAA" maxLength="10" />
                </div>
                <div className="input-group full-width">
                  <label htmlFor="editPerfil">Perfil:</label>
                  <select id="editPerfil" value={formFkPerfil} onChange={(e) => setFormFkPerfil(e.target.value)} required>
                    <option value="">Selecione um perfil</option>
                    {perfis.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-cadastrar">Atualizar Utilizador</button>
                  <button type="button" className="btn-cancelar" onClick={handleCancelEdit}>Cancelar</button>
                </div>
              </form>
            </div>
          </>
        )}

        <h1 className="admin-section-title">Lista de Utilizadores</h1>
        <div className="listagem-box">
          <div className="tabela-jogos-container">
            <table className="tabela-jogos">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Data de Nascimento</th>
                  <th>Perfil</th>
                  <th>Editar</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nome}</td>
                    <td>{u.email}</td>
                    <td>{u.dataNascimento || 'Não informado'}</td>
                    <td style={{fontWeight: 'bold', color: '#39FF14'}}>
                      {perfilMap[u.fkPerfil] || '...'}
                    </td>
                    <td>
                      <i 
                        className="fas fa-edit action-icon icon-edit"
                        onClick={() => handleEditClick(u)}
                        style={{cursor: 'pointer'}}
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <h1 className="admin-section-title list-title">Gerenciamento de Perfis</h1>
        <div className="listagem-box">
          <form onSubmit={handleCriarPerfil} className="cadastro-box" style={{ padding: '20px', marginBottom: '20px' }}>
            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="nomePerfil">Nome do Novo Perfil:</label>
                <input type="text" id="nomePerfil" value={novoPerfilNome} onChange={(e) => setNovoPerfilNome(e.target.value)} placeholder="Ex: Moderador" required />
              </div>
              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="submit" className="btn-cadastrar">Criar Perfil</button>
              </div>
            </div>
          </form>
          <div className="tabela-jogos-container">
            <table className="tabela-jogos">
              <thead>
                <tr>
                  <th>ID do Perfil</th>
                  <th>Nome do Perfil</th>
                </tr>
              </thead>
              <tbody>
                {perfis.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Componente Toast */}
      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          <div className="toast-icon">
            {notification.type === 'error' ? <i className="fas fa-exclamation-circle"></i> : <i className="fas fa-check-circle"></i>}
          </div>
          <div className="toast-content">
            <h4>{notification.type === 'error' ? 'Erro' : 'Sucesso'}</h4>
            <p>{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsuariosPage;