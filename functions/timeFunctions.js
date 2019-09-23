exports.toms = function(time, scale){
    switch(scale){
        case("seconds"):
        case("second"):
            return time*1000;
            break;
        case("minutes"):
        case("minute"):
            return time*60000;
            break;
        case("hours"):
        case("hour"):
            return time*3600000;
            break;
        case("days"):
        case("day"):
            return time*86400000;
            break;
        case("weeks"):
        case("week"):
            return time*6.048e8;
            break;
        case("months"):
        case("month"):
            return time*2.628e9;
            break;    
    }
}