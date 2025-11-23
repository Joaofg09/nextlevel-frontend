// No arquivo: src/pages/AdminJogos.js
// VERSÃO FINAL - Com Modal de Exclusão e Toasts

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminJogos() {
  // === ESTADOS ===
  const [jogos, setJogos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortCriteria, setSortCriteria] = useState('id-asc');
  
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState({
    nome: '', preco: '', fkCategoria: '', ano: '', descricao: '', fkEmpresa: ''
  });
  const [editingId, setEditingId] = useState(null); 

  // 1. NOVOS ESTADOS para Modal e Toast
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Função auxiliar de Notificação
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => { setNotification(null); }, 3000);
  };

  // === Mapas ===
  const categoriaMap = useMemo(() => {
    return categorias.reduce((acc, cat) => { acc[cat.id] = cat.nome; return acc; }, {});
  }, [categorias]);

  const empresaMap = useMemo(() => {
    return empresas.reduce((acc, emp) => { acc[emp.id] = emp.nome; return acc; }, {});
  }, [empresas]);

  const categoriasParaDropdown = useMemo(() => {
    const nomesVistos = new Set();
    const listaLimpa = [];
    categorias.forEach(cat => {
      const nomeLimpo = cat.nome.trim();
      if (!nomesVistos.has(nomeLimpo)) {
        nomesVistos.add(nomeLimpo);
        listaLimpa.push({ ...cat, nome: nomeLimpo });
      }
    });
    listaLimpa.sort((a, b) => a.nome.localeCompare(b.nome));
    return listaLimpa;
  }, [categorias]);

  // === Fetch Data ===
  const fetchData = useCallback(() => {
    const token = localStorage.getItem('token');
    const secureFetch = (url) => {
      return fetch(url, { headers: { 'Authorization': `Bearer ${token}` }})
        .then(res => {
          if (res.status === 401) {
            // Aqui mantemos o alert pois é um erro de sessão crítica
            alert('Sessão expirada.');
            logout(); 
            navigate('/login');
            throw new Error('Sessão expirada');
          }
          if (!res.ok) throw new Error(`Erro ${res.status}`);
          return res.json();
        });
    };

    Promise.all([
      secureFetch('http://localhost:3000/api/v1/jogos'),
      secureFetch('http://localhost:3000/api/v1/categorias'),
      secureFetch('http://localhost:3000/api/v1/empresas')
    ])
    .then(([jogosData, categoriasData, empresasData]) => {
      if (Array.isArray(jogosData)) setJogos(jogosData);
      if (Array.isArray(categoriasData)) setCategorias(categoriasData);
      if (Array.isArray(empresasData)) setEmpresas(empresasData);
    })
    .catch(err => console.error("Erro ao buscar dados:", err.message));
  }, [logout, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // === Lógica do Formulário ===
  const toggleForm = () => {
    if (showForm) { clearForm(); setShowForm(false); } else { setShowForm(true); }
  };

  const clearForm = () => {
    setFormState({ nome: '', preco: '', fkCategoria: '', ano: '', descricao: '', fkEmpresa: '' });
    setEditingId(null);
  };

  const handleEditClick = (jogo) => {
    setEditingId(jogo.id);
    setFormState({
      nome: jogo.nome,
      preco: jogo.preco,
      fkCategoria: jogo.fkCategoria,
      ano: jogo.ano,
      descricao: jogo.descricao || '',
      fkEmpresa: jogo.fkEmpresa
    });
    setShowForm(true); 
    window.scrollTo(0, 0); 
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); 
    const anoInt = parseInt(formState.ano);
    const anoAtual = new Date().getFullYear();
    if (anoInt > anoAtual) {
      showToast(`O ano de lançamento não pode ser futuro.`, 'error');
      return; 
    }

    const token = localStorage.getItem('token');
    const jogoData = {
      ...formState,
      preco: parseFloat(formState.preco),
      fkCategoria: parseInt(formState.fkCategoria),
      ano: anoInt,
      fkEmpresa: parseInt(formState.fkEmpresa)
    };

    const isUpdating = editingId !== null;
    const url = isUpdating 
      ? `http://localhost:3000/api/v1/jogos/${editingId}`
      : 'http://localhost:3000/api/v1/jogos';
    const method = isUpdating ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(jogoData),
      });

      if (response.ok) {
        showToast(`Jogo ${isUpdating ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
        clearForm();
        setShowForm(false);
        fetchData(); 
      } else {
        const data = await response.json();
        showToast(`Erro: ${data.message || 'Erro desconhecido'}`, 'error');
      }
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
      showToast("Erro de conexão.", 'error');
    }
  };

  // 2. Função que ABRE o Modal de Exclusão
  const handleDeleteClick = (jogo) => {
    setGameToDelete(jogo);
    setShowDeleteModal(true);
  };

  // 3. Função que CONFIRMA a Exclusão
  const confirmDelete = async () => {
    setShowDeleteModal(false);
    if (!gameToDelete) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/v1/jogos/${gameToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showToast('Jogo excluído com sucesso!', 'success');
        setJogos(jogosAtuais => jogosAtuais.filter(j => j.id !== gameToDelete.id));
      } else {
        const data = await response.json();
        showToast(`Erro: ${data.message}`, 'error');
      }
    } catch (error) {
      console.error("Erro ao excluir jogo:", error);
      showToast("Erro de conexão.", 'error');
    }
  };

  // === Filtros ===
  const jogosFiltrados = useMemo(() => {
    let lista = [...jogos];
    if (searchTerm) {
      lista = lista.filter(jogo => jogo.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterCategory) {
      const nomeLimpoSelecionado = categoriaMap[filterCategory]?.trim();
      if (nomeLimpoSelecionado) {
        lista = lista.filter(jogo => {
          const nomeLimpoJogo = categoriaMap[jogo.fkCategoria]?.trim();
          return nomeLimpoJogo === nomeLimpoSelecionado;
        });
      }
    }
    if (sortCriteria === 'preco-desc') lista.sort((a, b) => b.preco - a.preco);
    else if (sortCriteria === 'titulo-asc') lista.sort((a, b) => a.nome.localeCompare(b.nome));
    else if (sortCriteria === 'id-asc') lista.sort((a, b) => a.id - b.id);
    return lista;
  }, [jogos, searchTerm, filterCategory, sortCriteria, categoriaMap]);

  return (
    <div className="main-content-area">
      <div className="admin-container">
        <div className="header-flex">
          <h1 className="admin-section-title" style={{marginTop: 0}}>Gerenciamento de Jogos</h1>
          <button 
            className={`btn-novo-jogo ${showForm ? 'cancelar' : ''}`} 
            onClick={toggleForm}
          >
            {showForm ? <><i className="fas fa-times"></i> Fechar</> : <><i className="fas fa-plus"></i> Novo Jogo</>}
          </button>
        </div>

        <div className={`form-collapsible ${showForm ? 'open' : ''}`}>
          <div className="form-content">
            <h2 className="form-title">
              {editingId ? `Editando Jogo (ID: ${editingId})` : 'Cadastrar Novo Jogo'}
            </h2>
            <form id="cadastro-jogo-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="input-group">
                  <label htmlFor="titulo">Título:</label>
                  <input type="text" id="titulo" name="titulo" required 
                         value={formState.nome} onChange={(e) => setFormState({...formState, nome: e.target.value})} />
                </div>
                <div className="input-group preco-group">
                  <label htmlFor="preco">Preço:</label>
                  <input type="number" step="0.01" id="preco" name="preco" placeholder="0.00" required
                         value={formState.preco} onChange={(e) => setFormState({...formState, preco: e.target.value})} />
                </div>
                <div className="input-group">
                  <label htmlFor="categoria">Categoria:</label>
                  <select id="categoria" name="categoria" required
                          value={formState.fkCategoria} onChange={(e) => setFormState({...formState, fkCategoria: e.target.value})}>
                    <option value="">Selecione...</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label htmlFor="ano">Ano:</label>
                  <input type="number" id="ano" name="ano" placeholder="AAAA" maxLength="4" required
                         value={formState.ano} onChange={(e) => setFormState({...formState, ano: e.target.value})} />
                </div>
                <div className="input-group full-width">
                  <label htmlFor="descricao">Descrição:</label>
                  <textarea id="descricao" name="descricao" required style={{height: '80px'}}
                            value={formState.descricao} onChange={(e) => setFormState({...formState, descricao: e.target.value})}></textarea>
                </div>
                <div className="input-group full-width">
                  <label htmlFor="desenvolvedora">Desenvolvedora:</label>
                  <select id="desenvolvedora" name="desenvolvedora" required
                          value={formState.fkEmpresa} onChange={(e) => setFormState({...formState, fkEmpresa: e.target.value})}>
                    <option value="">Selecione...</option>
                    {empresas.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-cadastrar">
                  {editingId ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="listagem-box">
          <div className="filter-bar">
            <div className="search-input-group">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                id="input-busca" 
                placeholder="Pesquisar Título" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              id="select-categoria" 
              className="select-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Todas as Categorias</option>
              {categoriasParaDropdown.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
            <select 
              id="select-classificar" 
              className="select-filter"
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value)}
            >
              <option value="id-asc">Ordenar: ID</option>
              <option value="titulo-asc">Ordenar: A-Z</option>
              <option value="preco-desc">Ordenar: Preço</option>
            </select>
          </div>

          <div className="tabela-jogos-container">
            <table className="tabela-jogos">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Preço</th>
                  <th>Categoria</th>
                  <th>Empresa</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {jogosFiltrados.map(jogo => (
                  <tr key={jogo.id}>
                    <td>{jogo.id}</td>
                    <td>{jogo.nome}</td>
                    <td className="preco-tabela">$ {jogo.preco ? jogo.preco.toFixed(2) : '0.00'}</td>
                    <td>{categoriaMap[jogo.fkCategoria] || '...'}</td>
                    <td>{empresaMap[jogo.fkEmpresa] || '...'}</td>
                    <td>
                      <div style={{display: 'flex', gap: '10px'}}>
                        <i 
                          className="fas fa-edit action-icon icon-edit"
                          title="Editar"
                          onClick={() => handleEditClick(jogo)}
                          style={{cursor: 'pointer'}}
                        ></i>
                        <i 
                          className="fas fa-trash-alt action-icon icon-delete"
                          title="Excluir"
                          onClick={() => handleDeleteClick(jogo)}
                          style={{cursor: 'pointer'}}
                        ></i>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. MODAL DE EXCLUSÃO */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Excluir Jogo?</h3>
            <p>
              Tem certeza que deseja excluir <strong>"{gameToDelete?.nome}"</strong>?
              <br />
              <span style={{color: '#e53935', fontSize: '0.9em'}}>Esta ação é permanente.</span>
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button className="btn-confirm" onClick={confirmDelete} style={{backgroundColor: '#e53935', color: '#fff'}}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. NOTIFICAÇÃO TOAST */}
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

export default AdminJogos;