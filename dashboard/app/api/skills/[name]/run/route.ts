import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { resolve } from 'path'

const REPO_ROOT = resolve(process.cwd(), '..')

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params

    // Validate skill name to prevent injection
    if (!/^[a-z][a-z0-9-]*$/.test(name)) {
      return NextResponse.json({ error: 'Invalid skill name' }, { status: 400 })
    }

    execSync(`gh workflow run aeon.yml -f skill=${name}`, {
      stdio: 'pipe',
      cwd: REPO_ROOT,
    })

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to trigger run'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
