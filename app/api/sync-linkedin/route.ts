import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

const STATUS_FILE = path.join(process.cwd(), 'data', 'sync-status.json')

function writeStatus(data: object) {
  fs.mkdirSync(path.dirname(STATUS_FILE), { recursive: true })
  fs.writeFileSync(STATUS_FILE, JSON.stringify(data))
}

export async function POST() {
  const scriptPath = path.join(process.cwd(), 'scripts', 'sync-linkedin.js')

  console.log('\n[SYNC-LINKEDIN] ▶ Démarrage de la synchronisation manuelle...')
  writeStatus({ status: 'running', startedAt: Date.now() })

  const child = spawn('node', [scriptPath], {
    detached: false,
    stdio: 'inherit',
  })

  child.on('close', (code) => {
    if (code === 0) {
      console.log('[SYNC-LINKEDIN] ✅ Script terminé avec succès')
      writeStatus({ status: 'done', finishedAt: Date.now() })
    } else {
      console.error(`[SYNC-LINKEDIN] ❌ Script terminé avec code ${code}`)
      writeStatus({ status: 'error', code, finishedAt: Date.now() })
    }
  })

  child.unref()

  return NextResponse.json({ success: true })
}
