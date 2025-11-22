// No arquivo: src/pages/AdminEmpresas.js
// VERSÃO 3 - Com Modal de Confirmação "Bonito"

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminEmpresas() {
  // === ESTADOS ===
  const [empresas, setEmpresas] = useState([]);
  const [nome, setNome] = useState(''); 
  const [editingId, setEditingId] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriteria, setSortCriteria] = useState('id-asc');

  // 1. NOVO ESTADO: Controla a visibilidade do Modal
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  // === Carregar Dados ===
  const fetchEmpresas = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3000/api/v1/empresas', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) {
        alert('Sessão expirada.');
        logout();
        navigate('/login');
        throw new Error('Sessão expirada');
      }
      return res.json();
    })
    .then(data => { if (Array.isArray(data)) setEmpresas(data); })
    .catch(err => console.error("Erro ao buscar empresas:", err.message));
  };

  useEffect(() => {
    fetchEmpresas();
  }, [navigate, logout]);

  // === Lógica do Formulário ===

  // 2. Função chamada pelo formulário (apenas abre o modal)
  const handleFormSubmit = (event) => {
    event.preventDefault();
    // Abre o modal para pedir confirmação
    setShowModal(true);
  };

  // 3. Função chamada ao clicar em "Sim" no modal (Faz o envio real)
  const confirmCadastro = async () => {
    setShowModal(false); // Fecha o modal
    
    const token = localStorage.getItem('token');
    const isUpdating = editingId !== null;
    const url = isUpdating 
      ? `http://localhost:3000/api/v1/empresas/${editingId}`
      : 'http://localhost:3000/api/v1/empresas';
    const method = isUpdating ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nome: nome }),
      });

      if (response.ok) {
        alert(`Empresa ${isUpdating ? 'atualizada' : 'cadastrada'} com sucesso!`);
        setNome('');
        setEditingId(null);
        fetchEmpresas();
      } else {
        const data = await response.json();
        alert(`Erro ao salvar: ${data.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro ao salvar empresa:", error);
    }
  };

  // Função de Exclusão (mantém o window.confirm padrão ou pode mudar depois)
  const handleDeleteClick = async (empresa) => {
    if (!window.confirm(`Tem certeza que deseja excluir a empresa "${empresa.nome}"?`)) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/v1/empresas/${empresa.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Empresa excluída com sucesso!');
        fetchEmpresas();
      } else {
        const data = await response.json();
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const handleEditClick = (empresa) => {
    setNome(empresa.nome);
    setEditingId(empresa.id);
    window.scrollTo(0, 0);
  };

  // === Filtros ===
  const empresasFiltradas = useMemo(() => {
    let lista = [...empresas];
    if (searchTerm) {
      lista = lista.filter(emp => emp.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (sortCriteria === 'nome-asc') {
      lista.sort((a, b) => a.nome.localeCompare(b.nome));
    } else {
      lista.sort((a, b) => a.id - b.id);
    }
    return lista;
  }, [empresas, searchTerm, sortCriteria]);

  // === Renderização ===
  return (
    <div className="main-content-area">
      <div className="admin-container">
        
        <h1 className="admin-section-title">
          {editingId ? `Editando Empresa (ID: ${editingId})` : 'Cadastrar Nova Empresa'}
        </h1>
        
        <div className="cadastro-box">
          {/* O onSubmit chama handleFormSubmit, que abre o modal */}
          <form id="cadastro-empresa-form" onSubmit={handleFormSubmit}>
            <div className="form-grid">
              <div className="input-group full-width">
                <label htmlFor="nome">Nome da Empresa:</label>
                <input type="text" id="nome" name="nome" required 
                       value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-cadastrar-empresa">
                {editingId ? 'Atualizar' : 'Cadastrar'}
              </button>
              {editingId && (
                <button type="button" className="btn-cancelar" onClick={() => { setNome(''); setEditingId(null); }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* 4. O POP-UP (MODAL) */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirmação</h3>
              <p>
                Tem certeza que deseja {editingId ? 'atualizar' : 'adicionar'} a empresa 
                <br/>
                <strong style={{color: '#39FF14', fontSize: '1.2em'}}>"{nome}"</strong>?
              </p>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn-confirm" onClick={confirmCadastro}>Sim, Confirmar</button>
              </div>
            </div>
          </div>
        )}

        <h1 className="admin-section-title list-title">Listar Empresas</h1>
        
        <div className="listagem-box">
          <div className="filter-bar">
            <div className="search-input-group">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                id="input-busca-empresa" 
                placeholder="Pesquisar Nome"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              id="select-classificar-empresa" 
              className="select-filter"
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value)}
            >
              <option value="id-asc">Classificar por: ID</option>
              <option value="nome-asc">Classificar por: Nome (A-Z)</option>
            </select>
          </div>

          <div className="tabela-empresas-container">
            <table className="tabela-empresas">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome da Empresa</th>
                  <th>Editar</th>
                  <th>Excluir</th>
                </tr>
              </thead>
              <tbody>
                {empresasFiltradas.map(emp => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>{emp.nome}</td>
                    <td>
                      <i 
                        className="fas fa-edit action-icon icon-edit"
                        onClick={() => handleEditClick(emp)}
                        style={{cursor: 'pointer'}}
                      ></i>
                    </td>
                    <td>
                      <i 
                        className="fas fa-trash-alt action-icon icon-delete"
                        onClick={() => handleDeleteClick(emp)}
                        style={{cursor: 'pointer'}}
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminEmpresas;