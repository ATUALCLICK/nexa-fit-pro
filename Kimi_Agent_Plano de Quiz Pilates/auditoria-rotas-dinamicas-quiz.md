# Auditoria — Rotas Dinâmicas e Personalização do Quiz
### Análise do funil implementado + catálogo de oportunidades de branching congruente

**Objeto:** implementação atual (`/mnt/agents/output/app`)
**Princípio da auditoria:** toda resposta capturada deve (1) ecoar em pelo menos uma tela posterior, (2) influenciar o plano/oferta, ou (3) alterar a rota. Resposta que não faz nenhum dos três é **peso morto** — custa fricção e não paga em conversão.

---

## 1. SUMÁRIO EXECUTIVO

O funil captura **32 variáveis** de resposta. Hoje:

| Status | Qtd. | Detalhe |
|---|---|---|
| ✅ Personalizam telas posteriores | 9 | ageBucket, goal, energy, painPoints, height, weight, goalWeight, eventDate, name |
| ✅ Alimentam diagnóstico/nível | 8 | experience, frequency, plank, toeTouch, balance, bodyType, weightPattern, typicalDay |
| ⚠️ Capturadas mas **nunca ecoadas** | 15 | secondaryGoals, dreamBody, bestShape, flexibility, focusZones, workRoutine, water, sleep, stress, breakfast, lunch, dinner, dietType, badHabits, cravings, weightTriggers, event, mainReason, confidence, country |
| 🔀 Branching real (rota muda) | 1 | event → event-date (guard) |

**Diagnóstico da auditoria:** o funil tem boa personalização de *copy* (eco), mas quase nenhuma personalização de *rota*. A estrutura é 97% linear — o mesmo caminho para uma mulher de 26 anos sedentária e para uma de 58 anos no pós-parto com dor no joelho. **O original da BetterMe também é majoritariamente linear — ou seja, rotas dinâmicas são uma oportunidade de SUPERAR o funil de referência, não apenas replicá-lo.**

Abaixo: o gap tela a tela e o catálogo de rotas dinâmicas priorizado.

---

## 2. MAPA DE COBERTURA — variáveis × onde ecoam hoje

| Variável (tela) | Eco atual | Veredito |
|---|---|---|
| ageBucket (1) | social-proof, email-headline | Parcial — poderia trocar **perguntas e imagens** |
| experience (3) | score de nível (41, 53) | OK, mas não muda promessa nem rota |
| goal (5) | i-goal, plan-ready, checkout | Bom — falta mudar **ordem das seções** e oferta |
| secondaryGoals (7) | — | **Morta** |
| bodyType (8) | diagnóstico D3, imagem 41 | OK |
| dreamBody (9) | — | **Morta** — deveria definir o "corpo objetivo" do antes/depois |
| bestShape (10) | — | **Morta** — forte gancho emocional desperdiçado |
| weightPattern (11) | diagnóstico D2 | OK |
| flexibility (13) | card 41 | OK |
| frequency (14) | score de nível | OK |
| focusZones (15) | — | **Morta** — deveria aparecer em 20, 41, 53 e checkout |
| plank/toeTouch/balance (16–18) | score de nível | OK |
| painPoints (19) | i-activity | Parcial — deveria gerar **interstitial específico por dor** e adaptação no FAQ |
| workRoutine (21) | — | **Morta** |
| typicalDay (22) | card 41 | OK |
| energy (23) | i-energy | OK |
| water (25) | — | **Morta** — benefício "tracker de água" no checkout |
| sleep (26) | — | **Morta** |
| stress (27) | — | **Morta** — benefício respiração/relaxamento |
| breakfast/lunch/dinner (28–30) | — | **Mortas** — sinal de jejum intermitente ignorado |
| dietType (31) | — | **Morta** — o meal-preview deveria refletir a dieta escolhida! |
| badHabits/cravings (33–34) | — | **Mortas** — munição de copy para checkout/e-mail |
| weightTriggers (42) | — | **Morta** — a resposta mais emocional do funil sem nenhum eco |
| event/eventDate (43–44) | projeção 45 | OK |
| mainReason (46) | — | **Morta** — deveria ancorar o headline do checkout |
| confidence (47) | — | **Morta** — baixa confiança pede interstitial de reasseguro |
| country (54) | — | Parcial (Fase 2: moeda) |

**15 variáveis mortas = 15 oportunidades.** As de maior valor estão na seção 4.

---

## 3. AS 10 ROTAS DINÂMICAS PRIORITÁRIAS

Cada "rota" é um pacote de desvios congruentes (telas inseridas, puladas ou com copy/variante trocada) disparado por um gatilho de resposta.

### R1 — Rota da Mamãe (gatilho: `weightTriggers` inclui "gravidez" OU `mainReason` = "pos-parto")
**Por quê:** é a dor mais identitária do nicho; hoje não gera nada.
- Inserir interstitial após 42: "**Seu corpo passou por uma transformação enorme.** O Pilates é o método mais recomendado para o pós-parto: reconstrói o core e o assoalho pélvico com segurança — no seu ritmo."
- Trocar teste de prancha (16) por variante: "Você já recebeu liberação médica para exercícios?" (Sim/Não/Não sei) — tela de cuidado que aumenta confiança
- Checkout: trocar história em destaque pela da "Carla, 33 (pós-parto)" + badge "seguro para o pós-parto"
- FAQ: inserir item "Posso fazer após a gravidez?"

### R2 — Rota Menopausa (gatilho: `weightTriggers` inclui "menopausa" OU (`ageBucket` = 45–54/55+ ∧ `weightPattern` = "dificil"))
- Diagnóstico vira variante D2b: "**Metabolismo Hormonal.** Com a menopausa, o corpo redistribui gordura para a barriga e perde músculo mais rápido. Pilates combate exatamente esses dois efeitos."
- Inserir interstitial de especialista com copy hormonal (fisioterapeuta → "especialista em saúde da mulher 40+")
- Checkout: benefício "fortalece ossos e articulações" sobe para o topo

### R3 — Rota Dor Crônica (gatilho: `painPoints` ≠ ["nenhuma"])
Hoje gera só uma frase no i-activity. Expandir:
- Inserir **tela de adaptação** após 19: "Vamos adaptar os exercícios para a sua {lombar}. Você verá variações sem impacto em todas as aulas." (interstitial com ilustração da região marcada — reusar as zonas de 15)
- Se `joelhos` selecionado → remover âncora "agachamento" de qualquer copy; promessa vira "fortalecer sem dobrar os joelhos"
- Checkout: FAQ de dor vira o **primeiro** item e já aberto; barra comparativa do hero ganha linha "Dor na {região}: Frequente → Aliviada"

### R4 — Rota Iniciante Total (gatilho: `experience` = "nao" ∧ `frequency` = "nunca")
- Inserir interstitial após 14: "**Perfeito — você vai começar do zero absoluto.** Sem movimentos complicados, sem vergonha: as primeiras aulas têm 10 minutos e você faz sentada ou deitada."
- Badge da tela 53 vira "Feito para quem nunca treinou"
- Plano trial de 1 semana ganha destaque (âncora de menor compromisso) em vez do pré-selecionado padrão

### R5 — Rota 55+ (gatilho: `ageBucket` = "55+")
- Substituir teste de equilíbrio (18) por: "Você sente firmeza ao descer escadas sem corrimão?" (mesma função de calibragem, mais congruente com a faixa)
- Trocar todas as imagens/artes para a variante madura
- Diagnóstico ganha linha de osteoporose/osteopenia: "exercícios com o peso do corpo fortalecem ossos"
- Checkout: história da Sônia (54) vira a primeira

### R6 — Rota Jejum/Pula Refeições (gatilho: qualquer refeição (28–30) = "pula")
Hoje as 3 perguntas de horário não geram nada.
- Inserir interstitial após 30: "**Notamos que você costuma pular o {café da manhã}.** Seu plano alimentar se adapta à sua rotina real — com opções de jejum intermitente estruturado, se fizer sentido para você."
- Meal-preview (32): reorganiza para 2 refeições + lanche quando detectado jejum

### R7 — Rota Dieta Restritiva (gatilho: `dietType` ≠ "tradicional")
- Meal-preview (32) **obrigatoriamente** reflete a dieta: keto → ovos/abacate; vegana → bowl de grãos; sem glúten → tapioca. Hoje mostra refeições genéricas — quebra de congruência gritante
- Checkout J4: "Plano alimentar {vegana} com receitas de 15 min"

### R8 — Rota Meta Agressiva / Evento Próximo (gatilho: data do evento (44) < projeção calculada para 0,75 kg/sem)
**Congruência de promessa** — hoje o sistema usa a data menor sem comentar, criando promessa potencialmente irreal.
- Inserir interstitial de alinhamento: "Para chegar a {x} kg até o seu evento, o ritmo seria acelerado. Vamos focar em **resultados visíveis primeiro**: barriga mais plana e postura já nas primeiras 2 semanas — e a meta de peso logo depois."
- Se meta > 15% do peso → trocar destaque do plano para **12 semanas** (pré-selecionado muda!) com copy "sua meta pede constância"

### R9 — Rota Baixa Confiança (gatilho: `confidence` = "insegura")
- Substituir i-awards (48) por interstitial de reasseguro: "**É normal duvidar — principalmente se outras tentativas falharam.** A diferença: 10 minutos por dia, zero equipamento, garantia de 30 dias. Você só precisa começar." + depoimento de quem "estava cética"
- Checkout: garantia de 30 dias sobe para logo abaixo dos planos (em vez do fim da página)

### R10 — Rota Razão Emocional (gatilho: `mainReason`)
O headline do checkout hoje é genérico ("Seu Plano de Pilates está pronto!").
- `confianca` → "Pronta para se olhar no espelho com orgulho?"
- `roupas` → "Suas roupas favoritas vão voltar a servir"
- `pos-parto` → "Seu corpo de volta, no seu tempo"
- `dores` → "Viver sem dor começa hoje"
- O headline passa a **ecoar a razão declarada** — o fechamento emocional do funil

---

## 4. OPORTUNIDADES DE ECO (sem mudança de rota, só copy dinâmica)

| Variável morta | Onde ecoar | Copy sugerida |
|---|---|---|
| secondaryGoals (7) | tela 53 badges | "Também vamos trabalhar: {flexibilidade, sono}" |
| dreamBody (9) | hero do checkout (J1) | imagem/ilustração do "objetivo" muda: esguia / curvas / tonificada |
| bestShape (10) | interstitial 45 | "Você já esteve lá {há 2 anos} — seu corpo tem memória muscular. Voltar é mais rápido do que começar." |
| focusZones (15) | tela 41 (5º card), tela 53 | "Foco especial: {barriga + glúteos}" |
| workRoutine (21) | plan-ready (53) | "Sessões de 10–20 min encaixadas na sua rotina {9h–18h}" |
| water (25) | checkout J4 | se < 2 copos: "Lembretes de hidratação no plano diário" |
| sleep (26) | i-energy ou J4 | se < 6h: "rotinas noturnas de relaxamento para dormir melhor" |
| stress (27) | J4 benefício 6 | se alto: destacar "respiração e relaxamento" no topo |
| badHabits (33) | checkout J4 meal plan | "Estratégias anti-belisco noturno no seu plano alimentar" |
| cravings (34) | FAQ ou J4 | "Receitas que matam a vontade de {doces} sem sair do plano" |

---

## 5. ARQUITETURA PROPOSTA — "Profile Engine"

Hoje a personalização é ad-hoc (funções espalhadas). Para rotas dinâmicas em escala, centralizar:

```ts
// personalization/engine.ts
export interface Profile {
  tokens: Record<string, string>      // {idade: "casa dos 30 e 40", foco: "barriga"}
  routes: RouteId[]                   // ['R1-mamae', 'R3-dor'] — gatilhos ativos
  flags: Record<string, boolean>      // {inicianteTotal, jejum, metaAgressiva, baixaConfianca}
  plan: { recommended: '1w'|'4w'|'12w', headline: string }
  diagnosis: Diagnosis
  level: string
}

export function deriveProfile(a: Answers): Profile {
  // regras R1–R10 avaliadas em ordem; retorna objeto único
}
```

**Mudanças no `screens.config.ts` (retrocompatíveis):**

1. **Inserção condicional de telas** — o `guard` já existe; basta cadastrar as telas novas (R1–R9) com guards baseados no profile:
```ts
{ id: 'i-pos-parto', template: 'interstitial', countsForProgress: false,
  guard: (a) => routes(a).includes('R1-mamae'), next: 'event', ... }
```
2. **Variantes de tela** — payload ganha `variants: { [routeId]: payloadParcial }`; o template faz merge antes de renderizar (troca headline, imagem, ordem de opções)
3. **Ordem dinâmica de seções** (futuro): `goal = postura` poderia antecipar a seção Atividade antes de Nutrição; `goal = perder-peso` faz o contrário. Hoje `next` como função já permite; exige apenas um mapa de seções por goal
4. **Plano recomendado dinâmico** — checkout lê `profile.plan.recommended` em vez de fixar `PLANS[1]`

**Regra de ouro de implementação:** nenhuma rota pode remover uma variável que outra rota usa. O `deriveProfile` roda sobre as respostas brutas, nunca sobre o profile de outra regra.

---

## 6. CHECKLIST DE CONGRUÊNCIA (para qualquer rota nova)

- [ ] Toda tela inserida tem guard simétrico — quem entra na rota nunca vê a versão "default" contraditória
- [ ] O diagnóstico (12/41) nunca contradiz uma dor ou gatilho declarado (ex.: não dizer "metabolismo lento" para quem marcou "ganho de peso pós-gravidez" sem mencionar a gravidez)
- [ ] Promessa numérica (45/53) respeita 0,75 kg/semana; se o evento for antes, a copy muda para "resultados visíveis" (R8) — nunca prometer o impossível em silêncio
- [ ] A imagem do "objetivo" (checkout) corresponde ao `dreamBody` declarado
- [ ] O plano pré-selecionado corresponde ao tamanho da meta (R8)
- [ ] O headline do checkout ecoa `mainReason` (R10)
- [ ] Nenhum interstitial repete informação que a usuária já sabe que sabemos ("eco redundante" — cada eco deve adicionar consequência, não só repetir)
- [ ] Voltar e mudar uma resposta-gatilho re-deriva o profile e a rota (testar os dois sentidos)

---

## 7. PRIORIZAÇÃO (impacto × esforço)

| Rota/Oportunidade | Impacto em conversão | Esforço | Prioridade |
|---|---|---|---|
| R7 Dieta no meal-preview | Alto (quebra de congruência atual) | Baixo | **P0** |
| Ecos da seção 4 (tabela §4) | Alto | Baixo | **P0** |
| R8 Meta agressiva + plano dinâmico | Alto (receita: vende 12 semanas) | Médio | **P0** |
| R1 Mamãe | Alto (segmento enorme do nicho) | Médio | **P1** |
| R10 Headline por mainReason | Alto | Baixo | **P1** |
| R3 Dor crônica expandida | Médio-alto | Médio | **P1** |
| R9 Baixa confiança | Médio | Baixo | **P1** |
| R2 Menopausa | Médio | Médio | **P2** |
| R5 Rota 55+ | Médio | Médio | **P2** |
| R6 Jejum | Médio | Baixo | **P2** |
| R4 Iniciante total | Médio | Baixo | **P2** |
| Ordem dinâmica de seções | Incerto (testar) | Alto | **P3 (só com A/B)** |

**Validação:** cada rota entra como variante do parâmetro `flow` (A/B) — medir lift de `email_submitted` e `purchase_completed` por rota vs. funil linear.

---

## 8. RISCOS

| Risco | Mitigação |
|---|---|
| Explosão combinatória de variantes → QA impossível | Rotas são pacotes fechados; testar cada rota com um "persona script" (conjunto fixo de respostas) |
| Personalização errada (eco de resposta mal lida) | `deriveProfile` com testes unitários por regra; fallback sempre para a copy default |
| Mais telas = mais abandono | Rotas só **inserem** interstitials (telas sem pergunta); saldo máximo: +2 telas por sessão |
| Copy dinâmica quebrada (token vazio) | Render helper com fallback: token vazio → frase default, nunca "{barriga}" na tela |
