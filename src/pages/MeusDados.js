// No ficheiro: src/pages/MeusDados.js
// VERSÃO 2 - Com máscara de data

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function MeusDados() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados para o formulário de dados
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [fkPerfil, setFkPerfil] = useState(null);

  // Estados para o formulário de senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Buscar os dados do utilizador
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:3000/api/v1/usuarios/${user.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) { logout(); navigate('/login'); throw new Error('Sessão expirada'); }
      return res.json();
    })
    .then(data => {
      setNome(data.nome);
      // A API já retorna no formato DD/MM/AAAA
      setDataNascimento(data.dataNascimento || ''); 
      setFkPerfil(data.fkPerfil);
    })
    .catch(err => console.error("Erro ao buscar dados do utilizador:", err.message));
  }, [user, navigate, logout]);

  // =================================================================
  // NOVA FUNÇÃO: Lida com a formatação da data
  // =================================================================
  const handleDataChange = (e) => {
    let valor = e.target.value.replace(/\D/g, ''); 
    if (valor.length > 8) valor = valor.slice(0, 8);

    if (valor.length > 4) {
      valor = valor.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    } else if (valor.length > 2) {
      valor = valor.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    }
    setDataNascimento(valor); 
  };
  
  // Função para ATUALIZAR DADOS (Nome, Data Nasc.)
  const handleUpdateDados = async (event) => {
    event.preventDefault();
    if (dataNascimento.length < 10) {
      alert('Por favor, preencha a data de nascimento completa (DD/MM/AAAA).');
      return;
    }
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:3000/api/v1/usuarios/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        // A API espera a data como DD/MM/AAAA
        body: JSON.stringify({ nome, dataNascimento, fkPerfil }) 
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    }
  };

  // Função para MUDAR SENHA (Sem mudança)
  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      alert('A nova senha deve ter pelo menos 8 caracteres.');
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
      alert(data.message);

      if (response.ok) {
        logout();
        navigate('/login');
      } else {
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (error) {
      console.error("Erro ao mudar senha:", error);
    }
  };

  // --- Renderização ---
  return (
    <div className="main-content-area">
      <div className="admin-container">
        <h1 className="admin-section-title">Meus Dados</h1>
        
        <div className="cadastro-box">
          <form onSubmit={handleUpdateDados} className="form-grid" style={{marginBottom: '40px'}}>
            <div className="input-group">
              <label htmlFor="nome">Nome Completo</label>
              <input 
                type="text" 
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            {/* === CAMPO DE DATA ATUALIZADO === */}
            <div className="input-group">
              <label htmlFor="dataNasc">Data de Nascimento (DD/MM/AAAA)</label>
              <input 
                type="text" // Mudado para 'text'
                id="dataNasc"
                placeholder="DD/MM/AAAA"
                value={dataNascimento}
                onChange={handleDataChange} // Usa a nova função
                maxLength="10"
                required
              />
            </div>
            <div className="form-actions" style={{gridColumn: '1 / -1'}}>
              <button type="submit" className="btn-cadastrar">Atualizar Dados</button>
            </div>
          </form>

          {/* ... (Formulário de Senha sem mudança) ... */}
          <h2 className="admin-section-title" style={{marginTop: '20px', fontSize: '1.2em'}}>Mudar Senha</h2>
          <form onSubmit={handleChangePassword} className="form-grid">
            <div className="input-group">
              <label htmlFor="currentPass">Senha Atual</label>
              <input 
                type="password" 
                id="currentPass"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="newPass">Nova Senha</label>
              <input 
                type="password" 
                id="newPass"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-actions" style={{gridColumn: '1 / -1'}}>
              <button type="submit" className="btn-cadastrar">Mudar Senha</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MeusDados;