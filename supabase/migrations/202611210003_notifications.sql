begin;
-- Server-side setup operations use the server key. Anon/authenticated permissions do not change.
grant select,insert,update,delete on public.profiles,public.roles,public.permissions,public.role_permissions,public.departments,public.clients,public.leads,public.lead_activities,public.projects,public.project_members,public.project_milestones,public.tasks,public.task_comments,public.task_attachments,public.services,public.portfolio_projects,public.portfolio_media,public.content_posts,public.marketing_campaigns,public.social_accounts,public.invoices,public.invoice_items,public.payments,public.expenses,public.notifications,public.activity_logs,public.files,public.website_settings,public.testimonials,public.contact_submissions to service_role;
create or replace function public.mark_notifications_read(notification_ids uuid[]) returns void language sql security definer set search_path='' as $$update public.notifications set read_at=now()::text where recipient_id=auth.uid() and id=any(notification_ids)$$;
revoke all on function public.mark_notifications_read(uuid[]) from public,anon;
grant execute on function public.mark_notifications_read(uuid[]) to authenticated;
create or replace function public.notify_task() returns trigger language plpgsql security definer set search_path='' as $$begin
if NEW.assigned_to is not null and (TG_OP='INSERT' or NEW.assigned_to is distinct from OLD.assigned_to) then insert into public.notifications(recipient_id,title,body,link) values(NEW.assigned_to,'Task assigned',NEW.title,'/dashboard/tasks/'||NEW.id);end if;
if TG_OP='UPDATE' and NEW.status='completed' and OLD.status is distinct from 'completed' and NEW.created_by is not null and NEW.created_by is distinct from auth.uid() then insert into public.notifications(recipient_id,title,body,link) values(NEW.created_by,'Task completed',NEW.title,'/dashboard/tasks/'||NEW.id);end if;return NEW;end;$$;
revoke all on function public.notify_task() from public,anon,authenticated;
create or replace function public.notify_project() returns trigger language plpgsql security definer set search_path='' as $$begin
if NEW.manager_id is not null then insert into public.notifications(recipient_id,title,body,link) values(NEW.manager_id,'New project',NEW.name,'/dashboard/projects/'||NEW.id);end if;return NEW;end;$$;
revoke all on function public.notify_project() from public,anon,authenticated;
create trigger project_notify after insert on public.projects for each row execute function public.notify_project();
-- This de-duplicated check runs on workspace visits. No scheduled email/push delivery is implied.
create or replace function public.sync_deadline_notifications() returns void language plpgsql security definer set search_path='' as $$begin
if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and status='active') then raise exception 'Active workspace access required';end if;
perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
insert into public.notifications(recipient_id,title,body,link)
select auth.uid(),'Task deadline approaching',t.title||' · '||t.deadline,'/dashboard/tasks/'||t.id from public.tasks t where public.has_permission('tasks.read') and t.assigned_to=auth.uid() and t.status<>'completed' and t.deadline between timezone('Africa/Cairo',now())::date and timezone('Africa/Cairo',now())::date+2 and not exists(select 1 from public.notifications n where n.recipient_id=auth.uid() and n.title='Task deadline approaching' and n.link='/dashboard/tasks/'||t.id and n.created_at>=(date_trunc('day',timezone('Africa/Cairo',now())) at time zone 'Africa/Cairo'));
insert into public.notifications(recipient_id,title,body,link)
select auth.uid(),'Project deadline approaching',p.name||' · '||p.deadline,'/dashboard/projects/'||p.id from public.projects p where public.can_read_project(p.id) and p.manager_id=auth.uid() and p.status not in ('completed','cancelled') and p.deadline between timezone('Africa/Cairo',now())::date and timezone('Africa/Cairo',now())::date+2 and not exists(select 1 from public.notifications n where n.recipient_id=auth.uid() and n.title='Project deadline approaching' and n.link='/dashboard/projects/'||p.id and n.created_at>=(date_trunc('day',timezone('Africa/Cairo',now())) at time zone 'Africa/Cairo'));
end;$$;
revoke all on function public.sync_deadline_notifications() from public,anon;
grant execute on function public.sync_deadline_notifications() to authenticated;
do $$begin if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='notifications') then alter publication supabase_realtime add table public.notifications;end if;end$$;
drop policy module_read on public.projects;
create policy module_read on public.projects for select to authenticated using(public.has_permission('projects.read') and (public.has_permission('projects.write') or public.can_read_project(id)));
notify pgrst,'reload schema';
commit;
