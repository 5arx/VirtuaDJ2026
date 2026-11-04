//switchbox.js
//this toggles the state of
//the popuplight and switch sensors
//author: Indra sarkar (msc46ixs)

function initialize() 
{
    //Initialize to on state
    enabled = true;
    setSwitchSensor = enabled;   
}

//This toggles its own enabled
//and toggles both Sensor's enableds
function touchTime( value, time ) {
    enabled = !enabled;
    setSwitchSensor= enabled;
    setLightSensor = !enabled;      
}