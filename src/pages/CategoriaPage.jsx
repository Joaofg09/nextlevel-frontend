import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from '../components/Home.module.css';

function normalizar(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function CategoriaPage() {
  const { slug } = useParams(); // exemplo: "acao", "simulacao", "rpg"
  const [jogos, setJogos] = useState([]);

  useEffect(() => {
    async function fetchDados() {
      const token = localStorage.getItem("token");

      // 1 — BUSCAR JOGOS
      const resJogos = await fetch("http://localhost:3000/api/v1/jogos", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const listaJogos = await resJogos.json();

      // 2 — BUSCAR CATEGORIAS
      const resCategorias = await fetch("http://localhost:3000/api/v1/categorias", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const listaCategorias = await resCategorias.json();

      // 3 — MAPEAR ID → NOME
      const categoriaMap = {};
      listaCategorias.forEach(c => {
        categoriaMap[c.id] = normalizar(c.nome);
      });

      // 4 — NORMALIZAR O SLUG DA URL
      const slugNormalizado = normalizar(slug);

      // 5 — FILTRAR JOGOS PELA CATEGORIA
      const filtrados = listaJogos.filter(jogo =>
        categoriaMap[jogo.fkCategoria] === slugNormalizado
      );

      setJogos(filtrados);
    }

    fetchDados();
  }, [slug]); // roda sempre que o slug mudar

  return (
    <div className="main-container" style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>
        Jogos da categoria: {slug.toUpperCase()}
      </h2>

      {jogos.length === 0 ? (
        <p>Nenhum jogo encontrado.</p>
      ) : (
        <div className={styles.grid}>
          {jogos.map(jogo => (
            <Link to={`/jogo/${jogo.id}`} key={jogo.id} className={styles['card-link']}>
              <div className={styles.card}>{jogo.nome}</div>
              <div className={styles.priceTag}>
                R$ {jogo.preco.toFixed(2).replace('.', ',')}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoriaPage;
