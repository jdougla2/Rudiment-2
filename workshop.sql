create database workshop2;
\c workshop2

create table workshops (
        title varchar not null,
        wsdate varchar not null,
        location varchar not null,
        maxseats int not null,
        instructor varchar not null,
        primary key (title, wsdate, location)
);

create table users (
        username varchar not null,
        firstname varchar not null,
        lastname varchar not null,
        email varchar not null,
        primary key (username)
);

create table enrolledusers (
        username varchar not null,
        title varchar not null,
        wsdate varchar not null,
        location varchar not null,
        foreign key (username) references users(username),
        foreign key (title, wsdate, location) references workshops(title, wsdate, location)
);

insert into users (username, firstname, lastname, email) values ('ann', 'Ann', 'Mulkern', 'ann.mulkern@gmail.com');
insert into users (username, firstname, lastname, email) values ('bnowicki', 'Ben', 'Nowicki', 'benben@umw.edu');
insert into users (username, firstname, lastname, email) values ('dougjacklas', 'Jack', 'Douglas', 'jdougla2@mail.umw.edu');
