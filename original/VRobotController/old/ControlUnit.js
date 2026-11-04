//ControlUnit.js
//author: Indra Sarkar (msc46ixs)

function initialize() 
   {
      //Initialize script
      angle = 0;
   }
                
function UpBut1touchTime (value)
{
   print("UP1 pressed");
   
   a = ARM1.rotation;
   angle1 = angle1 + 0.17444;
   a[0] = -1;
   a[1] = 0;
   a[2] = 0;
   a[3] = angle1;
   print("a = " + a);

   ARM1.set_rotation = a;
}
                   
function DownBut1touchTime (value)
{
   print ("DOWN1 pressed");   
   
   a = ARM1.rotation;
   angle1 = angle1 - 0.17444;
   a[0] = -1;
   a[1] = 0;
   a[2] = 0;
   a[3] = angle1;
   print ("rotation arm1 = " + a);
   
   ARM1.set_rotation = a;
}
 
 function UpBut2touchTime (value)
{
   print("UP1 pressed");
   
   b = ARM2.rotation;
   angle2 +=  0.17444;
   b[0] = -1;
   b[1] = 0;
   b[2] = 0;
   b[3] = angle2;
   print("rot arm2 = " + b);

   ARM2.set_rotation = b;
}
                   
function DownBut2touchTime (value)
{
   print ("DOWN1 pressed");   
   
   b = ARM2.rotation;
   angle2 -=  0.17444;
   b[0] = -1;
   b[1] = 0;
   b[2] = 0;
   b[3] = angle2;
   print ("rotation arm2 = " + b);
   
   ARM2.set_rotation = b;
}
                           