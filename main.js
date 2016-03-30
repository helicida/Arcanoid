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
        this.puntuacion = 0;
        // Constantes
        this.VELOCIDAD_MAXIMA = 450; // pixels/second
        this.FUERZA_ROZAMIENTO = 100; // Aceleración negativa
        this.ACELERACION = 700; // aceleración
        this.MARGEN_TEXTO = 50; // Margen de los textos
    }
    mainState.prototype.preload = function () {
        _super.prototype.preload.call(this);
        // Importamos las imagenes
        this.load.image('barra', 'assets/png/paddleRed.png');
        this.load.image('pelota', 'assets/png/ballGrey.png');
        this.load.image('ladrilloVerde', 'assets/png/element_green_rectangle.png');
        this.load.image('ladrilloAzul', 'assets/png/element_blue_rectangle.png');
        this.load.image('ladrilloRojo', 'assets/png/element_red_rectangle.png');
        this.load.image('ladrilloAmarillo', 'assets/png/element_yellow_rectangle.png');
        this.load.image('ladrilloGris', 'assets/png/element_grey_rectangle.png');
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
        this.createTexts();
    };
    mainState.prototype.crearLadrillos = function () {
        // Anyadimos el recolectable a un grupo
        this.grupoLadrillos = this.add.group();
        this.grupoLadrillos.enableBody = true;
        // Array con ladrillos
        var barritas = ['ladrilloVerde', 'ladrilloAzul', 'ladrilloRojo', 'ladrilloAmarillo', 'ladrilloGris'];
        // Posiciones en las que generaremos los ladrillos
        var ladrillosPorLinea = 20;
        var numeroFilas = 8;
        // Tamanyo de los ladrillos
        var anchuraLadrillo = 64;
        var alturaLadrillo = 32;
        // For para llenar array de coordeandas
        for (var posFila = 0; posFila < numeroFilas; posFila++) {
            for (var posColumna = 0; posColumna < ladrillosPorLinea; posColumna++) {
                // Array circular
                var colorBarrita = barritas[posFila % barritas.length];
                // Coordenadas en las que mostraremos el ladrillo
                var x = anchuraLadrillo * posColumna;
                var y = posFila * (alturaLadrillo + 1);
                // instanciamos el Sprite
                var ladrillo = new Ladrillo(this.game, x, y, colorBarrita, 0);
                // mostramos el Sprite por pantalla
                this.add.existing(ladrillo);
                this.grupoLadrillos.add(ladrillo);
            }
        }
    };
    mainState.prototype.createTexts = function () {
        var width = this.scale.bounds.width;
        this.scoreText = this.add.text(this.MARGEN_TEXTO, this.MARGEN_TEXTO, 'Score: ' + this.puntuacion, { font: "30px Arial", fill: "#ffffff" });
        this.speedText = this.add.text(width - this.MARGEN_TEXTO, this.MARGEN_TEXTO, 'Speed: ' + this.pelota.body.velocity.x, { font: "30px Arial", fill: "#ffffff" });
        this.speedText.anchor.setTo(1, 0);
        this.scoreText.fixedToCamera = true;
        this.speedText.fixedToCamera = true;
    };
    mainState.prototype.createBarra = function () {
        // Coordenadas y posicion de la barra
        this.barra = this.add.sprite(this.world.centerX, 0, 'barra');
        this.barra.x = this.world.centerX;
        this.barra.y = this.world.height - this.barra.height - 5;
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
        // Coordenadas y posicion de la pelota
        this.pelota = this.add.sprite(this.world.centerX, 500, 'pelota');
        this.pelota.position = (new Point(this.world.centerX, this.world.height - this.pelota.height));
        this.pelota.anchor.setTo(0.5, 0.5);
        // Activamos la fisica y la hacemos rebotar con los bordes
        this.physics.enable(this.pelota);
        this.pelota.body.collideWorldBounds = true;
        this.pelota.body.maxVelocity.setTo(this.VELOCIDAD_MAXIMA, this.VELOCIDAD_MAXIMA);
        // Velocidad de la pelota
        this.pelota.body.velocity.x = 170;
        this.pelota.body.velocity.y = 170;
        // Rebote
        this.pelota.body.bounce.setTo(1);
    };
    mainState.prototype.destruirLadrillo = function (pelota, ladrillo) {
        ladrillo.kill(); // Nos cargamos el sprite
        this.pelota.body.velocity.x = this.pelota.body.velocity.x + 5;
        this.pelota.body.velocity.y = this.pelota.body.velocity.y + 5;
        this.puntuacion = this.puntuacion + 1;
        // Imprimimos los textos
        this.scoreText.setText("Score: " + this.puntuacion);
        // Sacamos el modulo de la velocidad y lo imprimimos por pantalla
        this.speedText.setText("Speed: " + Math.sqrt(Math.pow(this.pelota.body.velocity.x, 2) + Math.pow(this.pelota.body.velocity.y, 2)).toFixed(2));
    };
    mainState.prototype.update = function () {
        _super.prototype.update.call(this);
        // Colisiones del jugador (barra) con las paredes
        this.physics.arcade.collide(this.barra, this.pelota);
        //this.physics.arcade.collide(this.pelota, this.grupoLadrillos);
        /* Overlap es similar a un trigger de colision. Es decir, gestiona las colisiones pero no de manera "física"
         de los objetos, al superponerse los objetos, ejcuta código*/
        this.physics.arcade.collide(this.pelota, this.grupoLadrillos, this.destruirLadrillo, null, this);
        // Movimientos en el eje X
        if (this.cursor.left.isDown) {
            this.barra.body.acceleration.x = -this.ACELERACION;
        }
        else if (this.cursor.right.isDown) {
            this.barra.body.acceleration.x = this.ACELERACION / 2;
        }
        this.barra.position.x = this.game.input.x;
    };
    return mainState;
})(Phaser.State);
var Ladrillo = (function (_super) {
    __extends(Ladrillo, _super);
    function Ladrillo(game, x, y, key, frame) {
        _super.call(this, game, x, y, key, frame);
        // Activamos las fisicas
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.body.immovable = true;
    }
    return Ladrillo;
})(Phaser.Sprite);
var SimpleGame = (function () {
    function SimpleGame() {
        this.game = new Phaser.Game(1280, 750, Phaser.AUTO, 'gameDiv');
        this.game.state.add('main', mainState);
        this.game.state.start('main');
    }
    return SimpleGame;
})();
window.onload = function () {
    var game = new SimpleGame();
};
//# sourceMappingURL=main.js.map