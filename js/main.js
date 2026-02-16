//****** GAME LOOP ********//

var time = new Date();
var deltaTime = 0;

if(document.readyState === "complete" || document.readyState === "interactive"){
    setTimeout(Init, 1);
}else{
    document.addEventListener("DOMContentLoaded", Init); 
}




function Init() {
  time = new Date();
  Start();
  Loop();
  
}

function Loop() {
  deltaTime = (new Date() - time) / 1000;
  time = new Date();
  Update();
  requestAnimationFrame(Loop);
}

//****** GAME LOGIC ********//

var sueloY = 22;
var velY = 0;
var impulso = 900;
var gravedad = 2500;

var dinoPosX = 42;
var dinoPosY = sueloY;

var sueloX = 0;
var velEscenario =  1280/3;
var gameVel = 1;
var score = 0;

var parado = false;
var saltando = false;

var tiempoHastaObstaculo = 2;
var tiempoObstaculoMin = 0.7;
var tiempoObstaculoMax = 1.8;
var obstaculoPosY = 16;
var obstaculos = [];

var tiempoHastaNube = 0.5;
var tiempoNubeMin = 0.7;
var tiempoNubeMax = 2.7;
var maxNubeY = 270;
var minNubeY = 100;
var nubes = [];
var velNube = 0.5;

var contenedor;
var dino;
var textoScore; 
var suelo;
var gameOver;

function Start() {
 // gameOver = document.querySelector(".game-over");
  suelo = document.querySelector(".suelo");
  contenedor = document.querySelector("#contenedor");
  textoScore = document.querySelector(".score");
  dino = document.querySelector(".dino");
  document.addEventListener("keydown", HandleKeyDown);

}

function Saltar() {
  if(dinoPosY === sueloY) {
    saltando = true;
    velY = impulso;
    dino.classList.remove("dino-corriendo");

  }
}

function HandleKeyDown(ev) {
  if(ev.keyCode == 32) {
    Saltar();
  }
}

function TocarSuelo() {
  dinoPosY = sueloY;
  velY = 0;
  if(saltando){
    dino.classList.add("dino-corriendo");
  }
  saltando = false;
}

function MoverSuelo(){
  sueloX += CalcularDesplazamiento();
  suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";

}

function MoverDinosaurio() {
  dinoPosY += velY * deltaTime;
  if(dinoPosY < sueloY){

    TocarSuelo();
  }
  dino.style.bottom = dinoPosY + "px";
}

function CalcularDesplazamiento() {
  return velEscenario * deltaTime * gameVel;

}

function Estrellarse() {
  dino.classList.remove("dino-corriendo");
  dino.classList.add("dino-estrellado");
  parado = true;
}

function CrearObstaculo() {
  var obstaculo = document.createElement("div");
  contenedor.appendChild(obstaculo);
  obstaculo.classList.add("cactus");
  if(Math.random() > 0.5) obstaculo.classList.add("cactus2");
  obstaculo.posX = contenedor.clientWidth;
  obstaculo.style.left = contenedor.clientWidth+"px";
  
  obstaculos.push(obstaculo);
  tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax-tiempoObstaculoMin) / gameVel;


}

function DecidirCrearObstaculos() {
  tiempoHastaObstaculo -= deltaTime;
  if(tiempoHastaObstaculo <= 0) {
    CrearObstaculo();
  }
}

function MoverObstaculos() {
  for (var i = obstaculos.length - 1; i >= 0; i--) {
    if(obstaculos[i].posX < -obstaculos[i].clientWidth) {
      obstaculos[i].parentNode.removeChild(obstaculos[i]);
      obstaculos.splice(i, 1);
      GanarPuntos();
    } else {
      obstaculos[i].posX -= CalcularDesplazamiento();
      obstaculos[i].style.left = obstaculos[i].posX+"px";
    }
  }
}

function CrearNube() {
  var nube = document.createElement("div");
  contenedor.appendChild(nube);
  nube.classList.add("nube");
  nube.posX = contenedor.clientWidth;
  nube.style.left = contenedor.clientWidth + "px";
  nube.style.bottom = minNubeY +  Math.random() * (maxNubeY-minNubeY) + "px";

  nubes.push(nube);
  tiempoHastaNube = tiempoNubeMin  +  Math.random() * (tiempoNubeMax - tiempoNubeMin) / gameVel;
}

function DecidirCrearNubes() {
  tiempoHastaNube -= deltaTime;
  if(tiempoHastaNube <= 0) {
   CrearNube();
  }
}


function MoverNubes() {
  for (var i = nubes.length - 1; i >= 0; i--) {
      if(nubes[i].posX < -nubes[i].clientWidth) {
          nubes[i].parentNode.removeChild(nubes[i]);
          nubes.splice(i, 1);
      }else{
          nubes[i].posX -= CalcularDesplazamiento() * velNube;
          nubes[i].style.left = nubes[i].posX+"px";
      }
  }
}

function GanarPuntos() {
  score++;
  textoScore.innerText = score;
  if(score == 5){
      gameVel = 1.5;
      contenedor.classList.add("mediodia");
  }else if(score == 10) {
      gameVel = 2;
      contenedor.classList.add("tarde");
  } else if(score == 20) {
      gameVel = 3;
      contenedor.classList.add("noche");
  }
  suelo.style.animationDuration = (3/gameVel)+"s";
}
// Suma los puntos pasados como paraemtro y retorna el resultado final 
function MuestraPuntuacionTotal (puntosASumar) {
  let arrayNumerosPasados = [];
  // Inserta cada numero pasado como parametro al array
  arrayNumerosPasados.push(puntosASumar);
  let resultado = arrayNumerosPasados.reduce((acumulador,numeroActual) => {acumulador + numeroActual;});
  return resultado;

};

function GameOver() {
  
  DecidirReinicio(true);
  Estrellarse();
  gameOver.style.display = "block";
 
}

function DetectarColision() {
  for (var i = 0; i < obstaculos.length; i++) {
      if(obstaculos[i].posX > dinoPosX + dino.clientWidth) {
          //EVADE
          break; //al estar en orden, no puede chocar con más
      }else{
          if(IsCollision(dino, obstaculos[i], 10, 30, 15, 20)) {
              GameOver();
              // retorna true si el dinosaurio choco, este valor lo uso para activar la funcion DecidirReinicio()
              return true 
          }

      }
  }
  // Retorna false si no choco si ocurre esto no se activara la funcionDecidirReinicio()
  return false 
}

function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
  var aRect = a.getBoundingClientRect();
  var bRect = b.getBoundingClientRect();

  return !(
      ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
      (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
      ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
      (aRect.left + paddingLeft > (bRect.left + bRect.width))
  );
}





// detecta clicks en el boton que tenga la clase pasada como parametro 
function DetectarClicksEnBoton(classBoton) {
  const botonConEsaClase = document.querySelector(classBoton);
  if(botonConEsaClase) {botonConEsaClase.addEventListener("click", () => {
    location.reload();
    }) 
  }
}
// Mostrara un cartel con la opcion para reiniciar el juego solo si el parametro pasado es true
function DecidirReinicio(parametroAEvaluar) {
  if(parametroAEvaluar === true) {
    // Creo el div que sera el cartel de reinicio
    let cartelReinicio = document.createElement("div");
    // Le asigno una clase 
    cartelReinicio.classList.add("cartel-reinicio");
    // Creo un <h1> 
    let tituloCartelReinicio = document.createElement("h1"); 
    // Le agrego el contenido al <h1>
    tituloCartelReinicio.innerText = "Fin del juego";
    // Invoco a la funcion muestraPuntuacionTotal
    let puntajeFinal = MuestraPuntuacionTotal(score);
    // crea un <h3> 
     let mensajePuntuacionFinal = document.createElement("h3");
     // le agrego texto al <h3>
     mensajePuntuacionFinal.innerText = "Puntuacion final:  "  + puntajeFinal;
    // creo el boton 
    let botonReinicio = document.createElement("button");
    // le agrego una clase al boton 
     botonReinicio.classList.add("boton-reinicio");
     // le agrego texto al boton 
     botonReinicio.innerText = "Reiniciar";
     //Le agrego el <h1> al cartelReinicio
    cartelReinicio.appendChild(tituloCartelReinicio);
     // Le agrego el <h3> 
     cartelReinicio.appendChild(mensajePuntuacionFinal);
    // Le agrero el botonReinicio
    cartelReinicio.appendChild(botonReinicio);
    // Agrego agrega cartelReinicio al div con el id contenedor 
    contenedor.appendChild(cartelReinicio);
    
    DetectarClicksEnBoton(".boton-reinicio");

    } 

};

function Update() {
  if(parado) return;

  MoverDinosaurio();
  MoverSuelo();
  DecidirCrearObstaculos();
  MoverObstaculos();
  DecidirCrearNubes();
  MoverNubes();
  DetectarColision();
  
 


  velY -= gravedad * deltaTime;
}

