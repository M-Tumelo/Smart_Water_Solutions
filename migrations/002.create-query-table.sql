create table query(
	id integer primary key AUTOINCREMENT,
    name  text not null,
	longitude text not null,
    lattitude text not null,
    picture none,
    status text  ---new query, pending, attended
);