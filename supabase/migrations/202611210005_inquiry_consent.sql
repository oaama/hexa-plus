begin;
-- Anonymous callers can invoke this RPC directly, so enforce consent and the API's required fields here too.
create or replace function public.submit_inquiry(payload jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare lid uuid; person text; email_value text; begin
if payload is null or jsonb_typeof(payload)<>'object' then raise exception 'Please check your inquiry.';end if;
if jsonb_typeof(payload->'consent') is distinct from 'boolean' or (payload->>'consent') is distinct from 'true' then raise exception 'Please accept the privacy policy.';end if;
if length(coalesce(payload->>'website',''))<>0 then raise exception 'Please check your inquiry.';end if;
person=btrim(payload->>'name');email_value=lower(btrim(payload->>'email'));
if person is null or length(person) not between 2 and 200 or email_value is null or email_value !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(email_value)>254 or length(coalesce(payload->>'description','')) not between 20 and 10000 or length(btrim(coalesce(payload->>'phone',''))) not between 7 and 80 or length(btrim(coalesce(payload->>'service',''))) not between 1 and 200 or length(coalesce(payload->>'company',''))>200 or length(coalesce(payload->>'budget',''))>100 or length(coalesce(payload->>'timeline',''))>100 then raise exception 'Please check your inquiry details.';end if;
perform pg_advisory_xact_lock(hashtext(email_value));
if (select count(*) from public.leads where lower(email)=email_value and created_at>now()-interval '1 hour')>=3 then raise exception 'Please wait before sending another inquiry.';end if;
insert into public.leads(name,company,email,phone,service,budget,timeline,description,source,stage) values(person,payload->>'company',email_value,btrim(payload->>'phone'),btrim(payload->>'service'),payload->>'budget',payload->>'timeline',payload->>'description','website','new') returning id into lid;
insert into public.contact_submissions(lead_id,consent) values(lid,true);
insert into public.notifications(recipient_id,title,body,link) select p.id,'New project inquiry',person||' sent a project inquiry.','/dashboard/leads/'||lid from public.profiles p join public.roles r on r.id=p.role_id where p.status='active' and (r.name='super_admin' or exists(select 1 from public.role_permissions rp join public.permissions pe on pe.id=rp.permission_id where rp.role_id=r.id and pe.name='leads.read'));
return lid;end;$$;
revoke all on function public.submit_inquiry(jsonb) from public;
grant execute on function public.submit_inquiry(jsonb) to anon,authenticated;
commit;
