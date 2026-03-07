import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://scehxjtcfejrzedebnfq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjZWh4anRjZmVqcnplZGVibmZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjMwNjc1NSwiZXhwIjoyMDg3ODgyNzU1fQ.mbP4DOxW4rQd8zBhVfWopm0fmd2_1juj8_FIniFAm24'
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const email = 'PajiroTrans@gmail.com'
  const { data: users, error: userError } = await supabase.auth.admin.listUsers()
  
  if (userError) {
    console.error('Error listing users:', userError)
    return
  }

  const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
  
  if (!user) {
    console.log(`User ${email} NOT found in auth.users`)
    console.log('Available users:', users.users.map(u => u.email).filter(Boolean))
  } else {
    console.log(`User ${email} FOUND in auth.users`)
    console.log(`ID: ${user.id}`)
    console.log(`Confirmed: ${user.email_confirmed_at}`)
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      
    if (profileError) {
      console.error('Error fetching profile:', profileError)
    } else {
      console.log('Profile details:', profile)
    }
  }
}

main()
