const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.locals.title = 'Palette Picker';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3002);

const requireHTTPS = (request, response, next) => {
  if (request.header('x-forwarded-proto') !== 'https') {
    return (
      response.rediirect(`https://${request.header}('host')}${request.url}`));
  }
  next();
};

if (process.env.NODE_ENV === 'production') { app.use(requireHTTPS); }

app.listen(app.get('port'), () => {
  // eslint-disable-next-line no-console
  console.log(`${app.locals.title} is running on port ${app.get('port')}.`);
});

app.get('/api/v1/projects', (request, response) => {
  database('projects').select()
    .then( projects => {
      return response.status(200).json(projects);
    })
    .catch( error => {
      return response.status(500).json({ error });
    });
});

app.get('/api/v1/projects/:projectID/palettes', (request, response) => {
  database('palettes').where('project_key', request.params.projectID).select()
    .then( palettes => {
      return response.status(200).json(palettes);
    });
});

app.get('/api/v1/palettes', (request, response) => {
  database('palettes').select()
    .then( palettes => {
      return response.status(200).json(palettes);
    })
    .catch( error => {
      return response.status(500).json({ error });
    });
});

app.get('/api/v1/palettes/:id', (request, response) => {
  database('palettes').where('id', request.params.id).select()
    .then( palette => {
      return response.status(200).json(palette);
    })
    .catch( error => {
      return response.status(500).json({ error });
    });
});

const checkPostBody = (reqParamArray, bodyObject) => {
  for (var requiredParameter of reqParamArray) {
    if (!bodyObject[requiredParameter]){
      return {
        error: `You are missing the ${requiredParameter} parameter!`
      };
    }
  }
  return 'ok';
};

app.post('/api/v1/projects', (request, response) => {
  const checkBodyResult = checkPostBody(['name'], request.body);
  if (checkBodyResult !== 'ok') {
    return response.status(422).json(checkBodyResult);
  } else {
    database('projects').insert(request.body, 'id')
      .then( project => {
        return response.status(201).json({
          id: project[0]
        });
      })
      .catch( error => {
        return response.status(500).json({ error });
      });
  }
});

app.post('/api/v1/projects/:projectKey/palettes', (request, response) => {
  const reqParams = ['name', 'color1', 'color2', 'color3', 'color4', 'color5'];
  const checkBodyResult = checkPostBody(reqParams, request.body);
  if (checkBodyResult !== 'ok') {
    return response.status(422).json(checkBodyResult);
  } else {
    const newPalette = Object.assign({},
      request.body, {project_key: request.params.projectKey});
    database('palettes').insert(newPalette, 'id')
      .then( palette => {
        return response.status(201).json({
          id: palette[0]
        });
      })
      .catch( error => {
        return response.status(500).json({ error });
      });
  }
});

app.delete('/api/v1/palettes/:paletteID', (request, response) => {
  database('palettes').where('id', request.params.paletteID).del()
    .then( () => {
      return response.sendStatus(204);
    })
    .catch( error => {
      return response.status(500).json({ error });
    });
});

app.delete('/api/v1/projects/:projectID', (request, response) => {
  database('palettes').where('project_key', request.params.projectID).del()
    .then( () => {
      database('projects').where('id', request.params.projectID).del()
        .then( () => {
          return response.sendStatus(204);
        });
    })
    .catch( error => {
      return response.status(500).json({ error });
    });
});

module.exports = app;
