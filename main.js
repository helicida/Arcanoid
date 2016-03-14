/// <reference path="phaser/phaser.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Point = Phaser.Point;
var mainState = (function (_super) {
    __extends(mainState, _super);
    function mainState() {
        _super.apply(this, arguments);
        // Constantes
        this.ACCELERATION = 300; // aceleración
        this.VELOCIDAD_MAXIMA = 350; // pixels/second
        this.FUERZA_ROZAMIENTO = 100; // Aceleración negativa
        this.UFO_SPEED = 200;
    }
    mainState.prototype.preload = function () {
        _super.prototype.preload.call(this);
        // Importamos las imagenes
        this.load.image('barra', 'assets/png/paddleRed.png');
        this.load.image('pelota', 'assets/png/ballGrey.png');
        this.load.image('ladrillo', 'assets/png/element_green_rectangle.png');
        // Declaramos el motor de físicas que vamos a usar
        this.physics.startSystem(Phaser.Physics.ARCADE);
    };
    mainState.prototype.create = function () {
        _super.prototype.create.call(this);
        this.game.stage.backgroundColor = "#4488AA";
        // Creamos los elementos
        this.createBarra();
        this.createPelota();
        this.crearLadrillos();
    };
    mainState.prototype.crearLadrillos = function () {
        // Anyadimos el recolectable a un grupo
        this.grupoLadrillos = this.add.group();
        this.grupoLadrillos.enableBody = true;
        // Posiciones en las que generaremos los ladrillos
        var positions = [
            new Point(300, 95),
            new Point(190, 135), new Point(410, 135),
            new Point(120, 200), new Point(480, 200),
            new Point(95, 300), new Point(505, 300),
            new Point(120, 405), new Point(480, 405),
            new Point(190, 465), new Point(410, 465),
            new Point(300, 505),
        ];
        // Colocamos los sprites en sus coordenadas a traves de un for
        for (var i = 0; i < positions.length; i++) {
            var position = positions[i];
            // instanciamos el Sprite
            var larillo = new Ladrillo(this.game, position.x, position.y, 'ladrillo', 0);
            // mostramos el Sprite por pantalla
            this.add.existing(larillo);
            this.grupoLadrillos.add(larillo);
        }
    };
    mainState.prototype.createBarra = function () {
        this.barra = this.add.sprite(this.world.centerX, 0, 'barra');
        this.barra.position = (new Point(this.world.centerX, 600 - this.barra.height));
        this.barra.anchor.setTo(0.5, 0.5);
        // Para el movimiento de la barra con las teclas
        this.cursor = this.input.keyboard.createCursorKeys();
        // Activamos la fisica y la hacemos rebotar con los bordes
        this.physics.enable(this.barra);
        this.barra.body.collideWorldBounds = true;
        // Fuerza de rozamiento para que la barra frene
        this.barra.body.drag.setTo(this.FUERZA_ROZAMIENTO, this.FUERZA_ROZAMIENTO); // x, y
        // Le damos una velocidad maxima
        this.barra.body.maxVelocity.setTo(this.VELOCIDAD_MAXIMA, 0); // x, y
        this.barra.body.bounce.setTo(0); // Que no rebote
        this.barra.body.immovable = true;
    };
    mainState.prototype.createPelota = function () {
        this.pelota = this.add.sprite(this.world.centerX, 0, 'pelota');
        this.pelota.anchor.setTo(0.5, 0.5);
        // Activamos la fisica y la hacemos rebotar con los bordes
        this.physics.enable(this.pelota);
        this.pelota.body.collideWorldBounds = true;
        // Velocidad de la pelota
        this.pelota.body.velocity.x = 170;
        this.pelota.body.velocity.y = 170;
        // Rebote
        this.pelota.body.bounce.setTo(1);
    };
    mainState.prototype.destruirLadrillo = function (pelota, ladrillo) {
        ladrillo.kill(); // Nos cargamos el sprite
        this.pelota.body.velocity.x = -this.pelota.body.velocity.x;
        this.pelota.body.velocity.y = -this.pelota.body.velocity.y;
    };
    mainState.prototype.update = function () {
        _super.prototype.update.call(this);
        // Colisiones del jugador (barra) con las paredes
        this.physics.arcade.collide(this.barra, this.pelota);
        //this.physics.arcade.collide(this.pelota, this.grupoLadrillos);
        /* Overlap es similar a un trigger de colision. Es decir, gestiona las colisiones pero no de manera "física"
         de los objetos, al superponerse los objetos, ejcuta código*/
        this.physics.arcade.overlap(this.pelota, this.grupoLadrillos, this.destruirLadrillo, null, this);
        // Movimientos en el eje X
        if (this.cursor.left.isDown) {
            this.barra.body.acceleration.x = -this.ACCELERATION;
        }
        else if (this.cursor.right.isDown) {
            this.barra.body.acceleration.x = this.ACCELERATION / 2;
        }
        else {
            this.barra.body.acceleration.x = 0;
        }
    };
    return mainState;
})(Phaser.State);
var Ladrillo = (function (_super) {
    __extends(Ladrillo, _super);
    function Ladrillo(game, x, y, key, frame) {
        _super.call(this, game, x, y, key, frame);
    }
    return Ladrillo;
})(Phaser.Sprite);
var SimpleGame = (function () {
    function SimpleGame() {
        this.game = new Phaser.Game(600, 600, Phaser.AUTO, 'gameDiv');
        this.game.state.add('main', mainState);
        this.game.state.start('main');
    }
    return SimpleGame;
})();
window.onload = function () {
    var game = new SimpleGame();
};
//# sourceMappingURL=main.js.map