create table query (
	id integer primary key AUTOINCREMENT,
    name  text not null,
	longitude integer not null,
    lattitude integer not null,
    query text,
    date text,
    picture none
);