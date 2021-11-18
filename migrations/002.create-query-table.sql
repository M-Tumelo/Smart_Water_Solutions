create table query(
	id integer primary key AUTOINCREMENT,
    name  text not null DEFAULT 'sensor query',
	longitude int not null,
    lattitude int not null,
    query text,
    date text,
    picture text,
    status text  ---new query, pending, attended
);