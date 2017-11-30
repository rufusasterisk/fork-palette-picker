let displayColors = {
  1: { hue: 0, saturation: 100, lightness: 50},
  2: { hue: 60, saturation: 100, lightness: 50},
  3: { hue: 120, saturation: 100, lightness: 50},
  4: { hue: 180, saturation: 100, lightness: 50},
  5: { hue: 240, saturation: 100, lightness: 50},
};

const hostPort = 3002;

const setFontColor = (index) => {
  if (displayColors[index].lightness < 41) {
    $(`.color-${index}`).css({'color':'HSL(0,100%,100%)'})
  } else {
    $(`.color-${index}`).css({'color':'HSL(0,100%,0%)'})
  }
}

const updateColors = () => {
  console.log(displayColors);
  for (let i=1; i<6; i++) {
    setFontColor(i)
    $(`.color-${i}`).css(
      {'background-color': `HSL(
        ${displayColors[i].hue},
        ${displayColors[i].saturation}%,
        ${displayColors[i].lightness}%)`})
  }
}
updateColors();


const tetraColors = () => {
  const starterColor = pickRandomColor();
  const firstTetra = Object.assign({}, pickRandomColor(), { hue: ( starterColor.hue + 180 )%360 });
  const secondTetra = Object.assign({}, pickRandomColor(), { hue: ( starterColor.hue + 60 )%360 });
  const thirdTetra = Object.assign({}, pickRandomColor(), { hue: ( starterColor.hue + 240 )%360 });
  const fifthRando = pickRandomColor();

  displayColors = {
    1: starterColor,
    2: firstTetra,
    3: secondTetra,
    4: thirdTetra,
    5: fifthRando
  }
  updateColors()
}

const shuffleColors = () => {
  for (let i=1; i<6; i++) {
    const currentColor = pickRandomColor();
    Object.assign(displayColors, {[i]: currentColor})
  }
  updateColors();
}

const pickRandomColor = () => {
  const hue = Math.floor(Math.random()*359);
  const saturation = Math.floor(Math.random()*100);
  const lightness = Math.floor(Math.random()*80)+10;
  return ({ hue: hue, saturation: saturation, lightness: lightness})
}

const buildPostPayload = (bodyObject) => ({
  body: JSON.stringify(bodyObject),
  headers: {
    'Content-Type': 'application/json'
  },
  method: 'POST'
})

const loadCurrentProjects = () => {
  fetch('http://localhost:' + hostPort + '/api/v1/projects')
    .then( response => response.json())
    .then( projectArray => {
      if (projectArray.length) {
        $('.project-dropdown').html(`
        <option value="null">No Project Selected</option>`);
        projectArray.forEach( (project) => {
          $('.project-dropdown').prepend(`
            <option value="${project.id}">${project.name}</option>
            `);
          })
      }
    })
}

const addProject = () => {
  const projectName = $('.add-project-input').val();
  const payload = buildPostPayload({ name: projectName })
  fetch('http://localhost:' + hostPort + '/api/v1/projects', payload)
    .then( response => response.json())
    .then( data => {
      console.log(data);
    })
}

const loadSelectedPalette = () => {
  const currentPalette = $('.palette-dropdown').val();
  console.log(currentPalette);
  fetch('http://localhost:' + hostPort + '/api/v1/palettes/' + currentPalette)
    .then( response => response.json())
    .then( palette => {
      console.log(palette);
    })
}


const selectProject = () => {
  const currentProject = $('.project-dropdown').val()
  if(currentProject !== null) {
    fetch('http://localhost:' + hostPort + '/api/v1/projects/' + currentProject + '/palettes')
      .then( response => response.json())
      .then( paletteArray => {
        if (paletteArray.length){
          $('.palette-dropdown').html('');
          paletteArray.forEach( (palette) => {
            $('.palette-dropdown').append(`
              <option value="${palette.id}">${palette.name}</option>
            `)
          })
        } else {
          $('.palette-dropdown').html(`
            <option value="null">No Palette Selected</option>
          `)
        }
      })
      .catch( error => {
        console.log({ error });
      })
  }
}

loadCurrentProjects();

$('#shuffle-btn').on('click', tetraColors);

$('.add-project-btn').on('click', addProject);

$('.project-dropdown').on('change', selectProject);
