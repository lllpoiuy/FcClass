// const nodeExcel = require('excel-export')
const xlsx = require('node-xlsx');
Object.prototype.assign = require('object-assign');
const fs = require('fs');

function writeXls(datas) {
    // console.log(datas);
    // const options = {'!cols': [{ wch: 6 }, { wch: 7 }, { wch: 10 }, { wch: 20 } ]};

    let buffer = xlsx.build([{
        name :'sheet1',
        data : datas
    }]);
    fs.writeFileSync('./static/list.xlsx', buffer, {'flag' : 'w'});
}

exports.export = (rows)=>{
    let data = [];
    let title = ['id','name','learning','contribution','performance','n_learning','n_contribution','score','grade']; 
    data.push(title)
    rows.forEach((element) => {
        // console.log(element);
        let arrInner = []
        arrInner.push(element.id)
        arrInner.push(element.rname)
        arrInner.push(element.learning)
        arrInner.push(element.contribution)
        arrInner.push(element.performance)
        arrInner.push(element.n_learning)
        arrInner.push(element.n_contribution)
        arrInner.push(element.score)
        arrInner.push('优秀')
        data.push(arrInner)
    });
    writeXls(data)
}
