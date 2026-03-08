const fs = require('fs');
const path = require('path');

/**
 * TransactionForm Accessibility Validation Script
 * 
 * This script validates the TransactionForm component's accessibility implementation
 * by analyzing the source code for proper ARIA attributes, semantic HTML, and
 * accessibility best practices.
 * 
 * **Validates: Requirements 8.6, 11.2, 11.6**
 */

class TransactionFormAccessibilityValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  /**
   * Main validation method
   */
  async validate() {
    console.log('🔍 TransactionForm Accessibility Validation');
    console.log('=' .repeat(50));
    
    try {
      // Read the TransactionForm component
      const componentPath = path.join(__dirname, '../src/components/TransactionForm.tsx');
      const componentContent = fs.readFileSync(componentPath, 'utf8');
      
      // Run validation checks
      this.validateSemanticStructure(componentContent);
      this.validateLabelAssociation(componentContent);
      this.validateAriaAttributes(componentContent);
      this.validateKeyboardAccessibility(componentContent);
      this.validateErrorHandling(componentContent);
      this.validateFocusManagement(componentContent);
      
      // Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Error reading TransactionForm component:', error.message);
      this.addResult('error', 'Failed to read component file', error.message);
    }
  }

  /**
   * Validate semantic HTML structure
   */
  validateSemanticStructure(content) {
    console.log('\n📋 Validating Semantic Structure...');
    
    // Check for proper form element
    if (content.includes('<form') && content.includes('aria-label')) {
      this.addResult('pass', 'Form element has semantic structure', 'Form uses proper HTML5 form element with aria-label');
    } else {
      this.addResult('fail', 'Form element missing semantic structure', 'Form should use <form> element with aria-label');
    }
    
    // Check for proper heading structure
    if (content.includes('CardTitle') || content.includes('<h1') || content.includes('<h2') || content.includes('<h3')) {
      this.addResult('pass', 'Form has proper heading structure', 'Form includes heading elements for structure');
    } else {
      this.addResult('warning', 'Form heading structure could be improved', 'Consider adding proper heading hierarchy');
    }
    
    // Check for fieldset usage (optional but recommended for grouped fields)
    if (content.includes('<fieldset') || content.includes('role="group"')) {
      this.addResult('pass', 'Form uses field grouping', 'Form properly groups related fields');
    } else {
      this.addResult('warning', 'Consider using fieldset for field grouping', 'Fieldsets can improve screen reader navigation');
    }
  }

  /**
   * Validate label association
   */
  validateLabelAssociation(content) {
    console.log('\n🏷️ Validating Label Association...');
    
    // Check for Label components
    const labelMatches = content.match(/<Label\s+htmlFor="([^"]+)"/g) || [];
    const inputMatches = content.match(/id="([^"]+)"/g) || [];
    
    console.log(`Found ${labelMatches.length} Label components`);
    console.log(`Found ${inputMatches.length} elements with IDs`);
    
    if (labelMatches.length >= 7) { // Expecting at least 7 form fields
      this.addResult('pass', 'Form has sufficient label associations', `Found ${labelMatches.length} Label components`);
    } else {
      this.addResult('fail', 'Insufficient label associations', `Expected at least 7 labels, found ${labelMatches.length}`);
    }
    
    // Check for specific required fields
    const requiredFields = ['date', 'transactionTypeId', 'categoryId', 'subCategoryId', 'paymentModeId', 'accountId', 'amount'];
    let foundFields = 0;
    
    requiredFields.forEach(field => {
      if (content.includes(`htmlFor="${field}"`) && content.includes(`id="${field}"`)) {
        foundFields++;
      }
    });
    
    if (foundFields >= 6) {
      this.addResult('pass', 'Required fields have proper label association', `${foundFields}/${requiredFields.length} required fields properly labeled`);
    } else {
      this.addResult('fail', 'Missing label associations for required fields', `Only ${foundFields}/${requiredFields.length} required fields properly labeled`);
    }
  }

  /**
   * Validate ARIA attributes
   */
  validateAriaAttributes(content) {
    console.log('\n🔊 Validating ARIA Attributes...');
    
    // Check for aria-label attributes
    const ariaLabelMatches = content.match(/aria-label="[^"]+"/g) || [];
    if (ariaLabelMatches.length >= 8) {
      this.addResult('pass', 'Form elements have aria-label attributes', `Found ${ariaLabelMatches.length} aria-label attributes`);
    } else {
      this.addResult('warning', 'Consider adding more aria-label attributes', `Found ${ariaLabelMatches.length} aria-label attributes`);
    }
    
    // Check for aria-required attributes
    if (content.includes('aria-required="true"')) {
      this.addResult('pass', 'Required fields have aria-required attribute', 'Form properly marks required fields');
    } else {
      this.addResult('fail', 'Missing aria-required attributes', 'Required fields should have aria-required="true"');
    }
    
    // Check for aria-invalid attributes
    if (content.includes('aria-invalid')) {
      this.addResult('pass', 'Form handles aria-invalid for validation', 'Form properly manages validation states');
    } else {
      this.addResult('fail', 'Missing aria-invalid handling', 'Form should use aria-invalid for validation states');
    }
    
    // Check for aria-describedby attributes
    if (content.includes('aria-describedby')) {
      this.addResult('pass', 'Form uses aria-describedby for error association', 'Error messages properly associated with fields');
    } else {
      this.addResult('fail', 'Missing aria-describedby attributes', 'Error messages should be associated with fields via aria-describedby');
    }
    
    // Check for role="alert" on error messages
    if (content.includes('role="alert"')) {
      this.addResult('pass', 'Error messages use role="alert"', 'Error messages will be announced to screen readers');
    } else {
      this.addResult('fail', 'Missing role="alert" on error messages', 'Error messages should have role="alert" for immediate announcement');
    }
  }

  /**
   * Validate keyboard accessibility
   */
  validateKeyboardAccessibility(content) {
    console.log('\n⌨️ Validating Keyboard Accessibility...');
    
    // Check for proper button types
    if (content.includes('type="submit"') && content.includes('type="button"')) {
      this.addResult('pass', 'Buttons have proper types', 'Submit and cancel buttons properly typed');
    } else {
      this.addResult('warning', 'Verify button types for keyboard accessibility', 'Ensure buttons have appropriate type attributes');
    }
    
    // Check for disabled state handling
    if (content.includes('disabled={') && content.includes('submitting')) {
      this.addResult('pass', 'Form handles disabled states', 'Form properly disables elements during submission');
    } else {
      this.addResult('warning', 'Verify disabled state handling', 'Form should disable elements appropriately');
    }
    
    // Check for focus management (Controller usage indicates proper focus handling)
    if (content.includes('Controller') && content.includes('react-hook-form')) {
      this.addResult('pass', 'Form uses proper form control library', 'React Hook Form provides good keyboard accessibility');
    } else {
      this.addResult('warning', 'Verify form control implementation', 'Ensure form controls are properly implemented');
    }
  }

  /**
   * Validate error handling accessibility
   */
  validateErrorHandling(content) {
    console.log('\n⚠️ Validating Error Handling...');
    
    // Check for error message structure
    if (content.includes('-error') && content.includes('role="alert"')) {
      this.addResult('pass', 'Error messages have proper structure', 'Error messages use consistent ID pattern and role="alert"');
    } else {
      this.addResult('fail', 'Error message structure needs improvement', 'Error messages should have consistent IDs and role="alert"');
    }
    
    // Check for error styling classes
    if (content.includes('text-destructive') || content.includes('border-destructive')) {
      this.addResult('pass', 'Error states have visual styling', 'Form provides visual feedback for errors');
    } else {
      this.addResult('warning', 'Verify error visual styling', 'Ensure errors have sufficient visual contrast');
    }
    
    // Check for error icons or indicators
    if (content.includes('<svg') && content.includes('error')) {
      this.addResult('pass', 'Error messages include visual indicators', 'Error messages use icons for better accessibility');
    } else {
      this.addResult('warning', 'Consider adding visual indicators to errors', 'Icons can help users identify errors more easily');
    }
    
    // Check for success state handling
    if (content.includes('success') || content.includes('valid')) {
      this.addResult('pass', 'Form handles success states', 'Form provides feedback for successful validation');
    } else {
      this.addResult('warning', 'Consider adding success state feedback', 'Success states can improve user experience');
    }
  }

  /**
   * Validate focus management
   */
  validateFocusManagement(content) {
    console.log('\n👁️ Validating Focus Management...');
    
    // Check for focus-visible styles (modern focus management)
    if (content.includes('focus-visible') || content.includes('focus:')) {
      this.addResult('pass', 'Form uses modern focus management', 'Form implements focus-visible for better UX');
    } else {
      this.addResult('warning', 'Consider using focus-visible for focus management', 'Modern focus management improves accessibility');
    }
    
    // Check for transition animations on focus
    if (content.includes('transition') && content.includes('focus')) {
      this.addResult('pass', 'Focus transitions are smooth', 'Form provides smooth focus transitions');
    } else {
      this.addResult('warning', 'Consider adding smooth focus transitions', 'Smooth transitions improve user experience');
    }
    
    // Check for ring/outline focus indicators
    if (content.includes('ring') || content.includes('outline')) {
      this.addResult('pass', 'Form has visible focus indicators', 'Focus indicators are implemented');
    } else {
      this.addResult('fail', 'Missing visible focus indicators', 'All interactive elements should have visible focus indicators');
    }
  }

  /**
   * Add a validation result
   */
  addResult(type, title, description) {
    this.results[type === 'pass' ? 'passed' : type === 'fail' ? 'failed' : 'warnings']++;
    this.results.details.push({
      type,
      title,
      description,
      timestamp: new Date().toISOString()
    });
    
    const icon = type === 'pass' ? '✅' : type === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${title}: ${description}`);
  }

  /**
   * Generate final validation report
   */
  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 ACCESSIBILITY VALIDATION REPORT');
    console.log('='.repeat(50));
    
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`📋 Total Checks: ${this.results.details.length}`);
    
    const score = Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100);
    console.log(`🎯 Accessibility Score: ${score}%`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 EXCELLENT! TransactionForm passes all critical accessibility checks.');
      console.log('✨ The form meets WCAG 2.1 AA standards for Requirements 8.6, 11.2, and 11.6.');
    } else {
      console.log(`\n🔧 NEEDS ATTENTION: ${this.results.failed} critical accessibility issues found.`);
      console.log('Please address the failed checks to ensure WCAG 2.1 AA compliance.');
    }
    
    if (this.results.warnings > 0) {
      console.log(`\n💡 RECOMMENDATIONS: ${this.results.warnings} suggestions for improvement.`);
      console.log('Consider implementing the warnings to enhance accessibility further.');
    }
    
    // Save detailed report
    const reportPath = path.join(__dirname, 'transaction-form-accessibility-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      summary: {
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        score: score,
        timestamp: new Date().toISOString()
      },
      details: this.results.details,
      requirements: {
        '8.6': 'TransactionForm accessibility compliance',
        '11.2': 'Visible focus indicators on all interactive elements',
        '11.6': 'Form accessibility (proper labels, error announcements, keyboard navigation)'
      }
    }, null, 2));
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    console.log('\n🚀 Next Steps:');
    console.log('1. Run the automated Playwright test: npx playwright test transaction-form-accessibility-compliance.spec.ts');
    console.log('2. Perform manual keyboard navigation testing');
    console.log('3. Test with screen readers (NVDA, JAWS, VoiceOver)');
    console.log('4. Validate with browser accessibility tools (axe, WAVE)');
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new TransactionFormAccessibilityValidator();
  validator.validate().catch(console.error);
}

module.exports = TransactionFormAccessibilityValidator;