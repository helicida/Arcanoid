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
        // Declaramos el motor de físicas que vamos a usar
        this.physics.startSystem(Phaser.Physics.ARCADE);
    };
    mainState.prototype.create = function () {
        _super.prototype.create.call(this);
        this.game.stage.backgroundColor = "#4488AA";
        // Creamos los elementos
        this.createBarra();
        this.createPelota();
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
    mainState.prototype.update = function () {
        _super.prototype.update.call(this);
        // Colisiones del jugador (UFO) con las paredes
        this.physics.arcade.collide(this.barra, this.pelota);
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