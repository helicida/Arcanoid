/// <reference path="phaser/phaser.d.ts"/>

import Point = Phaser.Point;
class mainState extends Phaser.State {
    game: Phaser.Game;

    // Variables
    private barra:Phaser.Sprite;
    private pelota:Phaser.Sprite;
    private grupoLadrillos:Phaser.Group; // Ladrillos

    private cursor:Phaser.CursorKeys;

    // Constantes
    private ACCELERATION = 300; // aceleración
    private VELOCIDAD_MAXIMA = 350;     // pixels/second
    private FUERZA_ROZAMIENTO = 100; // Aceleración negativa

    private UFO_SPEED = 200;

    preload():void {
        super.preload();

        // Importamos las imagenes
        this.load.image('barra', 'assets/png/paddleRed.png');
        this.load.image('pelota', 'assets/png/ballGrey.png');
        this.load.image('ladrillo', 'assets/png/element_green_rectangle.png');

        // Declaramos el motor de físicas que vamos a usar
        this.physics.startSystem(Phaser.Physics.ARCADE);
    }

    create():void {
        super.create();

        this.game.stage.backgroundColor = "#4488AA";

        // Creamos los elementos
        this.createBarra();
        this.createPelota();
        this.crearLadrillos();
    }

    crearLadrillos(){

        // Anyadimos el recolectable a un grupo
        this.grupoLadrillos = this.add.group();
        this.grupoLadrillos.enableBody = true;

        // Posiciones en las que generaremos los ladrillos

        var positions:Point[] = [
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
    }

    createBarra(){

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
        this.barra.body.bounce.setTo(0);  // Que no rebote
        this.barra.body.immovable = true
    }

    createPelota(){

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
    }

    private destruirLadrillo(pelota:Phaser.Sprite, ladrillo:Phaser.Sprite) {
        ladrillo.kill();    // Nos cargamos el sprite

        this.pelota.body.velocity.x = -this.pelota.body.velocity.x;
        this.pelota.body.velocity.y = -this.pelota.body.velocity.y;
    }

    update():void {
        super.update();

        // Colisiones del jugador (barra) con las paredes
        this.physics.arcade.collide(this.barra, this.pelota);
        //this.physics.arcade.collide(this.pelota, this.grupoLadrillos);

        /* Overlap es similar a un trigger de colision. Es decir, gestiona las colisiones pero no de manera "física"
         de los objetos, al superponerse los objetos, ejcuta código*/
        this.physics.arcade.overlap(this.pelota, this.grupoLadrillos, this.destruirLadrillo, null, this);

        // Movimientos en el eje X
        if (this.cursor.left.isDown) {
            this.barra.body.acceleration.x = -this.ACCELERATION;
        } else if (this.cursor.right.isDown) {
            this.barra.body.acceleration.x = this.ACCELERATION / 2;
        }
        else {
            this.barra.body.acceleration.x = 0;
        }

    }
}

class Ladrillo extends Phaser.Sprite{

    constructor(game:Phaser.Game, x:number, y:number, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture, frame:string|number) {
        super(game, x, y, key, frame);
    }


}



class SimpleGame {
    game:Phaser.Game;

    constructor() {
        this.game = new Phaser.Game(600, 600, Phaser.AUTO, 'gameDiv');

        this.game.state.add('main', mainState);
        this.game.state.start('main');
    }
}

window.onload = () => {
    var game = new SimpleGame();
};
