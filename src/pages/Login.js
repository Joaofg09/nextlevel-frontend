// No arquivo: src/pages/Login.js
// VERSÃO SEM BOTÃO VOLTAR

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault(); 

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }), 
      });

      const data = await response.json();

      if (response.ok) {
        auth.login(data.token); 
        navigate('/'); 
      } else {
        alert(data.message); 
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
      alert('Não foi possível conectar ao servidor. Verifique se a API está rodando.');
    }
  };

  return (
    <div className="login-page-body"> 
      <div className="login-container">
        <div className="login-wrapper">
          
          {/* CABEÇALHO LIMPO: Apenas o Título */}
          <div className="header">
            <h2>Iniciar Sessão</h2>
          </div>

          <div className="login-box">
            <form onSubmit={handleSubmit}> 
              <div className="input-group">
                <label htmlFor="email">Digite seu Email</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="Digite aqui."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="password">Digite sua senha</label>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="Digite aqui."
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="login-button">Iniciar</button>
              <a href="/" className="forgot-password">Esqueci minha Senha.</a>
            </form>
          </div>

          <div className="signup-box">
            <h3>Primeira vez na NextLevel?</h3>
            <br />
            <button onClick={() => navigate('/cadastro')} className="signup-button">Criar uma Conta</button>
            <br /><br />
            <p>Crie sua conta gratuitamente, de forma fácil e rápida, e leve sua diversão para o próximo nível!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;