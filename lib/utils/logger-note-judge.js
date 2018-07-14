// logger-note-judge
const loggerNoteJudge = {
    tagCommand: '-t',
    signCommand: '-sign',
    countCommand: '-count',
    timeCommand: '-time',
    profileCommand: '-profile',
    stopCommand: '-stop',
    fromCommand: '-from',
    serializeCommand: '-serialize',
    loggerLevels: [
        {
            name: '-e',
            value: 'error'
        },
        {
            name: '-d',
            value: 'debug'
        },
        {
            name: '-w',
            value: 'warn'
        },
        {
            name: '-i',
            value: 'info'
        },
    ]
};

loggerNoteJudge.generateNote = function(logger, options, ...consoleStrArr){
    // logger => // {#} -d
    logger = logger.substring(`// {${options.hook}}`.length, logger.length).trim();
    const loggerCommands = logger.split(/\s+/);

    // check -t
    let localTag = options.tag;
    const tagIndex = loggerCommands.findIndex(comm => comm === loggerNoteJudge.tagCommand);
    if (tagIndex > -1) {
        localTag = loggerCommands[tagIndex + 1];
    }

    let consoleLine = [
        'if (typeof DEBUG === "undefined") {',
        'if (typeof localStorage !== "undefined") {',
        'window.DEBUG = localStorage.getItem("DEBUG");',
        '}',
        '}',
        'if (typeof DEBUG === "string") {',
        'DEBUG = new RegExp(DEBUG);',
        '}',
        `if (typeof DEBUG === "undefined" || DEBUG == null || DEBUG.test('${localTag}')) {`
    ].join('');

    // find logger levels
    const currentLevel = loggerNoteJudge.loggerLevels.find(level => {
        for (let i = 0; i < loggerCommands.length; i++) {
            if (loggerCommands[i] === level.name) {
                // get
                return true;
            }
        }
        return false;
    });

    const hasSerializeCommand = loggerCommands.indexOf(loggerNoteJudge.serializeCommand) > -1;

    if (currentLevel) {
        const levelTag = `${currentLevel.value}Tag`;
        const levelTagStyle = `${currentLevel.value}TagStyle`;
        consoleLine += `console.${currentLevel.value}('%c[${options[levelTag]}][${localTag}]', '${options[levelTagStyle]}', `;
        for (let i = 0; i < consoleStrArr.length; i++) {
            let array = consoleStrArr[i];
            if (hasSerializeCommand) {
                array = array.map(str => {
                    if (str.charAt(0) === "'" && str.charAt(str.length - 1) === "'") {
                        return str;
                    }
                    return `JSON.stringify(${str}, null, 2)`;
                });
            }
            consoleLine += `${array}`;
            if (i !== consoleStrArr.length - 1) {
                consoleLine += ', ';
            }
        }
        consoleLine += ');';
    } else {
        consoleLine += 'console.log(';
        for (let i = 0; i < consoleStrArr.length; i++) {
            let array = consoleStrArr[i];
            if (hasSerializeCommand) {
                array = array.map(str => {
                    if (str.charAt(0) === "'" && str.charAt(str.length - 1) === "'") {
                        return str;
                    }
                    return `JSON.stringify(${str}, null, 2)`;
                });
            }
            consoleLine += `${array}`;
            if (i !== consoleStrArr.length - 1) {
                consoleLine += ', ';
            }
        }
        consoleLine += ');';
    }

    consoleLine += '}';

    if (loggerCommands.indexOf(loggerNoteJudge.stopCommand) > -1) {
        consoleLine = '';
    }

    return consoleLine;
};

loggerNoteJudge.hasSignCommand = function(logger, options){
    logger = logger.substring(`// {${options.hook}}`.length, logger.length).trim();
    const loggerCommands = logger.split(/\s+/);
    return loggerCommands.indexOf(loggerNoteJudge.signCommand) > -1;
};

loggerNoteJudge.withAssignment = function(loggerType, options){
    let loggerLine = '';
    loggerLine += loggerType.input;

    const consoleStrArr = [];
    const hasSignCommand = loggerNoteJudge.hasSignCommand(loggerType.logger, options);
    if (hasSignCommand) {
        consoleStrArr.push(`'${loggerType.var}: '`);
    }
    consoleStrArr.push(loggerType.var);

    const generateNote = loggerNoteJudge.generateNote(loggerType.logger, options, consoleStrArr);
    loggerLine += `\n${generateNote}`;
    return loggerLine;
};

loggerNoteJudge.withFunction = function(loggerType, options){
    let loggerLine = '';
    loggerLine += loggerType.input;
    const consoleStrArr = [];
    const hasSignCommand = loggerNoteJudge.hasSignCommand(loggerType.logger, options);

    for (let i = 0; i < loggerType.var.length; i++) {
        if (hasSignCommand) {
            consoleStrArr.push(`'${loggerType.var[i]}: '`);
        }
        consoleStrArr.push(`${loggerType.var[i]}`);
    }

    if (loggerType.var.length > 0) {
        loggerLine += `\n${loggerNoteJudge.generateNote(loggerType.logger, options, consoleStrArr)}`;
    }

    // check -count
    const logger = loggerType.logger.substring(`// {${options.hook}}`.length, loggerType.logger.length).trim();
    const loggerCommands = logger.split(/\s+/);
    if (loggerCommands.indexOf(loggerNoteJudge.countCommand) > -1) {
    // has -count
        loggerLine += `\nconsole.count('${loggerType.functionName}')`;
    }

    return loggerLine;
};

loggerNoteJudge.withFunctionCall = function(loggerType, options){
    let loggerLine = '';

    // check -time -profile -from
    const logger = loggerType.logger.substring(`// {${options.hook}}`.length, loggerType.logger.length).trim();
    const loggerCommands = logger.split(/\s+/);
    let hasTimeCommand = false;
    let hasProfileCommand = false;
    let hasFromCommand = false;

    if (loggerCommands.indexOf(loggerNoteJudge.timeCommand) > -1) {
        hasTimeCommand = true;
    }

    if (loggerCommands.indexOf(loggerNoteJudge.profileCommand) > -1) {
        hasProfileCommand = true;
    }

    if (loggerCommands.indexOf(loggerNoteJudge.fromCommand) > -1) {
        hasFromCommand = true;
    }

    if (hasProfileCommand) {
        loggerLine += `console.profile('${loggerType.functionName}')`;
    }

    if (hasTimeCommand) {
        loggerLine += `\nconsole.time('${loggerType.functionName}')`;
    }

    // check -from
    let consoleStrArr = [];
    if (hasFromCommand) {
        const hasSignCommand = loggerNoteJudge.hasSignCommand(loggerType.logger, options);

        for (let i = 0; i < loggerType.var.length; i++) {
            if (hasSignCommand) {
                consoleStrArr.push(`'${loggerType.var[i]}: '`);
            }
            consoleStrArr.push(`${loggerType.var[i]}`);
        }

        if (loggerType.var.length > 0) {
            loggerLine += `\n${loggerNoteJudge.generateNote(loggerType.logger, options, consoleStrArr)}`;
        }
    }
    // check -form end

    const resultName = `result_${Math.floor(Math.random() * 100000000)}`;
    loggerLine += `\nconst ${resultName} = ${loggerType.input}`;

    if (hasTimeCommand) {
        loggerLine += `\nconsole.timeEnd('${loggerType.functionName}')`;
    }

    if (hasProfileCommand) {
        loggerLine += `\nconsole.profileEnd('${loggerType.functionName}')`;
    }

    consoleStrArr = [];
    if (loggerNoteJudge.hasSignCommand(loggerType.logger, options)) {
        consoleStrArr.push('\'result: \'');
    }
    consoleStrArr.push(resultName);
    loggerLine += `\n${loggerNoteJudge.generateNote(loggerType.logger, options, consoleStrArr)}`;
    return loggerLine;
};

loggerNoteJudge.withFunctionCallback = function(loggerType, options){
    let loggerLine = '';
    loggerLine += loggerType.input;
    const consoleStrArr = [];
    const hasSignCommand = loggerNoteJudge.hasSignCommand(loggerType.logger, options);

    for (let i = 0; i < loggerType.var.length; i++) {
        if (hasSignCommand) {
            consoleStrArr.push(`'${loggerType.var[i]}: '`);
        }
        consoleStrArr.push(`${loggerType.var[i]}`);
    }

    if (loggerType.var.length > 0) {
        loggerLine += `\n${loggerNoteJudge.generateNote(loggerType.logger, options, consoleStrArr)}`;
    }

    return loggerLine;
};

module.exports = loggerNoteJudge;
