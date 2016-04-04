/// <reference path="phaser/phaser.d.ts"/>

import Point = Phaser.Point;
class mainState extends Phaser.State {
    game: Phaser.Game;

    private scoreText:Phaser.Text;
    private speedText:Phaser.Text;
    private endGameText:Phaser.Text;

    // Variables
    private barra:Phaser.Sprite;
    private pelota:Phaser.Sprite;
    private grupoLadrillos:Phaser.Group;
    private proyectiles:Phaser.Group;
    private cursor:Phaser.CursorKeys;
    private puntuacion = 0;
    private nextFire = 0;
    private perdida = false;
    private ganada = false;

    // Constantes
    private VELOCIDAD_MAXIMA = 450;  // pixels/second
    private FUERZA_ROZAMIENTO = 100; // Aceleración negativa
    private ACELERACION = 700;       // aceleración
    private MARGEN_TEXTO = 50;       // Margen de los textos
    private CADENCIA_DISPARO = 200;

    preload():void {
        super.preload();

        // Importamos las imagenes
        this.load.image('barra', 'assets/png/paddleRed.png');
        this.load.image('pelota', 'assets/png/ballGrey.png');
        this.load.image('proyectiles', 'assets/png/ballBlue.png');
        this.load.image('ladrilloVerde', 'assets/png/element_green_rectangle.png');
        this.load.image('ladrilloAzul', 'assets/png/element_blue_rectangle.png');
        this.load.image('ladrilloRojo', 'assets/png/element_red_rectangle.png');
        this.load.image('ladrilloAmarillo', 'assets/png/element_yellow_rectangle.png');
        this.load.image('ladrilloGris', 'assets/png/element_grey_rectangle.png');

        // Declaramos el motor de físicas que vamos a usar
        this.physics.startSystem(Phaser.Physics.ARCADE);
    }

    create():void {
        super.create();

        this.game.stage.backgroundColor = "#4488AA";
        this.physics.arcade.checkCollision.down = false;


        // Creamos los elementos
        this.createBarra();
        this.createBullets();
        this.createPelota();
        this.crearLadrillos();
        this.createTexts();
    }

    crearLadrillos(){

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
    }

    createTexts(){
        var width = this.scale.bounds.width;

        this.scoreText = this.add.text(this.MARGEN_TEXTO, this.MARGEN_TEXTO, 'Score: ' + this.puntuacion,
            {font: "30px Arial", fill: "#ffffff"});

        this.speedText = this.add.text(width - this.MARGEN_TEXTO, this.MARGEN_TEXTO, 'Speed: ' + this.pelota.body.velocity.x,
            {font: "30px Arial", fill: "#ffffff"});

        this.speedText.anchor.setTo(1, 0);
        this.scoreText.fixedToCamera = true;
        this.speedText.fixedToCamera = true;
    }

    createBarra(){
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
        this.barra.body.bounce.setTo(0);  // Que no rebote
        this.barra.body.immovable = true;
    }

    createPelota(){

        // Coordenadas y posicion de la pelota
        this.pelota = this.add.sprite(this.world.centerX, 500, 'pelota');
        this.pelota.position = (new Point(this.world.centerX, this.world.centerY));
        this.pelota.anchor.setTo(0.5, 0.5);

        // Activamos la fisica y la hacemos rebotar con los bordes
        this.physics.enable(this.pelota);
        this.pelota.body.collideWorldBounds = true;
        this.pelota.body.maxVelocity.setTo(this.VELOCIDAD_MAXIMA, this.VELOCIDAD_MAXIMA);

        // Velocidad de la pelota
        this.pelota.body.velocity.x = 170;
        this.pelota.body.velocity.y = 170;

        // Rebote
        this.pelota.body.bounce.setTo(1.2);
        this.pelota.checkWorldBounds = true;
        this.pelota.events.onOutOfBounds.add(this.destruirPelota, this);
    }

    private createBullets() {
        this.proyectiles = this.add.group();
        this.proyectiles.enableBody = true;
        this.proyectiles.physicsBodyType = Phaser.Physics.ARCADE;
        this.proyectiles.createMultiple(20, 'proyectiles');

        this.proyectiles.setAll('anchor.x', 0.5);
        this.proyectiles.setAll('anchor.y', 0.5);
        this.proyectiles.setAll('scale.x', 0.5);
        this.proyectiles.setAll('scale.y', 0.5);
        this.proyectiles.setAll('outOfBoundsKill', true);
        this.proyectiles.setAll('checkWorldBounds', true);
    };


    fire():void {

        if (this.time.now > this.nextFire) {

            var bullet = this.proyectiles.getFirstDead();

            if (bullet) {
                var length = this.barra.width * 0.5 + 20;

                bullet.reset(this.barra.x, this.barra.y - this.barra.height);

                bullet.body.velocity.setTo(0, -500);

                this.nextFire = this.time.now + this.CADENCIA_DISPARO;
            }
        }
    }

    private destruirPelota(pelota:Phaser.Sprite){

        this.perdida = true;

        pelota.kill();

        if(!this.ganada){
            this.endGameText = this.add.text(this.world.centerX - 300, this.world.centerY,  'Has perdido. Haz clic para jugar otra partida',
                {font: "30px Arial", fill: "#ffffff"});

            this.input.onTap.addOnce(this.restartGame, this);
        }
    }

    private destruirLadrillo(pelota:Phaser.Sprite, ladrillo:Phaser.Sprite) {

        ladrillo.kill();    // Nos cargamos el sprite
        this.puntuacion = this.puntuacion + 1;

        // Imprimimos los textos
        this.scoreText.setText("Score: " + this.puntuacion);

        this.calcularVelocidad();
    }

    private ladrilloProyectil(proyectil:Phaser.Sprite, ladrillo:Phaser.Sprite){

        ladrillo.kill();    // Nos cargamos el sprite
        proyectil.kill();

        this.puntuacion = this.puntuacion + 2;

        // Imprimimos los textos
        this.scoreText.setText("Score: " + this.puntuacion);
    }

    private calcularVelocidad(){
        // Sacamos el modulo de la velocidad y lo imprimimos por pantalla
        this.speedText.setText("Speed: " + Math.sqrt(Math.pow(this.pelota.body.velocity.x, 2) + Math.pow(this.pelota.body.velocity.y, 2)).toFixed(2));
    }

    private restartGame(){
        this.game.state.restart();
        this.puntuacion = 0;
        this.perdida = false;
    }

    private ganarPartida(){

        this.ganada = true;

        this.endGameText = this.add.text(this.world.centerX - 300, this.world.centerY,  '¡Has ganado! Haz clic para jugar otra partida',
            {font: "30px Arial", fill: "#ffffff"});

        this.input.onTap.addOnce(this.restartGame, this);
    }

    update():void {
        super.update();

        if (this.input.activePointer.isDown && !this.perdida) {
            this.fire();
        }

        if (this.puntuacion > 1 && this.grupoLadrillos.countDead() == this.grupoLadrillos.length){
            this.ganarPartida();
        }

        // Colisiones
        this.physics.arcade.collide(this.barra, this.pelota, this.calcularVelocidad, null, this);
        this.physics.arcade.overlap(this.proyectiles, this.grupoLadrillos, this.ladrilloProyectil, null, this);

        /* Overlap es similar a un trigger de colision. Es decir, gestiona las colisiones pero no de manera "física"
         de los objetos, al superponerse los objetos, ejcuta código*/
        this.physics.arcade.collide(this.pelota, this.grupoLadrillos, this.destruirLadrillo, null, this);

        // Movimientos en el eje X
        if (this.cursor.left.isDown) {
            this.barra.body.acceleration.x = -this.ACELERACION;
        } else if (this.cursor.right.isDown) {
            this.barra.body.acceleration.x = this.ACELERACION / 2;
        }

        this.barra.position.x = this.game.input.x;
    }
}

class Ladrillo extends Phaser.Sprite{

    constructor(game:Phaser.Game, x:number, y:number, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture, frame:string|number) {
        super(game, x, y, key, frame);
        // Activamos las fisicas
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.body.immovable = true;
    }
}

class SimpleGame {
    game:Phaser.Game;

    constructor() {
        this.game = new Phaser.Game(1280, 750, Phaser.AUTO, 'gameDiv');

        this.game.state.add('main', mainState);
        this.game.state.start('main');
    }
}

window.onload = () => {
    var game = new SimpleGame();
};
