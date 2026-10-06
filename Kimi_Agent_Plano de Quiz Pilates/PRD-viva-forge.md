# PRD — Viva Forge
### Gerador de Funis de Quiz por Nicho

**Status:** Aprovado para execução · **Data:** 2026-08-01 · **Escopo:** F2–F5, com MVP (F2) detalhado
**Documentos irmãos:** `estrutura-gerador-de-funis.md` (arquitetura — o COMO) · `app/CONTEXT.md` (glossário) · `app/docs/adr/0001` (publicação via deploy)

---

## 1. Visão

> Digitar um nicho e, em minutos, ter um funil de quiz completo, navegável e validado — com ICP próprio, rotas dinâmicas, copy personalizada e checkout — indistinguível em comportamento do funil pilates que já validamos.

O Viva Pilates provou que a máquina converte: 62 telas, diagnósticos dinâmicos, personas, checkout estruturado. O gargalo do negócio deixou de ser "construir um funil" e passou a ser **replicar o funil para novos nichos** sem semanas de trabalho manual por nicho. O Viva Forge elimina esse gargalo: a engine e o esqueleto são fixos; o conteúdo é gerado por LLM, validado por máquina e aprovado por humano.

## 2. Problema

Criar um novo funil hoje exige, por nicho: pesquisar ICP, escrever ~200 peças de copy (headlines, opções, interstitials, variantes por persona, checkout, FAQs), desenhar personas detectáveis e diagnósticos plausíveis, e validar que todas as rotas dinâmicas funcionam. Estimativa realista: 2–4 semanas de trabalho especializado por nicho, com qualidade variável.

Consequência: o negócio testa poucos nichos por trimestre e concentra risco no pilates. Quem testa mais nichos, mais rápido e mais barato, encontra o próximo vencedor antes.

## 3. Usuário e cenários

**Operador único:** o founder (técnico, opera sozinho). Não há equipe, clientes ou usuários finais do /admin — é uma ferramenta interna.

| Cenário | Fluxo esperado |
|---|---|
| **Testar um nicho novo** | Abre /admin → digita "yoga para iniciantes 40+" (+ campos opcionais) → acompanha o pipeline S1–S5 → percorre o preview `?f=draft` → aprova → funil entra no próximo deploy |
| **Corrigir copy ruim** | No preview, anota a tela → ajusta o campo do form e regenera o estágio (ou edita o JSON na mão) → QA roda de novo |
| **QA falhou após auto-repair** | Recebe a lista de falhas por estágio → decide: regenerar estágio, editar JSON ou abandonar o nicho |
| **Voltar atrás** | Funil publicado com problema → rollback = versão anterior do app |

## 4. Objetivos e métricas de sucesso

### KPIs de aceite do MVP (F2)

| # | Métrica | Meta |
|---|---|---|
| K1 | Tempo de geração completa (nicho → funil validado) | **< 5 minutos** |
| K2 | QA verde sem intervenção manual | **≥ 80% dos nichos** testados |
| K3 | Custo de tokens por funil gerado | **< US$ 0,50** |
| K4 | Marco funcional | Funil gerado navegável de ponta a ponta em `?f=slug`, QA verde, indistinguível do pilates em comportamento |

### KPIs de negócio (a partir de F4, com tráfego real)

- Taxa de conclusão do funil gerado vs. pilates (benchmark)
- Taxa de chegada ao checkout por nicho
- Velocidade de portfólio: nichos em teste por mês (meta: 4+)

### Não-métricas (o que o MVP NÃO precisa provar)

- Qualidade literária da copy além do "bom o suficiente para testar tráfego"
- Autonomia total sem revisão humana — a revisão no preview é parte do design

## 5. Escopo funcional — MVP (F2)

### RF-01 · Formulário de entrada (/admin)

- Campo obrigatório: **nicho/produto** (texto livre)
- Campos opcionais: público-alvo, faixa de preço, nome da marca, tom de voz
- Campo de chave da Kimi API (password, persistida apenas no localStorage do navegador do admin)
- /admin sem link público na navegação do funil

### RF-02 · Pipeline S1 — Geração do ICP

- Entrada: o form (RF-01)
- Saída: 4–6 personas com dores, desejos, regras de detecção declarativas, plano recomendado e headline de checkout
- Restrição dura: toda persona deve ser detectável por variáveis que o esqueleto captura (`saveAs` existentes) — validado no S4

### RF-03 · Pipeline S2 — Geração das telas

- O esqueleto (62 telas, ordem, templates, seções, regras) **não é gerado** — o LLM preenche slots de conteúdo por lote (blocos A–I), cada lote validado isoladamente
- Cada slot carrega instrução própria (ex.: tela do diagnóstico = "perfil pseudo-científico do nicho")
- Few-shot obrigatório: o funil pilates (seed) como exemplo-âncora

### RF-04 · Pipeline S3 — Geração do checkout

- 3 planos (preço/dia + âncora), 6 benefícios, 3 histórias (1 por persona prioritária), 4 FAQs, headlines por razão emocional
- **Textos legais e disclaimers nunca são gerados** — vêm de templates fixos com placeholders de marca

### RF-05 · Pipeline S4 — Validação e auto-repair

1. Validação estrutural (zod) do funnel.json completo
2. Persona-scripts: `persona-qa` roda contra o JSON gerado — toda persona ativa sua rota; toda rota termina na raspadinha
3. Congruência: tokens `{{...}}` existem, `next/guard` apontam para ids válidos, disclaimers presentes nas telas de projeção/dor (bloqueante em nichos de saúde)
4. Auto-repair: até 2 loops de correção automática; persistindo, reporta a lista de falhas ao operador

### RF-06 · Pipeline S5 — Preview e publicação

- Preview instantâneo via `?f=draft` (JSON da sessão do admin, sem publicar)
- **Publicar = gravar o funil como arquivo do projeto e gerar nova versão do app** (ver ADR-0001)
- Publicação exige: QA verde **e** confirmação humana após percorrer o preview — ambos obrigatórios

### RF-07 · Multi-tenant de consumo

- `?f={slug}` carrega `/funnels/{slug}.json`; ausência de slug carrega o seed (pilates); slug inexistente faz fallback para o seed
- *(Já implementado em F1 — o MVP apenas o consome.)*

## 6. Não-objetivos (explícitos)

| # | Fora de escopo | Até quando |
|---|---|---|
| N1 | Auth real, multi-user, roles, colaboração | F5 |
| N2 | Editor visual de copy no admin | F4 |
| N3 | Nichos fora de transformação corporal/bem-estar | indefinido (exige novos esqueletos) |
| N4 | Idiomas além de pt-BR | F4+ (schema já tem `meta.locale`) |
| N5 | Processamento de pagamento (gateway, webhooks, renovação) | PRD separado |
| N6 | Publicação instantânea sem deploy (storage remoto) | F5 |
| N7 | Geração de imagens/arte por nicho | F5 |
| N8 | Teste A/B de variantes de funil | F5+ |

## 7. Roadmap

| Fase | Entrega | Critério de saída |
|---|---|---|
| **F1 — Fundação** ✅ | Engine lê funnel.json; pilates compilado como seed; QA generalizado; multi-tenant `?f=slug` | Entregue (38 rotas + 23 copies verdes) |
| **F2 — Gerador MVP** | /admin com S1–S5, validação zod, preview `?f=draft`, publicação via deploy | KPIs K1–K4 atingidos com 3 nichos de teste |
| **F3 — QA + Repair** | Persona-scripts no pipeline, congruência, auto-repair de 2 loops | K2 ≥ 80% sustentado em 5 nichos novos |
| **F4 — Polimento** | Editor de copy, versionamento `{slug}.v{n}`, index de funis, duplicar funil, candidato: campo "URL de checkout externo" (Hotmart/Kirvano/Kiwify) | Edição sem regenerar; rollback por funil |
| **F5 — Escala** | Proxy backend da API (chave fora do navegador), auth do admin, storage remoto (publicação instantânea), geração de imagens, es/en | Conforme demanda |

## 8. Dependências externas

- **Kimi API** — geração de todo o conteúdo; chave do operador no navegador até F5 (risco aceito, uso interno)
- **Deploy do app** — cada publicação de funil é uma nova versão do app estático (ADR-0001)
- **Gateway de pagamento** — fora de escopo (N5); os planos gerados são display até que um PRD de monetização exista

## 9. Riscos

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| Copy fora do tom ou genérica demais | Média | Médio | Few-shot com o seed + temperature por estágio + revisão humana obrigatória (RF-06) |
| JSON inválido / ids quebrados / rotas órfãs | Média | Alto | zod + validador de grafo + persona-scripts no S4 — nada publica sem QA verde |
| Personas indetectáveis (regra aponta para variável inexistente) | Média | Médio | S4 checa `detect.key` contra os `saveAs` do esqueleto |
| Custo/latência escalarem por nicho | Baixa | Baixo | Lotes por bloco, retry só do lote falho, K3 monitorado |
| Chave da API exposta no navegador | Baixa | Médio | Aceito no MVP (uso interno); proxy backend no F5 |
| Qualidade variar muito por nicho | Média | Alto | Gate duplo: QA verde + revisão humana; K2 mede a taxa real |

## 10. Métricas pós-lançamento

- Log por geração: nicho, duração, tokens gastos, loops de repair necessários, falhas do S4 (alimenta K1–K3)
- Por funil publicado: taxa de conclusão, chegada ao checkout (analytics já instrumentado na engine)
- Revisão mensal: portfólio de nichos em teste vs. meta (4+/mês a partir de F4)

---

*Aprovado nas 9 decisões da sessão de 2026-08-01 (escopo, operador, nichos, publicação, KPIs, edição, idioma, pagamento, nome). Glossário em `app/CONTEXT.md`; decisão de publicação em `app/docs/adr/0001-publicacao-via-deploy-embutido.md`.*
