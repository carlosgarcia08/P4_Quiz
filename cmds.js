

const {log, biglog, errorlog, colorize} = require("./out");

const model = require('./model');


/**
 * Muestra la ayuda
 */
exports.helpCmd = rl => {
    log("Comandos");
    log("  h|help - Muestra esta ayuda.");
    log("  list - Listar los quizzes existentes.");
    log("  show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
    log("  add - Añadir un nuevo quiz interactivamente");
    log("  delete <id> - Borrar el quiz indicado");
    log("  edit <id> - Editar el quiz indicado");
    log("  test <id> - Probar el quiz indicado");
    log("  p|play = Jugar a preguntar aleatoriamente todos los quizzes");
    log("  credits = Créditos.");
    log("  q|quit = Salir del programa");
    rl.prompt();
};

/**
 * Lista todos los quizzes existentes en el modelo.
 */
exports.listCmd = rl => {

    model.getAll().forEach((quiz, id) => {
        log(`  [${colorize(id, 'magenta')}]: ${quiz.question}` );
    });


    rl.prompt();
};

/**
 * Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
 *
 * @param id Clave del quiz a mostrar.
 */
exports.showCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
    }else{
        try{
            const quiz = model.getByIndex(id);
            log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        } catch(error) {
            errorlog(error.message);
        }
    }


    rl.prompt();
};

/**
 * Añade un nuevo quiz al modelo.
 * Pregunta interactivamente por la pregunta y por la respuesta.
 *
 * Hay que recordar que el funcionamiento de la funcion rl.question es asincrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interaccion con el usuario,
 * es decir, la llamada a rl.prompt() se debe haer en la callback de la segunda
 * llamada a rl.question.
 *
 * @param rl Objeto readline usado para implementar el CLI
 */
exports.addCmd = rl => {

    rl.question(colorize('Introduzca una pregunta: ', 'red'), question => {
        rl. question(colorize('Introduzca la respuesta ', 'red'), answer => {
            model.add(question, answer);
            log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
            rl.prompt();
    });
    });
};

/**
 * Borra un quiz del modelo.
 *
 * @param id Clave del quiz a borrar en el modelo.
 */
exports.deleteCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
    }else{
        try{
            model.deleteByIndex(id);
        } catch(error) {
            errorlog(error.message);
        }
    }

    rl.prompt();
};

/**
 * Edita un quiz del modelo.
 *
 * @param id Clave del quiz a editar en el modelo.
 */
exports.editCmd = (rl, id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else {
        try {
            const quiz = model.getByIndex(id);

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

                rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {
                    model.update(id, question, answer);
                    log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
                    rl.prompt();
            });
            });
        }catch (error) {
            errorlog(error.message);
            rl.prompt();
        }
    }
};


/**
 * Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
 *
 * @param id Clave del quiz a probar.
 */
exports.testCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id`);
        rl.prompt();
    }else{

        try{
            const quiz = model.getByIndex(id);
            rl.question(`${quiz.question}:`, (respuesta) => {//question = pregunta metida

                if(respuesta.trim().toLowerCase()===quiz.answer.toLowerCase()) {

                    console.log("Su respuesta es:");
                    biglog('Correcta', 'green');

                }else{
                    console.log("Su respuesta es:");
                    biglog('Incorrecta', 'red');
                }
                rl.prompt();

            });

        } catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};

/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
 * Se gana si se contesta a todos satisfactoriamente.
 */
exports.playCmd = rl => {
    let score = 0;
    let toBeResolved = [];
    for ( i = 0; i< model.count;i++){
        toBeResolved[i]=i;
    }

    const playOne= () => {

        if (toBeResolved.length === 0){
            console.log("No hay preguntas");
            console.log(`Su resultado es: ${score}`);
            rl.prompt();
        }else{
            let id =  toBeResolved[Math.floor(Math.random() * toBeResolved.length)];
            toBeResolved.splice(id,1);
            let quiz = model.getByIndex(id);

            rl.question(`${quiz.question}:`, respuesta => {//question = pregunta metida

                if((respuesta.trim()===quiz.answer.toLowerCase()) || (respuesta.trim()===quiz.answer) || (respuesta.trim() === quiz.answer.toUpperCase()) ){

                    console.log("Su respuesta es:");
                    biglog('Correcta', 'green');
                    score ++;
                    console.log(`Llevas ${score} puntos`);
                    playOne();

                }else{
                    console.log("Su respuesta es:");
                    biglog('Incorrecta', 'red');
                    console.log(`Conseguiste ${score} puntos`);
                    rl.prompt();
                }
            });
        }
    }
    playOne();
};

/**
 * Muestra el nombre del autor de la práctica.
 */
exports.creditsCmd = rl => {
    log('Autor de la práctica');
    log('Carlos García Manrique', 'green');
    rl.prompt();
};

/**
 * Terminar el programa.
 */
exports.quitCmd = rl => {
    rl.close();
};