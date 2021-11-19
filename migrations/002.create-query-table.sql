create table query (
	id integer primary key AUTOINCREMENT,
    name  text not null,
<<<<<<< HEAD
<<<<<<< HEAD
	longitude integer not null,
    lattitude integer not null,
    query text,
    date text,
    picture none
=======
	-- longitude text not null,
    -- lattitude text not null,
=======
	 longitude text,
     lattitude text,
>>>>>>> bcd745c4e4fe39ee3b8aab3b9581ccf4c5fa9bf5
    query text,
    date text,
    picture text,
    status text  ---new query, pending, attended
>>>>>>> main
);