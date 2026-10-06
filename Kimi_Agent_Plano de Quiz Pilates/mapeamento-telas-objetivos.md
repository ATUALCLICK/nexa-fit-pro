# Mapeamento Completo do Funil — Objetivo de Cada Tela

**Funil:** Plano de Pilates (Viva Pilates) · **62 telas:** 33 perguntas · 7 inputs · 22 recompensas · 6 condicionais
**Níveis:** N0 curiosa → N1 problema → N2 solução → N3 produto → N4 pronta · ★ tela-chave · ◆ condicional

---

## Entrada

### 01 · `age` — Q · N0→N1
- **Função estratégica:** Segmentação instantânea por faixa etária; primeiro micro-compromisso (1 clique).
- **Dado → uso:** ageBucket → {{ageLabel}} (prova social), persona madura 55+
- **Alavanca:** Fricção quase zero + cards visuais: a porta de entrada mais barata possível.
- **Técnica:** select-cards · progresso: sim · saveAs `ageBucket` · **transições:** → social-proof

### 02 · `social-proof` — R · N1
- **Função estratégica:** Ancoragem de relevância ("98 mil mulheres na SUA faixa") + autoridade de mídia.
- **Dado → uso:** — (consome ageBucket = 1ª personalização do funil)
- **Alavanca:** Prova social + pertencimento logo na 2ª tela.
- **Técnica:** interstitial · progresso: não · **transições:** → experience


## Meu Perfil

### 03 · `experience` — Q · N1
- **Função estratégica:** Calibra nível de experiência com Pilates.
- **Dado → uso:** experience → flag inicianteTotal, persona iniciante, {{pilatesLevel}}
- **Alavanca:** Binária, resposta em <2s.
- **Técnica:** question-single · progresso: sim · saveAs `experience` · **transições:** → i-welcome

### 04 · `i-welcome` — R · N1
- **Função estratégica:** Recompensa imediata; entrega a promessa central (suave, sem equipamento, em casa).
- **Dado → uso:** —
- **Alavanca:** Dopamina antecipada + desativa a objeção "não sei fazer".
- **Técnica:** interstitial · progresso: não · **transições:** → goal

### 05 · `goal` — Q · N1
- **Função estratégica:** Declaração do objetivo principal — eixo de copy do funil inteiro.
- **Dado → uso:** goal → @switch i-goal, diagnósticos D1/D2, email, plan-ready
- **Alavanca:** Auto-compromisso declarado (consistência).
- **Técnica:** question-single · progresso: sim · saveAs `goal` · **transições:** → i-goal

### 06 · `i-goal` — R · N1→N2
- **Função estratégica:** Eco empático do objetivo + primeiro "nós sabemos como fazer" (solução implícita).
- **Dado → uso:** — (4 variações via @switch)
- **Alavanca:** Reciprocidade: ela fala, o funil responde.
- **Técnica:** interstitial · progresso: não · **transições:** → secondary-goals

### 07 · `secondary-goals` — Q · N1→N2
- **Função estratégica:** Enriquece motivações secundárias (multi-seleção).
- **Dado → uso:** secondaryGoals → {{secundarios}} (badge plan-ready)
- **Alavanca:** Mais cliques = mais investimento (sunk cost).
- **Técnica:** question-multi · progresso: sim · saveAs `secondaryGoals` · **transições:** → body-type

### 08 · `body-type` — Q · N1→N2
- **Função estratégica:** Auto-avaliação corporal por silhuetas (sem números ainda).
- **Dado → uso:** bodyType → diagnóstico D3
- **Alavanca:** Visual > texto: decisão rápida, baixa carga.
- **Técnica:** question-single · progresso: sim · saveAs `bodyType` · **transições:** → dream-body

### 09 · `dream-body` — Q · N2
- **Função estratégica:** Visualização da meta — cria o gap atual × desejado.
- **Dado → uso:** dreamBody → dreamLabels no checkout
- **Alavanca:** Tensão aspiracional (a motivação do funil inteiro).
- **Técnica:** question-single · progresso: sim · saveAs `dreamBody` · **transições:** → best-shape

### 10 · `best-shape` — Q · N2
- **Função estratégica:** "Há quanto tempo esteve na melhor forma?" — ativa nostalgia e perda.
- **Dado → uso:** bestShape → detecção cética
- **Alavanca:** Aversão à perda.
- **Técnica:** question-single · progresso: sim · saveAs `bestShape` · **transições:** → weight-pattern

### 11 · `weight-pattern` — Q · N2
- **Função estratégica:** Calibra a narrativa metabólica (peso difícil de perder).
- **Dado → uso:** weightPattern → D2/D2b, flag transicaoRaw
- **Alavanca:** Explica "por que outras tentativas falharam" sem culpar ela.
- **Técnica:** question-single · progresso: sim · saveAs `weightPattern` · **transições:** → i-diagnosis

### 12 · `i-diagnosis` — R · N2 ★
- **Função estratégica:** PAYOFF: nomeia o problema (1 de 8 diagnósticos dinâmicos). Maior virada de consciência da 1ª metade.
- **Dado → uso:** — (consome tudo até aqui)
- **Alavanca:** Rótulo = identificação ("isso sou eu"). Posicionado cedo (tela 12/62) como hook.
- **Técnica:** interstitial · progresso: não · **transições:** → flexibility


## Atividade

### 13 · `flexibility` — Q · N2
- **Função estratégica:** Baseline de flexibilidade auto-reportada.
- **Dado → uso:** flexibility → {{flexibilityLabel}}
- **Alavanca:** Início do bloco de "medição" (streak física 1/4).
- **Técnica:** question-single · progresso: sim · saveAs `flexibility` · **transições:** → frequency

### 14 · `frequency` — Q · N2
- **Função estratégica:** Baseline de frequência de exercício.
- **Dado → uso:** frequency → inicianteTotal, cética
- **Alavanca:** Streak física 2/4.
- **Técnica:** question-single · progresso: sim · saveAs `frequency` · **transições:** → focus-zones

### 15 · `focus-zones` — Q · N2
- **Função estratégica:** Escolha das zonas-alvo do corpo (multi).
- **Dado → uso:** focusZones → {{foco}} (i-foco, card Foco)
- **Alavanca:** Agência: ela "monta" o próprio plano.
- **Técnica:** question-multi · progresso: sim · saveAs `focusZones` · **transições:** → i-foco

### 16 · `i-foco` — R · N2
- **Função estratégica:** Recompensa do meio do bloco (P0): ecoa as zonas e enquadra as próximas perguntas como "medição com propósito".
- **Dado → uso:** — ({{foco}})
- **Alavanca:** Quebra o maior streak do funil (7→4); reforça agência.
- **Técnica:** interstitial · progresso: não · **transições:** → plank

### 17 · `plank` — Q · N2
- **Função estratégica:** Teste de força imaginado (prancha).
- **Dado → uso:** plank → D3, {{pilatesLevel}}
- **Alavanca:** Auto-exposição física — custo emocional alto, já blindado por i-foco.
- **Técnica:** question-single · progresso: sim · saveAs `plank` · **transições:** → toe-touch

### 18 · `toe-touch` — Q · N2
- **Função estratégica:** Teste de flexibilidade imaginado.
- **Dado → uso:** toeTouch → D4
- **Alavanca:** Idem.
- **Técnica:** question-single · progresso: sim · saveAs `toeTouch` · **transições:** → balance

### 19 · `balance` — Q · N2
- **Função estratégica:** Teste de equilíbrio; variante 55+ troca para "firmeza ao descer escadas".
- **Dado → uso:** balance → {{pilatesLevel}}
- **Alavanca:** Variante por persona: pergunta relevante para a idade dela.
- **Técnica:** question-single · progresso: sim · saveAs `balance` · **transições:** → pain-points · **variantes:** 55plus

### 20 · `pain-points` — Q · N2
- **Função estratégica:** Mapeamento de dores (multi).
- **Dado → uso:** painPoints → dorCronica, {{dorAlvo}}, i-adaptacao, FAQ checkout
- **Alavanca:** Footnote médica = segurança; exclusiva "Nenhuma" preserva qualidade do dado.
- **Técnica:** question-multi · progresso: sim · saveAs `painPoints` · **transições:** → i-activity

### 21 · `i-activity` — R · N2→N3
- **Função estratégica:** Recompensa do bloco físico; promessa adaptada à dor ({{dorAlvoFrase}}).
- **Dado → uso:** —
- **Alavanca:** Alívio de objeção física ("dá pra fazer mesmo com dor").
- **Técnica:** interstitial · progresso: não · **transições:** → i-adaptacao

### 22 · `i-adaptacao` — R · N3 ◆
- **Função estratégica:** CONDICIONAL (dor ≠ nenhuma): prova cirúrgica de adaptação à região dela ({{dorAdaptacao}}).
- **Dado → uso:** —
- **Alavanca:** "O plano é seguro pra MIM" — personalização visível.
- **Técnica:** interstitial · progresso: não · **guarda:** painPoints preenchido E painPoints ∌ nenhuma · **transições:** → work-routine


## Estilo de Vida

### 23 · `work-routine` — Q · N2
- **Função estratégica:** Contexto de agenda/trabalho.
- **Dado → uso:** workRoutine → (contexto)
- **Alavanca:** Pergunta neutra de baixo custo (respiro pós-bloco físico).
- **Técnica:** question-single · progresso: sim · saveAs `workRoutine` · **transições:** → typical-day

### 24 · `typical-day` — Q · N2
- **Função estratégica:** Mede sedentarismo do dia típico.
- **Dado → uso:** typicalDay → D5, persona executiva
- **Alavanca:** Neutra.
- **Técnica:** question-single · progresso: sim · saveAs `typicalDay` · **transições:** → energy

### 25 · `energy` — Q · N2
- **Função estratégica:** Mapeia a dor energética do dia.
- **Dado → uso:** energy → @switch i-energy
- **Alavanca:** Amplia o problema para além do corpo.
- **Técnica:** question-single · progresso: sim · saveAs `energy` · **transições:** → i-energy

### 26 · `i-energy` — R · N2→N3
- **Função estratégica:** Reframe: Pilates como solução de ENERGIA, não só de estética.
- **Dado → uso:** — (4 variações)
- **Alavanca:** Benefício funcional imediato — nova razão para continuar.
- **Técnica:** interstitial · progresso: não · **transições:** → water

### 27 · `water` — Q · N2
- **Função estratégica:** Hábito de hidratação.
- **Dado → uso:** water → boost hidratação no checkout
- **Alavanca:** Nota educativa (250ml) reduz ambiguidade.
- **Técnica:** question-single · progresso: sim · saveAs `water` · **transições:** → sleep

### 28 · `sleep` — Q · N2
- **Função estratégica:** Hábito de sono.
- **Dado → uso:** sleep → (objetivo secundário sono)
- **Alavanca:** Streak nutrição 1/6.
- **Técnica:** question-single · progresso: sim · saveAs `sleep` · **transições:** → stress

### 29 · `stress` — Q · N2
- **Função estratégica:** Nível de estresse.
- **Dado → uso:** stress → persona executiva, boost respiração no checkout
- **Alavanca:** Conecta corpo × mente.
- **Técnica:** question-single · progresso: sim · saveAs `stress` · **transições:** → breakfast


## Nutrição

### 30 · `breakfast` — Q · N2
- **Função estratégica:** Rotina alimentar 1/3 (café da manhã).
- **Dado → uso:** breakfast → flag jejum, {{refeicaoPulada}}
- **Alavanca:** Sequência ritualística rápida.
- **Técnica:** question-single · progresso: sim · saveAs `breakfast` · **transições:** → lunch

### 31 · `lunch` — Q · N2
- **Função estratégica:** Rotina alimentar 2/3.
- **Dado → uso:** lunch → flag jejum
- **Alavanca:** Idem.
- **Técnica:** question-single · progresso: sim · saveAs `lunch` · **transições:** → dinner

### 32 · `dinner` — Q · N2
- **Função estratégica:** Rotina alimentar 3/3.
- **Dado → uso:** dinner → flag jejum
- **Alavanca:** Idem.
- **Técnica:** question-single · progresso: sim · saveAs `dinner` · **transições:** → i-jejum

### 33 · `i-jejum` — R · N2→N3
- **Função estratégica:** Recompensa INCONDICIONAL do bloco nutrição (P0); variante jejum introduz jejum intermitente orientado.
- **Dado → uso:** —
- **Alavanca:** Todo mundo recebe payoff na 6ª tela; quem pula refeição recebe espelho exato.
- **Técnica:** interstitial · progresso: não · **transições:** → diet-type · **variantes:** jejum

### 34 · `diet-type` — Q · N2→N3
- **Função estratégica:** Preferência alimentar — 10 dietas em 4 grupos.
- **Dado → uso:** dietType → variante diet-*, mealsByDiet
- **Alavanca:** Inclusão ("tem a MINHA dieta") + layout agrupado escaneável.
- **Técnica:** question-single · progresso: sim · saveAs `dietType` · **transições:** → i-meal-preview

### 35 · `i-meal-preview` — R · N3 ★
- **Função estratégica:** PAYOFF tangível: 3 refeições da dieta DELA com kcal/min.
- **Dado → uso:** —
- **Alavanca:** Concretude de valor ANTES do pedido de dados pessoais.
- **Técnica:** interstitial · progresso: não · **transições:** → bad-habits

### 36 · `bad-habits` — Q · N2
- **Função estratégica:** Hábitos sabotadores (multi).
- **Dado → uso:** badHabits → (copy futura)
- **Alavanca:** Autoria do diagnóstico: ela mesma lista os vilões.
- **Técnica:** question-multi · progresso: sim · saveAs `badHabits` · **transições:** → cravings

### 37 · `cravings` — Q · N2
- **Função estratégica:** Vontades alimentares específicas (multi).
- **Dado → uso:** cravings → (copy futura)
- **Alavanca:** Idem; streak curto antes da autoridade.
- **Técnica:** question-multi · progresso: sim · saveAs `cravings` · **transições:** → i-authority

### 38 · `i-authority` — R · N3
- **Função estratégica:** Credenciais das especialistas (BASI, fisio, nutri).
- **Dado → uso:** —
- **Alavanca:** Autoridade (Cialdini) posicionada exatamente ANTES do pedido invasivo de dados corporais.
- **Técnica:** interstitial · progresso: não · **transições:** → height


## Quase Lá

### 39 · `height` — I · N3
- **Função estratégica:** Input corporal 1/4 + consentimento de dados de saúde.
- **Dado → uso:** height → IMC
- **Alavanca:** Consent blindado pela autoridade; toggle CM/FT.
- **Técnica:** input-measure · progresso: sim · saveAs `height` · **transições:** → weight

### 40 · `weight` — I · N3
- **Função estratégica:** Input corporal 2/4.
- **Dado → uso:** weight → IMC, projeção
- **Alavanca:** Feedback de IMC instantâneo transforma input em recompensa.
- **Técnica:** input-measure · progresso: sim · saveAs `weight` · **transições:** → goal-weight

### 41 · `goal-weight` — I · N3
- **Função estratégica:** Input corporal 3/4 — o número do sonho.
- **Dado → uso:** goalWeight → projeção, confidence, checkout
- **Alavanca:** Feedback "% da meta" instantâneo.
- **Técnica:** input-measure · progresso: sim · saveAs `goalWeight` · **transições:** → age-input

### 42 · `age-input` — I · N3
- **Função estratégica:** Input corporal 4/4.
- **Dado → uso:** ageYears → (refino)
- **Alavanca:** Justificativa embutida (sarcopenia) responde "por que perguntam isso".
- **Técnica:** input-measure · progresso: sim · saveAs `ageYears` · **transições:** → loading-analysis

### 43 · `loading-analysis` — R · N3
- **Função estratégica:** Processamento percebido (4 barras por seção).
- **Dado → uso:** —
- **Alavanca:** Labor illusion: "estão trabalhando pra mim" + badge 40 países.
- **Técnica:** loading · progresso: não · **transições:** → wellness-profile

### 44 · `wellness-profile` — R · N3 ★
- **Função estratégica:** PAYOFF MÁXIMO do quiz: perfil completo (IMC + diagnóstico + nível + flexibilidade + foco).
- **Dado → uso:** —
- **Alavanca:** Prova de personalização: "o plano me conhece". Consolida N3.
- **Técnica:** result · progresso: não · **transições:** → weight-triggers

### 45 · `weight-triggers` — Q · N3→N4
- **Função estratégica:** Causa emocional do ganho de peso (multi).
- **Dado → uso:** weightTriggers → personas mamae/transição
- **Alavanca:** Empatia situacional; abre as rotas dinâmicas emocionais.
- **Técnica:** question-multi · progresso: sim · saveAs `weightTriggers` · **transições:** → i-mamae

### 46 · `i-mamae` — R · N4 ◆
- **Função estratégica:** CONDICIONAL (gravidez/pós-parto): validação da fase — "seu corpo passou por uma transformação enorme".
- **Dado → uso:** —
- **Alavanca:** "Finalmente algo pra MINHA fase" — maior pico emocional da rota mamãe.
- **Técnica:** interstitial · progresso: não · **guarda:** weightTriggers ∋ gravidez OU mainReason = pos-parto · **transições:** → q-liberacao

### 47 · `q-liberacao` — Q · N4 ◆
- **Função estratégica:** CONDICIONAL: liberação médica pós-parto.
- **Dado → uso:** liberacaoMedica → intensidade inicial
- **Alavanca:** Cuidado explícito = confiança; única pergunta exclusiva de rota.
- **Técnica:** question-single · progresso: sim · saveAs `liberacaoMedica` · **guarda:** weightTriggers ∋ gravidez OU mainReason = pos-parto · **transições:** → i-menopausa

### 48 · `i-menopausa` — R · N4 ◆
- **Função estratégica:** CONDICIONAL (menopausa/metabolismo): "seu corpo mudou as regras — o método também precisa mudar".
- **Dado → uso:** —
- **Alavanca:** Valida a frustração hormonal sem prometer milagre.
- **Técnica:** interstitial · progresso: não · **guarda:** NÃO(weightTriggers ∋ gravidez OU mainReason = pos-parto) E weightTriggers ∋ menopausa OU weightTriggers ∋ metabolismo · **transições:** → event

### 49 · `event` — Q · N3→N4
- **Função estratégica:** Gancho temporal: evento importante chegando?
- **Dado → uso:** event → branch (event-date × i-alinhamento)
- **Alavanca:** Deadline natural = motivador concreto.
- **Técnica:** question-single · progresso: sim · saveAs `event` · **transições:** ⤳ se event = nenhum → i-alinhamento | → senão: event-date

### 50 · `event-date` — I · N4 ◆
- **Função estratégica:** CONDICIONAL (evento ≠ nenhum): data do evento (pulável).
- **Dado → uso:** eventDate → flag metaAgressiva (>8% até a data)
- **Alavanca:** Compromisso com data; "Pular" preserva quem não quer dizer.
- **Técnica:** input-measure · progresso: sim · saveAs `eventDate` · **guarda:** event ≠ nenhum · **transições:** → i-alinhamento

### 51 · `i-alinhamento` — R · N4 ◆
- **Função estratégica:** CONDICIONAL (meta agressiva): gestão de expectativa — "ambiciosa, e vamos em etapas".
- **Dado → uso:** —
- **Alavanca:** Anti-decepção = anti-abandono/anti-reembolso no futuro.
- **Técnica:** interstitial · progresso: não · **guarda:** $flag:metaAgressiva ativo · **transições:** → projection

### 52 · `projection` — R · N4 ★
- **Função estratégica:** PROPULSOR-MOR do funil: gráfico peso→meta com data + quote da instrutora.
- **Dado → uso:** — ({{goalWeight}} {{projectionDate}})
- **Alavanca:** Concretização do futuro: desejo vira plano com data.
- **Técnica:** result · progresso: não · **transições:** → main-reason

### 53 · `main-reason` — Q · N4
- **Função estratégica:** Declaração emocional final ("por que essa transformação?").
- **Dado → uso:** mainReason → headline do checkout, persona mamae
- **Alavanca:** Consistência (Cialdini): ela disse o porquê — o checkout cobra.
- **Técnica:** question-single · progresso: sim · saveAs `mainReason` · **transições:** → confidence

### 54 · `confidence` — Q · N4
- **Função estratégica:** Declaração de confiança na meta.
- **Dado → uso:** confidence → persona cética
- **Alavanca:** Compromisso; quem duvida recebe a variante certa na tela seguinte.
- **Técnica:** question-single · progresso: sim · saveAs `confidence` · **transições:** → i-awards

### 55 · `i-awards` — R · N4
- **Função estratégica:** Resposta à dúvida recém-declarada: prêmios/confiabilidade; variante cética = garantia 30 dias.
- **Dado → uso:** —
- **Alavanca:** Redução de risco no ponto mais cético do funil.
- **Técnica:** interstitial · progresso: não · **transições:** → loading-plan · **variantes:** cetica

### 56 · `loading-plan` — R · N4
- **Função estratégica:** Labor illusion final + 3 depoimentos + "Seu plano está 100% pronto!".
- **Dado → uso:** —
- **Alavanca:** Antecipação máxima antes do pedido de email (blindagem P0).
- **Técnica:** loading · progresso: não · **transições:** → social-proof-2

### 57 · `social-proof-2` — R · N4
- **Função estratégica:** Reblindagem de prova social (repete tela 2, intencional).
- **Dado → uso:** —
- **Alavanca:** Segurança de pertencimento imediatamente antes da fricção.
- **Técnica:** interstitial · progresso: não · **transições:** → email

### 58 · `email` — I · N4 ⚠
- **Função estratégica:** Captura de lead — MAIOR fricção de valor do funil.
- **Dado → uso:** email → (envio do plano)
- **Alavanca:** Blindagens: headline {{goalLabel}}, micro-prova ★312 mil, privacy note, plano "100% pronto" na tela anterior.
- **Técnica:** input-measure · progresso: não · saveAs `email` · **transições:** → name

### 59 · `name` — I · N4
- **Função estratégica:** Captura de nome (fricção baixa pós-email).
- **Dado → uso:** name → {{firstName}} (plan-ready)
- **Alavanca:** Compromisso escalonado: depois do email, o nome é fácil.
- **Técnica:** input-measure · progresso: não · saveAs `name` · **transições:** → plan-ready

### 60 · `plan-ready` — R · N4 ★
- **Função estratégica:** PAYOFF pessoal: nome em destaque + plano pronto + badges dinâmicas + meta com data.
- **Dado → uso:** —
- **Alavanca:** Possessão ("é MEU plano") — efeito dotação.
- **Técnica:** result · progresso: não · **transições:** → country

### 61 · `country` — Q · N4
- **Função estratégica:** Segmentação de país para a oferta.
- **Dado → uso:** country → (oferta)
- **Alavanca:** Pergunta leve posicionada DEPOIS do payoff — custo mínimo.
- **Técnica:** question-single · progresso: não · saveAs `country` · **transições:** → scratch

### 62 · `scratch` — R · N4→💰
- **Função estratégica:** Dopamina final: raspadinha revela 30% + countdown de 4s empurra ao checkout.
- **Dado → uso:** scratched → analytics
- **Alavanca:** Recompensa variável (jogo) + urgência imediata.
- **Técnica:** scratch · progresso: não


---

## Todos os caminhos possíveis

| Persona | Telas | Δ vs linear | Divergências de caminho | Divergências de conteúdo |
|---|---|---|---|---|
| linear | 56 | +0 | — | — |
| mamae | 59 | +3 | + i-adaptacao, i-mamae, q-liberacao | diagnóstico D1b, badge pós-parto, headline checkout, FAQ extra |
| menopausa | 57 | +1 | + i-menopausa | diagnóstico D2b, plano 12 semanas |
| madura55 | 56 | +0 | — | pergunta balance adaptada (escadas), variante 55plus |
| dor | 57 | +1 | + i-adaptacao | i-activity personalizada, FAQ dor primeiro |
| cetica | 56 | +0 | — | i-awards→garantia 30d, garantia antecipada no checkout |
| jejum | 56 | +0 | — | i-jejum personalizado (refeição pulada) |
| metaAgressiva | 58 | +2 | + event-date, i-alinhamento | plano 12 semanas |
| inicianteTotal | 56 | +0 | — | plano 1 semana, badge plan-ready |
| vegana | 56 | +0 | — | refeições veganas no i-meal-preview |

### Sequências completas

**linear** (56): `age` → `social-proof` → `experience` → `i-welcome` → `goal` → `i-goal` → `secondary-goals` → `body-type` → `dream-body` → `best-shape` → `weight-pattern` → `i-diagnosis` → `flexibility` → `frequency` → `focus-zones` → `i-foco` → `plank` → `toe-touch` → `balance` → `pain-points` → `i-activity` → `work-routine` → `typical-day` → `energy` → `i-energy` → `water` → `sleep` → `stress` → `breakfast` → `lunch` → `dinner` → `i-jejum` → `diet-type` → `i-meal-preview` → `bad-habits` → `cravings` → `i-authority` → `height` → `weight` → `goal-weight` → `age-input` → `loading-analysis` → `wellness-profile` → `weight-triggers` → `event` → `projection` → `main-reason` → `confidence` → `i-awards` → `loading-plan` → `social-proof-2` → `email` → `name` → `plan-ready` → `country` → `scratch`

**mamae** (59): `age` → `social-proof` → `experience` → `i-welcome` → `goal` → `i-goal` → `secondary-goals` → `body-type` → `dream-body` → `best-shape` → `weight-pattern` → `i-diagnosis` → `flexibility` → `frequency` → `focus-zones` → `i-foco` → `plank` → `toe-touch` → `balance` → `pain-points` → `i-activity` → `i-adaptacao` → `work-routine` → `typical-day` → `energy` → `i-energy` → `water` → `sleep` → `stress` → `breakfast` → `lunch` → `dinner` → `i-jejum` → `diet-type` → `i-meal-preview` → `bad-habits` → `cravings` → `i-authority` → `height` → `weight` → `goal-weight` → `age-input` → `loading-analysis` → `wellness-profile` → `weight-triggers` → `i-mamae` → `q-liberacao` → `event` → `projection` → `main-reason` → `confidence` → `i-awards` → `loading-plan` → `social-proof-2` → `email` → `name` → `plan-ready` → `country` → `scratch`

**menopausa** (57): `age` → `social-proof` → `experience` → `i-welcome` → `goal` → `i-goal` → `secondary-goals` → `body-type` → `dream-body` → `best-shape` → `weight-pattern` → `i-diagnosis` → `flexibility` → `frequency` → `focus-zones` → `i-foco` → `plank` → `toe-touch` → `balance` → `pain-points` → `i-activity` → `work-routine` → `typical-day` → `energy` → `i-energy` → `water` → `sleep` → `stress` → `breakfast` → `lunch` → `dinner` → `i-jejum` → `diet-type` → `i-meal-preview` → `bad-habits` → `cravings` → `i-authority` → `height` → `weight` → `goal-weight` → `age-input` → `loading-analysis` → `wellness-profile` → `weight-triggers` → `i-menopausa` → `event` → `projection` → `main-reason` → `confidence` → `i-awards` → `loading-plan` → `social-proof-2` → `email` → `name` → `plan-ready` → `country` → `scratch`

**madura55** (56): `age` → `social-proof` → `experience` → `i-welcome` → `goal` → `i-goal` → `secondary-goals` → `body-type` → `dream-body` → `best-shape` → `weight-pattern` → `i-diagnosis` → `flexibility` → `frequency` → `focus-zones` → `i-foco` → `plank` → `toe-touch` → `balance` → `pain-points` → `i-activity` → `work-routine` → `typical-day` → `energy` → `i-energy` → `water` → `sleep` → `stress` → `breakfast` → `lunch` → `dinner` → `i-jejum` → `diet-type` → `i-meal-preview` → `bad-habits` → `cravings` → `i-authority` → `height` → `weight` → `goal-weight` → `age-input` → `loading-analysis` → `wellness-profile` → `weight-triggers` → `event` → `projection` → `main-reason` → `confidence` → `i-awards` → `loading-plan` → `social-proof-2` → `email` → `name` → `plan-ready` → `country` → `scratch`

**dor** (57): `age` → `social-proof` → `experience` → `i-welcome` → `goal` → `i-goal` → `secondary-goals` → `body-type` → `dream-body` → `best-shape` → `weight-pattern` → `i-diagnosis` → `flexibility` → `frequency` → `focus-zones` → `i-foco` → `plank` → `toe-touch` → `balance` → `pain-points` → `i-activity` → `i-adaptacao` → `work-routine` → `typical-day` → `energy` → `i-energy` → `water` → `sleep` → `stress` → `breakfast` → `lunch` → `dinner` → `i-jejum` → `diet-type` → `i-meal-preview` → `bad-habits` → `cravings` → `i-authority` → `height` → `weight` → `goal-weight` → `age-input` → `loading-analysis` → `wellness-profile` → `weight-triggers` → `event` → `projection` → `main-reason` → `confidence` → `i-awards` → `loading-plan` → `social-proof-2` → `email` → `name` → `plan-ready` → `country` → `scratch`

**cetica** (56): `age` → `social-proof` → `experience` → `i-welcome` → `goal` → `i-goal` → `secondary-goals` → `body-type` → `dream-body` → `best-shape` → `weight-pattern` → `i-diagnosis` → `flexibility` → `frequency` → `focus-zones` → `i-foco` → `plank` → `toe-touch` → `balance` → `pain-points` → `i-activity` → `work-routine` → `typical-day` → `energy` → `i-energy` → `water` → `sleep` → `stress` → `breakfast` → `lunch` → `dinner` → `i-jejum` → `diet-type` → `i-meal-preview` → `bad-habits` → `cravings` → `i-authority` → `height` → `weight` → `goal-weight` → `age-input` → `loading-analysis` → `wellness-profile` → `weight-triggers` → `event` → `projection` → `main-reason` → `confidence` → `i-awards` → `loading-plan` → `social-proof-2` → `email` → `name` → `plan-ready` → `country` → `scratch`

**jejum** (56): `age` → `social-proof` → `experience` → `i-welcome` → `goal` → `i-goal` → `secondary-goals` → `body-type` → `dream-body` → `best-shape` → `weight-pattern` → `i-diagnosis` → `flexibility` → `frequency` → `focus-zones` → `i-foco` → `plank` → `toe-touch` → `balance` → `pain-points` → `i-activity` → `work-routine` → `typical-day` → `energy` → `i-energy` → `water` → `sleep` → `stress` → `breakfast` → `lunch` → `dinner` → `i-jejum` → `diet-type` → `i-meal-preview` → `bad-habits` → `cravings` → `i-authority` → `height` → `weight` → `goal-weight` → `age-input` → `loading-analysis` → `wellness-profile` → `weight-triggers` → `event` → `projection` → `main-reason` → `confidence` → `i-awards` → `loading-plan` → `social-proof-2` → `email` → `name` → `plan-ready` → `country` → `scratch`

**metaAgressiva** (58): `age` → `social-proof` → `experience` → `i-welcome` → `goal` → `i-goal` → `secondary-goals` → `body-type` → `dream-body` → `best-shape` → `weight-pattern` → `i-diagnosis` → `flexibility` → `frequency` → `focus-zones` → `i-foco` → `plank` → `toe-touch` → `balance` → `pain-points` → `i-activity` → `work-routine` → `typical-day` → `energy` → `i-energy` → `water` → `sleep` → `stress` → `breakfast` → `lunch` → `dinner` → `i-jejum` → `diet-type` → `i-meal-preview` → `bad-habits` → `cravings` → `i-authority` → `height` → `weight` → `goal-weight` → `age-input` → `loading-analysis` → `wellness-profile` → `weight-triggers` → `event` → `event-date` → `i-alinhamento` → `projection` → `main-reason` → `confidence` → `i-awards` → `loading-plan` → `social-proof-2` → `email` → `name` → `plan-ready` → `country` → `scratch`

**inicianteTotal** (56): `age` → `social-proof` → `experience` → `i-welcome` → `goal` → `i-goal` → `secondary-goals` → `body-type` → `dream-body` → `best-shape` → `weight-pattern` → `i-diagnosis` → `flexibility` → `frequency` → `focus-zones` → `i-foco` → `plank` → `toe-touch` → `balance` → `pain-points` → `i-activity` → `work-routine` → `typical-day` → `energy` → `i-energy` → `water` → `sleep` → `stress` → `breakfast` → `lunch` → `dinner` → `i-jejum` → `diet-type` → `i-meal-preview` → `bad-habits` → `cravings` → `i-authority` → `height` → `weight` → `goal-weight` → `age-input` → `loading-analysis` → `wellness-profile` → `weight-triggers` → `event` → `projection` → `main-reason` → `confidence` → `i-awards` → `loading-plan` → `social-proof-2` → `email` → `name` → `plan-ready` → `country` → `scratch`

**vegana** (56): `age` → `social-proof` → `experience` → `i-welcome` → `goal` → `i-goal` → `secondary-goals` → `body-type` → `dream-body` → `best-shape` → `weight-pattern` → `i-diagnosis` → `flexibility` → `frequency` → `focus-zones` → `i-foco` → `plank` → `toe-touch` → `balance` → `pain-points` → `i-activity` → `work-routine` → `typical-day` → `energy` → `i-energy` → `water` → `sleep` → `stress` → `breakfast` → `lunch` → `dinner` → `i-jejum` → `diet-type` → `i-meal-preview` → `bad-habits` → `cravings` → `i-authority` → `height` → `weight` → `goal-weight` → `age-input` → `loading-analysis` → `wellness-profile` → `weight-triggers` → `event` → `projection` → `main-reason` → `confidence` → `i-awards` → `loading-plan` → `social-proof-2` → `email` → `name` → `plan-ready` → `country` → `scratch`

---

## Checkout (destino de todos os caminhos)

J1 hero (headline por mainReason + antes/depois) → J2 planos (pré-selecionado por persona, countdown) → garantia (antecipada p/ céticas) → incluídos (boost por estresse/água) → avaliações → histórias (persona primeiro) → FAQ (dinâmico por dor/pós-parto) → mídia → reviews → planos 2 → garantia → footer. CTA fixo no header. Modal de pagamento com resumo + desconto 30%.
