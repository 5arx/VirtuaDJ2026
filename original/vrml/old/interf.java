/**
 *interf.java.
 *This class represents the User Interface
 *of the V-Robot application.
 *@author Indra Sarkar (msc46ixs)
**/

import java.awt.*;
import java.awt.event.*;
import java.applet.*;
import java.awt.*;
import javax.swing.JTabbedPane;
import javax.swing.*;
import javax.swing.event.*;
/*
import vrml.*;
import vrml.external.field.*;
import vrml.external.Node;
import vrml.external.Browser;
import vrml.external.exception.*;
 */

public class interf extends JApplet implements ActionListener, ChangeListener
{
   /*declare UI components*/
   JButton resetButton, 
               leftButton, 
               rightButton;
               
   JPanel buttonPanel, 
             sliderPanel,
             controlInterface;
             
   JSlider slider1, 
              slider2, 
              slider3, 
              slider4;

   JTextField textf1,
                   textf2,
                   textf3,
                   textf4;              

   editor editor;

   JSlider[] sliderArray;
   
   /**
   *This method is called when the applet is
   *initialised. It calls createJavaInterface().
   */
   public void init() 
   {
      createJavaInterface();
   }
   
   
   /** constructs the Java interface */
   void createJavaInterface()
   {
      //CONTROL INTERFACE
     
     editor = new editor();
     
     /*old code used with the framedEditor
     editor.show();
     */
      
      /*Containers for the sliders and the buttons*/
      sliderPanel = new JPanel ();
      buttonPanel = new JPanel();
      controlInterface = new JPanel();
      
      /*layout managers */
      GridLayout bplayout = new GridLayout (1,4,10,10 );
      GridLayout splayout = new GridLayout (2,4,10, 10);
      BorderLayout borderlay = new BorderLayout();
      BorderLayout contlay = new BorderLayout();
      
      /*set the containers' layouts */
      sliderPanel.setLayout(splayout);
      buttonPanel.setLayout(bplayout);
      controlInterface.setLayout(contlay);      
      this.getContentPane().setLayout(borderlay);
          
      /* create buttons, sliders and textfields */
      resetButton=  new JButton(" R e s e t ");
      leftButton =   new JButton(" Left  ");
      rightButton =  new JButton(" Right ");

      slider1 = new JSlider();
      slider2 = new JSlider();
      slider3 = new JSlider();
      slider4 = new JSlider();
      
      textf1 = new JTextField (3);
      textf2 = new JTextField(3);
      textf3 = new JTextField(3);
      textf4 = new JTextField(3);
      
      /* add eventListeners to buttons/sliders/textfields */
      resetButton.addActionListener(this);
      leftButton.addActionListener(this);
      rightButton.addActionListener(this);

      slider1.addChangeListener(this);
      slider2.addChangeListener(this);
      slider3.addChangeListener(this); 
      slider4.addChangeListener(this);
      
      textf1.addActionListener(this);
      textf2.addActionListener(this);
      textf3.addActionListener(this);
      textf4.addActionListener(this);
      
      /*add the sliders to array*/
      sliderArray = new JSlider[4];
      sliderArray[0] = slider1;
      sliderArray[1] = slider2;
      sliderArray[2] = slider3;
      sliderArray[3] = slider4;
      
      /*add the buttons to the buttonPanel*/
      buttonPanel.add(resetButton);
      buttonPanel.add(leftButton);
      buttonPanel.add(rightButton);
      
      /*add the buttonPanel to the applet*/
      controlInterface.add(buttonPanel, "North");
      
      /*add the sliders and textfields to the sliderPanel*/
      sliderPanel.add(slider1);
      sliderPanel.add(textf1);
      sliderPanel.add(slider2);
      sliderPanel.add(textf2);
      sliderPanel.add(slider3);
      sliderPanel.add(textf3);
      sliderPanel.add(slider4);
      sliderPanel.add(textf4);

//      JLabel label = new JLabel ("This is the label", 1);

      /*add the sliderPanel to the applet*/
      controlInterface.add(sliderPanel, "South");  
//      controlInterface.add(label, "Center");
      
            
      JTabbedPane tabbedPane = new JTabbedPane();      
      tabbedPane.add(controlInterface, "Control Interface");
      tabbedPane.add(editor, "Editor");
      this.getContentPane().add (tabbedPane);
   }

   /*event handling for the buttons and textfields.*/
   public void actionPerformed(ActionEvent event) 
   {
      Object source = event.getSource();

      /*resets all the sliders to 50%*/
      if(source == resetButton)
      {  
         for (int i = 0; i <=sliderArray.length -1; i++)
         {
            JSlider jsl = sliderArray[i];
            (jsl.getModel()).setValue( (jsl.getMaximum()/2)  );
         }
      }

      if(source == leftButton)
      {
         System.out.println("Left button Pressed ");
      }

      if(source == rightButton)
      {
         System.out.println("Right button pressed ");
      }

      if (source == textf1)
      {
         System.out.println("Textfield 1: " + event.getActionCommand());
         (slider1.getModel()).setValue(Integer.parseInt(event.getActionCommand()));
      }

      if (source == textf2)
      {
         System.out.println("Textfield 2: " + event.getActionCommand());
         (slider2.getModel()).setValue(Integer.parseInt(event.getActionCommand()));
      }

      if (source == textf3)
      {
         System.out.println("Textfield 3: " + event.getActionCommand());
         (slider3.getModel()).setValue(Integer.parseInt(event.getActionCommand()));
      }

      if (source == textf4)
      {
         System.out.println("Textfield 4: " + event.getActionCommand());
         (slider4.getModel()).setValue(Integer.parseInt(event.getActionCommand()));
      }

   }
      
   /*event handling for sliders*/
   public void stateChanged (ChangeEvent chevt)
   {
      Object source = chevt.getSource();
            
      /* slider event handling.*/
      if (source == slider1)
      {
         textf1.setText( (""+ ((JSlider)source).getValue() )  );
      }
         
      if (source == slider2)
      {
         textf2.setText( (""+ ((JSlider)source).getValue() )  );
      }                        
            
      if (source == slider3)
      {
         textf3.setText( (""+ ((JSlider)source).getValue() )  );
      }

      if (source == slider4)
      {
         textf4.setText( (""+ ((JSlider)source).getValue() )  );
      }            
   }
      
}
