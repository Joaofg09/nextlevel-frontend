// No arquivo: src/pages/AdminJogos.js
// VERSÃO 9 - Com Filtro de Categoria Inteligente

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminJogos() {
  // === ESTADOS (sem mudança) ===
  const [jogos, setJogos] = useState([]);
  const [categorias, setCategorias] = useState([]); // Esta é a lista "suja"
  const [empresas, setEmpresas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState(''); // Guarda o ID da categoria
  const [sortCriteria, setSortCriteria] = useState('id-asc');
  const [formState, setFormState] = useState({
    nome: '', preco: '', fkCategoria: '', ano: '', descricao: '', fkEmpresa: ''
  });
  const [editingId, setEditingId] = useState(null); 

  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // =================================================================
  // LÓGICA DE "TRADUÇÃO" DE IDs
  // =================================================================
  const categoriaMap = useMemo(() => {
    // { 3: 'RPG', 14: ' RPG' }
    return categorias.reduce((acc, cat) => {
      acc[cat.id] = cat.nome;
      return acc;
    }, {});
  }, [categorias]);

  const empresaMap = useMemo(() => {
    return empresas.reduce((acc, emp) => {
      acc[emp.id] = emp.nome;
      return acc;
    }, {});
  }, [empresas]);

  // =================================================================
  // NOVA LÓGICA: Criar lista limpa para o Dropdown de Filtro
  // =================================================================
  const categoriasParaDropdown = useMemo(() => {
    const nomesVistos = new Set();
    const listaLimpa = [];

    categorias.forEach(cat => {
      const nomeLimpo = cat.nome.trim(); // " RPG" vira "RPG"
      if (!nomesVistos.has(nomeLimpo)) {
        nomesVistos.add(nomeLimpo);
        listaLimpa.push({
          ...cat, // Mantém o ID original (ex: 3)
          nome: nomeLimpo // Mas usa o nome limpo
        });
      }
    });

    // Ordena alfabeticamente
    listaLimpa.sort((a, b) => a.nome.localeCompare(b.nome));
    return listaLimpa;
  }, [categorias]);

  // =================================================================
  // FUNÇÃO PARA CARREGAR DADOS (sem mudança)
  // =================================================================
  const fetchData = () => {
    const token = localStorage.getItem('token');
    const secureFetch = (url) => {
      return fetch(url, { headers: { 'Authorization': `Bearer ${token}` }})
        .then(res => {
          if (res.status === 401) {
            alert('Sua sessão expirou. Por favor, faça login novamente.');
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
      if (Array.isArray(categoriasData)) setCategorias(categoriasData); // Pega a lista "suja"
      if (Array.isArray(empresasData)) setEmpresas(empresasData);
    })
    .catch(err => console.error("Erro ao buscar dados:", err.message));
  };

  useEffect(() => {
    fetchData();
  }, [navigate, logout]); // eslint-disable-line react-hooks/exhaustive-deps

  // =================================================================
  // LÓGICA DO FORMULÁRIO (sem mudança)
  // =================================================================
  const clearForm = () => {
    setFormState({
      nome: '', preco: '', fkCategoria: '', ano: '', descricao: '', fkEmpresa: ''
    });
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
    window.scrollTo(0, 0); 
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); 
    const anoInt = parseInt(formState.ano);
    const anoAtual = new Date().getFullYear();
    if (anoInt > anoAtual) {
      alert(`O ano de lançamento (${anoInt}) não pode ser maior que o ano atual (${anoAtual}).`);
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
        alert(`Jogo ${isUpdating ? 'atualizado' : 'cadastrado'} com sucesso!`);
        clearForm();
        fetchData(); 
      } else {
        const data = await response.json();
        alert(`Erro: ${data.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
    }
  };

  // =================================================================
  // FUNÇÃO DE EXCLUSÃO (sem mudança)
  // =================================================================
  const handleDeleteClick = async (jogo) => {
    if (!window.confirm(`Tem certeza que deseja excluir o jogo "${jogo.nome}" (ID: ${jogo.id})?`)) {
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/v1/jogos/${jogo.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Jogo excluído com sucesso!');
        setJogos(jogosAtuais => jogosAtuais.filter(j => j.id !== jogo.id));
      } else {
        const data = await response.json();
        alert(`Erro ao excluir: ${data.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro ao excluir jogo:", error);
    }
  };

  // =================================================================
  // NOVA LÓGICA: Filtro Inteligente
  // =================================================================
  const jogosFiltrados = useMemo(() => {
    let lista = [...jogos];

    if (searchTerm) {
      lista = lista.filter(jogo => 
        jogo.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de Categoria Inteligente
    if (filterCategory) { // filterCategory é o ID da categoria "limpa" (ex: 3)
      // 1. Pega o nome limpo da categoria selecionada (ex: "RPG")
      const nomeLimpoSelecionado = categoriaMap[filterCategory]?.trim();

      if (nomeLimpoSelecionado) {
        lista = lista.filter(jogo => {
          // 2. Pega o nome da categoria do jogo (ex: " RPG")
          const nomeLimpoJogo = categoriaMap[jogo.fkCategoria]?.trim();
          // 3. Compara os nomes limpos (ex: "RPG" === "RPG")
          return nomeLimpoJogo === nomeLimpoSelecionado;
        });
      }
    }

    // Ordenação (sem mudança)
    if (sortCriteria === 'preco-desc') {
      lista.sort((a, b) => b.preco - a.preco);
    } else if (sortCriteria === 'titulo-asc') {
      lista.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (sortCriteria === 'id-asc') {
      lista.sort((a, b) => a.id - b.id);
    }
    return lista;
  }, [jogos, searchTerm, filterCategory, sortCriteria, categoriaMap]); // Adicionado categoriaMap

  // =================================================================
  // RENDERIZAÇÃO DO COMPONENTE (JSX)
  // =================================================================
  return (
    <div className="main-content-area">
      <div className="admin-container">
        
        <h1 className="admin-section-title">
          {editingId ? `Editando Jogo (ID: ${editingId})` : 'Cadastrar Novo Jogo'}
        </h1>
        <div className="cadastro-box">
          {/* O formulário de cadastro não mudou */}
          <form id="cadastro-jogo-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Todos os inputs do formulário (sem mudança) */}
              <div className="input-group">
                <label htmlFor="titulo">Título:</label>
                <input type="text" id="titulo" name="titulo" required 
                       value={formState.nome} 
                       onChange={(e) => setFormState({...formState, nome: e.target.value})} />
              </div>
              <div className="input-group preco-group">
                <label htmlFor="preco">Preço:</label>
                <input type="number" step="0.01" id="preco" name="preco" placeholder="0.00" required
                       value={formState.preco} 
                       onChange={(e) => setFormState({...formState, preco: e.target.value})} />
              </div>
              <div className="input-group">
                <label htmlFor="categoria">Categoria:</label>
                <select id="categoria" name="categoria" required
                        value={formState.fkCategoria} 
                        onChange={(e) => setFormState({...formState, fkCategoria: e.target.value})}>
                  <option value="">Selecione uma categoria</option>
                  {/* O dropdown do *formulário* usa a lista limpa */}
                  {categoriasParaDropdown.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label htmlFor="ano">Ano de Lançamento:</label>
                <input type="number" id="ano" name="ano" placeholder="AAAA" maxLength="4" required
                       value={formState.ano} 
                       onChange={(e) => setFormState({...formState, ano: e.target.value})} />
              </div>
              <div className="input-group full-width">
                <label htmlFor="descricao">Descrição:</label>
                <textarea id="descricao" name="descricao" placeholder="Escreva sua descrição sobre o jogo aqui." required
                          value={formState.descricao} 
                          onChange={(e) => setFormState({...formState, descricao: e.target.value})}></textarea>
              </div>
              <div className="input-group full-width">
                <label htmlFor="desenvolvedora">Desenvolvedora (Empresa):</label>
                <select id="desenvolvedora" name="desenvolvedora" required
                        value={formState.fkEmpresa} 
                        onChange={(e) => setFormState({...formState, fkEmpresa: e.target.value})}>
                  <option value="">Selecione uma empresa</option>
                  {empresas.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nome}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-cadastrar">
                {editingId ? 'Atualizar Jogo' : 'Cadastrar Jogo'}
              </button>
              {editingId && (
                <button type="button" className="btn-cancelar" onClick={clearForm}>
                  Cancelar Edição
                </button>
              )}
            </div>
          </form>
        </div>
        
        <h1 className="admin-section-title list-title">Listar Jogos</h1>
        
        <div className="listagem-box">
          <div className="filter-bar">
            {/* ... (search) ... */}
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
            
            {/* === DROPDOWN DE FILTRO ATUALIZADO === */}
            <select 
              id="select-categoria" 
              className="select-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Todas as Categorias</option>
              {/* Usa a lista de categorias limpa, sem duplicatas */}
              {categoriasParaDropdown.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
            
            {/* ... (sort) ... */}
            <select 
              id="select-classificar" 
              className="select-filter"
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value)}
            >
              <option value="id-asc">Classificar por: ID (Crescente)</option>
              <option value="titulo-asc">Classificar por: Título (A-Z)</option>
              <option value="preco-desc">Classificar por: Preço (Maior)</option>
            </select>
          </div>

          <div className="tabela-jogos-container">
            <table className="tabela-jogos">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título do Jogo</th>
                  <th>Preço</th>
                  <th>Categoria</th>
                  <th>Empresa</th>
                  <th>Editar</th>
                  <th>Excluir</th>
                </tr>
              </thead>
              <tbody>
                {/* A tabela usa 'jogosFiltrados' e os 'mapas' */}
                {jogosFiltrados.map(jogo => (
                  <tr key={jogo.id}>
                    <td>{jogo.id}</td>
                    <td>{jogo.nome}</td>
                    <td className="preco-tabela">$ {jogo.preco ? jogo.preco.toFixed(2) : '0.00'}</td>
                    {/* Tradução usando o mapa (ex: categoriaMap[14] -> " RPG") */}
                    <td>{categoriaMap[jogo.fkCategoria] || '...'}</td>
                    <td>{empresaMap[jogo.fkEmpresa] || '...'}</td>
                    <td>
                      <i 
                        className="fas fa-edit action-icon icon-edit"
                        onClick={() => handleEditClick(jogo)}
                      ></i>
                    </td>
                    <td>
                      <i 
                        className="fas fa-trash-alt action-icon icon-delete"
                        onClick={() => handleDeleteClick(jogo)}
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

export default AdminJogos;