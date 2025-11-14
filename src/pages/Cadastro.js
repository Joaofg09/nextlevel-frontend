// No arquivo: src/pages/Cadastro.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Verificação de data (o formato DD/MM/YYYY já está correto)
    const dataNascimento = `${dia}/${mes}/${ano}`;

    if (!nome || !email || !senha || !dia || !mes || !ano) {
      alert('Por favor, preencha todos os campos.');
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
          dataNascimento 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); // Ex: "Usuário cadastrado com sucesso!"
        navigate('/login'); // Envia o usuário para o login
      } else {
        alert(data.message); // Ex: "E-mail já cadastrado."
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Não foi possível conectar ao servidor.');
    }
  };

  // === CORREÇÃO AQUI ===
  // Popula os dias já com o zero à esquerda
  const diasDoMes = [];
  for (let i = 1; i <= 31; i++) {
    // Converte o número para string e preenche com '0' à esquerda
    const diaFormatado = String(i).padStart(2, '0');
    diasDoMes.push(diaFormatado);
  }

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

              <label>Data de Nascimento.</label>
              <div className="dob-group">
                <select 
                  id="dob-day" 
                  value={dia} 
                  onChange={(e) => setDia(e.target.value)}
                >
                  <option value="">Dia</option>
                  {/* Agora o 'value' será "01", "02", ..., "31" */}
                  {diasDoMes.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select 
                  id="dob-month" 
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                >
                  {/* Os meses já estavam corretos com dois dígitos */}
                  <option value="">Mês</option>
                  <option value="01">Janeiro</option>
                  <option value="02">Fevereiro</option>
                  <option value="03">Março</option>
                  <option value="04">Abril</option>
                  <option value="05">Maio</option>
                  <option value="06">Junho</option>
                  <option value="07">Julho</option>
                  <option value="08">Agosto</option>
                  <option value="09">Setembro</option>
                  <option value="10">Outubro</option>
                  <option value="11">Novembro</option>
                  <option value="12">Dezembro</option>
                </select>
                <input 
                  type="text" 
                  id="dob-year" 
                  placeholder="Ano" 
                  maxLength="4"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
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