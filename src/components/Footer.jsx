import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <nav aria-label="Informações do site" className={styles.footerContent}>
        
        <p>© 2025 NextLevel — Todos os direitos reservados.</p>

        <p>
          Suporte:{" "}
          <a
            href="mailto:suporte@NextLevel.com"
            aria-label="Enviar e-mail para o suporte da GameStore"
          >
            suporte@NextLevel.com
          </a>
        </p>

        <div className={styles.links}>
          <a href="#" aria-label="Ver política de privacidade">Política de Privacidade</a>
          <span aria-hidden="true">•</span>
          <a href="#" aria-label="Ver termos de uso">Termos de Uso</a>
        </div>

        <p className={styles.copyNote}>
          Projeto acadêmico desenvolvido para fins estudantis — sem fins comerciais.
        </p>

      </nav>
    </footer>
  );
}

export default Footer;
