// No ficheiro: src/pages/Cadastro.js
// VERSÃO 3 - Com máscara de data

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Cadastro() {
  const navigate = useNavigate();

  // 1. Estados do formulário (agora com dataNascimento unificada)
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [dataNascimento, setDataNascimento] = useState(''); // Estado único para a data

  // 2. NOVA FUNÇÃO: Lida com a formatação da data
  const handleDataChange = (e) => {
    // Remove todos os caracteres que não são números
    let valor = e.target.value.replace(/\D/g, ''); 

    // Limita a 8 dígitos (DDMMAAAA)
    if (valor.length > 8) {
      valor = valor.slice(0, 8);
    }

    // Adiciona as barras de formatação
    if (valor.length > 4) {
      // Formato DD/MM/AAAA
      valor = valor.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    } else if (valor.length > 2) {
      // Formato DD/MM
      valor = valor.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    }

    setDataNascimento(valor); // Atualiza o estado
  };

  // 3. Função de envio (agora usa o 'dataNascimento' direto)
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!nome || !email || !senha || dataNascimento.length < 10) {
      alert('Por favor, preencha todos os campos corretamente. A data deve estar no formato DD/MM/AAAA.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
          dataNascimento // Envia a data formatada
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); // Ex: "Usuário cadastrado com sucesso!"
        navigate('/login'); 
      } else {
        alert(data.message); // Ex: "E-mail já cadastrado."
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Não foi possível conectar ao servidor.');
    }
  };

  // 4. O array 'diasDoMes' foi removido (não é mais necessário)

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
                <label htmlFor="fullname">Nome Completo.</label>
                <input 
                  type="text" 
                  id="fullname" 
                  placeholder="Digite aqui."
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              {/* 5. GRUPO DE DATA SUBSTITUÍDO */}
              <div className="input-group">
                <label htmlFor="dataNascimento">Data de Nascimento</label>
                <input 
                  type="text" // Usamos 'text' para controlar a formatação
                  id="dataNascimento" 
                  placeholder="DD/MM/AAAA" 
                  value={dataNascimento}
                  onChange={handleDataChange} // Usa a nova função de formatação
                  maxLength="10" // Limita o tamanho final
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Senha.</label>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="Digite aqui."
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
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