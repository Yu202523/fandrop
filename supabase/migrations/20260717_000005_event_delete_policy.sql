create policy "organizers can delete their own events"
on public.events
for delete
to authenticated
using (auth.uid() = created_by);
