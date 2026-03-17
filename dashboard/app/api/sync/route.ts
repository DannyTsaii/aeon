import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { resolve } from 'path'

const REPO_ROOT = resolve(process.cwd(), '..')

function run(cmd: string) {
  return execSync(cmd, { stdio: 'pipe', cwd: REPO_ROOT }).toString().trim()
}

export async function GET() {
  try {
    const status = run('git status --porcelain')
    const hasChanges = status.length > 0
    const changedFiles = hasChanges ? status.split('\n').length : 0
    return NextResponse.json({ hasChanges, changedFiles })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to check status'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST() {
  try {
    const status = run('git status --porcelain')
    if (!status) {
      return NextResponse.json({ ok: true, message: 'Already in sync' })
    }

    run('git add -A')

    try {
      run('git commit -m "chore: update config from dashboard"')
    } catch {
      return NextResponse.json({ ok: true, message: 'Nothing to commit' })
    }

    run('git push')

    return NextResponse.json({ ok: true, message: 'Pushed to GitHub' })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to sync'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
