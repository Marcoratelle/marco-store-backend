
const createUsersTable = knex =>
knex.schema.createTable('users', table => {
    table.increments('id').primary().notNullable().unique();
    table.string('Username').notNullable().unique();
    table.string('first_name').notNullable()
    table.string('last_name').notNullable()
});


const deleteUsersTable = knex => knex.schema.dropTable('users');



exports.up = knex => createUsersTable(knex);


exports.down = knex => deleteUsersTable(knex);