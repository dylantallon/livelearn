describe('Teacher Flow', () => {
    it('should navigate Poll screen, add a poll, and see Start Session button', () => {
      cy.visit('/poll'); // ✅ Adjust if needed based on your router
  
      cy.contains('New Poll').click();
  
      cy.contains('Start Session').should('exist');
    });
  
    it('should navigate Edit screen and add a question', () => {
      cy.visit('/edit', {
        onBeforeLoad: (win: any) => { // ✅ no more AUTWindow problem
          win.sessionStorage.setItem('pollId', 'test-poll-id');
        }
      });
  
      cy.contains('Add Question').click();
      cy.contains('Checkbox Question').click();
    });
  
    it('should navigate Score screen', () => {
      cy.visit('/scores', {
        onBeforeLoad: (win: any) => {
          win.sessionStorage.setItem('pollId', 'test-poll-id');
        }
      });
  
      cy.contains('Loading...').should('exist');
    });
  
    it('should navigate Session screen and see session controls', () => {
      cy.visit('/session', {
        onBeforeLoad: (win: any) => {
          win.sessionStorage.setItem('pollId', 'test-poll-id');
        }
      });
  
      cy.contains('Show Answer').should('exist');
      cy.contains('End Session').should('exist');
    });
  });
  