import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

const STATUS_FILE = path.join(process.cwd(), 'data', 'sync-status.json')

export async function GET() {
  try {
    const content = fs.readFileSync(STATUS_FILE, 'utf-8')
    return NextResponse.json(JSON.parse(content))
  } catch {
    return NextResponse.json({ status: 'idle' })
  }
}
