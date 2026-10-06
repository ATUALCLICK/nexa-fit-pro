export const exercisesSeed = [
  { id: 'ex_1', nome: 'Supino Reto com Barra', grupo_muscular: 'peito', equipamento: 'barra', nivel: 'intermediario', series_padrao: 4, reps_min: 8, reps_max: 12, descanso_seg: 90, instrucoes: ['Deite no banco e segure a barra', 'Desça a barra até o peito', 'Empurre para cima'], erros_comuns: ['Tirar os glúteos do banco'], alternativas: [], calorias_por_serie: 5 },
  { id: 'ex_2', nome: 'Agachamento Livre', grupo_muscular: 'pernas', equipamento: 'barra', nivel: 'avancado', series_padrao: 4, reps_min: 8, reps_max: 12, descanso_seg: 120, instrucoes: ['Posicione a barra nos ombros', 'Agache até os joelhos passarem de 90 graus', 'Suba'], erros_comuns: ['Joelho entrando'], alternativas: [], calorias_por_serie: 8 },
  // Abreviated for brevity, normally 80+ exercises would be here
];

export const foodsSeed = [
  { id: 'f_1', nome: 'Peito de Frango Grelhado', grupo: 'proteina', porcao_padrao_g: 100, kcal_por_100g: 165, proteina_por_100g: 31, carb_por_100g: 0, gordura_por_100g: 3.6, restricoes_incomp: ['vegetariano', 'vegano'], alternativas: [], timing: 'qualquer' },
  { id: 'f_2', nome: 'Arroz Integral Cozido', grupo: 'carboidrato', porcao_padrao_g: 100, kcal_por_100g: 112, proteina_por_100g: 2.6, carb_por_100g: 23.5, gordura_por_100g: 0.9, restricoes_incomp: [], alternativas: [], timing: 'pre_treino' },
];
