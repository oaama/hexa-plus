-- Applied after 202611210001_foundation.sql. Closes the independent review findings.
begin;
-- Explicit privileges, including Supabase defaults. Do not widen unrelated tables.
revoke all privileges on public.profiles,public.roles,public.permissions,public.role_permissions,public.departments,public.clients,public.leads,public.lead_activities,public.projects,public.project_members,public.project_milestones,public.tasks,public.task_comments,public.task_attachments,public.services,public.portfolio_projects,public.portfolio_media,public.content_posts,public.marketing_campaigns,public.social_accounts,public.invoices,public.invoice_items,public.payments,public.expenses,public.notifications,public.activity_logs,public.files,public.website_settings,public.testimonials,public.contact_submissions from anon;
revoke all privileges on public.profiles,public.roles,public.permissions,public.role_permissions,public.departments,public.clients,public.leads,public.lead_activities,public.projects,public.project_members,public.project_milestones,public.tasks,public.task_comments,public.task_attachments,public.services,public.portfolio_projects,public.portfolio_media,public.content_posts,public.marketing_campaigns,public.social_accounts,public.invoices,public.invoice_items,public.payments,public.expenses,public.notifications,public.activity_logs,public.files,public.website_settings,public.testimonials,public.contact_submissions from authenticated;
revoke execute on function public.is_super_admin(),public.has_permission(text),public.stamp_record(),public.log_change(),public.submit_inquiry(jsonb),public.save_invoice(uuid,jsonb,jsonb),public.validate_payment(),public.notify_task(),public.set_task_status(uuid,text) from public,anon,authenticated;
grant usage on schema public to anon,authenticated;
grant select,insert,update,delete on public.profiles,public.roles,public.permissions,public.role_permissions,public.departments,public.clients,public.leads,public.lead_activities,public.projects,public.project_members,public.project_milestones,public.tasks,public.task_comments,public.task_attachments,public.services,public.portfolio_projects,public.portfolio_media,public.content_posts,public.marketing_campaigns,public.social_accounts,public.invoices,public.invoice_items,public.payments,public.expenses,public.notifications,public.activity_logs,public.files,public.website_settings,public.testimonials,public.contact_submissions to authenticated;
revoke insert,update on public.invoices from authenticated;
revoke insert,update,delete on public.invoice_items from authenticated;
revoke insert,update,delete on public.notifications,public.activity_logs,public.contact_submissions from authenticated;
grant execute on function public.is_super_admin(),public.has_permission(text),public.save_invoice(uuid,jsonb,jsonb),public.set_task_status(uuid,text) to authenticated;
grant execute on function public.submit_inquiry(jsonb) to anon,authenticated;
alter default privileges in schema public revoke all on tables from anon,authenticated;
alter default privileges revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon,authenticated;
-- Child reads inherit the parent's RLS visibility.
drop policy module_read on public.project_milestones;
create policy module_read on public.project_milestones for select to authenticated using(exists(select 1 from public.projects p where p.id=project_id));
drop policy module_read on public.project_members;
-- Avoid recursive projects -> project_members -> projects RLS. Membership lookup is a narrow definer predicate.
create or replace function public.can_read_project(project_uuid uuid) returns boolean language sql stable security definer set search_path='' as $$
select public.has_permission('projects.read') and exists(select 1 from public.projects p where p.id=project_uuid and (public.has_permission('projects.write') or p.manager_id=auth.uid() or exists(select 1 from public.project_members pm where pm.project_id=p.id and pm.profile_id=auth.uid())))
$$;
revoke all on function public.can_read_project(uuid) from public,anon;
grant execute on function public.can_read_project(uuid) to authenticated;
drop policy module_read on public.projects;
create policy module_read on public.projects for select to authenticated using(public.can_read_project(id));
create policy module_read on public.project_members for select to authenticated using(public.can_read_project(project_id));
-- View projections are intentional publication boundaries. Base-table policies remain private.
drop policy public_read on public.services;
drop policy public_read on public.portfolio_projects;
drop policy public_read on public.portfolio_media;
drop policy public_read on public.testimonials;
drop policy public_read on public.website_settings;
create view public.published_services with (security_barrier=true) as select id,name,name_ar,slug,division,description,benefits,deliverables,workflow,case when show_pricing then pricing else null end as pricing,show_pricing,image_url,featured,sort_order from public.services where published=true;
create view public.published_portfolio with (security_barrier=true) as select id,title,slug,client_name,category,industry,description,challenge,solution,services_provided,technologies,results,project_date,thumbnail_url,video_url,featured,sort_order from public.portfolio_projects where published=true;
create view public.published_portfolio_media with (security_barrier=true) as select m.id,m.portfolio_project_id,m.url,m.alt,m.sort_order from public.portfolio_media m join public.portfolio_projects p on p.id=m.portfolio_project_id where p.published=true;
create view public.published_testimonials with (security_barrier=true) as select id,name,company,quote from public.testimonials where published=true;
-- Only known public content keys can cross the publication boundary, even if a private key was accidentally marked public.
create view public.published_settings with (security_barrier=true) as select key,value from public.website_settings where is_public=true and (key in ('hero_title','hero_description','address','contact_email','contact_phone','footer_description','primary_color','secondary_color','accent_color','site_description','site_title') or key like 'social\_%' escape '\' or key like 'page\_%' escape '\');
grant select on public.published_services,public.published_portfolio,public.published_portfolio_media,public.published_testimonials,public.published_settings to anon,authenticated;
-- Payment trigger runs with enough privileges to acquire the invoice lock, never with broader caller rights.
create or replace function public.validate_payment() returns trigger language plpgsql security definer set search_path='' as $$declare invoice_total bigint;other_paid bigint;begin
if not public.has_permission('finance.write') then raise exception 'Permission denied';end if;
if TG_OP='UPDATE' and NEW.invoice_id is distinct from OLD.invoice_id then raise exception 'A recorded payment cannot be moved to another invoice';end if;
select total_minor into invoice_total from public.invoices where id=NEW.invoice_id for update;
if invoice_total is null then raise exception 'Invoice not found';end if;
select coalesce(sum(amount_minor),0) into other_paid from public.payments where invoice_id=NEW.invoice_id and id<>NEW.id;
if NEW.amount_minor<=0 or other_paid+NEW.amount_minor>invoice_total then raise exception 'Payment must be positive and cannot exceed the outstanding amount';end if;return NEW;end;$$;
-- Explicit NULL rejection, paid-invoice immutability and integer, server-calculated money.
create or replace function public.save_invoice(record_id uuid,header jsonb,items jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare iid uuid; line jsonb; subtotal bigint:=0; tax bigint; rate integer;begin
if not public.has_permission('finance.write') then raise exception 'Permission denied';end if;
if header is null or jsonb_typeof(header)!='object' or items is null or jsonb_typeof(items)!='array' or jsonb_array_length(items) not between 1 and 100 then raise exception 'Add 1 to 100 invoice items';end if;
if header->>'invoice_number' is null or length(btrim(header->>'invoice_number')) not between 1 and 100 then raise exception 'Invoice number is required';end if;
if (header->>'due_date')::date<(header->>'issue_date')::date then raise exception 'Due date cannot be before issue date';end if;
rate=coalesce((header->>'tax_bps')::integer,0);if rate not between 0 and 10000 then raise exception 'Invalid tax rate';end if;
for line in select * from jsonb_array_elements(items) loop
if jsonb_typeof(line)!='object' or line->>'description' is null or line->>'quantity' is null or line->>'unit_price_minor' is null or length(btrim(line->>'description')) not between 1 and 500 or (line->>'quantity')::integer not between 1 and 100000 or (line->>'unit_price_minor')::bigint not between 0 and 100000000 then raise exception 'Invalid invoice item';end if;
subtotal=subtotal+(line->>'quantity')::integer*(line->>'unit_price_minor')::bigint;end loop;
if subtotal>9007199254740991 then raise exception 'Invoice total too large';end if;
tax=round(subtotal::numeric*rate/10000)::bigint;
if record_id is null then
insert into public.invoices(invoice_number,client_id,project_id,issue_date,due_date,tax_bps,notes,subtotal_minor,tax_minor,total_minor) values(header->>'invoice_number',(header->>'client_id')::uuid,nullif(header->>'project_id','')::uuid,(header->>'issue_date')::date,(header->>'due_date')::date,rate,header->>'notes',subtotal,tax,subtotal+tax) returning id into iid;
else iid=record_id;perform 1 from public.invoices where id=iid for update;if not found then raise exception 'Invoice not found';end if;
if exists(select 1 from public.payments where invoice_id=iid) then raise exception 'Invoices with payments cannot be edited';end if;
update public.invoices set invoice_number=header->>'invoice_number',client_id=(header->>'client_id')::uuid,project_id=nullif(header->>'project_id','')::uuid,issue_date=(header->>'issue_date')::date,due_date=(header->>'due_date')::date,tax_bps=rate,notes=header->>'notes',subtotal_minor=subtotal,tax_minor=tax,total_minor=subtotal+tax where id=iid;
delete from public.invoice_items where invoice_id=iid;end if;
insert into public.invoice_items(invoice_id,description,quantity,unit_price_minor,sort_order) select iid,v->>'description',(v->>'quantity')::integer,(v->>'unit_price_minor')::bigint,(ord-1)::integer from jsonb_array_elements(items) with ordinality as t(v,ord);
return iid;end;$$;
revoke all on function public.save_invoice(uuid,jsonb,jsonb) from public,anon;
grant execute on function public.save_invoice(uuid,jsonb,jsonb) to authenticated;
-- Global, serialized abuse ceiling is independent of attacker-supplied email.
create or replace function public.inquiry_guard() returns trigger language plpgsql security definer set search_path='' as $$begin
if NEW.source='website' then
perform pg_advisory_xact_lock(581817321);
if (select count(*) from public.leads where source='website' and created_at>now()-interval '1 hour')>=30 or (select count(*) from public.leads where source='website' and created_at>now()-interval '1 minute')>=3 then raise exception 'Please wait before sending another inquiry';end if;
end if;return NEW;end;$$;
revoke all on function public.inquiry_guard() from public,anon,authenticated;
create trigger inquiry_abuse_guard before insert on public.leads for each row execute function public.inquiry_guard();
-- No public bucket. Draft media stays private; unpublishing revokes future anonymous reads.
update storage.buckets set public=false where id='portfolio';
drop policy portfolio_read on storage.objects;
create or replace function public.is_published_media(object_name text) returns boolean language sql stable security definer set search_path='' as $$
select exists(select 1 from public.portfolio_projects p where p.published=true and (p.thumbnail_url = 'https://vjpoqdieltptvychhnmb.supabase.co/storage/v1/object/public/portfolio/'||object_name or exists(select 1 from public.portfolio_media m where m.portfolio_project_id=p.id and m.url = 'https://vjpoqdieltptvychhnmb.supabase.co/storage/v1/object/public/portfolio/'||object_name))) or exists(select 1 from public.services s where s.published=true and s.image_url = 'https://vjpoqdieltptvychhnmb.supabase.co/storage/v1/object/public/portfolio/'||object_name)
$$;
revoke all on function public.is_published_media(text) from public;
grant execute on function public.is_published_media(text) to anon,authenticated;
create policy portfolio_public_read on storage.objects for select to anon,authenticated using(bucket_id='portfolio' and public.is_published_media(name));
create policy portfolio_staff_read on storage.objects for select to authenticated using(bucket_id='portfolio' and (public.has_permission('portfolio.read') or public.has_permission('services.read')));
-- Deadline notifications are derived from actual records at read time; no background worker is claimed.
create or replace function public.dashboard_overview() returns jsonb language plpgsql stable security invoker set search_path='' as $$declare response jsonb;begin
select jsonb_build_object('stats',jsonb_build_object('clients',(select count(*) from public.clients),'activeProjects',(select count(*) from public.projects where status in ('in_progress','review')),'completedProjects',(select count(*) from public.projects where status='completed'),'pendingProjects',(select count(*) from public.projects where status in ('planning','on_hold')),'newLeads',(select count(*) from public.leads where stage='new'),'totalLeads',(select count(*) from public.leads),'conversion',coalesce((select round(100.0*count(*) filter(where stage='won')/nullif(count(*),0),1) from public.leads),0),'leadStages',(select coalesce(jsonb_object_agg(stage,n),'{}'::jsonb) from (select stage,count(*) n from public.leads group by stage) x),'monthlyRevenue',(select coalesce(sum(amount_minor),0) from public.payments where paid_at>=date_trunc('month',timezone('Africa/Cairo',now()))::date and paid_at<(date_trunc('month',timezone('Africa/Cairo',now()))+interval '1 month')::date),'monthlyExpenses',(select coalesce(sum(amount_minor),0) from public.expenses where expense_date>=date_trunc('month',timezone('Africa/Cairo',now()))::date),'outstanding',(select coalesce(sum(greatest(i.total_minor-coalesce(p.paid,0),0)),0) from public.invoices i left join(select invoice_id,sum(amount_minor) paid from public.payments group by invoice_id)p on p.invoice_id=i.id),'team',(select count(*) from public.profiles where status='active'),'tasksInProgress',(select count(*) from public.tasks where status='in_progress')),'months',(select jsonb_agg(jsonb_build_object('month',to_char(m,'Mon'),'revenue',coalesce((select sum(amount_minor)/100.0 from public.payments where paid_at>=m::date and paid_at<(m+interval '1 month')::date),0),'leads',(select count(*) from public.leads where created_at>=m and created_at<m+interval '1 month'),'clients',(select count(*) from public.clients where created_at>=m and created_at<m+interval '1 month')) order by m) from generate_series(date_trunc('month',timezone('Africa/Cairo',now()))-interval '5 months',date_trunc('month',timezone('Africa/Cairo',now())),interval '1 month') m)) into response;
return response;end;$$;
revoke all on function public.dashboard_overview() from public,anon;
grant execute on function public.dashboard_overview() to authenticated;
-- Explicitly retain zero TRUNCATE and zero trigger-function EXECUTE privileges for API users.
revoke truncate on public.profiles,public.roles,public.permissions,public.role_permissions,public.departments,public.clients,public.leads,public.lead_activities,public.projects,public.project_members,public.project_milestones,public.tasks,public.task_comments,public.task_attachments,public.services,public.portfolio_projects,public.portfolio_media,public.content_posts,public.marketing_campaigns,public.social_accounts,public.invoices,public.invoice_items,public.payments,public.expenses,public.notifications,public.activity_logs,public.files,public.website_settings,public.testimonials,public.contact_submissions from anon,authenticated;
revoke all on function public.validate_payment() from public,anon,authenticated;
notify pgrst,'reload schema';
commit;
