// No arquivo: src/pages/Login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Importe o useAuth

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();
  const auth = useAuth(); // 2. Pegue o contexto

  const handleSubmit = async (event) => {
    event.preventDefault(); 
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }), 
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Chame a função de login do Contexto!
        auth.login(data.token); 

        alert(data.message); // Opcional
        navigate('/'); // Redireciona para a Home
      } else {
        alert(data.message); 
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
      alert('Não foi possível conectar ao servidor.');
    }
  };

  // O resto do seu JSX (HTML) continua igual...
  return (
    <div className="login-page-body"> 
      <div className="login-container">
        {/* ... (todo o seu HTML/JSX do login) ... */}
        <div className="login-wrapper">
          <div className="header">
            <h2>Iniciar Sua Sessão</h2>
            <button onClick={() => navigate('/')} className="back-button">&lt; Voltar</button>
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