import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://scehxjtcfejrzedebnfq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjZWh4anRjZmVqcnplZGVibmZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjMwNjc1NSwiZXhwIjoyMDg3ODgyNzU1fQ.mbP4DOxW4rQd8zBhVfWopm0fmd2_1juj8_FIniFAm24'
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    const { data: users, error } = await supabase.auth.admin.listUsers()
    if (error) {
        console.error('Error fetching users:', error)
        return
    }

    const emails = users.users.filter(u => u.email)
    console.log(`Total active standard users with email: ${emails.length}`)
    emails.forEach(u => {
        console.log(`Email: ${u.email}, Confirmed: ${u.email_confirmed_at !== null}, CreatedAt: ${u.created_at}`)
    })
}

main()
