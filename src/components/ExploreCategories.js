import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './ExploreCategories.module.css';
import homeStyles from './Home.module.css';

const categoriesData = [
    { name: 'RPG', slug: 'rpg' },
    { name: 'AÇÃO', slug: 'acao' },
    { name: 'AVENTURA', slug: 'aventura' },
    { name: 'TIRO', slug: 'tiro' },
    { name: 'SIMULAÇÃO', slug: 'simulacao' },
];

function ExploreCategories({ categories = categoriesData }) {
    const gridRef = useRef(null);

    // DUPLICA A LISTA PARA O LOOP
    const loopedCategories = [...categories, ...categories];

    // AUTO AJUSTE DO LOOP INFINITO
    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;

        const handleScroll = () => {
            const maxScroll = grid.scrollWidth / 2;

            // Se passou da metade → volta para o início
            if (grid.scrollLeft >= maxScroll) {
                grid.scrollLeft = 1;
            }

            // Se rolar demais pra esquerda → volta para a segunda metade
            if (grid.scrollLeft <= 0) {
                grid.scrollLeft = maxScroll - 1;
            }
        };

        grid.addEventListener("scroll", handleScroll);
        return () => grid.removeEventListener("scroll", handleScroll);
    }, []);

    // Botões de rolagem
    const scroll = (direction) => {
        const grid = gridRef.current;
        if (!grid) return;

        const scrollAmount = grid.clientWidth / 1.5;

        grid.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <section className={styles.exploreSection}>
            <h2>Explore por categorias</h2>

            <div className={styles.carouselContainer}>
                <button
                    className={`${styles.arrow} ${styles.left}`}
                    onClick={() => scroll("left")}
                    aria-label="Anterior"
                >
                    &lt;
                </button>

                <div className={styles.categoryGrid} ref={gridRef}>
                    {loopedCategories.map((category, index) => (
                        <Link
                            key={index}
                            to={`/categoria/${category.slug}`}
                            className={homeStyles['card-link']}
                        >
                            <div className={homeStyles.card}>
                                {category.name}
                            </div>
                        </Link>
                    ))}
                </div>

                <button
                    className={`${styles.arrow} ${styles.right}`}
                    onClick={() => scroll("right")}
                    aria-label="Próximo"
                >
                    &gt;
                </button>
            </div>
        </section>
    );
}

export default ExploreCategories;
