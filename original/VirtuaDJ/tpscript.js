//topscript.js
//author: indra sarkar (msc46ixs)


//this toggles which orient.interp
//will be driven.
function touchTime (value, time)
{                          
    if (clockwise)
    {
       clockOut = (value, time);
    }
    else
    {
        anticlockOut = (value,time);

    }

    clockwise = !clockwise;
}                                   
