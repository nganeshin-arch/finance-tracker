/**
 * Validation script for TransactionForm spacing consistency
 * This script validates the spacing consistency property for the TransactionForm component
 */

const { chromium } = require('playwright');

async function validateTransactionFormSpacing() {
  console.log('🧪 Validating TransactionForm Spacing Consistency...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    
    // Login
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'Admin123!@#');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('**/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Navigate to transactions
    await page.click('text=Transactions');
    await page.waitForTimeout(500);
    
    // Click "Add Transaction" button
    await page.click('button:has-text("Add Transaction")');
    await page.waitForTimeout(500);
    
    console.log('✅ Successfully navigated to TransactionForm\n');
    
    // Test 1: Form field container spacing consistency
    console.log('📏 Testing form field container spacing...');
    
    const containerSpacing = await page.evaluate(() => {
      const containers = Array.from(document.querySelectorAll('.space-y-2'));
      return containers.map((container, index) => {
        const computed = window.getComputedStyle(container);
        return {
          index,
          marginTop: computed.marginTop,
          marginBottom: computed.marginBottom,
          paddingTop: computed.paddingTop,
          paddingBottom: computed.paddingBottom,
          id: container.querySelector('input, textarea, [role="combobox"]')?.id || `container-${index}`,
        };
      });
    });
    
    console.log(`Found ${containerSpacing.length} form field containers`);
    
    if (containerSpacing.length >= 2) {
      const firstContainer = containerSpacing[0];
      let consistentContainers = 0;
      
      for (let i = 1; i < containerSpacing.length; i++) {
        const container = containerSpacing[i];
        const isConsistent = container.marginTop === firstContainer.marginTop &&
                           container.marginBottom === firstContainer.marginBottom;
        
        if (isConsistent) {
          consistentContainers++;
          console.log(`  ✅ Container ${i} (${container.id}): Consistent spacing`);
        } else {
          console.log(`  ❌ Container ${i} (${container.id}): Inconsistent spacing`);
          console.log(`     Expected: margin(${firstContainer.marginTop}, ${firstContainer.marginBottom})`);
          console.log(`     Actual: margin(${container.marginTop}, ${container.marginBottom})`);
        }
      }
      
      const containerConsistencyRate = (consistentContainers / (containerSpacing.length - 1)) * 100;
      console.log(`  📊 Container spacing consistency: ${consistentContainers}/${containerSpacing.length - 1} (${containerConsistencyRate.toFixed(1)}%)\n`);
    }
    
    // Test 2: Adjacent element gaps
    console.log('📐 Testing adjacent element gaps...');
    
    const adjacentSpacing = await page.evaluate(() => {
      const containers = Array.from(document.querySelectorAll('.space-y-2'));
      const spacingData = [];
      
      for (let i = 0; i < containers.length - 1; i++) {
        const current = containers[i];
        const next = containers[i + 1];
        
        const currentRect = current.getBoundingClientRect();
        const nextRect = next.getBoundingClientRect();
        
        const gap = nextRect.top - (currentRect.top + currentRect.height);
        
        spacingData.push({
          currentIndex: i,
          nextIndex: i + 1,
          gap: Math.round(gap),
          currentId: current.querySelector('input, textarea, [role="combobox"]')?.id || `element-${i}`,
          nextId: next.querySelector('input, textarea, [role="combobox"]')?.id || `element-${i + 1}`,
        });
      }
      
      return spacingData;
    });
    
    console.log(`Found ${adjacentSpacing.length} adjacent element pairs`);
    
    if (adjacentSpacing.length >= 2) {
      const expectedGap = adjacentSpacing[0].gap;
      const tolerance = 2;
      let consistentGaps = 0;
      
      for (const spacing of adjacentSpacing) {
        const isConsistent = Math.abs(spacing.gap - expectedGap) <= tolerance;
        
        if (isConsistent) {
          consistentGaps++;
          console.log(`  ✅ Gap ${spacing.currentId} → ${spacing.nextId}: ${spacing.gap}px`);
        } else {
          console.log(`  ❌ Gap ${spacing.currentId} → ${spacing.nextId}: ${spacing.gap}px (expected ~${expectedGap}px)`);
        }
      }
      
      const gapConsistencyRate = (consistentGaps / adjacentSpacing.length) * 100;
      console.log(`  📊 Gap consistency: ${consistentGaps}/${adjacentSpacing.length} (${gapConsistencyRate.toFixed(1)}%)\n`);
    }
    
    // Test 3: Input field padding consistency
    console.log('📦 Testing input field padding consistency...');
    
    const inputPadding = await page.evaluate(() => {
      const selectors = [
        'input[type="date"]',
        'input[type="number"]',
        'textarea',
        '[role="combobox"]',
      ];
      
      const paddingData = [];
      
      for (const selector of selectors) {
        const elements = Array.from(document.querySelectorAll(selector));
        
        elements.forEach((el, index) => {
          const computed = window.getComputedStyle(el);
          paddingData.push({
            selector,
            index,
            paddingTop: computed.paddingTop,
            paddingRight: computed.paddingRight,
            paddingBottom: computed.paddingBottom,
            paddingLeft: computed.paddingLeft,
            id: el.id || `${selector.replace(/[^\w]/g, '')}-${index}`,
          });
        });
      }
      
      return paddingData;
    });
    
    console.log(`Found ${inputPadding.length} input fields`);
    
    // Group by input type
    const inputsByType = inputPadding.reduce((acc, input) => {
      const key = input.selector;
      if (!acc[key]) acc[key] = [];
      acc[key].push(input);
      return acc;
    }, {});
    
    let totalPaddingTests = 0;
    let passedPaddingTests = 0;
    
    for (const [inputType, inputs] of Object.entries(inputsByType)) {
      if (inputs.length >= 2) {
        console.log(`  Testing ${inputs.length} ${inputType} fields:`);
        
        const firstInput = inputs[0];
        
        for (let i = 1; i < inputs.length; i++) {
          totalPaddingTests++;
          const input = inputs[i];
          
          const isConsistent = input.paddingTop === firstInput.paddingTop &&
                             input.paddingRight === firstInput.paddingRight &&
                             input.paddingBottom === firstInput.paddingBottom &&
                             input.paddingLeft === firstInput.paddingLeft;
          
          if (isConsistent) {
            passedPaddingTests++;
            console.log(`    ✅ ${inputType}[${i}] (${input.id}): Consistent padding`);
          } else {
            console.log(`    ❌ ${inputType}[${i}] (${input.id}): Inconsistent padding`);
            console.log(`       Expected: ${firstInput.paddingTop} ${firstInput.paddingRight} ${firstInput.paddingBottom} ${firstInput.paddingLeft}`);
            console.log(`       Actual: ${input.paddingTop} ${input.paddingRight} ${input.paddingBottom} ${input.paddingLeft}`);
          }
        }
      }
    }
    
    if (totalPaddingTests > 0) {
      const paddingConsistencyRate = (passedPaddingTests / totalPaddingTests) * 100;
      console.log(`  📊 Padding consistency: ${passedPaddingTests}/${totalPaddingTests} (${paddingConsistencyRate.toFixed(1)}%)\n`);
    }
    
    // Test 4: Form element alignment
    console.log('📏 Testing form element alignment...');
    
    const alignmentData = await page.evaluate(() => {
      const containers = Array.from(document.querySelectorAll('.space-y-2'));
      const alignmentInfo = [];
      
      for (let i = 0; i < containers.length; i++) {
        const container = containers[i];
        const label = container.querySelector('label');
        const input = container.querySelector('input, textarea, [role="combobox"]');
        
        if (label && input) {
          const labelRect = label.getBoundingClientRect();
          const inputRect = input.getBoundingClientRect();
          
          alignmentInfo.push({
            index: i,
            labelLeft: Math.round(labelRect.left),
            inputLeft: Math.round(inputRect.left),
            labelId: label.getAttribute('for') || `label-${i}`,
            inputId: input.id || `input-${i}`,
          });
        }
      }
      
      return alignmentInfo;
    });
    
    console.log(`Found ${alignmentData.length} form field pairs (label + input)`);
    
    if (alignmentData.length >= 2) {
      const firstLabelLeft = alignmentData[0].labelLeft;
      const firstInputLeft = alignmentData[0].inputLeft;
      const tolerance = 2;
      
      let alignedLabels = 0;
      let alignedInputs = 0;
      
      for (let i = 1; i < alignmentData.length; i++) {
        const data = alignmentData[i];
        
        const labelAligned = Math.abs(data.labelLeft - firstLabelLeft) <= tolerance;
        const inputAligned = Math.abs(data.inputLeft - firstInputLeft) <= tolerance;
        
        if (labelAligned) {
          alignedLabels++;
          console.log(`  ✅ Label ${data.labelId}: Aligned (${data.labelLeft}px)`);
        } else {
          console.log(`  ❌ Label ${data.labelId}: Misaligned (${data.labelLeft}px, expected ~${firstLabelLeft}px)`);
        }
        
        if (inputAligned) {
          alignedInputs++;
          console.log(`  ✅ Input ${data.inputId}: Aligned (${data.inputLeft}px)`);
        } else {
          console.log(`  ❌ Input ${data.inputId}: Misaligned (${data.inputLeft}px, expected ~${firstInputLeft}px)`);
        }
      }
      
      const labelAlignmentRate = (alignedLabels / (alignmentData.length - 1)) * 100;
      const inputAlignmentRate = (alignedInputs / (alignmentData.length - 1)) * 100;
      
      console.log(`  📊 Label alignment: ${alignedLabels}/${alignmentData.length - 1} (${labelAlignmentRate.toFixed(1)}%)`);
      console.log(`  📊 Input alignment: ${alignedInputs}/${alignmentData.length - 1} (${inputAlignmentRate.toFixed(1)}%)\n`);
    }
    
    // Test 5: Responsive spacing (quick test)
    console.log('📱 Testing responsive spacing...');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Desktop', width: 1200, height: 800 },
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(300);
      
      const spacing = await page.evaluate(() => {
        const containers = Array.from(document.querySelectorAll('.space-y-2'));
        if (containers.length >= 2) {
          const first = containers[0].getBoundingClientRect();
          const second = containers[1].getBoundingClientRect();
          return Math.round(second.top - (first.top + first.height));
        }
        return 0;
      });
      
      console.log(`  📐 ${viewport.name} (${viewport.width}x${viewport.height}): ${spacing}px gap`);
      
      if (spacing < 8 || spacing > 40) {
        console.log(`    ⚠️  Gap may be too ${spacing < 8 ? 'small' : 'large'} for ${viewport.name}`);
      } else {
        console.log(`    ✅ Gap is reasonable for ${viewport.name}`);
      }
    }
    
    console.log('\n🎉 TransactionForm spacing consistency validation completed!');
    
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the validation
if (require.main === module) {
  validateTransactionFormSpacing()
    .then(() => {
      console.log('\n✅ All spacing consistency validations completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Spacing consistency validation failed:', error.message);
      process.exit(1);
    });
}

module.exports = { validateTransactionFormSpacing };