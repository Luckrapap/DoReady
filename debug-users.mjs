import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://scehxjtcfejrzedebnfq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IjpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjZWh4anRjZmVqcnplZGVibmZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjMwNjc1NSwiZXhwIjoyMDg3ODgyNzU1fQ.mbP4DOxW4rQd8zBhVfWopm0fmd2_1juj8_FIniFAm24'
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('Fetching all users...')
  const { data: users, error } = await supabase.auth.admin.listUsers()
  
  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`Total users found: ${users.users.length}`)
  
  const usersWithEmail = users.users.filter(u => u.email)
  console.log(`Users with email: ${usersWithEmail.length}`)
  
  usersWithEmail.forEach(u => {
    console.log(`- ${u.email} (ID: ${u.id}, Confirmed: ${!!u.email_confirmed_at})`)
  })

  // Also check profiles
  const { data: profiles, error: pError } = await supabase.from('profiles').select('id, full_name')
  if (pError) {
    console.error('Profile Error:', pError)
  } else {
    console.log(`Total profiles: ${profiles.length}`)
    profiles.forEach(p => {
        const u = users.users.find(user => user.id === p.id)
        console.log(`- Profile: ${p.full_name}, Email: ${u?.email || 'N/A'}`)
    })
  }
}

main()
