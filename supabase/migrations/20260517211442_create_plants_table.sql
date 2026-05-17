create type health_status as enum ('ok', 'warn', 'bad');

create table plants (
  id          integer primary key,
  name        text not null,
  latin       text not null,
  category    text not null,
  note        text not null default '',
  health      health_status not null default 'ok',
  image_path  text not null,
  created_at  timestamptz not null default now()
);

alter table plants enable row level security;

create policy "plants are publicly readable"
  on plants for select
  to anon, authenticated
  using (true);

grant select on plants to anon, authenticated;
