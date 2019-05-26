

function integ(num) {
    if (num != null)
        return Math.round(num);
    else
        return null;
}

function abs(num) {
    return Math.abs(num);
}

function sign(num) {
    if (num < 0) return -1;
    else return 1;
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}