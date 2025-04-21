const faker = require('@faker-js/faker').faker;
const User = require('../models/user');
const Book = require('../models/book');
const { indexUser, createUsersIndex } = require('../services/elasticUserService');

const populateUsers = async (shouldDelete) => {
  try {
    console.log('📚 Poblando usuarios...');
    
    if (shouldDelete) {
        console.log('🗑️ Eliminando usuarios existentes...');
        
        // Eliminar usuarios de MongoDB
        await User.deleteMany({});
        console.log('✅ Usuarios eliminados de MongoDB.');
  
        // Eliminar índice de Elasticsearch y recrearlo
        await createUsersIndex();
        console.log('✅ Índice "users" eliminado y recreado en Elasticsearch.');
      }

    const users = [];

    for (let i = 0; i < 100; i++) {
      const name = faker.person.fullName();
      const email = `${name.replace(/ /g, '-').toLowerCase()}${i}@example.com`;  
      const user = new User({
        name: name,
        email: email,
        password: 'password123',
        purchasedBooks: [],
      });
      const savedUser = await user.save();

      // Indexar el usuario en Elasticsearch
      await indexUser(savedUser);

      users.push(savedUser);
    }

    console.log(`✅ Se han creado ${users.length} usuarios con datos aleatorios.`);
  } catch (err) {
    console.error('❌ Error poblando usuarios:', err.message);
    throw err;
  }
};

module.exports = populateUsers;