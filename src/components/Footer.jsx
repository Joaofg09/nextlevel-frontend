import React, { useState } from 'react';
import styles from './Footer.module.css';

function Footer() {
  // Estado para controlar qual modal está aberto (null, 'privacy', 'terms')
  const [activeModal, setActiveModal] = useState(null);

  // Função para fechar o modal
  const closeModal = () => setActiveModal(null);

  return (
    <>
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
            {/* Botão Política de Privacidade */}
            <button 
              type="button" 
              className={styles.fakeLink} 
              onClick={() => setActiveModal('privacy')}
              aria-label="Ver política de privacidade"
            >
              Política de Privacidade
            </button>
            
            <span aria-hidden="true">•</span>
            
            {/* Botão Termos de Uso */}
            <button 
              type="button" 
              className={styles.fakeLink} 
              onClick={() => setActiveModal('terms')}
              aria-label="Ver termos de uso"
            >
              Termos de Uso
            </button>
          </div>

          <p className={styles.copyNote}>
            Projeto acadêmico desenvolvido para fins estudantis — sem fins comerciais.
          </p>

        </nav>
      </footer>

      {/* === MODAIS (Renderizados condicionalmente) === */}
      
      {/* MODAL DE POLÍTICA DE PRIVACIDADE */}
      {activeModal === 'privacy' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content legal-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Política de Privacidade</h2>
            
            <h3>1. Coleta de Dados</h3>
            <p>A NextLevel coleta apenas os dados estritamente necessários para o funcionamento da plataforma, incluindo nome, e-mail e data de nascimento para fins de cadastro e verificação de idade.</p>
            
            <h3>2. Uso das Informações</h3>
            <p>As informações coletadas são utilizadas exclusivamente para:</p>
            <ul>
                <li>Gerenciar sua conta e acesso à biblioteca de jogos.</li>
                <li>Processar pedidos e gerar chaves de ativação.</li>
                <li>Personalizar sua experiência na loja.</li>
            </ul>

            <h3>3. Segurança</h3>
            <p>Levamos a sua segurança a sério. Todas as senhas são criptografadas antes de serem salvas no nosso banco de dados. Não compartilhamos seus dados com terceiros para fins comerciais.</p>

            <h3>4. Cookies</h3>
            <p>Utilizamos armazenamento local (Local Storage) apenas para manter sua sessão ativa e salvar suas preferências de tema (modo claro/escuro).</p>

            <div className="modal-actions" style={{marginTop: '30px'}}>
                <button className="btn-confirm" onClick={closeModal}>Entendi</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE TERMOS DE USO */}
      {activeModal === 'terms' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content legal-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Termos de Uso</h2>
            
            <h3>1. Aceitação</h3>
            <p>Ao criar uma conta na NextLevel, você concorda com estes termos. Este é um projeto acadêmico e todos os produtos listados são fictícios ou chaves de simulação.</p>

            <h3>2. Uso da Plataforma</h3>
            <p>Você concorda em utilizar a plataforma apenas para fins legais. É proibido:</p>
            <ul>
                <li>Tentar invadir ou comprometer a segurança do site.</li>
                <li>Usar scripts automatizados para coleta de dados.</li>
                <li>Desrespeitar outros usuários nos comentários e avaliações.</li>
            </ul>

            <h3>3. Propriedade Intelectual</h3>
            <p>Todas as imagens e nomes de jogos são propriedade de seus respectivos desenvolvedores e publishers. Este site utiliza esse material sob o conceito de "Fair Use" para fins educacionais.</p>

            <h3>4. Compras e Reembolsos</h3>
            <p>Como este é um ambiente de simulação, nenhuma cobrança real é efetuada e nenhum reembolso real pode ser processado.</p>

            <div className="modal-actions" style={{marginTop: '30px'}}>
                <button className="btn-confirm" onClick={closeModal}>Concordo</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Footer;