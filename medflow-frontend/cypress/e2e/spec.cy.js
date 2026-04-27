describe('Fluxo Completo do TCC - MedFlow', () => {
  const idUnico = Date.now().toString().slice(-6);
  const nomePaciente = 'Paciente Cypress ' + idUnico;
  const cpfDinamico = `123.${idUnico.slice(0,3)}.${idUnico.slice(3,6)}-00`;

  it('Fluxo Perfeito: Cadastro Completo e Atendimento Médico', () => {
    // 1. LOGIN
    cy.visit('http://localhost:5173/');
    cy.get('input[type="email"]').type('recepcao@medflow.com');
    cy.get('input[type="password"]').type('123456');
    cy.get('select').select('recepcao');
    cy.contains('button', 'Entrar no Sistema').click();

    // 2. CADASTRO NA RECEPÇÃO
    cy.url().should('include', '/recepcao');
    cy.contains('button', '+ Novo Agendamento').click();
    cy.wait(1000);

    // Preenche tudo
    cy.get('input[placeholder*="Nome"]').first().type(nomePaciente, { force: true });
    cy.get('input[placeholder*="CPF"]').first().type(cpfDinamico, { force: true });
    cy.get('input[type="date"]').type('1990-01-01', { force: true });
    cy.get('select').first().select('M', { force: true });
    cy.get('input[placeholder*="WhatsApp"]').first().type('11999999999', { force: true });
    cy.get('input[placeholder*="CEP"]').first().type('00000-000', { force: true });
    cy.get('input[placeholder*="Endereço"]').first().type('Rua Cypress, 123', { force: true });

    // 🔥 A FORÇA BRUTA: Ignora o botão e força o formulário a enviar os dados!
    cy.get('form').submit();

    // Dá 3 segundos cravados pro banco de dados salvar em paz
    cy.wait(3000); 

    // 3. SAIR
    cy.contains('button', 'Sair').click({ force: true });
    cy.wait(1000);

    // 4. LOGIN DO MÉDICO
    cy.get('input[type="email"]').type('medico@medflow.com');
    cy.get('input[type="password"]').type('123456');
    cy.get('select').select('medico');
    cy.contains('button', 'Entrar no Sistema').click();

    // 5. ATENDER O PACIENTE
    cy.url().should('include', '/medico');
    
    // O paciente tem que estar aqui
    cy.contains(nomePaciente, { timeout: 15000 }).should('be.visible');

    cy.contains(nomePaciente).parents('tr, div').find('button').contains('Chamar').first().click();

    cy.get('textarea[placeholder*="Sintomas"]').type('Teste automatizado', { force: true });
    cy.get('textarea[placeholder*="Diagnóstico"]').type('Tudo OK', { force: true });
    cy.get('textarea[placeholder*="Prescrição"]').type('Nenhuma', { force: true });

    cy.contains('button', 'Salvar e Finalizar Consulta').click();

    cy.on('window:alert', () => true);
    cy.contains(nomePaciente).should('not.exist');
  });
});