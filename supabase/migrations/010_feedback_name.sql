-- Contact form asks for a name (required in the form; nullable for older rows).
alter table feedback add column if not exists name text check (name is null or char_length(name) between 1 and 80);
