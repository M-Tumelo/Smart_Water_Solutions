-- DDL
create table signup(
	id integer primary key AUTOINCREMENT,
    name  text not null,
	Email text not null,
    type_of_user text not null,
    password text not null
);