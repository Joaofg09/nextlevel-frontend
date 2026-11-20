<h1 align="center">🎮 NextLevel — Loja de Jogos Digitais</h1>

<p align="center">
  Front-end de um e-commerce de jogos digitais, com área do cliente, carrinho, biblioteca e painel administrativo.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/React%20Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="React Router 7" />
  <img src="https://img.shields.io/badge/JWT-Autentica%C3%A7%C3%A3o-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/CSS%20Modules-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS Modules" />
</p>

---

## 📌 Sobre o projeto

O **NextLevel** é uma loja de jogos digitais desenvolvida como projeto acadêmico em equipe. Este repositório contém o **front-end em React**, que consome uma API REST (`/api/v1`) mantida em um repositório separado.

A aplicação tem dois tipos de usuário: **cliente**, que navega, compra e organiza seus jogos, e **administrador**, que gerencia o catálogo, as empresas, os usuários e acompanha as vendas.

> A pesquisa e os protótipos de usabilidade da interface estão no repositório [A3_usabilidade](https://github.com/Joaofg09/A3_usabilidade).

## ✨ Funcionalidades

### 🛒 Loja (pública)
- Página inicial com carrossel de destaques e navegação por categorias
- Busca de jogos por nome em tempo real
- Página de detalhes do jogo com média de avaliações
- Páginas por categoria (`/loja/categoria/:slug`)
- Alternância entre **modo claro e escuro**, com a preferência salva no navegador

### 👤 Área do cliente
- Cadastro com validação de senha (mínimo de 8 caracteres, com letras e números)
- Login com **JWT**: o token é guardado no `localStorage` e decodificado para identificar o usuário e o perfil
- **Carrinho**, revisão do pedido e checkout
- **Biblioteca** com os jogos comprados
- **Lista de desejos**
- Histórico de compras
- "Meus dados", com troca de senha

### 🛠️ Painel administrativo
- CRUD de **jogos** e **empresas** (criar, editar e excluir)
- Gerenciamento de **usuários**
- **Relatório** dos jogos mais vendidos

### 🔒 Controle de acesso
As rotas privadas usam um componente `ProtectedRoute`: visitantes sem login são redirecionados e as rotas `/loja/admin/*` só abrem para usuários com perfil **Administrador**.

## 🧱 Tecnologias

| Camada | Ferramentas |
|---|---|
| Interface | React 19, CSS Modules |
| Rotas | React Router 7 |
| Autenticação | JWT (`jwt-decode`) + Context API (`AuthContext`) |
| Testes | Testing Library (Jest) |
| Build | Create React App (`react-scripts`) |

## 📁 Estrutura

```
src/
├── components/   # Header, Footer, Carrossel, GameCard, ProtectedRoute...
├── context/      # AuthContext (sessão e token JWT)
├── data/         # Categorias.json
├── pages/        # Home, Login, Cadastro, Carrinho, Biblioteca, Admin*...
└── App.js        # Definição das rotas
```

## 🚀 Como rodar

### Pré-requisitos
- [Node.js](https://nodejs.org/) 18 ou superior
- A **API do NextLevel** rodando em `http://localhost:3000` (as chamadas usam `http://localhost:3000/api/v1`)

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/Joaofg09/nextlevel-frontend.git
cd nextlevel-frontend

# 2. Instale as dependências
npm install

# 3. Inicie em outra porta, já que a API ocupa a 3000
# Linux/macOS:
PORT=3001 npm start
# Windows (PowerShell):
$env:PORT=3001; npm start
```

Acesse **http://localhost:3001** e você será levado para a loja (`/loja`).

### Scripts

| Comando | O que faz |
|---|---|
| `npm start` | Ambiente de desenvolvimento com recarregamento automático |
| `npm test` | Executa os testes |
| `npm run build` | Gera a versão de produção na pasta `build/` |

## 🗺️ Rotas principais

| Rota | Acesso |
|---|---|
| `/loja` | Público |
| `/loja/jogo/:id` · `/loja/categoria/:slug` | Público |
| `/login` · `/cadastro` | Público |
| `/loja/carrinho` · `/loja/revisar-pedido` · `/loja/biblioteca` · `/loja/lista-desejos` · `/loja/historico` · `/loja/meus-dados` | Cliente logado |
| `/loja/admin/jogos` · `/loja/admin/empresas` · `/loja/admin/usuarios` · `/loja/admin/relatorios` | Administrador |

---

<p align="center">
  Feito por <a href="https://github.com/Joaofg09">João Pedro</a> · projeto acadêmico, sem fins comerciais
</p>
