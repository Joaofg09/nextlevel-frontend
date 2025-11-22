// src/components/ExploreCategories.js
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './ExploreCategories.module.css';
import homeStyles from './Home.module.css'; 

// Dados de exemplo (SUBSTITUA PELOS SEUS DADOS REAIS DA API)
const categoriesData = [
    { name: 'TERROR', slug: 'terror' },
    { name: 'COMÉDIA', slug: 'comedia' },
    { name: 'AÇÃO', slug: 'acao' },
    { name: 'DRAMA', slug: 'drama' },
    { name: 'FANTASIA & FICÇÃO CIENTÍFICA', slug: 'fantasia-ficcao' },
];

// O componente agora espera a lista de categorias como prop
function ExploreCategories({ categories = categoriesData }) {

    const gridRef = useRef(null);

    // NOVO: Função para rolar
    const scroll = (direction) => {
    if (gridRef.current) {
        const scrollAmount = gridRef.current.clientWidth / 2;
        
        // NOVO: Use scrollLeft com um objeto de opções para suavização
        gridRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth' // ISTO ADICIONA A SUAVIZAÇÃO
        });
    }
};

    return (
        <section className={styles.exploreSection}>
            <h2>Explore por categorias</h2>
           <div className={styles.carouselContainer}> 

                {/* Botão de navegação esquerda */}
                <button 
                    className={`${styles.arrow} ${styles.left}`} 
                    onClick={() => scroll('left')}
                    aria-label="Anterior"
                >
                    &lt;
                </button>

                {/* O elemento que será rolado, agora com a referência */}
                <div className={styles.categoryGrid} ref={gridRef}> 
                    {categories.map((category) => (
                        <Link 
                            key={category.slug} 
                            to={`/categoria/${category.slug}`} 
                            className={homeStyles['card-link']}
                        >
                            <div className={homeStyles.card}>
                                {category.name}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Botão de navegação direita */}
                <button 
                    className={`${styles.arrow} ${styles.right}`} 
                    onClick={() => scroll('right')}
                    aria-label="Próximo"
                >
                    &gt;
                </button>
            </div>
        </section>
    );
}

export default ExploreCategories;