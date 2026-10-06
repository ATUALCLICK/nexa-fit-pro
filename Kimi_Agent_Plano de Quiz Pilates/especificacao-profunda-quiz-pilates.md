# Especificação Profunda — Quiz Pilates (Réplica Fiel BetterMe)
### Spec de comportamento, componentes e estados — nível de implementação

Este documento desce ao nível de **como cada tela se comporta**, não só o que contém. É o complemento build-ready do plano anterior. Sempre que algo aqui divergir do plano anterior, **este documento prevalece**.

---

## PARTE 1 — O DNA COMPORTAMENTAL DO FUNIL

Estas 10 regras de interação são o que torna o funil "BetterMe-like". Se qualquer uma for quebrada, a réplica deixa de ser fiel:

1. **Uma pergunta por tela. Sempre.** Nunca duas perguntas visíveis ao mesmo tempo.
2. **Escolha única = avanço automático.** Não existe botão "continuar" em pergunta de escolha única. O clique na opção dispara: estado `selected` (~150–250ms de feedback visual) → transição para a próxima tela. O usuário nunca precisa confirmar.
3. **Múltipla escolha = botão "Próximo passo" condicional.** O botão só aparece/habilita após a 1ª seleção. Opções se comportam como checkboxes (podem ser desmarcadas), exceto "Nenhum dos itens acima", que é **exclusiva**: selecionar "Nenhum" limpa as demais; selecionar outra limpa "Nenhum".
4. **Interstitial ≠ pergunta.** Interstitials não têm barra de progresso avançando, têm layout split (texto esquerda / imagem direita no desktop; empilhado no mobile) e CTA escuro fixo na base. São as únicas telas com botão "CONTINUAR" dentro do quiz.
5. **Todo input aberto responde.** Assim que o valor digitado é válido, um bloco de feedback aparece abaixo do campo (cálculo + insight) e o CTA habilita. Enquanto inválido/vazio, CTA fica cinza (disabled).
6. **Progresso é por seção, não por pergunta.** Barra fina segmentada no topo com o nome da seção centralizado. A barra enche suavemente dentro da seção; interstitials não movem a barra.
7. **Voltar sempre funciona.** Seta no canto superior esquerdo retorna à tela anterior **com a resposta preservada** (pré-selecionada). Refazer uma resposta regrava o estado.
8. **Loadings são teatrais e longos o bastante.** 8–14 segundos no total, com microcopy de credibilidade durante a espera. Nunca um spinner genérico.
9. **Nada de scroll dentro de perguntas.** Cada tela de pergunta cabe 100% no viewport (mobile e desktop). Scroll só existe no checkout e em telas de resultado/dashboard.
10. **Transições rápidas e direcionais.** Avanço: fade+slide sutil (150–250ms). Nenhum reload de página dentro do quiz (SPA pura); a URL muda por etapa para suportar o botão voltar do navegador.

---

## PARTE 2 — ANATOMIA GLOBAL (chrome compartilhado)

Todo o quiz (telas 3–49) usa o mesmo chrome. Variações por tipo de tela estão na Parte 3.

```
┌────────────────────────────────────────────────┐
│ [←]  LOGO (esq.)   NOME DA SEÇÃO (centro) [≡] │  header 64px
│ ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  barra de progresso 2–3px
│                                                │
│              HEADLINE (pergunta)               │
│              subheadline (opcional)            │
│                                                │
│   ┌──────────────────────────┐   ┌──────────┐ │
│   │  OPÇÕES / INPUT          │   │  IMAGEM  │ │  imagem lateral só no desktop
│   │  (coluna central 560px)  │   │  (abs)   │ │  e só em algumas perguntas
│   └──────────────────────────┘   └──────────┘ │
│                                                │
│         [ PRÓXIMO PASSO ]  (condicional)       │  CTA fixo na base quando existe
└────────────────────────────────────────────────┘
```

**Elementos do chrome:**

| Elemento | Comportamento |
|---|---|
| Botão voltar `[←]` | Sempre presente a partir da tela 2. Volta 1 etapa com resposta preservada. Na tela 1 não existe |
| Logo | Topo esquerdo (desktop) ou centralizado (mobile), link nenhum (não clicável durante o quiz — não dar rota de fuga) |
| Menu `[≡]` | Hamburger discreto; abre overlay com links institucionais (Ajuda, Termos, Privacidade). Nunca leva para fora do funil sem confirmação |
| Nome da seção | Texto centrado no header: `Meu perfil` → `Atividade` → `Estilo de vida e hábitos` → `Nutrição` → `Quase lá`. Muda apenas na 1ª pergunta de cada seção |
| Barra de progresso | 2–3px, cor de acento escuro. Segmentada visualmente por seção. Anima com `transition: width 300ms ease` a cada resposta |
| Botão "Ajuda" | Pill flutuante no canto inferior direito da **tela 1 apenas** |

**Cálculo da barra de progresso:**
```
progresso = (perguntas respondidas / total de perguntas do quiz) × 100
- Interstitials NÃO contam como pergunta
- Telas de input (altura/peso/meta/idade) contam
- Na seção final a barra chega a ~95% (100% só no loading de criação do plano)
```

---

## PARTE 3 — OS 7 TIPOS DE TELA (templates)

Todo o funil é montado a partir de apenas 7 templates. Replicar os 7 = replicar o funil.

### T1 — SELECT_CARDS (escolha única com imagem por opção)
Usado em: tela 1 (idade).
- Cards grandes com foto + label pill escuro sobre a imagem + seta circular
- Grid: 4 colunas desktop / 2×2 mobile
- Clique → ripple/scale no card → avanço automático
- Footer com Termos + Privacidade (só na tela 1)

### T2 — QUESTION_SINGLE (escolha única, lista)
Usado em: maioria das perguntas (3, 5, 8–11, 13–14, 16–18, 21–31, 42–44 parcial, 46–47).
- Cards de opção: largura máx 560px, altura 56–64px, borda 1px `#E7E2DA`, radius 12px
- Radio visual à direita: círculo vazio → ao clicar, círculo preenchido com check branco + fundo do card em tom bege `#F3EFE8`
- **Sem botão continuar.** Feedback de 150–250ms → avanço automático
- Imagem lateral opcional (config por pergunta: `image: right | none`)
- Algumas usam **ilustração de silhueta** por opção (telas 8–9) em vez de lista: grid 2×2/4 colunas com mesma regra de auto-advance

### T3 — QUESTION_MULTI (múltipla escolha)
Usado em: 7, 15, 19, 33–34, 42.
- Idêntico ao T2, mas checkbox à direita e **sem auto-advance**
- Botão `Próximo passo` fixo na base: nasce `disabled` (cinza `#B9B2A8`) → `enabled` (escuro `#292524`) na 1ª seleção
- Regra de exclusividade para a opção "Nenhum/Nenhuma" (ver DNA #3)

### T4 — INTERSTITIAL (insight/motivação/autoridade)
Usado em: 2, 4, 6, 12, 20, 24, 32, 35, 48.
- Sem avanço de progresso. Layout split 50/50 desktop; mobile empilha (texto sobre imagem)
- Headline 28–36px + 1–2 parágrafos com **1 trecho em negrito** (o benefício)
- Variantes:
  - **T4a Motivação:** headline curta + parágrafo (telas 4, 6, 20, 24)
  - **T4b Diagnóstico:** "Parece que você tem o perfil X" + explicação (tela 12)
  - **T4c Prova social:** número gigante + "Como visto em" logos (telas 2, 48, 50)
  - **T4d Autoridade:** 3 cards de especialista com foto/nome/credencial (tela 35)
  - **T4e Preview de produto:** cards de refeição com kcal/min (tela 32)
- CTA `CONTINUAR` escuro, pill, fixo na base (margem 24px)

### T5 — INPUT_MEASURE (medida numérica)
Usado em: 36–39, 51–52 (com variações).
- Card central com: toggle de unidade (CM/FT, KG/LBS) quando aplicável, input gigante centralizado (fonte 32–40px, text-align center, borda só embaixo), label de unidade à direita
- Hint de range: "Por favor, introduza um valor entre X e Y"
- **Máquina de estados do CTA:**
  ```
  vazio/inválido → disabled (cinza)
  válido → enabled + bloco de feedback aparece abaixo com fade-in
  clique com consentimento pendente → toast vermelho: "O consentimento é necessário para continuar"
  ```
- Consentimento (só tela 36): checkbox quadrado 18px + label de 2 linhas com link para Privacidade. Obrigatório. Toast de erro se tentar avançar sem marcar
- Feedbacks instantâneos por tela:
  - **37 (peso):** "Seu IMC é {x}, o que é considerado {faixa}" + microcopy
  - **38 (meta):** "Desbloqueie benefícios para a saúde: perca {y}% do seu peso" + frase de estudo
  - **39 (idade):** justificativa estática exibida sempre
- Regras de validação (com mensagem inline vermelha):
  - Altura: 90–243 cm (ou 3–8 ft)
  - Peso atual/meta: 25–300 kg
  - Idade: 16–100 anos
  - Meta ≠ peso atual (se igual/maior em fluxo de perda: mostrar copy alternativa de "manter e tonificar" em vez de erro — nunca bloquear)

### T6 — LOADING (processamento teatral)
Usado em: 40, 49.
- **T6a "Analisando suas respostas…" (tela 40):**
  - 4 barras horizontais rotuladas: `Seu Perfil`, `Atividade`, `Estilo de Vida e Hábitos`, `Nutrição`
  - Cada barra enche 0→100% sequencialmente (2,5–3s por barra; total ~10–12s), label de % à direita
  - Rodapé durante a espera: selo de credibilidade + nota de avaliação
  - Ao completar as 4 → transição automática para tela 41
- **T6b "Criando seu Plano de Pilates personalizado" (tela 49):**
  - Círculo de progresso central com % grande (0→100 em ~12–15s)
  - Abaixo: número social gigante ("{312.000} mulheres…")
  - Carrossel de 3 depoimentos (auto-rotate a cada ~4s, com estrelas)
  - Disclaimer no rodapé
  - 100% → headline muda para "**Seu Plano de Pilates personalizado está pronto!**" → redirect automático em ~1,5s para tela 50
- Header some ou fica mínimo (sem voltar nestas telas — evitar abandonar o "processamento")

### T7 — RESULT (resultado/dashboard/gráfico)
Usado em: 41, 45, 53.
- Únicas telas do quiz com scroll permitido
- **T7a Wellness Profile (41):** escala de IMC horizontal colorida com marcador "O Seu – {x}" + caixa de alerta de riscos + 4 cards de diagnóstico (ícone + label + valor) + imagem "corpo atual"
- **T7b Projeção (45):** gráfico de linha/área com gradiente (vermelho→verde), eixo X em meses, eixo Y em kg, ponto final com tooltip "Objetivo {x} kg"; disclaimer `*` abaixo; quote da especialista com foto
- **T7c Plano Pronto (53):** headline com `{nome}` + gráfico de 4 semanas + 3 badges com ícone + disclaimer
- CTA `CONTINUAR` fixo na base

*(Telas 50–55 e checkout seguem os mesmos templates: T4c, T5, T7c + componentes especiais detalhados na Parte 6.)*

---

## PARTE 4 — MÁQUINA DE ESTADOS GLOBAL

```
TELA_1_IDADE (T1)
  └─auto→ TELA_2_PROVA_SOCIAL (T4c)
      └─cta→ SEÇÃO 1 "Meu perfil": Q3→I4→Q5→I6→Q7(multi) → Q8→Q9→Q10→Q11→I12(diagnóstico)
          └─→ SEÇÃO 2 "Atividade": Q13→Q14→Q15(multi)→Q16→Q17→Q18→Q19(multi)→I20
              └─→ SEÇÃO 3 "Estilo de vida": Q21→Q22→Q23→I24(eco)→Q25→Q26→Q27
                  └─→ SEÇÃO 4 "Nutrição": Q28→Q29→Q30→Q31→I32(preview)→Q33(multi)→Q34(multi)→I35(autoridade)
                      └─→ SEÇÃO 5 "Quase lá": INPUT36(altura+consent)→INPUT37(peso→IMC)→INPUT38(meta→%)→INPUT39(idade)
                          └─→ LOADING40 (T6a) → RESULT41 (T7a)
                              └─→ Q42(multi gatilhos)→Q43(evento)→Q44(data, pulável)→RESULT45(projeção)→Q46(razão)→Q47(compromisso)→I48(prêmios)
                                  └─→ LOADING49 (T6b) → T50(reprise T4c) → EMAIL51 → NOME52 → RESULT53(plano pronto)
                                      └─→ PAÍS54 → RASPADINHA55 →(countdown 4s)→ CHECKOUT
```

**Regras da máquina:**
- Transições por resposta (`answer`), por CTA (`cta`), por timer (`loading_done`, `scratch_reveal`, `redirect`)
- Estado persistido a cada transição no backend via `order` (UUID) — permite retomada
- `flow` (variante A/B) congela: ordem de perguntas, presença da raspadinha, preços e copies sob teste
- Voltar do navegador = voltar da seta (mesma rota, estado íntegro)
- Refresh em qualquer tela = reidrata estado pelo `order` e permanece na mesma tela

---

## PARTE 5 — COPY DECK COMPLETO + METADADOS POR TELA

Formato: `[ID] TEMPLATE | seção | imagem | evento de tracking` + conteúdo. Copies finais de produção.

### Bloco A — Entrada

**[01] T1 | sem seção | 4 fotos | `quiz_start` / `age_selected`**
- Headline: PLANO DE TREINO DE PILATES
- Sub: ESCOLHA A SUA IDADE
- Opções: `Idade: 25–34` / `Idade: 35–44` / `Idade: 45–54` / `Idade: 55+`
- Footer: "Ao escolher sua idade e continuar, você concorda com nossos [Termos de Serviço] | [Política de Privacidade] — Leia antes de continuar"
- Flutuante: botão "Ajuda" (pill, canto inferior direito)
- Variável gravada: `age_bucket`

**[02] T4c | — | foto lunge/stretch | `social_proof_viewed`**
- Copy: "Mais de **98.000 mulheres** na **casa dos {idade} anos** já experimentaram nosso Plano de Pilates"
- "Como visto em": 3 logos de mídia
- CTA: CONTINUAR
- Mapa de idade para copy: 25–34→"casa dos 20 e 30 anos" / 35–44→"casa dos 30 e 40 anos" / 45–54→"casa dos 40 e 50 anos" / 55+→"acima dos 50 anos"

### Bloco B — Seção "Meu perfil"

**[03] T2 | Meu perfil | foto full-body lateral | `q_experience`**
- "Você já praticou Pilates antes?" — Sim / Não

**[04] T4a | — | foto roll-up em sala | `insight_welcome`**
- "**Você vai amar!** Nosso programa de Pilates é suave, de baixo impacto e eficaz para todos os níveis de condicionamento físico. Vamos ajudar você a **tonificar o corpo e corrigir a postura sem nenhum equipamento** em casa!"

**[05] T2 | Meu perfil | sem imagem | `q_goal`**
- "Qual é o seu principal objetivo?"
- Perder peso / Tonificar e definir / Corrigir a postura e aliviar dores / Manter o peso e ficar em forma
- Variável: `goal` (drive de copy em 06, 12, 46, 53, checkout)

**[06] T4a | — | foto seated stretch | `insight_goal`**
- Se `goal=perder peso`: "**Nós sabemos como fazer isso acontecer!** Vamos criar um plano adaptado às suas medidas corporais e ao seu objetivo. Assim, você pode **emagrecer no seu ritmo** e com prazer!"
- Se `goal=postura`: "**Você está no lugar certo!** O Pilates é o método mais estudado para **realinhar a postura e aliviar dores** — sem impacto, sem equipamento."
- Se `goal=tonificar`: "**Perfeito!** Sequências de Pilates criam **músculos longos e definidos** — o famoso 'corpo de bailarina' — usando só o peso do seu corpo."
- Se `goal=manter`: "**Ótima escolha!** Consistência é o segredo. Vamos montar uma rotina que **mantém você em forma e com energia** todos os dias."

**[07] T3 | Meu perfil | sem imagem | `q_secondary_goals`**
- "O que mais você espera alcançar com este plano?" — sub: "Escolha todas que se aplicam"
- Reduzir dores nas costas / Aumentar flexibilidade / Fortalecer o abdômen (core) / Reduzir o estresse e a ansiedade / Dormir melhor / **Nenhum dos itens acima** (exclusiva)

**[08] T2-silhueta | Meu perfil | 4 ilustrações | `q_body_type`**
- "Como você descreveria o seu físico atual?"
- Magra / Média / Tamanho grande / Significativamente acima do peso

**[09] T2-silhueta | Meu perfil | 4 ilustrações | `q_dream_body`**
- "Qual é o seu corpo de sonho?" — sub: "Visualize sua meta para se manter motivada e responsável"
- Esguia e alongada / Tonificada / Com curvas / Média

**[10] T2 | Meu perfil | sem imagem | `q_best_shape_recency`**
- "Há quanto tempo você esteve no melhor físico da sua vida?"
- Há menos de um ano / 1 a 2 anos atrás / Há mais de 3 anos / Nunca

**[11] T2 | Meu perfil | sem imagem | `q_weight_pattern`**
- "Como o seu peso muda tipicamente?"
- Peso difícil de perder / O peso muda facilmente / Dificuldade em ganhar peso

**[12] T4b | — | foto single-leg stretch | `diagnosis_shown`**
- Matriz na Parte 7. Default: "**Parece que você tem o perfil de Core Adormecido.** Quando os músculos profundos do abdômen não são ativados, a barriga projeta-se para fora e a postura sofre — mesmo em pessoas magras. Os nossos **treinos guiados por vídeo com foco em ativação do core** vão reverter isso de forma progressiva."

### Bloco C — Seção "Atividade"

**[13] T2 | Atividade | foto saw stretch | `q_flexibility`**
- "Você se considera flexível?" — Bastante flexível / Estou começando / Não muito / Não tenho certeza

**[14] T2 | Atividade | sem imagem | `q_frequency`**
- "Quantas vezes por semana você se exercita?" — Quase todos os dias / Várias vezes por semana / Várias vezes por mês / Nunca

**[15] T3 | Atividade | silhueta clicável | `q_focus_zones`**
- "Quais regiões você quer transformar?" — sub: "Escolha todas que se aplicam"
- Barriga / Cintura / Glúteos / Pernas / Braços / Postura (costas)

**[16] T2 | Atividade | sem imagem | `q_plank`**
- "Por quanto tempo você consegue segurar uma prancha?" — Não consigo / Menos de 30 segundos / 30–60 segundos / Mais de 1 minuto

**[17] T2 | Atividade | sem imagem | `q_toe_touch`**
- "Sentada com as pernas esticadas, você consegue tocar os pés?" — Nem perto / Quase lá / Toco com esforço / Toco facilmente

**[18] T2 | Atividade | sem imagem | `q_balance`**
- "Você consegue ficar em uma perna só por 30 segundos sem apoio?" — Não / Com dificuldade / Sim, em uma perna / Sim, nas duas

**[19] T3 | Atividade | sem imagem | `q_pain_points`**
- "Você sente desconforto em alguma dessas regiões?" — sub: "Escolha todas que se aplicam"
- Lombar / Pescoço e ombros / Joelhos / Quadril / **Nenhuma** (exclusiva)
- Microcopy no rodapé: "Este plano não substitui orientação médica ou fisioterapêutica."

**[20] T4a | — | foto cat-cow | `insight_activity`**
- "**Ótimo, entendido!** Vamos montar sequências que fortalecem o core, **protegem sua {lombar}** e melhoram o condicionamento de forma suave. Uma rotina simples e regular de Pilates significa um corpo mais forte, alongado e sem dores!"
- `{lombar}` = primeira região marcada em 19; se "Nenhuma" → "protegem suas articulações"

### Bloco D — Seção "Estilo de vida e hábitos"

**[21] T2 | Estilo de vida e hábitos | sem imagem | `q_work_routine`**
- "Como é a sua rotina de trabalho?" — Das 9h às 18h / Horários flexíveis / Turnos noturnos / Não estou trabalhando no momento

**[22] T2 | idem | sem imagem | `q_typical_day`**
- "Como você descreveria o seu dia típico?" — Passo a maior parte do dia sentada / Faço pausas ativas / Fico de pé o dia todo

**[23] T2 | idem | sem imagem | `q_energy`**
- "Como são os seus níveis de energia durante o dia?" — Baixos, sinto-me cansada o dia todo / Queda após o almoço / Vou me arrastando entre refeições / Elevados e estáveis

**[24] T4a | — | foto breathing exercise | `insight_energy`**
- Eco conforme resposta em 23 (copies no plano anterior; regra: repetir a **frase exata** da opção escolhida na headline)

**[25] T2 | idem | sem imagem | `q_water`**
- "Quanta água você bebe por dia?" — nota: "1 copo médio de água equivale a 250 ml"
- Apenas tomo café ou chá / Cerca de 2 copos / 2 a 6 copos / Mais de 6 copos

**[26] T2 | idem | sem imagem | `q_sleep`**
- "Quantas horas você dorme por noite?" — Menos de 5 horas / 5–6 horas / 7–8 horas / Mais de 8 horas

**[27] T2 | idem | sem imagem | `q_stress`**
- "Como você avalia seu nível de estresse no dia a dia?" — Muito alto / Moderado / Baixo / Bem controlado

### Bloco E — Seção "Nutrição"

**[28] T2 | Nutrição | sem imagem | `q_breakfast`**
- "Quando você normalmente toma café da manhã?" — Entre 6h e 8h / Entre 8h e 10h / Entre 10h e meio-dia / Costumo pular o café da manhã

**[29] T2 | idem | `q_lunch`** — "E o almoço?" — Entre 10h e meio-dia / Entre meio-dia e 14h / Entre 14h e 16h / Costumo pular o almoço

**[30] T2 | idem | `q_dinner`** — "A que horas você normalmente janta?" — Entre 16h e 18h / Entre 18h e 20h / Entre 20h e 22h / Costumo pular o jantar

**[31] T2-agrupado | idem | `q_diet_type`**
- "Que tipo de alimentação você prefere?"
- Grupos com divisores: **Com carne** (Tradicional "Gosto de tudo" / Keto / Low carb) · **Sem carne** (Vegetariana / Vegana / Keto vegana) · **Com peixe** (Mediterrânea / Pescatariana) · **Sem alérgenos** (Sem lactose / Sem glúten)
- Cada opção tem título + descrição de 1 linha. Auto-advance mantido

**[32] T4e | — | fotos de pratos | `meal_preview`**
- "**Emagreça com um plano alimentar adaptado.** A nutrição é fundamental para **um resultado visível**. Receba receitas rápidas e saborosas e melhore seus hábitos para atingir sua meta mais rápido."
- Cards: Suas refeições → Café da manhã 420 kcal | 10 min · Almoço 510 kcal | 20 min · Jantar 435 kcal | 25 min

**[33] T3 | Nutrição | `q_bad_habits`**
- "Você tem algum desses hábitos?" — Comer por emoção ou tédio / Comer demais / Lanches noturnos / Pular refeições com frequência / **Nenhum dos itens acima**

**[34] T3 | idem | `q_cravings`**
- "Quais alimentos você mais sente vontade de comer?" — Doces / Salgadinhos / Fast food / Refrigerante / **Nenhum dos itens acima**

**[35] T4d | — | 3 fotos | `authority_viewed`**
- "Especialistas certificadas de alto nível"
- {Nome} — Instrutora de Pilates Certificada (BASI) · {Nome} — Fisioterapeuta especialista em coluna · {Nome} — Nutricionista

### Bloco F — Seção "Quase lá" (inputs)

**[36] T5 | Quase lá | `height_submitted`**
- "Qual é a sua altura?" — toggle CM/FT · range 90–243 cm · consent checkbox obrigatório: "Eu concordo que {Marca} processe meus dados de saúde para fornecer serviços e melhorar minha experiência de usuária. [Política de Privacidade]."
- Toast de erro: "O consentimento é necessário para continuar"

**[37] T5 | idem | `weight_submitted` / `bmi_calculated`**
- "Qual é o seu peso atual?" — toggle KG/LBS · range 25–300
- Feedback ao valor válido: "Seu IMC é {x}, o que é considerado {abaixo do peso|normal|acima do peso|obesidade}. Você pode ganhar muito ao perder pouco peso. Vamos usar o seu IMC para criar o programa ideal para você."

**[38] T5 | idem | `goal_weight_submitted`**
- "Entendido! E qual é o seu peso dos sonhos?" — range 25–300
- Feedback: "**Desbloqueie benefícios para a saúde: perca {y}% do seu peso.** Estudos demonstraram que perder 10% ou mais do peso corporal pode reduzir o risco de doenças associadas à obesidade, como problemas cardíacos, glicemia alta e inflamação."
- `{y}` = round((atual−meta)/atual×100)

**[39] T5 | idem | `age_submitted`**
- "Qual é a sua idade?" — input + "anos"
- Texto fixo: "Perguntamos a sua idade para personalizar o seu plano. Com a idade, a massa muscular diminui e o core enfraquece — o Pilates é o método mais indicado para reverter isso com segurança."

### Bloco G — Resultado

**[40] T6a | `analysis_started` / `analysis_done`**
- "Analisando suas respostas…" — barras: Seu Perfil / Atividade / Estilo de Vida e Hábitos / Nutrição
- Rodapé: selo "App em destaque em {X} países" + avaliação "Excelente"

**[41] T7a | `profile_viewed`**
- "Aqui está o seu perfil de bem-estar"
- IMC {x} na escala (15–40: Abaixo do peso 15–18,5 · Normal 18,5–25 · Acima do peso 25–30 · Obeso 30–40), marcador "O Seu – {x}"
- Alerta: "Riscos de IMC não saudável: tensão arterial elevada, risco acrescido de ataque cardíaco, AVC, diabetes tipo 2, dores crônicas nas costas e articulações" — **exibir apenas se IMC ≥ 25 ou < 18,5**; se normal, trocar por caixa verde: "Seu IMC está na faixa saudável — o foco do seu plano será tônus, postura e flexibilidade."
- Cards: Perfil de core {diagnóstico da Parte 7} · Estilo de vida {derivado de 22: "Sedentário" se sentada} · Nível de Pilates {derivado de 3+14+16–18} · Flexibilidade {derivado de 13+17}
- Imagem: "corpo atual" (silhueta conforme resposta 8)

### Bloco H — Ancoragem emocional

**[42] T3 | Quase lá | `q_weight_triggers`**
- "Algum desses eventos contribuiu para o ganho de peso nos últimos anos?" — sub: "Escolha todas que se aplicam"
- Pressão no trabalho / Correria da vida familiar / Gravidez e maternidade / Separação ou divórcio / Metabolismo mais lento com a idade / Dificuldades financeiras / Menopausa / **Nenhum dos itens acima**

**[43] T2 | idem | `q_event`**
- "Você tem algum evento importante chegando?" — sub: "Ter algo pelo qual esperar pode ser um grande motivador para **atingir sua meta**"
- Férias / Casamento / Viagem de praia / Festa de fim de ano / Reencontro / Aniversário / Outro / Nenhum evento por enquanto
- Se "Nenhum" → pula direto para 45

**[44] T2-date | idem | `event_date_set` / `event_skipped`**
- "Quando é o seu evento?" — sub: "Vamos **manter essa data em mente** para a sua meta"
- Date picker + nota de privacidade + CTA CONTINUAR + botão ghost **PULAR ESTA ETAPA**

**[45] T7b | — | gráfico + foto coach | `projection_viewed`**
- "O plano que vai finalmente transformar o seu corpo"
- "Estimamos que você pode chegar a **{meta} kg** até **{data}***"
- Regra da data de projeção: `hoje + (kg a perder ÷ 0,75 kg/semana)`, arredondada para o dia 1º ou 15 mais próximo; se usuária definiu data de evento em 44, usar a **menor** das duas
- Curva: decaimento suave (não linear — perda mais rápida nas 2 primeiras semanas), gradiente vermelho→verde, tooltip no ponto final "Objetivo {meta} kg"
- Disclaimer completo (ver Parte 8)
- Quote: "O nosso Plano de Pilates vai ajudar você a conquistar **resultados duradouros**. Ele combina treinos envolventes de baixo impacto com nutrição saudável para garantir o seu progresso." — {Nome}, Instrutora de Pilates Certificada (foto + selo de verificada)

**[46] T2 | idem | `q_main_reason`**
- "Qual é a sua principal razão para essa transformação?"
- Me sentir confiante no meu corpo / Ter mais saúde e energia / Voltar a usar minhas roupas favoritas / Recuperar meu corpo após a gravidez / Me livrar das dores / Outro

**[47] T2 | idem | `q_confidence`**
- "Quão confiante você está em alcançar **{meta} kg** até **{data}**?"
- Acredito que consigo! / Estou incerta, mas quero tentar! / Ainda estou muito insegura

**[48] T4c | — | 3 selos | `awards_viewed`**
- "O que faz de {Marca} uma escolha confiável" + 3 cards de prêmio/reconhecimento com ano

**[49] T6b | `plan_creation_started` / `plan_ready`**
- "Criando seu Plano de Pilates personalizado" — círculo 0→100%
- "**{312.000} mulheres** escolheram {Marca} para transformar o corpo"
- Carrossel: 3 depoimentos com estrelas (auto-rotate 4s)
- Disclaimer: "Seguir o plano de treinos e alimentação influencia significativamente os resultados. Em 4 semanas, as usuárias normalmente perdem no máximo 0,5–1 kg por semana. Resultados individuais podem variar."
- 100% → "Seu Plano de Pilates personalizado está pronto!" → redirect 1,5s

### Bloco I — Captura e fechamento

**[50] T4c | `social_proof_2_viewed`** — réplica da tela 02 (mesma copy dinâmica por idade) + CTA CONTINUAR

**[51] T5-email | `email_submitted`**
- "Digite seu e-mail para receber seu **Plano de Pilates personalizado** e transformar seu corpo"
- Input (placeholder "O seu e-mail") + cadeado + nota de privacidade + CTA CONTINUAR
- Validação: RFC básica + erro inline "Introduza um e-mail válido"
- Disparo imediato de e-mail transacional "Seu plano está quase pronto" (reengajamento)

**[52] T5-nome | `name_submitted`**
- "Qual é o seu nome?" — input gigante centralizado + CTA CONTINUAR (habilita com ≥2 caracteres)

**[53] T7c | `plan_ready_viewed`**
- "**{Nome}**, o seu Plano de Pilates de 4 semanas para emagrecer está pronto!"
- Gráfico de 4 semanas (Semana 1→4, marcadores "Agora" e "4 semanas") + nota "Este gráfico é apenas para fins ilustrativos"
- Badges: 👍 Perfeito para iniciantes · 🧘 Personalizado com base nas suas respostas · 🎯 Meta: Perder {x} kg até {data}*
- Disclaimer de resultado + CTA CONTINUAR

**[54] T2-país | `country_confirmed`**
- "Você é do Brasil? Pedimos seu país para personalizar sua oferta." — Sim, sou / Não, mudar meu país (abre seletor)
- Auto-detect por IP; pré-selecionar "Sim"

**[55] RASPADINHA | `scratch_started` / `scratch_revealed`**
- "Raspe para revelar seu desconto especial!" — sub: "Queremos que você comece sua jornada com uma boa surpresa"
- Card estilo cupom (ticket com picote): overlay escuro "Raspe aqui" + ícone de gesto
- Interação: canvas — apagar ≥40% da área revela tudo automaticamente; em dispositivos sem suporte, fallback de clique
- Revelado: "**30% de desconto** no seu Plano de Pilates" + "Código promocional `{pilates_jul26}`" (check verde) + "Aplicado automaticamente no checkout"
- Countdown circular 4s → redirect ao checkout
- **O desconto é sempre 30%** — a raspadinha é teatro de posse, não sorteio (mesmo padrão do original)

---

## PARTE 6 — COMPONENTES ESPECIAIS (detalhe fino)

### 6.1 Card de opção (T2/T3)
```
default:  bg #FFFFFF · border 1px #E7E2DA · radius 12px · padding 16/20px
hover:    border #C9C2B6 · translateY(-1px) · transition 150ms
selected: bg #F3EFE8 · border #292524 · radio/check preenchido #292524 com ✓ branco
focus:    outline 2px offset (a11y)
```
- Toda a área do card é clicável (não só o radio)
- Auto-advance: após `selected`, delay 200ms → `slideOut(fade)` → próxima tela

### 6.2 CTA fixo na base
- Container com gradiente de fade do fundo (para legibilidade sobre conteúdo)
- Botão pill full-width (max 400px, centralizado), altura 52px
- Estados: `enabled #292524` / `disabled #B9B2A8 cursor-not-allowed`

### 6.3 Toast de erro
- Slide-up da base do card, fundo `#E5484D`, texto branco, ícone ⚠, auto-dismiss 3s
- Único uso: consentimento pendente (tela 36)

### 6.4 Raspadinha
- Canvas 320×420px, overlay `#292524` com texto "Raspe aqui" + SVG de seta de gesto
- Brush: círculo 28px, `destination-out`; ao atingir 40% de área limpa → fade do overlay restante (400ms)
- Haptic leve no mobile durante o "raspar" (se disponível)

### 6.5 Countdown do checkout
- Formato `MM:SS` com labels "minutos/segundos"; inicia em 10:00; persiste em localStorage por sessão
- Presente 2×: header fixo e card do cupom no bloco de planos
- Ao zerar: não quebra a página — apenas esconde o selo de urgência (o desconto permanece; padrão observado no original)

### 6.6 Card de plano (checkout)
- 3 cards horizontais (desktop) / empilhados (mobile)
- Radio à direita; card do meio com faixa "MAIS POPULAR" no topo e **pré-selecionado**
- Preço riscado → preço final em destaque; abaixo "R$ X/dia" grande
- Mudança de seleção atualiza: disclaimer de renovação (valor e ciclo) e o modal de pagamento

---

## PARTE 7 — MATRIZ DE DIAGNÓSTICO EXPANDIDA (drive de 12 e 41)

| # | Condição (respostas) | Diagnóstico | Copy do interstitial 12 (resumo) | Card na tela 41 |
|---|---|---|---|---|
| D1 | goal = postura/dores | **Postura Sobrecarregada** | Ombros curvados e tensão cervical indicam desequilíbrio da cadeia posterior | Perfil de postura: Sobrecarregada |
| D2 | goal = perder peso ∧ weight_pattern = difícil | **Metabolismo de Baixa Queima** | Seu corpo tende a preservar energia — o segredo é queimar com baixo impacto e constância | Metabolismo: Lento, fácil de ganhar peso |
| D3 | plank < 30s ∧ (body_type = média/grande) | **Core Adormecido** | Transverso inativo projeta a barriga e sobrecarrega a lombar | Perfil de core: Adormecido |
| D4 | toe_touch = nem perto/quase | **Encurtamento Muscular** | Cadeias encurtadas limitam movimento e pioram a postura | Flexibilidade: Baixa |
| D5 | typical_day = sentada ∧ pain = lombar | **Quadril Preso** | Flexores de quadril encurtados por horas sentada | Mobilidade de quadril: Restrita |
| Fallback | — | **Perfil Equilibrado** | Base sólida — o plano acelera o que já funciona | Perfil geral: Equilibrado |

Prioridade: D1 > D2 > D3 > D4 > D5 > fallback (o 1º match vence).

**Nível de Pilates (tela 41)** — score:
```
experiência(3): não=0, sim=2
frequência(14): nunca=0, mês=1, semana=2, diária=3
prancha(16): não=0, <30s=1, 30–60=2, >60s=3
equilíbrio(18): não=0, dificuldade=1, uma=2, duas=3
0–2 → Iniciante · 3–6 → Iniciante+ · 7–9 → Intermediário · 10+ → Avançado
```

---

## PARTE 8 — TEXTOS LEGAIS EXATOS (não parafrasear)

1. **Disclaimer de projeção (45/53):** "*Baseado em dados de usuárias que registram o progresso no app. Seguir o plano de treinos e alimentação influencia significativamente os resultados. O gráfico é uma ilustração não personalizada e os resultados podem variar. Consulte seu médico antes de começar."
2. **Disclaimer de perda semanal (49/checkout):** "Seguir o plano de exercícios e alimentação influencia significativamente os resultados. Em 4 semanas, as usuárias normalmente podem esperar perder no máximo 0,5–1 kg por semana. Os resultados individuais podem variar."
3. **Renovação (checkout):** "Sem cancelamento, antes do término do plano selecionado, aceito que {Marca} cobre automaticamente {valor} a cada {ciclo} até eu cancelar. Cancele online pelo perfil no site ou app."
4. **Garantia:** "Acreditamos que o nosso plano funciona e você verá resultados visíveis em apenas 4 semanas! Devolvemos o seu dinheiro se você demonstrar que seguiu o plano e não viu resultados. Consulte as condições na nossa política de reembolso."
5. **Depoimentos:** "Esta usuária teve acesso a acompanhamento personalizado, disponível como recurso adicional pago. Usuária compensada por compartilhar seu feedback."
6. **Limitação física (19):** "Este plano não substitui orientação médica ou fisioterapêutica."

---

## PARTE 9 — EVENTOS DE ANALYTICS (nome exato + payload)

```js
// por tela
screen_viewed { screen_id, template, section, flow, order_id }
answer_submitted { screen_id, question_key, value(s), time_on_screen_ms }
insight_viewed { screen_id, variant }            // T4s
diagnosis_assigned { diagnosis_id }              // D1–D5
input_validated { field, value }                 // 36–39
feedback_shown { field, payload }                // IMC, %meta
loading_completed { type: 'analysis' | 'plan', duration_ms }
email_submitted / name_submitted { order_id }
country_confirmed { country, source: 'geoip' | 'manual' }
scratch_revealed { discount: 30, code }
plan_card_selected { plan: '1w' | '4w' | '12w', price }
checkout_cta_clicked { position: 'header' | 'plans_1' | 'plans_2' }
payment_modal_opened / purchase_completed { plan, value, coupon }
```

**Funil de dashboards:** age_selected → q_goal → diagnosis → height → analysis_done → profile → projection → email → name → scratch → plan_selected → purchase. Medir drop-off por `screen_id`.

---

## PARTE 10 — CRITÉRIOS DE ACEITE DE PARIDADE (QA)

Testar cada item contra o original lado a lado:

- [ ] Escolha única avança **sem botão** em ≤250ms após o clique
- [ ] Múltipla só libera "Próximo passo" após 1ª seleção; "Nenhum" é exclusiva
- [ ] Nome da seção no header muda exatamente nas telas 3, 13, 21, 28, 36
- [ ] Barra de progresso não anda em interstitials
- [ ] Voltar preserva respostas (radio/check/inputs pré-preenchidos)
- [ ] IMC calcula e renderiza feedback sem sair da tela (37)
- [ ] CTA cinza até input válido; toast vermelho sem consentimento (36)
- [ ] Loading 40: barras enchem em sequência, nunca simultâneas; ~10–12s
- [ ] Loading 49: chega a 100%, muda headline e redireciona sozinho
- [ ] Tela 41: marcador do IMC posicionado proporcionalmente na escala 15–40
- [ ] Tela 45: data da projeção = regra de 0,75 kg/semana (ou data do evento, se menor)
- [ ] Raspadinha revela com gesto real (canvas) e fallback de clique
- [ ] Countdown persiste ao dar F5 (localStorage)
- [ ] Plano do meio pré-selecionado com faixa "MAIS POPULAR"
- [ ] Modal de pagamento: regular → desconto → código → total → "você economiza"
- [ ] Nenhuma tela de pergunta tem scroll no mobile (360×640)
- [ ] Todas as telas têm headline idêntica em hierarquia e peso tipográfico ao original
- [ ] Disclaimers da Parte 8 presentes, palavra por palavra, nas telas corretas
