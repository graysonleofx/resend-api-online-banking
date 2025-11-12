import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://kpqemmxftcvhslqupzwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcWVtbXhmdGN2aHNscXVwendlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MzY1NjUsImV4cCI6MjA3MzMxMjU2NX0.CKUDX0xfOAz0S1B3JYShDqwYDdRPZ_QTpsY4bvudmao';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;