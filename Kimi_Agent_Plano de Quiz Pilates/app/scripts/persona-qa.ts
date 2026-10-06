/*
 * QA de personas — generalizado: roda contra QUALQUER funnel.json.
 * Uso: npx tsx scripts/persona-qa.ts [caminho-do-funnel.json]
 * As personas e as expectativas vivem na seção "qa" do próprio funil.
 */
import { readFileSync } from 'node:fs'
import { parseFunnel } from '../src/funnel/schema'
import { buildRuntime, type FunnelRuntime } from '../src/funnel/runtime'
import { deriveProfile, resolveDiagnosis } from '../src/funnel/derive'
import type { Answers } from '../src/quiz/engine/types'

const file = process.argv[2] ?? 'src/funnels/pilates.json'
const funnel = parseFunnel(JSON.parse(readFileSync(file, 'utf8')))
const runtime: FunnelRuntime = buildRuntime(funnel)

if (!funnel.qa) {
  console.error('❌ funnel não tem seção "qa"')
  process.exit(1)
}
const qa = funnel.qa

function walk(a: Answers): string[] {
  const path: string[] = []
  let cur = runtime.screens[0]
  let hops = 0
  while (cur && hops++ < 100) {
    path.push(cur.id)
    if (cur.template === 'scratch') break
    const nxt = runtime.resolveNext(cur, a)
    if (nxt === cur.id) break
    cur = runtime.map.get(nxt)!
  }
  return path
}

const answersOf = (name: string): Answers => ({ ...qa.base, ...qa.personas[name] }) as Answers
const paths: Record<string, string[]> = {}
for (const name of Object.keys(qa.personas)) paths[name] = walk(answersOf(name))

let fail = 0
const expect = (cond: boolean, msg: string) => {
  console.log(`${cond ? '✅' : '❌'} ${msg}`)
  if (!cond) fail++
}

/* relatório por persona */
for (const name of Object.keys(qa.personas)) {
  const p = deriveProfile(answersOf(name), funnel.icp)
  console.log(`\n=== ${name} | personas=[${p.personas}] plano=${p.plan.recommended} | ${paths[name].length} telas ===`)
}

/* expectativas declarativas */
for (const e of qa.expect) {
  const names = e.persona === '*' ? Object.keys(qa.personas) : [e.persona]
  for (const name of names) {
    if (e.vs && name === e.vs) continue
    const path = paths[name]
    const a = answersOf(name)
    const tag = `[${name}]`

    if (e.terminal) {
      expect(path[path.length - 1] === e.terminal, `${tag} termina em "${e.terminal}"`)
    }
    if (e.maxExtra !== undefined && e.vs) {
      const delta = path.length - paths[e.vs].length
      expect(delta <= e.maxExtra, `${tag} rota +${delta} telas vs ${e.vs} (máx ${e.maxExtra})`)
    }
    for (const id of e.includes ?? []) {
      expect(path.includes(id), `${tag} passa por "${id}"`)
    }
    for (const id of e.excludes ?? []) {
      expect(!path.includes(id), `${tag} NÃO passa por "${id}"`)
    }
    if (e.plan) {
      const got = deriveProfile(a, funnel.icp).plan.recommended
      expect(got === e.plan, `${tag} plano ${got} === ${e.plan}`)
    }
    if (e.variant) {
      const keys = deriveProfile(a, funnel.icp).variantKeys
      expect(keys.includes(e.variant), `${tag} variante "${e.variant}" ativa`)
    }
    if (e.hasPersona) {
      const ps = deriveProfile(a, funnel.icp).personas
      expect(ps.includes(e.hasPersona), `${tag} persona "${e.hasPersona}" detectada`)
    }
    if (e.diagnosis) {
      const d = resolveDiagnosis(a, funnel.icp)
      expect(d.id === e.diagnosis, `${tag} diagnóstico ${d.id} === ${e.diagnosis}`)
    }
  }
}

console.log(fail === 0 ? '\n🎉 QA VERDE — todas as rotas OK' : `\n💥 ${fail} FALHAS`)
process.exit(fail === 0 ? 0 : 1)
