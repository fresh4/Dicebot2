exports.toms = function(time, scale){
    switch(scale){
        case("seconds"):
        case("second"): return time*1000;

        case("minutes"):
        case("minute"): return time*60000;

        case("hours"):
        case("hour"): return time*3600000;

        case("days"):
        case("day"): return time*86400000;

        case("weeks"):
        case("week"): return time*6.048e8;
        
        case("months"):
        case("month"): return time*2.628e9;
    }
}