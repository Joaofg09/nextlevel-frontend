// No arquivo: src/pages/Cadastro.js
// VERSÃO 4 - Com campo de Confirmar Senha

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Cadastro() {
  const navigate = useNavigate();

  // 1. Estados do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState(''); // NOVO ESTADO
  const [dataNascimento, setDataNascimento] = useState('');

  // Função de máscara de data (sem mudança)
  const handleDataChange = (e) => {
    let valor = e.target.value.replace(/\D/g, ''); 
    if (valor.length > 8) valor = valor.slice(0, 8);
    if (valor.length > 4) valor = valor.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    else if (valor.length > 2) valor = valor.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    setDataNascimento(valor); 
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // 2. NOVA VALIDAÇÃO: Senhas Iguais
    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem!');
      return; // Para tudo por aqui
    }

    if (!nome || !email || !senha || dataNascimento.length < 10) {
      alert('Por favor, preencha todos os campos corretamente.');
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
        alert(data.message); 
        navigate('/login'); 
      } else {
        alert(data.message); 
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Não foi possível conectar ao servidor.');
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
                <input 
                  type="email" 
                  id="email" 
                  placeholder="Digite aqui." 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor="fullname">Nome Completo</label>
                <input 
                  type="text" 
                  id="fullname" 
                  placeholder="Digite aqui."
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="dataNascimento">Data de Nascimento</label>
                <input 
                  type="text"
                  id="dataNascimento" 
                  placeholder="DD/MM/AAAA" 
                  value={dataNascimento}
                  onChange={handleDataChange}
                  maxLength="10"
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Senha</label>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="Digite aqui."
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>

              {/* 3. NOVO CAMPO VISUAL */}
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirmar Senha</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  placeholder="Digite a senha novamente."
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  // Adiciona uma borda vermelha visual se as senhas forem diferentes (opcional, mas bonito)
                  style={confirmarSenha && senha !== confirmarSenha ? {borderColor: '#e53935'} : {}}
                />
                <p className="password-hint">Sua senha precisa ter um mínimo de 8 dígitos...</p>
              </div>

              <button type="submit" className="login-button">Cadastrar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cadastro;