describe('Suíte de Testes MedFlow Pro', () => {
  const loginUrl = 'http://localhost:5173/';
  const adminUrl = 'http://localhost:5173/admin';

  beforeEach(() => {
    // Ajuste a URL se o seu Vite estiver em outra porta
    cy.visit(adminUrl);
  });

  it('Deve validar o Dashboard e os cards de métricas', () => {
    cy.contains('PAINEL DO ADMINISTRADOR').should('be.visible');
    cy.contains('TOTAL DE PACIENTES').should('be.visible');
    cy.contains('FATURAMENTO ESTIMADO').should('be.visible');
  });

  it('Deve cadastrar um novo profissional na equipe', () => {
    cy.contains('Equipe / Staff').click();
    cy.get('input[placeholder="Nome"]').type('Dr. Teste Automatizado');
    cy.get('input[placeholder="E-mail"]').type('teste@medflow.com');
    cy.get('input[placeholder="Senha"]').type('123456');
    cy.get('select').select('MEDICO');
    cy.contains('button', 'Adicionar').click();
    
    cy.contains('Dr. Teste Automatizado').should('be.visible');
  });

  it('Deve gerenciar o estoque e validar a entrada de produtos', () => {
    cy.contains('Estoque').click();
    const produtoNome = `Luva Nitrílica ${Date.now()}`;
    
    cy.get('input[placeholder="Produto"]').type(produtoNome);
    cy.get('input[placeholder="Qtd"]').type('50');
    cy.get('input[placeholder="Custo"]').type('25.50');
    cy.contains('button', 'Salvar').click();

    cy.contains(produtoNome).should('be.visible');
  });

  it('Deve validar a lógica do Motor Financeiro (60/40)', () => {
    cy.contains('Financeiro').click();
    // Verifica se os cards de repasse e lucro estão renderizados
    cy.contains('REPASSE MÉDICO (60%)').should('be.visible');
    cy.contains('LUCRO CLÍNICA (40%)').should('be.visible');
  });

  it('Deve testar o disparo do formulário de campanhas', () => {
    cy.contains('Campanhas').click();
    cy.get('input[placeholder="Nome da Campanha"]').type('Campanha Novembro Azul');
    cy.get('textarea[placeholder="Mensagem do WhatsApp..."]').type('Olá, não esqueça seu exame preventivo!');
    
    // O teste apenas clica, o disparo real depende da API de Zap estar ativa
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });
    cy.contains('button', 'Disparar para Todos').click();
  });
});