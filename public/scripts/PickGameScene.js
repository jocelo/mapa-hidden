class PickGameScene extends Phaser.Scene {
    constructor() {
        console.log('pick a game class, constructor');
        super('pickGame');

        this.games = [];
        this.gameList = {};
        this.gameRooms;
        this.selectedCategory = 0;
        this.selectedRoom = '';
    }

    init() {
        console.log('the init');
    }

    preload() {
        console.log('the preload');
        this.load.image('backgroundd', 'assets/bg_win_blue.png');
    }

    create() {
        var add = this.add;
        var that = this;

        this.cameras.main.fadeIn(300, 0, 0, 0);
        this.socket = io.connect(url, {});

        add.text(200, 100, 'Selecciona', { fontSize: 30, color: '#ffffff' });
        add.text(200, 130, 'una escena', { fontSize: 30, color: '#ffffff' });

        this.socket.emit('request.games.available', {});

        this.socket.on('games.available', function (data) {
            const serverData = data;
            console.log('how many games are available:', data);
            let row_pos = 100;
            that.gameRooms = add.group();
            let firstRoom;
            for (const room in serverData) {
                console.log(room);
                firstRoom = firstRoom || room;

                var the_room = add.text(450, row_pos, `${room}`, { fontSize: 20, color: '#ffffff' })
                    .setInteractive()
                    .setData('aidi', room)
                    .on('pointerup', function (event) {
                        that.show_available_games(this._text, that);
                    })
                    .on('pointerover', function (event) {
                        if (this._text == that.selectedRoom) {
                            return;
                        }
                        this.setTint(0xf5bd1e);
                    })
                    .on('pointerout', function (event) {
                        if (this._text == that.selectedRoom) {
                            return;
                        }
                        this.clearTint();
                    });
                the_room.id = 5;

                that.gameRooms.add(the_room);
                that.gameList[room] = add.group();

                row_pos += 50;

                let row_pos_for_game = 100;

                serverData[room].forEach(gameId => {
                    const singleGame = add.text(650, row_pos_for_game, gameId, { fontSize: 15, color: '#ffffff' });
                    that.gameList[room].add(singleGame);

                    row_pos_for_game += 40;
                });

                if (that.gameList[room].countActive() == 0) {
                    const noGames_1 = add.text(650, row_pos_for_game, 'No hay juegos activos.', { fontSize: 15, color: '#ffffff' });
                    const noGames_2 = add.text(650, row_pos_for_game + 15, 'Da click para iniciar uno.', { fontSize: 15, color: '#ffffff' });

                    noGames_2
                        .setInteractive()
                        .on('pointerup', function (event) {
                            that.start_new_game().bind(that);
                        });

                    that.gameList[room].add(noGames_1);
                    that.gameList[room].add(noGames_2);
                }
            };

            for (const room in that.gameList) {
                that.gameList[room].setVisible(false);
            }
            console.log('what is the fist room?', firstRoom);
            that.show_available_games(firstRoom, that);
        });
    }

    update() {
    }

    start_new_game() {
        console.log('starting new game!!!!');

        this.cameras.main.fadeOut(700, 0, 0, 0);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            //this.scene.start('donePage', { winner: theWinner });
        });
    }

    show_available_games(item, scope) {
        scope.selectedRoom = item;

        for (const room of scope.gameRooms.getChildren()) {
            room.clearTint();
        }

        for (const room of scope.gameRooms.getMatching('_text', item)) {
            room.setTint(0xe57e04);
        }

        for (const room in scope.gameList) {
            scope.gameList[room].setVisible(false);
        }
        // debugger;
        // scope.gameRooms.getFirst(true).setTint(0xe57e04);
        scope.gameList[item].setVisible(true);
    }
}