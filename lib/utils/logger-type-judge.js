const loggerTypes = require('../constant/logger-types');

const assignmentTag = ['let', 'const', 'var'];

module.exports = (logger, input, index) => {
    // whether it is an assignment line
    input = input.substring(0, index).trim();
    const result = {
        logger,
        input,
        var: '',
        type: '',
        functionName: ''
    };

    // Assignment statement
    let assignmentVar = '';
    assignmentTag.forEach(tag => {
        if (input.indexOf(tag) > -1 && input.indexOf('=') > -1) {
            assignmentVar = input.substring(
                input.indexOf(tag) + tag.length,
                input.indexOf('=')
            ).trim();
        }
    });

    if (assignmentVar) {
        result.type = loggerTypes.ASSIGNMENT;
        result.var = assignmentVar;
        return result;
    }

    // judge like this: a = 123
    if (input.indexOf('=') > -1 && input.indexOf('=>') === -1) {
        const splitArrayWithEqualSign = input.split('=');
        // result: "a = 1" => ["a","1"]
        if (splitArrayWithEqualSign.length === 2) {
            result.type = loggerTypes.ASSIGNMENT;
            result.var = splitArrayWithEqualSign[0].trim();
            return result;
        }
    }

    // Function declaration: function test (p1, p2, p3) { // {#}
    // avoid: let a = 'test(p1, p2) { //{#}'
    const isFuncReg = /^(function)?\s*[a-zA-Z0-9_$]+\s*\(.*\)\s*{$/;
    if (isFuncReg.test(input)) {
        let startIndex = 0;
        if (input.indexOf('function') > -1) {
            startIndex = 'function'.length + 1;
        }
        const endIndex = input.indexOf('(');
        const functionName = input.substring(startIndex, endIndex).trim();

        let paramsString = input.match(/\(.+\)/);
        if (paramsString) {
            paramsString = paramsString[0];
            paramsString = paramsString.substring(1, paramsString.length - 1);
            if (paramsString.trim()) {
                result.type = loggerTypes.FUNCTION;
                result.var = paramsString.split(',');
                result.functionName = functionName;
                return result;
            }
        } else {
            result.type = loggerTypes.FUNCTION;
            result.var = [];
            result.functionName = functionName;
            return result;
        }
    }

    // Function call: this.test() // {#}
    const isFuncCallReg = /^[.a-zA-Z0-9_$]+\(.*\);?$/;
    if (isFuncCallReg.test(input) || input.indexOf('await') === 0) {
        let startIndex = 0;
        if (input.indexOf('.') > -1) {
            startIndex = input.indexOf('.') + 1;
        }
        let endIndex = input.indexOf('(');

        if (input.indexOf('await') === 0) {
            startIndex = 'await'.length + 1;
            const awaitFuncEnd = input.indexOf('(');
            endIndex = awaitFuncEnd === -1 ? -1 : awaitFuncEnd;
        }
        
        let functionName;
        if (endIndex === -1) {
            functionName = 'await statement';
        } else {
            functionName = input.substring(startIndex, endIndex).trim();
        }

        startIndex = input.lastIndexOf('(') + 1;
        endIndex = input.lastIndexOf(')');
        const paramsString = input.substring(startIndex, endIndex).trim();
        if (paramsString) {
            result.var = paramsString.split(',');
        } else {
            result.var = [];
        }

        result.type = loggerTypes.FUNCTION_CALL;
        result.functionName = functionName;
        return result;
    }

    // Function callback: this.test(() => { // {#}
    let isFuncCallbackReg = /^[.a-zA-Z0-9_$]+\(.*(function)?\(.*\)\s*(=>)?\s*{$/;
    if (isFuncCallbackReg.test(input)) {
        let startIndex = 0;
        if (input.indexOf('.') > -1) {
            startIndex = input.indexOf('.') + 1;
        }
        let endIndex = input.indexOf('(');
        const functionName = input.substring(startIndex, endIndex).trim();

        startIndex = input.lastIndexOf('(');
        endIndex = input.lastIndexOf(')');
        const paramsString = input.substring(startIndex + 1, endIndex).trim();
        
        result.type = loggerTypes.FUNCTION_CALLBACK;
        result.functionName = functionName;
        if (paramsString) {
            result.var = paramsString.split(',');
        } else {
            result.var = [];
        }
        return result;
    }
    // Function callback: this.test(response => { // {#}
    isFuncCallbackReg = /\.([a-zA-Z0-9_$]+)\s*\(([a-zA-Z0-9_$]+)\s*=>\s*{$/;
    const groups = isFuncCallbackReg.exec(input);
    if (groups) {
        result.type = loggerTypes.FUNCTION_CALLBACK;
        result.functionName = groups[1];
        result.var = [groups[2]];
        return result;
    }
    return null;
};
