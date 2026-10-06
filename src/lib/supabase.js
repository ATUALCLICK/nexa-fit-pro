import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zebunzuydwsudexdvmhu.supabase.co'
const supabaseKey = 'sb_publishable_wLYMf9X2A5nDtdR3kcT87g_z8FUpseM'

export const supabase = createClient(supabaseUrl, supabaseKey)
