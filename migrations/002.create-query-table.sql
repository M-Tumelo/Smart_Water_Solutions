create table query(
	id integer primary key AUTOINCREMENT,
    name  text not null,
	-- longitude text not null,
    -- lattitude text not null,
    query text,
    date text,
    picture text,
    status text  ---new query, pending, attended
);