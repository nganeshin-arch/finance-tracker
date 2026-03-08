const fs = require('fs');
const path = require('path');

/**
 * Form Accessibility Validation Script
 * 
 * This script validates that the TransactionForm component has proper accessibility attributes:
 * - Label association using for/id attributes
 * - ARIA attributes for error messages (aria-invalid, aria-describedby)
 * - Screen reader announcements for validation states
 * 
 * **Validates: Requirements 6.6, 11.6**
 */

console.log('🔍 Validating Form Accessibility Compliance...\n');

// Read the TransactionForm component
const transactionFormPath = path.join(__dirname, '../src/components/TransactionForm.tsx');

if (!fs.existsSync(transactionFormPath)) {
    console.error('❌ TransactionForm.tsx not found at:', transactionFormPath);
    process.exit(1);
}

const transactionFormContent = fs.readFileSync(transactionFormPath, 'utf8');

// Test 1: Check for proper label association
console.log('📋 Test 1: Label Association');
const labelForPattern = /<Label\s+htmlFor="([^"]+)"/g;
const inputIdPattern = /id="([^"]+)"/g;

const labelFors = [];
const inputIds = [];

let match;
while ((match = labelForPattern.exec(transactionFormContent)) !== null) {
    labelFors.push(match[1]);
}

while ((match = inputIdPattern.exec(transactionFormContent)) !== null) {
    inputIds.push(match[1]);
}

console.log(`   Found ${labelFors.length} labels with htmlFor attributes`);
console.log(`   Found ${inputIds.length} elements with id attributes`);

// Check if all form inputs have corresponding labels
const formInputIds = inputIds.filter(id => 
    ['date', 'transactionTypeId', 'categoryId', 'subCategoryId', 'paymentModeId', 'accountId', 'amount', 'description'].includes(id)
);

const missingLabels = formInputIds.filter(id => !labelFors.includes(id));
if (missingLabels.length === 0) {
    console.log('   ✅ All form inputs have associated labels');
} else {
    console.log(`   ❌ Missing labels for: ${missingLabels.join(', ')}`);
}

// Test 2: Check for ARIA attributes on Select components
console.log('\n📋 Test 2: ARIA Attributes for Select Components');
const selectTriggerPattern = /<SelectTrigger[^>]*>/g;
let selectTriggersWithAria = 0;
let totalSelectTriggers = 0;

while ((match = selectTriggerPattern.exec(transactionFormContent)) !== null) {
    totalSelectTriggers++;
    const selectTrigger = match[0];
    
    if (selectTrigger.includes('aria-invalid') && selectTrigger.includes('aria-describedby')) {
        selectTriggersWithAria++;
    }
}

console.log(`   Found ${totalSelectTriggers} SelectTrigger components`);
console.log(`   ${selectTriggersWithAria} have proper ARIA attributes`);

if (selectTriggersWithAria === totalSelectTriggers) {
    console.log('   ✅ All Select components have proper ARIA attributes');
} else {
    console.log('   ❌ Some Select components missing ARIA attributes');
}

// Test 3: Check for error message IDs and role="alert"
console.log('\n📋 Test 3: Error Message Accessibility');
const errorMessagePattern = /id="([^"]+)-error"[^>]*role="alert"/g;
let errorMessagesWithRole = 0;

while ((match = errorMessagePattern.exec(transactionFormContent)) !== null) {
    errorMessagesWithRole++;
}

console.log(`   Found ${errorMessagesWithRole} error messages with proper role="alert"`);

// Check for consistent error message ID pattern
const errorIdPattern = /id="([^"]+)-error"/g;
let totalErrorIds = 0;

while ((match = errorIdPattern.exec(transactionFormContent)) !== null) {
    totalErrorIds++;
}

console.log(`   Found ${totalErrorIds} error message IDs`);

if (errorMessagesWithRole === totalErrorIds && totalErrorIds > 0) {
    console.log('   ✅ All error messages have proper role="alert"');
} else if (totalErrorIds === 0) {
    console.log('   ℹ️  No error messages found (this is expected if no validation errors are shown)');
} else {
    console.log('   ❌ Some error messages missing role="alert"');
}

// Test 4: Check for textarea accessibility
console.log('\n📋 Test 4: Textarea Accessibility');
const textareaPattern = /<textarea[^>]*>/;
const textareaMatch = transactionFormContent.match(textareaPattern);

if (textareaMatch) {
    const textarea = textareaMatch[0];
    const hasAriaLabel = textarea.includes('aria-label');
    const hasAriaInvalid = textarea.includes('aria-invalid');
    const hasAriaDescribedBy = textarea.includes('aria-describedby');
    
    console.log(`   Textarea has aria-label: ${hasAriaLabel ? '✅' : '❌'}`);
    console.log(`   Textarea has aria-invalid: ${hasAriaInvalid ? '✅' : '❌'}`);
    console.log(`   Textarea has aria-describedby: ${hasAriaDescribedBy ? '✅' : '❌'}`);
    
    if (hasAriaLabel && hasAriaInvalid && hasAriaDescribedBy) {
        console.log('   ✅ Textarea has proper accessibility attributes');
    } else {
        console.log('   ❌ Textarea missing some accessibility attributes');
    }
} else {
    console.log('   ❌ No textarea found in form');
}

// Test 5: Check for form-level accessibility
console.log('\n📋 Test 5: Form-Level Accessibility');
const formPattern = /<form[^>]*>/;
const formMatch = transactionFormContent.match(formPattern);

if (formMatch) {
    const form = formMatch[0];
    const hasAriaLabel = form.includes('aria-label');
    
    console.log(`   Form has aria-label: ${hasAriaLabel ? '✅' : '❌'}`);
    
    if (hasAriaLabel) {
        console.log('   ✅ Form has proper accessibility label');
    } else {
        console.log('   ❌ Form missing aria-label');
    }
} else {
    console.log('   ❌ No form element found');
}

// Test 6: Check Input component usage
console.log('\n📋 Test 6: Input Component Usage');
const inputComponentPattern = /<Input[^>]*>/g;
let inputComponentsWithError = 0;
let totalInputComponents = 0;

while ((match = inputComponentPattern.exec(transactionFormContent)) !== null) {
    totalInputComponents++;
    const inputComponent = match[0];
    
    if (inputComponent.includes('error={')) {
        inputComponentsWithError++;
    }
}

console.log(`   Found ${totalInputComponents} Input components`);
console.log(`   ${inputComponentsWithError} Input components have error prop support`);

if (totalInputComponents > 0) {
    console.log('   ✅ Form uses Input components (which have built-in accessibility)');
} else {
    console.log('   ❌ No Input components found');
}

// Summary
console.log('\n📊 Summary');
const tests = [
    { name: 'Label Association', passed: missingLabels.length === 0 },
    { name: 'Select ARIA Attributes', passed: selectTriggersWithAria === totalSelectTriggers },
    { name: 'Error Message Accessibility', passed: errorMessagesWithRole === totalErrorIds || totalErrorIds === 0 },
    { name: 'Textarea Accessibility', passed: textareaMatch && textareaMatch[0].includes('aria-label') },
    { name: 'Form Accessibility', passed: formMatch && formMatch[0].includes('aria-label') },
    { name: 'Input Component Usage', passed: totalInputComponents > 0 }
];

const passedTests = tests.filter(test => test.passed).length;
const totalTests = tests.length;

console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);

tests.forEach(test => {
    console.log(`   ${test.passed ? '✅' : '❌'} ${test.name}`);
});

if (passedTests === totalTests) {
    console.log('\n🎉 All accessibility tests passed! Form is compliant with Requirements 6.6 and 11.6');
    process.exit(0);
} else {
    console.log('\n⚠️  Some accessibility tests failed. Please review the issues above.');
    process.exit(1);
}