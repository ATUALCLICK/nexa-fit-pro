export type AnswerValue = string | string[] | number
export type Answers = Record<string, AnswerValue>

export type TemplateId =
  | 'select-cards'      // T1
  | 'question-single'   // T2
  | 'question-multi'    // T3
  | 'interstitial'      // T4
  | 'input-measure'     // T5
  | 'loading'           // T6
  | 'result'            // T7
  | 'scratch'           // especial

export type SectionId =
  | 'none'
  | 'meu-perfil'
  | 'atividade'
  | 'estilo-de-vida'
  | 'nutricao'
  | 'quase-la'

export const SECTION_LABELS: Record<SectionId, string> = {
  none: '',
  'meu-perfil': 'Meu perfil',
  atividade: 'Atividade',
  'estilo-de-vida': 'Estilo de vida e hábitos',
  nutricao: 'Nutrição',
  'quase-la': 'Quase lá',
}

export interface Option {
  value: string
  label: string
  hint?: string
  exclusive?: boolean // regra "Nenhum dos itens acima"
  icon?: string // slug thiings.co → /icons/thiings/{slug}.png
}

export interface OptionGroup {
  title: string
  options: Option[]
}

export interface Screen {
  id: string
  template: TemplateId
  section: SectionId
  countsForProgress: boolean
  saveAs?: string
  // navegação: string fixa ou função de branching
  next?: string | ((a: Answers) => string)
  guard?: (a: Answers) => boolean // false = pular tela no fluxo
  // payload específico por template (interpretado pelo template)
  payload?: Record<string, unknown>
}
