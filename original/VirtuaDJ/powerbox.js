//powerbox.js
//author: indra sarkar

//this simulates electricity and 
//generates sound
//also keeps track of the state
//of the tonearm/lever and the 
//pitch slider and alters the pitch
//of the audio clip.

//author: Indra Sarkar (msc46ixs)

function initialize() 
                {
                    //Initialize to off state
                    powerOn = false;
                    set33Sensor = false;
                    set45Sensor = false;
					setSStopSensor = false;
                    rotTimerenabler = false;
                    turning = false;
                    audioToggle = 0;
                    sethorizsensor = false;  
                }
                
                //sets the pitch of the record
                //in response to speedslider
                function translation_changed (value)
                {
                    x = SpeedSlider.translation; 
                    p = x[1];
                   
                    if (p<-32)
                    {
                        //process reductions
                        setPitch = current - (current*(8/100));
                        return;
                    }

                    if (p >32)
                    {   //process increase
                            setPitch = current + (current*(8/100));
                            return; 
                    }
                      

                    else if (8>p>-8)
                    {
                        setPitch = 1;
                        return;
                    }                                  
                }
                
                //executed when arm lever is activated.
                function levertouchTime (value, time)
                {
                      a = ToneArm.rotation;
                      b = ToneArmVertical.rotation;
                      angle = a[3];

                      //check to ensure arm is down and 
                      //over the record surface.  
                      if (isUp)
                        {  
                            downtouchTime = (value, time);
                            sethorizsensor = false;
                            if ( (turning) && (angle < -.5) && (b[3] != 0.1)  )
                            {   
                                audioToggle = -1;
                                 
                            }
			             }
                 
                      else
                      {
                        audioToggle = 0;
                        uptouchTime = (value, time) ;
                        sethorizsensor = true;
                      }

                      isUp = !isUp;
                }
                 
                //executed by clicking startStop
                function SStouchtime (value, time)
                {   //stop or start the rotation                          
                    turning = !turning;
                    rotTimerenabler = turning;  
                    
                    if (!turning)
                    {   
                        c = ToneArm.rotation;
                        d = ToneArmVertical.rotation;
                        
                        audioToggle = 0    
                    }

                    if (turning)
                    {
                        c = ToneArm.rotation;
                        d = ToneArmVertical.rotation;
                        
                        //make sure arm is down and over the
                        //record.
                        if( (c[3] < -0.5) && ( d[3] < 0) )
                        {                                            
                          audioToggle = -1;
                        }
                    }
                }

                //executed by clicking either
                //speed button
                function stateChange (value, time)
                {
                    thirtythreeenabled = !thirtythreeenabled;
                    
                    set33Sensor = thirtythreeenabled;
                    set45Sensor = !thirtythreeenabled;
                    
                    if (thirtythreeenabled)
                        { //turn 33light off/ 45 on. reset pitch.
                         set45colour = lightOn;
                         set33colour = lightOff;
                         current = (45/33.3333);
                         setPitch = current;
                        }

                    else 
                    {
                        set45colour = lightOff;
                        set33colour = lightOn;
                        current = 1;
                        setPitch = current;
                    }
                }
        
                //This toggles powerOn
                //and toggles both Sensor's enableds
                function touchTime( value, time )
                {   
					setSStopSensor = !setSStopSensor;
                    powerOn = !powerOn;                                 
                     
                    if (!powerOn)
                    {
                        //print ('powerBoxtouchTime');
                        set33Sensor = false;
                        set45Sensor = false;
                        set33colour = lightOff;
                        set45colour = lightOff;
                        rotTimerenabler = false;
                        turning = false;   
                        setRedpanel = lightOff;
                        audioToggle = 0;    
                    }

                    if (powerOn)
                    {   
                        thirtythreeenabled = false;
                        set33Sensor = false;
                        set33colour = lightOn;
                        set45Sensor = true;
                        setRedpanel = lightOn;
                    }                 
                }