// No ficheiro: src/pages/RelatoriosPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RelatoriosPage() {
  const [jogosMaisVendidos, setJogosMaisVendidos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');

  // 1. Busca os dados do relatório
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');

    // Função de utilidade para o fetch seguro, assumindo que está disponível globalmente ou aqui
    const secureFetch = (url) => {
      return fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => {
          if (res.status === 401) { logout(); navigate('/login'); throw new Error('Sessão expirada'); }
          if (res.status === 204) return [];
          return res.json();
        });
    };

    // top=10 para top=100 para filtrar localmente.
    const relatorioUrl = 'http://localhost:3000/api/v1/relatorios/jogos-mais-vendidos?top=100';
    const empresasUrl = 'http://localhost:3000/api/v1/empresas';

    // CONSOLIDAR as duas chamadas de API em uma única Promise.all
    Promise.all([
      secureFetch(relatorioUrl),
      secureFetch(empresasUrl)
    ])
      .then(([relatorioData, empresasData]) => {
        if (Array.isArray(relatorioData)) setJogosMaisVendidos(relatorioData);
        if (Array.isArray(empresasData)) setEmpresas(empresasData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar dados:", err.message);
        setLoading(false);
      });
  }, [user, navigate, logout]); // Dependências do useEffect

  // NOVO: LÓGICA DE FILTRAGEM (empresaMap e useMemo)

  // Cria um mapa para traduzir o ID da empresa para o NOME 
  const empresaMap = useMemo(() => {
    return empresas.reduce((acc, emp) => {
      acc[emp.id] = emp.nome;
      return acc;
    }, {});
  }, [empresas]);

  // Lista final de jogos filtrados
  const relatorioFiltrado = useMemo(() => {
    let lista = [...jogosMaisVendidos];

    // FILTRO 1: Por Nome do Jogo
    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      lista = lista.filter(jogo =>
        jogo.nome.toLowerCase().includes(termo)
      );
    }

    // FILTRO 2: Por Empresa
    if (filterEmpresa) {
      const empresaId = parseInt(filterEmpresa);
      // Obtém o nome da empresa a partir do ID selecionado (o valor do dropdown)
      const nomeEmpresaSelecionada = empresaMap[empresaId];

      if (nomeEmpresaSelecionada) {
        lista = lista.filter(jogo =>
          // Compara o nome da empresa no DTO do relatório com o nome da empresa selecionada
          jogo.empresa.toLowerCase() === nomeEmpresaSelecionada.toLowerCase()
        );
      }
    }

    // Retorna a lista processada
    return lista;

  }, [jogosMaisVendidos, searchTerm, filterEmpresa, empresaMap]);


  if (loading) {
    return (
      <div className="main-content-area">
        <h1 className="page-title">Relatório de Vendas</h1>
        <p>A carregar...</p>
      </div>
    );
  }

  // 3. Renderiza a tabela e os filtros
  return (
    <div className="main-content-area">
      <div className="admin-container">
        <h1 className="admin-section-title">Relatório de Jogos Mais Vendidos</h1>

        {/*  BARRA DE FILTRO  */}
        <div className="filter-bar" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          {/* FILTRO POR NOME DO JOGO (Input de Texto) */}
          <div className="search-input-group">
            <i className="fas fa-search"></i>
            <input
              type="text"
              id="input-busca-jogo"
              placeholder="Pesquisar Nome do Jogo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#1e1e1e', color: 'white' }}
            />
          </div>

          {/* FILTRO POR EMPRESA (Dropdown) */}
          <select
            id="select-empresa-filter"
            value={filterEmpresa}
            onChange={(e) => setFilterEmpresa(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#1e1e1e', color: 'white' }}
          >
            <option value="">Todas as Empresas</option>
            {empresas.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nome}</option>
            ))}
          </select>
        </div>

        <div className="listagem-box">
          <div className="tabela-jogos-container">
            <table className="tabela-jogos">
              <thead>
                <tr>
                  <th>Nome do Jogo</th>
                  <th>Empresa</th>
                  <th>Total de Vendas</th>
                </tr>
              </thead>
              <tbody>
                {/* Usar relatorioFiltrado em vez de jogosMaisVendidos */}
                {relatorioFiltrado.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>
                      {searchTerm || filterEmpresa ? "Nenhum jogo encontrado com os filtros aplicados." : "Nenhuma venda registrada ainda."}
                    </td>
                  </tr>
                ) : (
                  relatorioFiltrado.map((jogo, index) => (
                    <tr key={index}>
                      <td>{jogo.nome}</td>
                      <td>{jogo.empresa}</td>
                      <td style={{ fontWeight: 'bold', color: '#39FF14' }}>{jogo.total}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RelatoriosPage;