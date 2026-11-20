import { getSupabase } from '../lib/supabase.js'

export async function createRsvp(rsvp) {
  const { data, error } = await getSupabase().from('rsvps').insert(rsvp).select('id').single()
  if (error?.code === '23505') {
    const duplicateError = new Error('An RSVP has already been submitted with this email address.')
    duplicateError.status = 409
    throw duplicateError
  }
  if (error) throw error
  return data
}

export async function getEventSettings() {
  const { data, error } = await getSupabase()
    .from('event_settings')
    .select('parent_one,parent_two,event_date,event_time,venue_name,venue_address,rsvp_deadline,dress_code,notes')
    .eq('id', 1)
    .single()
  if (error) throw error
  return {
    parentOne: data.parent_one,
    parentTwo: data.parent_two,
    date: data.event_date,
    time: data.event_time?.slice(0, 5) || null,
    venue: data.venue_name,
    address: data.venue_address,
    rsvpDeadline: data.rsvp_deadline,
    dressCode: data.dress_code,
    notes: data.notes,
  }
}

export async function listRsvps() {
  const { data, error } = await getSupabase().from('rsvps').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getRsvpStats() {
  const supabase = getSupabase()
  const [statsResult, countResult] = await Promise.all([
    supabase.from('rsvp_stats').select('*').single(),
    supabase.from('rsvps').select('id', { count: 'exact', head: true }),
  ])
  if (statsResult.error) throw statsResult.error
  if (countResult.error) throw countResult.error
  return {
    totalResponses: countResult.count || 0,
    totalAttending: Number(statsResult.data.attending_responses),
    totalGuests: Number(statsResult.data.total_guests),
    declined: Number(statsResult.data.declined),
    teamBoy: Number(statsResult.data.team_boy),
    teamGirl: Number(statsResult.data.team_girl),
    teamUndecided: Number(statsResult.data.team_undecided),
  }
}
