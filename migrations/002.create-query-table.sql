create table query (
	id integer primary key AUTOINCREMENT,

    ---name  text not null,
	---longitude text not null,
   --- lattitude text not null,

    name  text not null,
D
	longitude integer not null,
    lattitude integer not null,
    query text,
    date text,
    picture none

    query text,
    date text,
    picture text,
    status text  ---new query, pending, attended

);