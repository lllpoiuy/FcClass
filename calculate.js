
calcLearning = function(vl, rk, hold) {
    var s1 = hold * 0.5;
    var s2 = 15.0 / (1 + Math.pow(2.718281828, -rk / 10.0));
    return s1 + s2;
}

calc = function(table, by) {
    table = table.sort((a, b)=> {
        return b.learning - a.learing;
    })
    var rk = 1;
    for (var i = 0; i < table.length; i++) {
        if (i > 0 && table[i].learing > table[i - 1].learing) rk = i;
        table[i].n_learning = calcLearning(table[i].vl, rk, table[i].performance);
    } 
    for (var i = 0; i < table.length; i++) {
        table[i].n_contribution = Math.min(40, table[i].contribution + table[i].performance * 0.3);
    }
    for (var i = 0; i < table.length; i++) {
        table[i].score = table[i].n_learning + table[i].n_contribution + table[i].performance;
    }
    switch (by) {
        case "score" :
            table = table.sort((a, b)=> {
                if (b.score != a.score)
                    return b.score - a.score;
                    else return a.id - b.id;
            })
            break;
        case "learning" :
            table = table.sort((a, b)=> {
                if (b.learing != a.learing)
                    return b.learing - a.learing;
                    else return a.id - b.id;
            })
            break;
        case "contribution" :
            table = table.sort((a, b)=> {
                if (b.contribution != a.contribution)
                    return b.contribution - a.contribution;
                    else return a.id - b.id;
            })
            break;
        case "performance" :
            table = table.sort((a, b)=> {
                if (b.performance != a.performance)
                    return b.performance - a.performance;
                    else return a.id - b.id;
            })
            break;
        default :
            table = table.sort((a, b)=> {
                return a.id - b.id;
            })
    }
    return table;
}

exports.calc = calc;