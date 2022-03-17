const createCredsTable = knex => 
knex.schema.createTable('creds', table => {
    table.integer('user_id')
    .unsigned()
    .notNullable()
    .references('id')
    .inTable('users')
    table.string('hash').notNullable()
    table.string('salt').notNullable()

    })

const deleteCredsTable = knex => knex.schema.dropTable('creds');

exports.up = knex => createCredsTable(knex);
exports.down = knex => deleteCredsTable(knex);