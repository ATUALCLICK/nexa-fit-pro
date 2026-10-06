# Template de Jornada — Transformação Corporal

**Como o quiz do Viva Forge funciona, fase por fase — e por que cada etapa existe.**

Este documento é o raciocínio estratégico por trás de `journey-skeleton.json`. O JSON diz **o quê** (62 slots + 12 seções de checkout, com contrato por slot); este MD diz **por quê**. O gerador (S2/S3) consome o JSON; um humano avaliando ou adaptando a jornada lê este arquivo.

---

## A ideia central

Um quiz-funnel não é um formulário. É uma **escada de comprometimento**: cada tela pede um pouco mais porque a anterior já deu um pouco mais. A jornada inteira existe para mover a usuária por níveis de consciência:

```
N0  curiosa        → "o que é isso?"
N1  interessada    → "isso é pra mim"
N2  consciente     → "sei qual é o meu problema"
N3  convencida     → "esse método resolve o meu problema"
N4  pronta         → "quero começar agora"
compra
```

Cada fase F0–F10 carrega a usuária de um nível ao seguinte. **Cortar um slot não remove uma tela — remove um degrau da escada.** As anotações "o que acontece se cortar" abaixo existem exatamente para impedir podas que quebram a mecânica.

## O vocabulário de papéis (14 tags)

Todo slot tem exatamente um papel estratégico. O vocabulário é **fechado** — o gerador não inventa papéis novos:

| Papel | Função |
|---|---|
| `micro-compromisso` | Primeiro clique com fricção quase zero; inicia o comprometimento |
| `declaracao` | Ela declara algo sobre si — consistência que o funil ecoa depois |
| `eco` | O funil devolve o que ela disse — "isso é pra mim" |
| `medicao` | Auto-avaliação que monta o baseline e calibra o plano |
| `diagnostico` | Nomeia o problema com rótulo personalizado — virada de consciência |
| `autoridade` | Credenciais, experts, mídia — por que confiar neste método |
| `tangibilizacao` | Mostra o produto concreto antes de vender |
| `projecao` | Desejo vira plano com número e data — maior propulsor ao CTA |
| `compromisso` | Declaração de intenção/confiança que o funil usa para fechar |
| `captura` | Pede algo valioso (email, nome, dados) — sempre blindada |
| `blindagem` | Responde uma objeção no ponto em que ela aparece |
| `recompensa` | Payoff pelo investimento: perfil, plano pronto, cupom |
| `prova-social` | Outras pessoas como ela validam a decisão |
| `consentimento` | Permissão legal/segura para dados sensíveis — texto fixo, nunca gerado |

Distribuição real na jornada: `medicao` ×20, `declaracao` ×9, `captura` ×8, `recompensa` ×6, `eco` ×5, `blindagem` ×4, e os papéis de virada (`diagnostico`, `projecao`, `tangibilizacao`, `micro-compromisso`, `compromisso`, `consentimento`) ×1 — são raros porque são **caros**: cada um é um momento de pico, e pico diluído não é pico.

---

## F0 — Entrada (slots 1–2) · N0→N1

**Objetivo:** compromisso mínimo + relevância imediata.

- **Idade** (`micro-compromisso`) — o clique mais barato possível: ninguém hesita em dizer a faixa etária. Mas já é um clique, e quem clicou uma vez clica de novo. *Se cortar:* a primeira tela vira algo mais caro (corpo, dor, meta) e a taxa de início cai.
- **Tipo de corpo** (`medicao`) — ainda barato, visual, e já começa o baseline. *Se cortar:* perde o primeiro dado de personalização sem ganho de fricção.

## F1 — Objetivo (slots 3–6) · N1

**Objetivo:** ela declara; o funil devolve eco.

- **Zonas de foco** (`declaracao`) — "o que você quer mudar?" é a pergunta que ela *quer* responder. Multi-seleção = investimento sem risco.
- **Eco imediato** (`eco`) — a tela que repete o foco dela de volta ("vamos montar sequências para {{foco}}"). É aqui que nasce o "isso é pra mim". *Se cortar:* o quiz vira interrogatório — pergunta, pergunta, pergunta, sem devolver nada.
- **Sonho + ocasião** (`declaracao`) — o objetivo ganha peso (uma festa, férias, um espelho). A ocasião é o que alimenta a projeção com data lá no F7.

## F2 — Aprofundamento do problema (7–12) · N1→N2

**Objetivo:** streak de investimento na auto-imagem até o diagnóstico.

Cinco telas de `medicao`/`declaracao` em sequência (como o corpo se sente, o que incomoda, há quanto tempo, o que já tentou). Cada uma aumenta o custo de abandono — quem investiu 10 telas não larga na 11ª. O bloco culmina no **diagnóstico** (`diagnostico`, ★): o funil nomeia o problema *com os dados dela* ("{{diagnosisCardLabel}}"). É a virada N1→N2: ela para de achar que "só precisa se mexer mais" e passa a entender *qual* é o problema. *Se cortar o diagnóstico:* todo o streak anterior vira coleta sem payoff — e o plano perde a justificativa de existir.

## F3 — Avaliação física (13–22) · N2

**Objetivo:** baseline mensurável — força, amplitude, dores.

O bloco mais longo de `medicao` (experiência prévia, flexibilidade, dores por região, condicionamento). É também a **zona de maior risco de fadiga**: 10 perguntas seguidas sobre limitações. Por isso as `recompensa` curtas estão intercaladas aqui — mensagens de validação que quebram o streak e recarregam. *Se cortar as recompensas:* abandono silencioso no meio do funil, o pior tipo (ela já investiu 20 telas). *Se cortar medições:* o plano perde calibragem e o F6 (perfil montado) vira teatro sem dados.

## F4 — Estilo de vida (23–26) · N2

**Objetivo:** hábitos neutros + descanso emocional.

Sono, energia, rotina — perguntas de baixo custo emocional depois do bloco pesado de dores. Funciona como **vale de recuperação** entre dois blocos densos (F3 e F5). O `eco` de energia ("dias cansados pedem sequências curtas") mantém a sensação de personalização viva. *Se cortar inteiro:* F3→F5 direto empilha 20+ telas pesadas seguidas.

## F5 — Nutrição (27–38) · N2→N3

**Objetivo:** hábitos alimentares → tangibilização → autoridade que blinda o que vem depois.

Medições de hábito (refeições, água, doces) preparam os dois momentos-chave:

- **Prévia de refeições** (`tangibilizacao`, ★) — mostra o produto *concreto*: pratos reais para o perfil dela, antes de vender qualquer coisa. Abstrato vira tangível. *Se cortar:* a promessa "plano de treino + alimentação" fica sem prova até o checkout — tarde demais.
- **Autoridade** (`autoridade`, ★) — experts, método, credenciais, posicionada *imediatamente antes* dos dados sensíveis (peso, altura, meta no F6). Não é decoração: é blindagem sequencial. Peso é o dado mais caro do funil; ninguém entrega peso a quem não confia. *Se mover ou cortar:* a queda de conclusão dos inputs de peso é o sintoma clássico.

## F6 — Dados + Perfil (39–44) · N3

**Objetivo:** inputs com feedback instantâneo culminando no perfil montado.

Peso, altura, peso-meta — cada input devolve algo na hora (IMC calculado, faixa saudável, projeção visual da meta). O feedback instantâneo transforma "dar dados" em "receber análise". O bloco fecha com o **perfil montado** (`recompensa`): uma tela-resumo com tudo que ela contou, organizado — a prova material de que o quiz *ouviu*. *Se cortar o perfil:* os dados somem num buraco negro e o F7 perde a fundação emocional.

## F7 — Emoção → Projeção (45–52) · N3→N4

**Objetivo:** gatilhos emocionais, falas por persona e a projeção com data.

Aqui a jornada sai do racional (medir, avaliar) e entra no emocional (como ela se sente no espelho, o que vestir, o que ouviu de outros). As falas passam a ser **por persona** — a executiva, a mamãe, a cética ouvem coisas diferentes (é o `audience` do view seam). O bloco culmina na **projeção** (`projecao`, ★): "{{goalWeight}} até {{projectionDate}} — a tempo do seu casamento". Desejo vira plano com número e data; é o maior propulsor individual ao CTA do funil. *Se cortar:* F8 pede compromisso sem ter construído o desejo concreto — a conversão de checkout desaba.

## F8 — Compromisso (53–57) · N4

**Objetivo:** a sequência Cialdini completa.

Razão declarada ("por que agora?") → confiança declarada ("quanto você confia que consegue?") → prova → loading teatral com depoimentos → prova social. Declarar publicamente (ainda que para um app) cria pressão de consistência: quem disse "confio 8/10" não some na tela seguinte. O **loading** (`recompensa`) é teatral de propósito — o plano "sendo montado" vale mais do que o plano instantâneo. *Se cortar o loading:* o plano pronto parece genérico ("já estava feito"). *Se cortar a confiança declarada:* perde a âncora de consistência que sustenta o pedido de email.

## F9 — Captura (58–62) · N4

**Objetivo:** email blindado, nome, plano pronto, cupom — dopamina máxima na porta do checkout.

- **Email** (`captura`, ★) — só funciona aqui: depois de 57 telas de investimento, diagnóstico, projeção e compromisso. Pedir email no slot 5 é o erro clássico dos funis amadores. A blindagem é sequencial: o pedido vem escoltado por tudo que veio antes.
- **Nome** (`captura`) — barato depois do email, e alimenta a personalização do checkout.
- **Plano pronto** (`recompensa`, ★) — o payoff: badges por persona ("Feito para {{diagnosisCardLabel}}"), estrutura do plano, tudo com os tokens dela.
- **Raspadinha do cupom** (`recompensa`, ★) — interação física + prêmio = pico de dopamina imediatamente antes da decisão de compra. *Se cortar:* o checkout abre em temperatura morna.

## F10 — Checkout · N4→compra

**Objetivo:** remover fricção, urgência honesta, CTA. Estrutura fixa de 12 seções (ver `checkout` no JSON).

Os papéis se repetem em ordem de fechamento: `eco` (headline pela razão declarada) → `captura` ×2 (a oferta, duas vezes) → `blindagem` ×2 (garantia, FAQ filtrado por perfil) → `prova-social` ×3 (avaliações, histórias com a persona dela primeiro, reviews) → `tangibilizacao` (o que está incluído) → `autoridade` (mídia) → `compromisso` (countdown persistido) → `consentimento` (legal — fixo, nunca gerado).

Dois detalhes estruturais:

- **A garantia se move**: `guaranteeEarlyWhen` antecipa o bloco para perfis céticos. A estrutura (existência da regra) é fixa; o conteúdo da regra é gerado.
- **Textos legais e de renovação são FIXOS** (`consentimento`) — o gerador nunca escreve disclaimer de saúde, política de reembolso ou termos. É a única exceção à regra "conteúdo gerado".

---

## A regra de invariância (o que o gerador pode e não pode tocar)

| Fixo (estrutura) | Gerado (conteúdo) |
|---|---|
| Template de cada slot | Copy, headlines, descrições |
| Ordem dos 62 slots | Opções de resposta e labels |
| Tipo de interação (auto-advance/CTA) | Diagnósticos e rótulos por perfil |
| `saveAs` (o nome do dado capturado) | Tokens e fragmentos (@switch, descWhen…) |
| Existência de guards e branches | As regras dentro deles |
| Contagem no progresso | Personas, planos, histórias, FAQs |

O `saveAs` merece ênfase: ele é o **contrato de dados** da jornada. `{{foco}}` no eco do F1 só existe porque o slot 3 salvou `focusZones`. O gerador pode reescrever toda a copy do funil — mas se renomear um `saveAs`, quebra tokens trinta telas adiante. Por isso cada slot no JSON lista seus consumidores em `captura`.

## Natureza do conteúdo: textual × visual × híbrido

Cada slot e seção de checkout carrega um campo `natureza` (`T`, `H` ou `V`) no JSON. A classificação foi feita contra o código dos templates, não contra a intenção:

| Natureza | Definição | Slots | Checkout |
|---|---|---|---|
| **T — 100% textual** | O LLM gera tudo; o template só renderiza copy. Widgets e animações (régua, círculo de progresso, countdown) são estruturais, não assets | **57 de 62** | **11 de 12** |
| **H — híbrido** | Copy gerada + camada visual estrutural que carrega parte da persuasão | **5 de 62** | **1 de 12** |
| **V — 100% visual** | Depende de asset gráfico externo (foto, ilustração, logo-imagem) | **0** | **0** |

### Os 5 slots híbridos (+1 seção)

| Slot | Template | Camada visual |
|---|---|---|
| `age` (1) | select-cards | **Silhuetas SVG por faixa etária**, desenhadas no template — a ilustração é o elemento de escolha |
| `wellness-profile` (44) | result | Cards de diagnóstico com ícones + data-viz do perfil |
| `projection` (52) | result | **Gráfico peso→meta com data** — a curva é a persuasão |
| `plan-ready` (60) | result | Badges por persona + estrutura visual do plano |
| `scratch` (62) | scratch | **Canvas de raspadinha** — a interação física é o pico de dopamina |
| `hero-resultado` (checkout) | — | **Silhuetas antes/depois SVG** + barras de transformação com tokens |

### O achado mais importante: zero dependência de banco de imagens

Nenhum slot é `V`. Isso não é acidente — o template foi desenhado para rodar **sem nenhum asset fotográfico**:

- As "fotos" das telas de escolha são **silhuetas vetoriais SVG** desenhadas no código do template;
- As histórias de usuárias no checkout **não têm foto** — nome, resultado e texto bastam;
- Os logos de mídia são **nomes em texto serifado/itálico**, não arquivos de logo;
- Os ícones vêm de um **conjunto fechado** (lucide) — o gerador escolhe a chave (`home`, `salad`, `timer`…), nunca cria imagem.

Consequência para a replicação: **um nicho novo não precisa de fotógrafo, banco de imagem ou designer de assets**. O único artefato visual com acoplamento ao nicho são as **silhuetas SVG** (slot 1 + hero do checkout) — trocar de nicho = redesenhar esses dois vetores, e mais nada.

### O que isso muda no pipeline do gerador

- **92% da jornada (57 slots) é trabalho de LLM puro** — copy dentro do contrato de cada slot, validável por texto.
- **8% (5 slots) exige handoff de design apenas quando o nicho muda a forma do corpo/silhueta** — para nichos de transformação corporal (o escopo do MVP), as silhuetas atuais servem; o handoff é zero.
- As telas `H` de data-viz (`projection`, `wellness-profile`, `plan-ready`) não precisam de design nunca — o gráfico renderiza a partir dos dados dela. O gerador só escreve a copy ao redor.
- Regra S4 adicional: **se um slot `T` gerado contiver referência a imagem/asset, é erro de geração** — o template não tem onde renderizá-la.

## Regras de validação S4 (o que o QA do gerador deve checar)

1. **Todo papel de pico existe exatamente uma vez**: diagnostico, projecao, tangibilizacao, micro-compromisso, consentimento.
2. **Nenhuma `captura` sem blindagem anterior**: email/peso/dados sensíveis exigem `autoridade` ou `recompensa` nos 5 slots anteriores.
3. **Nenhum bloco de `medicao` com mais de 6 slots seguidos sem `eco` ou `recompensa`** (regra anti-fadiga do F3).
4. **Todo `saveAs` referenciado em algum token existe** em um slot anterior.
5. **Todo slot tem papel do vocabulário fechado** — tag fora da lista = erro de geração.
6. **Textos `consentimento` não foram gerados** — devem ser idênticos ao template legal.
7. **Slot `T` não pode referenciar imagem ou asset** — o template textual não tem onde renderizá-la; menção a "foto", "imagem" ou URL de asset em slot `T` = erro de geração.
8. **Prova social reativa (`proof`) plausível e coberta**: stats sempre 55–85%, redondos (sem decimal — precisão falsa denuncia o dado), sem claim médico (doença, tratamento, promessa clínica), framing "usuárias <Marca> com seu perfil"; todo valor de opção do `saveAs` referenciado tem entrada em `byAnswer` ou existe `fallback`; `saveAs` do proof deve ser de slot anterior.
9. **Medidor de plano (`meter`) presente em todo eco e monotônico**: todo eco tem `meter: {pct, block, blockName, milestone?}`; `pct` inteiro 1–99 estritamente crescente na ordem da jornada (nunca 100% — o 100% é o plan-ready); `block` 1–5 não retrocede; `milestone` ("Bloco X completo") só no último eco de cada bloco, com % redondo de marco (15/35/55/75/95 na escala de 5 blocos).

---

*Derivado de: `pilates.json` (seed), `mapeamento-telas-objetivos.md`, auditoria F0–F10. Os números de slot referem-se à ordem no `journey-skeleton.json`.*
