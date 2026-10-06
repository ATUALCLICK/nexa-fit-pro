import Dexie from 'dexie'

export const db = new Dexie('BronksGymApp')

db.version(1).stores({
  users:          '++id, nome, genero, objetivo, nivel, dias_treino',
  exercises:      '++id, grupo_muscular, equipamento, nivel',
  workouts:       '++id, letra, dias_semana',
  workout_logs:   '++id, user_id, data',
  foods:          '++id, grupo, nome',
  meals:          '++id, contexto',
  diet_plans:     '++id, user_id',
  diet_logs:      '++id, user_id, data',
  water_logs:     '++id, user_id, data',
  weight_logs:    '++id, user_id, data',
  progress_photos:'++id, user_id, data',
  settings:       '++id, key'
})

export default db
