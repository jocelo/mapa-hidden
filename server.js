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

var games = {};
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
        socket.broadcast.emit('client.disconnect', socket.id);
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
    })

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