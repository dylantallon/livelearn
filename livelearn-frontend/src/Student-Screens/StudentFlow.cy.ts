describe('Student Full Flow', () => {
    beforeEach(() => {
      cy.visit('/student'); // Adjust this if your StudentScreen route is different
    });
  
    it('selects an answer for MCQ and navigates through stages', () => {
      cy.contains('Submit').should('exist');
      
      // Pick first option
      cy.get('.choice').first().click();
      cy.contains('Submit').click();
      
      // Should show Result screen
      cy.get('.result-choice').should('exist');
  
      // Move to Feedback
      cy.get('.next-btn').click();
      cy.get('.result-choice').should('exist');
  
      // Move to next question
      cy.get('.next-btn').click();
    });
  
    it('types an answer for FRQ and navigates', () => {
      cy.get('textarea').type('Sample Answer');
      cy.contains('Submit').click();
      cy.get('.frq-result-answer-box').should('contain', 'Sample Answer');
  
      cy.get('.next-btn').click();
      cy.get('.frq-feedback-boxes').should('exist');
  
      cy.get('.next-btn').click();
    });
  
    it('selects multiple answers for Checkbox and submits', () => {
      cy.get('.choice').eq(0).click();
      cy.get('.choice').eq(2).click();
      cy.contains('Submit').click();
  
      cy.get('.result-choice').should('exist');
      cy.get('.next-btn').click();
      cy.get('.result-choice').should('exist');
  
      cy.get('.next-btn').click();
    });
  
    it('reaches final score screen', () => {
      cy.contains('Your Score:').should('exist');
    });
  });
  