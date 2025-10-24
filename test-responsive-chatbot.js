#!/usr/bin/env node
/**
 * Script de test pour la responsivité du chatbot
 */

const fs = require('fs');
const path = require('path');

function testResponsiveClasses() {
  console.log('🧪 TEST DES CLASSES RESPONSIVES DU CHATBOT');
  console.log('=' * 60);

  const chatbotFile = path.join(__dirname, 'components', 'saria-chatbot.tsx');
  const loadingFile = path.join(__dirname, 'components', 'loading-message.tsx');
  
  // Lire les fichiers
  const chatbotContent = fs.readFileSync(chatbotFile, 'utf8');
  const loadingContent = fs.readFileSync(loadingFile, 'utf8');

  // Tests des classes responsives
  const tests = [
    {
      name: 'Classes Tailwind responsives',
      pattern: /(sm:|md:|lg:|xl:|2xl:|3xl:)/g,
      files: [chatbotContent, loadingContent],
      expected: 'Classes responsives présentes'
    },
    {
      name: 'Hook useScreenSize utilisé',
      pattern: /useScreenSize/g,
      files: [chatbotContent, loadingContent],
      expected: 'Hook useScreenSize importé et utilisé'
    },
    {
      name: 'Composants responsives importés',
      pattern: /ResponsiveFloatingButton|ResponsiveChatHeader|ResponsiveMessagesArea|ResponsiveInputArea/g,
      files: [chatbotContent],
      expected: 'Composants responsives importés'
    },
    {
      name: 'Tailles responsives',
      pattern: /isSmallMobile|isMobile|isTablet|isDesktop/g,
      files: [chatbotContent, loadingContent],
      expected: 'Variables de taille d\'écran utilisées'
    },
    {
      name: 'Classes conditionnelles',
      pattern: /cn\([^)]*isSmallMobile[^)]*\)/g,
      files: [chatbotContent, loadingContent],
      expected: 'Classes conditionnelles basées sur la taille d\'écran'
    }
  ];

  let passed = 0;
  let total = tests.length;

  tests.forEach(test => {
    const found = test.files.some(content => test.pattern.test(content));
    const status = found ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${found ? test.expected : 'Non trouvé'}`);
    if (found) passed++;
  });

  console.log(`\n📊 Score: ${passed}/${total} tests réussis`);
  return passed === total;
}

function testBreakpoints() {
  console.log('\n🔍 TEST DES BREAKPOINTS TAILWIND');
  console.log('=' * 60);

  const tailwindConfig = path.join(__dirname, 'tailwind.config.js');
  const configContent = fs.readFileSync(tailwindConfig, 'utf8');

  const breakpoints = [
    'xs: 320px',
    'ipad-mini: 768px',
    'ipad-air: 820px',
    'ipad-pro: 1024px',
    'surface-pro: 912px',
    'zenbook-fold: 853px',
    'nest-hub: 1024px',
    'tablet: 768px',
    'tablet-lg: 1024px'
  ];

  let found = 0;
  breakpoints.forEach(bp => {
    if (configContent.includes(bp)) {
      console.log(`✅ ${bp}`);
      found++;
    } else {
      console.log(`❌ ${bp} - Manquant`);
    }
  });

  console.log(`\n📊 Breakpoints trouvés: ${found}/${breakpoints.length}`);
  return found === breakpoints.length;
}

function testComponentStructure() {
  console.log('\n🏗️ TEST DE LA STRUCTURE DES COMPOSANTS');
  console.log('=' * 60);

  const components = [
    'components/chatbot/responsive-floating-button.tsx',
    'components/chatbot/responsive-chat-header.tsx',
    'components/chatbot/responsive-messages-area.tsx',
    'components/chatbot/responsive-input-area.tsx',
    'hooks/useScreenSize.ts'
  ];

  let existing = 0;
  components.forEach(comp => {
    const filePath = path.join(__dirname, comp);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${comp}`);
      existing++;
    } else {
      console.log(`❌ ${comp} - Fichier manquant`);
    }
  });

  console.log(`\n📊 Composants créés: ${existing}/${components.length}`);
  return existing === components.length;
}

function generateResponsiveTest() {
  console.log('\n📝 GÉNÉRATION DU TEST RESPONSIVE');
  console.log('=' * 60);

  const testContent = `
// Test de responsivité du chatbot
import { render, screen } from '@testing-library/react';
import { MaiChatbot } from '@/components/saria-chatbot';

// Mock du hook useScreenSize
jest.mock('@/hooks/useScreenSize', () => ({
  useScreenSize: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isSmallMobile: false,
    isLargeMobile: false,
    isSmallTablet: false,
    isLargeTablet: false,
    deviceType: 'desktop',
    orientation: 'landscape'
  })
}));

describe('Chatbot Responsive', () => {
  test('renders on desktop', () => {
    render(<MaiChatbot />);
    // Tests desktop
  });

  test('renders on mobile', () => {
    // Mock mobile
    jest.mocked(useScreenSize).mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isSmallMobile: true,
      isLargeMobile: false,
      isSmallTablet: false,
      isLargeTablet: false,
      deviceType: 'mobile',
      orientation: 'portrait'
    });
    
    render(<MaiChatbot />);
    // Tests mobile
  });

  test('renders on tablet', () => {
    // Mock tablet
    jest.mocked(useScreenSize).mockReturnValue({
      isMobile: false,
      isTablet: true,
      isDesktop: false,
      isSmallMobile: false,
      isLargeMobile: false,
      isSmallTablet: true,
      isLargeTablet: false,
      deviceType: 'tablet',
      orientation: 'landscape'
    });
    
    render(<MaiChatbot />);
    // Tests tablet
  });
});
`;

  const testFile = path.join(__dirname, 'test-responsive-chatbot.test.tsx');
  fs.writeFileSync(testFile, testContent);
  console.log('✅ Test responsive généré: test-responsive-chatbot.test.tsx');
}

function main() {
  console.log('🧪 TEST COMPLET DE LA RESPONSIVITÉ DU CHATBOT');
  console.log('=' * 80);

  const results = [
    testResponsiveClasses(),
    testBreakpoints(),
    testComponentStructure()
  ];

  generateResponsiveTest();

  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log('\n' + '=' * 80);
  console.log('📊 RÉSULTATS FINAUX');
  console.log('=' * 80);
  console.log(`Score global: ${passed}/${total} tests réussis`);

  if (passed === total) {
    console.log('🎉 CHATBOT RESPONSIVE PRÊT !');
    console.log('\n📱 Fonctionnalités responsives:');
    console.log('  ✅ Détection automatique de la taille d\'écran');
    console.log('  ✅ Composants adaptatifs');
    console.log('  ✅ Tailles responsives');
    console.log('  ✅ Breakpoints Tailwind configurés');
    console.log('  ✅ Messages de chargement adaptatifs');
  } else {
    console.log('⚠️  Certains tests ont échoué - Vérifiez la configuration');
  }

  return passed === total;
}

if (require.main === module) {
  main();
}

module.exports = { testResponsiveClasses, testBreakpoints, testComponentStructure };

