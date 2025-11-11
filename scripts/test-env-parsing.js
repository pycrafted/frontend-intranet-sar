const { readFileSync } = require('fs')
const { join } = require('path')

console.log('🧪 ========== TEST PARSING .env.local ==========\n')

const projectDir = process.cwd()
const envLocalPath = join(projectDir, '.env.local')

console.log('📂 Répertoire:', projectDir)
console.log('📄 Fichier:', envLocalPath)

try {
  const content = readFileSync(envLocalPath, 'utf-8')
  console.log('✅ Fichier lu:', content.length, 'caractères\n')
  
  console.log('📝 Contenu brut (premiers 500 chars):')
  console.log(content.substring(0, 500))
  console.log('\n')
  
  const envParsed = {}
  const lines = content.split('\n')
  
  console.log('📊 Nombre de lignes:', lines.length)
  console.log('\n🔍 Analyse ligne par ligne:\n')
  
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    console.log(`Ligne ${index + 1}:`, JSON.stringify(trimmed))
    
    if (trimmed && !trimmed.startsWith('#')) {
      const equalIndex = trimmed.indexOf('=')
      if (equalIndex > 0) {
        const key = trimmed.substring(0, equalIndex).trim()
        let value = trimmed.substring(equalIndex + 1).trim()
        
        // Retirer les guillemets
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        
        // Retirer les commentaires
        const commentIndex = value.indexOf('#')
        if (commentIndex > 0) {
          value = value.substring(0, commentIndex).trim()
        }
        
        envParsed[key] = value
        console.log(`  ✅ Parsée: ${key} = ${value.substring(0, 20)}... (${value.length} chars)`)
      } else {
        console.log(`  ⚠️ Pas de '=' trouvé`)
      }
    } else {
      console.log(`  ⏭️ Ignorée (vide ou commentaire)`)
    }
  })
  
  console.log('\n📊 Variables parsées:', Object.keys(envParsed).length)
  console.log('🔑 Clés:', Object.keys(envParsed).join(', '))
  console.log('\n🔍 Vérification CLAUDE_API_KEY:')
  console.log('  - Existe:', 'CLAUDE_API_KEY' in envParsed)
  console.log('  - Valeur:', envParsed.CLAUDE_API_KEY ? `${envParsed.CLAUDE_API_KEY.substring(0, 20)}... (${envParsed.CLAUDE_API_KEY.length} chars)` : 'undefined')
  console.log('\n🔍 Vérification NEXT_PUBLIC_CLAUDE_API_KEY:')
  console.log('  - Existe:', 'NEXT_PUBLIC_CLAUDE_API_KEY' in envParsed)
  console.log('  - Valeur:', envParsed.NEXT_PUBLIC_CLAUDE_API_KEY ? `${envParsed.NEXT_PUBLIC_CLAUDE_API_KEY.substring(0, 20)}... (${envParsed.NEXT_PUBLIC_CLAUDE_API_KEY.length} chars)` : 'undefined')
  
} catch (error) {
  console.error('❌ Erreur:', error.message)
  console.error('Stack:', error.stack)
}


