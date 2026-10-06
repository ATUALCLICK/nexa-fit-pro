# Viva Forge — Gerador de Funis de Quiz

Contexto único do projeto: uma engine de quiz funnels multi-tenant e o gerador que produz novos funis por nicho. O primeiro funil (seed) é o Viva Pilates.

## Language

### Artefatos

**Funil**:
Um `funnel.json` completo — meta, icp, telas, checkout, qa — consumido pela engine via `?f=slug`. É o artefato central: tudo que define um funil vive nele, nada no código.
_Avoid_: quiz (é a experiência da usuária, não o artefato), campanha

**Seed**:
O funil pilates, compilado de referência. Serve como fallback quando um slug não existe e como exemplo-âncora (few-shot) na geração de novos funis.
_Avoid_: template, funil padrão

**Draft**:
Funil gerado ainda não publicado, carregado via `?f=draft` a partir do armazenamento local do navegador do admin. Permite percorrer o funil antes de publicar.
_Avoid_: rascunho solto, staging

**Conteúdo**:
Tudo que varia por nicho dentro de um funil: copies, opções, personas, diagnósticos, planos, histórias, FAQs. É o que o gerador produz.
_Avoid_: dados, config

### Máquina

**Engine**:
O código imutável entre nichos que renderiza e conduz um funil: templates de tela, máquina de navegação, store de sessão, cálculos (IMC, projeção, datas). Nunca é gerada.
_Avoid_: sistema, plataforma

**Esqueleto**:
A sequência fixa de telas (template, seção, ordem, regras de interação) que todo funil segue. Não é gerada pelo LLM — o gerador apenas preenche seus slots de conteúdo.
_Avoid_: jornada genérica, fluxo

**Slot**:
Uma posição do Esqueleto com contrato de 4 partes: papel persuasivo (tag de vocabulário fechado), papel de dados (o que captura e quem consome), contrato de copy (instrução de geração) e invariantes (o que não muda entre nichos). Definido em `journey-skeleton.json`.
_Avoid_: etapa, passo, tela solta

**Papel**:
A função estratégica de um Slot na jornada, escolhida de um vocabulário fechado (micro-compromisso, prova-social, declaracao, eco, diagnostico, medicao, autoridade, tangibilizacao, projecao, compromisso, captura, blindagem, recompensa, consentimento). Permite validar a estrutura de um funil gerado.
_Avoid_: objetivo, propósito genérico

**View**:
A tela final entregue pelo runtime (`view()`): payload com tokens interpolados, fragmentos de regra avaliados, diagnóstico resolvido e valores numéricos no `calc` — nenhuma regra ou token à vista. Templates e checkout consomem View, nunca dados crus.
_Avoid_: tela resolvida, payload processado

### Domínio de marketing

**Nicho-alvo**:
Categoria de transformação corporal e bem-estar (pilates, yoga, emagrecimento, fitness 40+) para a qual o gerador produz funis válidos. Nichos fora dessa categoria são não-objetivo.
_Avoid_: vertical, segmento

**Persona**:
Perfil de usuária detectável por respostas que a jornada captura, definido no `icp` do funil por regras declarativas. Toda persona deve ser detectável — regra apontando para variável inexistente falha o QA.
_Avoid_: avatar, público

**Diagnóstico**:
Rótulo personalizado atribuído no meio do funil que nomeia o "problema" da usuária (ex.: Core Adormecido). Momento de virada de consciência do funil.
_Avoid_: resultado, perfil

**QA verde**:
Estado em que os validadores de rotas (persona-qa) e de copy (copy-qa) passam contra um funil. Pré-requisito para publicar, mas não suficiente — publicar exige revisão humana no preview.
_Avoid_: testes passando, build ok

**Publicar**:
Gravar o funil como arquivo do projeto e gerar uma nova versão do app — o funil entra no build. Não existe publicação instantânea; rollback é a versão anterior do app.
_Avoid_: deploy de funil, subir funil

### Produto

**Viva Forge**:
Nome de trabalho do gerador de funis: a área `/admin` com o pipeline S1–S5 (ICP → telas → checkout → QA → preview/publicação).
_Avoid_: gerador genérico, admin
