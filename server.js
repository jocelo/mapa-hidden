const http = require('http');
const express = require('express');
const app = express();
const cors = require('cors');
const socketIO = require('socket.io');
const fs = require('fs');
const PORT = process.env.PORT || '8080';

const server = http.Server(app).listen(PORT, '0.0.0.0');
const io = socketIO(server, { origins: '*:*' });
const clients = {};

console.log('io');
console.log(`server started on port ${PORT}`);

// to allow CORS
// io.origins('*:*');

// enable cors
app.use(cors());

// serve static resources
app.use(express.static(__dirname + '/public/'));
app.use(express.static(__dirname + '/public/assets/'));
app.use(express.static(__dirname + '/node_modules/'));

app.get('/', (req, res) => {
    const stream = fs.createReadStream(__dirname + '/public/index.html');
    stream.pipe(res);
});

var games = {
    'kawaii': {
        'robot': 'Robot',
        'bow': 'Moño',
        'cactus': 'Cactus',
        'cloud': 'Nube',
        'hamster': 'Hamster',
        'ice_cream': 'Cono de Nieve',
        'lollypop': 'Paleta',
        'owl': 'Buho',
        'panda': 'Panda',
        'unicorn_cake': 'Pastel de Unicornio',
        'rice_bowl': 'Tazon de Arroz'
    },
    'classroom': {
        'mexico': 'Mapa de Mexico',
        'ruler': 'Regla',
        'calendar': 'Calendario',
        'pencil': 'Lapiz',
        'eraser': 'Goma',
        'scissors': 'Tijeras',
        'paper_clips': 'Clips para papel',
        'diskette': 'Disco flexible',
        'basket_ball': 'Pelota de basquetball'
    },
    'treasure': {
        'crown': 'Corona',
        'ring': 'Anillo',
        'ruby': 'Gema de Ruby',
        'gold_necklace': 'Collar de Oro',
        'pearls': 'Collar de perlas',
        'bracelet': 'Bracalete',
        'blue_earrings': 'Aretes azules',
        'butterfly_brooch': 'Prendedor de Mariposa',
        'necklace': 'Collar'
    },
    'chalkboard': {
        'cilinder': 'Cilindro',
        'cube': 'Cubo',
        'one': 'Numero uno',
        'calculator': 'Calculadora',
        'compass': 'Compas',
        'ruler_chalk': 'Regla',
        'infinity': 'Simbolo de Infinito',
        'phi': 'Simbolo de Pí',
        'light_bulb': 'Foco',
        'hexagon': 'Hexagono',
        'formula': 'Formula General',
        'pencil_chalk': 'Lápiz',
        'tictactoe': 'Gato'
    },
    'city': {
        'flower': 'Flor',
        'lightpost': 'Poste de Luz',
        'butterfly': 'Mariposa',
        'cube_city': 'Cubo',
        'bottle': 'Botella',
        'coin': 'Moneda',
        'bird': 'Pájaro',
        'bow_city': 'Moño de cabello',
        'flags': 'Banderin'
    },
    'retro': {
        'tetris': 'Piezas de tetris',
        'vhs': 'Cassette de VHS',
        'roller_skates': 'Patines',
        '3d_lens': 'Lentes 3D',
        'nokia': 'Celular',
        'cassette': 'Cassette de Música',
        'guitar': 'Guitarra',
        'envelope': 'Sobre para carta',
        'vinyl': 'Disco de vinil',
        'mouse': 'Mouse de computadora',
        'tennis': 'Tenis',
        'polaroid': 'Camara de Instantaneas',
        'discman': 'Disc-Man'
    }
};
var a_games = [];
var unmatched;

io.on('connection', function (socket) {
    let id = socket.id;
    const token = socket.handshake.query.gameId;
    const player = socket.handshake.query.player;
    console.log('------------------');
    console.log(`${socket.id} playing as ${player}`);
    clients[socket.id] = socket;
    a_games.push(socket.id);

    socket.on('disconnect', () => {
        console.log(`Client disconnected with ID: ${socket.id}`);
        delete clients[socket.id];

        var idxOfId = a_games.indexOf(socket.id);
        if (idxOfId != -1) {
            var zGame = a_games.splice(idxOfId, 1);
            console.log(` !!! ${zGame} removed from list of games`);
        }

        socket.broadcast.emit('client.disconnect', socket.id);
    });

    socket.on('request.game', (gameId) => {
        io.emit('get.game', {
            gameData: {
                id: 'city',
                bgImg: 'city.png',
                bgMusic: 'steady_rain.wav',
                objects: {
                    'flower': 'Flor',
                    'lightpost': 'Poste de Luz',
                    'butterfly': 'Mariposa',
                    'cube_city': 'Cubo',
                    'bottle': 'Botella',
                    'coin': 'Moneda',
                    'bird': 'Pájaro',
                    'bow_city': 'Moño de cabello',
                    'flags': 'Banderin'
                }
            }
        });
    });

    socket.on('new.game', () => {
        io.emit('request.new.game', '');
        io.emit('notify', 'se ha comenzado un juego nuevo');
    });

    socket.on('select.item', (data) => {
        console.log('item selected!!!');
        console.log(data);

        if (opponentOf(socket)) {
            opponentOf(socket).emit('remove.item', {
                gameId: socket.id,
                player: games[socket.id].character,
                item: data.item
            });
        }
    });

    socket.on('request.games.available', (data) => {
        console.log('available games!!');
        console.log(a_games);
        socket.emit('games.available', {
            'otoño': [
                'one',
                'two'
            ],
            'escuela': [],
            'tesoro': [
                'three',
                'four',
                'five'
            ],
            'ciudad': [],
            'pizarron': [
                'six',
                'seven',
                'eight',
                'nine',
                'ten'
            ],
            'retro': []
        });
    });

    join(socket, player);

    socket.emit('game.check', {
        gameId: socket.id,
        player: games[socket.id].character
    });

    if (opponentOf(socket)) {
        console.log('(1) =', games[socket.id].player);
        console.log('(2) =', games[opponentOf(socket).id].player);
        socket.emit('game.begin', {
            gameId: socket.id,
            player: games[socket.id].player
        });

        opponentOf(socket).emit('game.begin', {
            gameId: socket.id,
            player: games[opponentOf(socket).id].player
        });
    }

    socket.on('disconnect', () => {
        if (opponentOf(socket)) {
            opponentOf(socket).emit('opponent.left');
        }
    });

    console.log('how many clients are open?');
    console.log(a_games);
    a_games.forEach(function (item) {
        console.log('item', item);
        var isIt = item in games;
        console.log(`${item} is it? ${isIt}`);
    });
});

function join(socket, player) {
    console.log(`${player} from game ${socket.id}`);

    games[socket.id] = {
        opponent: unmatched,
        socket: socket,
        player: player
    }

    if (unmatched) {
        games[socket.id].player = 'red';
        games[unmatched].opponent = socket.id;
        unmatched = null;
    } else { //If 'unmatched' is not define it means the player (current socket) is waiting for an opponent (player #1)
        games[socket.id].player = 'blue';
        unmatched = socket.id;
    }

}

function opponentOf(socket) {
    // console.log('opponentOf socket', socket);
    if (!games[socket.id].opponent) {
        return;
    }
    return games[games[socket.id].opponent].socket;
}

/*
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('Server listening on port 8080')
});
*/