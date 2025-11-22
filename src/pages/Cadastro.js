// No arquivo: src/pages/Cadastro.js
// VERSÃO FINAL - Com Toasts

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState(''); 
  const [dataNascimento, setDataNascimento] = useState('');
  const [notification, setNotification] = useState(null); // Estado do Toast

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => { setNotification(null); }, 3000);
  };

  const handleDataChange = (e) => {
    let valor = e.target.value.replace(/\D/g, ''); 
    if (valor.length > 8) valor = valor.slice(0, 8);
    if (valor.length > 4) valor = valor.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    else if (valor.length > 2) valor = valor.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    setDataNascimento(valor); 
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (senha !== confirmarSenha) {
      showToast('As senhas não coincidem!', 'error');
      return;
    }

    if (!nome || !email || !senha || dataNascimento.length < 10) {
      showToast('Por favor, preencha todos os campos corretamente.', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, dataNascimento }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Cadastro realizado com sucesso!', 'success');
        // Espera 2 segundos para o usuário ler antes de ir pro login
        setTimeout(() => {
            navigate('/login');
        }, 2000);
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      showToast('Não foi possível conectar ao servidor.', 'error');
    }
  };

  return (
    <div className="login-page-body">
      <div className="login-container">
        <div className="login-wrapper">
          <div className="header">
            <h2>Criando Uma Conta!</h2>
            <Link to="/login" className="back-button">&lt; Voltar</Link>
          </div>

          <div className="cadastro-box">
            <form className="cadastro-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">Informe seu E-mail</label>
                <input type="email" id="email" placeholder="Digite aqui." value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="input-group">
                <label htmlFor="fullname">Nome Completo.</label>
                <input type="text" id="fullname" placeholder="Digite aqui." value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div className="input-group">
                <label htmlFor="dataNascimento">Data de Nascimento</label>
                <input type="text" id="dataNascimento" placeholder="DD/MM/AAAA" value={dataNascimento} onChange={handleDataChange} maxLength="10" />
              </div>
              <div className="input-group">
                <label htmlFor="password">Senha</label>
                <input type="password" id="password" placeholder="Digite aqui." value={senha} onChange={(e) => setSenha(e.target.value)} />
              </div>
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirmar Senha</label>
                <input 
                  type="password" id="confirmPassword" placeholder="Digite a senha novamente." value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)}
                  style={confirmarSenha && senha !== confirmarSenha ? {borderColor: '#e53935'} : {}}
                />
                <p className="password-hint">Sua senha precisa ter um mínimo de 8 dígitos...</p>
              </div>
              <button type="submit" className="login-button">Cadastrar</button>
            </form>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
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

export default Cadastro;