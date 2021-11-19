create table query(
	id integer primary key AUTOINCREMENT,
    name  text not null,
	 longitude text,
     lattitude text,
    query text,
    date text,
    picture text,
    status text  ---new query, pending, attended
);