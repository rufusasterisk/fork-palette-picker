
exports.seed = function(knex, Promise) {
  return knex('palettes').del()
    .then( () => knex('projects').del())
    .then( () => {
      return Promise.all([
        knex('projects').insert({
          name: 'Star Wars'
        }, 'id')
          .then( project => {
            return knex('palettes').insert([
              {
                name: 'Lightsabers',
                color1: '2ff923',
                color2: 'dd0048',
                color3: '551a8b',
                color4: '2719c7',
                color5: 'ff9933',
                project_key: project[0]
              },
              {
                name: 'Rebel Alliance',
                color1: 'ae0000',
                color2: '007ce6',
                color3: '2de3a2',
                color4: 'a36520',
                color5: '494949',
                project_key: project[0]
              }
            ]);
          })
          //eslint-disable-next-line no-console
          .then( () => console.log('Seeding complete!'))
          //eslint-disable-next-line no-console
          .catch( error => console.log(`Error seeding data: ${error}`))
      ]);
    });
};
