

        //toggles enabled
        function enabTime (value, time)
        {
            enabled = !enabled;
        } 
        
        /* ...isOver functions are
           called when the pointer
           is over components   */
            function powerisOver (value)
            {
                if (value && enabled)
                {
                    display = 1;
                }
                else display = -1;
            }
    
            function StartisOver (value)
            {
                if (value && enabled)
                {
                    display = 2;
                }
                else display = -1;
            }

            function popLiteisOver (value )
            {
                if (value && enabled)
                {
                    display = 3;
                }
                else display = -1;
            }

            function popswitchisOver (value)
            {
                if (value && enabled)
                {
                    display = 4;
                }
                else display = -1;    
            }

            function tonearmisOver (value)
            {
                  if (value && enabled )
                {
                    display = 5;
                }
                else display = -1;    
            }

            function headshellisOver (value)
            { 
                //print ('headshell is over' + value);
                if (value && enabled)
                display = 6;

                else display -1;
            }

            function leverisOver (value)
            {
                    if (value && enabled)
                {
                    display = 7;
                }
                else display = -1;    
            }

            function sliderisOver (value)
            {                   
                if (value && enabled)
                    display = 8;
                
                else display = -1;
            }


            function platterisOver (value)
            {
                    if (value && enabled)
                {
                    display = 9;
                }
                else display = -1;    
            }

            function lite33isOver (value)
            {
                if (value && enabled )
                {
                    display = 10; 
                }
                else display = -1;
            }

            function lite45isOver (value)
            {
                    if (value && enabled )
                {
                    display = 11;
                }
                else display = -1;    
            }

            function redLiteisOver (value)
            {
                if (value && enabled )
                {
                    display = 12;
                }
                else display = -1;
            }
            function toolisOver (value)
            {
                if (value && enabled)
                {
                    display = 13;
                }
                else display = -1;
            }
         

