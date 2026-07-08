-- Run this whole file once in Supabase: Project -> SQL Editor -> New query -> paste -> Run

create extension if not exists "pgcrypto";

create table employees (
  employee_id text primary key,
  name text not null,
  mobile text not null,
  role text not null default 'customer' check (role in ('customer', 'vendor')),
  created_at timestamptz not null default now()
);

create table sessions (
  token uuid primary key default gen_random_uuid(),
  employee_id text not null references employees(employee_id) on delete cascade,
  created_at timestamptz not null default now()
);

create table menu_items (
  id serial primary key,
  name text not null,
  price numeric(10, 2) not null
);

create table orders (
  id serial primary key,
  token_number integer not null,
  employee_id text not null references employees(employee_id),
  status text not null default 'waiting' check (status in ('waiting', 'preparing', 'ready', 'collected')),
  order_date date not null default current_date,
  total_amount numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id serial primary key,
  order_id integer not null references orders(id) on delete cascade,
  menu_item_id integer not null references menu_items(id),
  quantity integer not null default 1
);

create index idx_orders_date on orders(order_date);
create index idx_orders_status on orders(status);
create index idx_orders_employee on orders(employee_id);

-- Seed one vendor account. Employee ID and mobile are what the vendor will log in with.
-- Change these two values before running if you want different vendor credentials.
insert into employees (employee_id, name, mobile, role)
values ('VENDOR01', 'Canteen Vendor', '9999999999', 'vendor');

-- Starter menu. Edit prices/names to match your actual canteen menu.
insert into menu_items (name, price) values
('Masala chai', 15),
('Filter coffee', 20),
('Samosa', 15),
('Veg thali', 90),
('Masala dosa', 60),
('Sandwich', 40),
('Vada pav', 20),
('Lassi', 35),
('Veg biryani', 110);
