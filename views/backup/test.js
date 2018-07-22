function calEquation(pStr){
    let str = pStr;
    str = str.replace(/ /g , "");
    let arrayQ = [];
    let tmpStr = "";

    arrayQ = strToArrayEquation(str);

    let result = 0;
    while(arrayQ.length>1){
        let A = -1;
        for(let i = 0 ; i < arrayQ.length ; i++){
            let tmpChar = arrayQ[i];
            if( isNaN(parseInt(arrayQ[i])) ){
                if(A==-1){
                    A = i;
                }else{
                    let charA = arrayQ[A];
                    let syb1 = "+-";
                    let syb2 = "*/";
                    let syb3 = "^";
                    let point1 = (syb1.indexOf(charA) != -1)? 1: (syb2.indexOf(charA) != -1)? 2: (syb3.indexOf(charA) != -1)? 3: 0;
                    let point2 = (syb1.indexOf(tmpChar) != -1)? 1: (syb2.indexOf(tmpChar) != -1)? 2: (syb3.indexOf(tmpChar) != -1)? 3: 0;
                    console.log("a:"+charA+A+",b:"+tmpChar+i);
                    A = (point1 < point2)? i: A;
                }
            }
        }
        let tmpNum = 0;
        let num1 = (isNaN(parseFloat(arrayQ[A-1])))? 0: parseFloat(arrayQ[A-1]);
        let num2 = (isNaN(parseFloat(arrayQ[A+1])))? 0: parseFloat(arrayQ[A+1])
        switch(arrayQ[A]){
            case "+":
                tmpNum = num1 + num2;
                break;
            case "-":
                tmpNum = num1 - num2;
                break;
            case "*":
                tmpNum = num1 * num2;
                break;
            case "/":
                tmpNum = num1 / num2;
                break;
            case "^":
                tmpNum = Math.pow(num1, num2);
                break;
        }
        console.log(num1+arrayQ[A]+num2+"="+tmpNum+", A:"+A);
        let tmpArray = [];
        for(let i = 0 ; i < arrayQ.length ; i++){
            if(i<A-1 || i>A+1){
                tmpArray.push(arrayQ[i]);
            }else if(i==A){
                tmpArray.push(tmpNum);
            }
        }
        console.log("CHECK ARRAY: "+arrayQ.toString()+"&&"+tmpArray.toString());
        arrayQ = tmpArray;
    }
    console.log(arrayQ);
    return arrayQ.toString();
}

function strToArrayEquation(pStr,pValX){
    let str = pStr.replace(/ /g , "");
    if(typeof(pValX)!=="undefined"){
        str = str.replace(/x/g , "("+pValX+")");
    }
    let result = [];
    let tmpStr = "";
    for(let i = 0 ; i < str.length ; i++){
        if(tmpStr==""){
            if(!isNaN(parseInt(str[i])) || str[i]=="."){
                tmpStr = str[i];
            }else{
                //edit for use "()" in future
                if(!(str[i]=="(" || str[i]==")")){
                    tmpStr = str[i];
                }
            }
        }else{
            //check str[i]
            if(!isNaN(parseInt(str[i])) || str[i]=="."){
                //check tmpStr
                if(!isNaN(parseInt(tmpStr)) || tmpStr=="."){
                    tmpStr+=str[i];
                }else{
                    tmpStr = tmpStr[0]+str[i];
                }
            }else{
                //edit in future for use "()"
                if(str[i]=="("){
                    if(!isNaN(parseInt(tmpStr))){
                        result.push(tmpStr);
                        result.push("*");
                        tmpStr="";
                    }else{
                        result.push(tmpStr);
                        tmpStr="";
                    }
                }else if(str[i]==")"){
                    //use in future
                }
                else{
                    result.push(tmpStr);
                    result.push(str[i]);
                    tmpStr="";
                }
            }
        }
        if(tmpStr != "" && i == str.length-1){
            result.push(tmpStr);
            tmpStr = "";
        }
    }
    return result;
}

function rootTable(pEquation, pNumStart, pNumEnd, pNumStep){
    let numStep = Math.abs(pNumStep);
    let arrayResults = [];
    for(let count = pNumStart; count <= pNumEnd ; count = (count+numStep>pNumEnd && count!=pNumEnd)? pNumEnd: count+numStep){
        let equation = pEquation.replace(/x/g , count);
        let result = calEquation(equation);
        console.log("RESULT >> f(x) = F("+count+") = "+result);
        arrayResults.push(result);
    }
    return arrayResults;
}