import java.awt.*;
import java.awt.event.*;
import javax.swing.*;

public class editor extends JPanel implements ActionListener
{
   JButton clear,
               run,
               save,
               load;
               
   JPanel buttonPanel,
             textAreaPanel;
   
   JTextArea textArea;
   JScrollPane scrollPane;
   /**
   *Constructor method. Sets up the editor UI.
   **/
   public editor()
   {
      super ();   
      setUpUI();
   }
   
   /**
   *Called when UI components are activated.
   *@param ActionEvent evt.
   **/
   public void actionPerformed (ActionEvent evt)
   {
      Object source = evt.getSource();
      
      if (source == clear)
      {
         System.out.println("C L E A R ");
      }

      if (source == run)
      {
         System.out.println("R U N ");
      }
 
      if (source == save)
      {
         System.out.println("S A V E");   
      }

      if (source == load)
      {
         System.out.println("L O A D ");
      }
   }
   
   
   /**Sets up the UI. Called by the constructor.**/
   void setUpUI ()
   {
      setSize(350,400);
      setLocation (500, 200);
      
      /*create buttons*/      
      clear = new JButton("Clear");
      run = new JButton("Run");
      save = new JButton("Save");
      load = new JButton("Load");
      
      /*add actionlisteners to buttons*/
      clear.addActionListener(this);
      run.addActionListener(this);
      save.addActionListener(this);
      load.addActionListener(this);

      /*create and configure textarea*/
      textArea = new JTextArea("V-Robot Editor (c) Indra Sarkar 2000:\n", 10, 30);
      textArea.setLineWrap(true);
      textArea.setFont (new Font("Monospaced", 1, 10) );
      
        
      /*layout managers*/
      GridLayout grlay = new GridLayout (1,4,10,10); 
      BorderLayout borlay = new BorderLayout();
      
      setLayout(borlay);
      
      buttonPanel = new JPanel();
      buttonPanel.setLayout(grlay);
      
      /*add the buttons to the  buttonPanel*/
      buttonPanel.add(clear);
      buttonPanel.add(run);
      buttonPanel.add (save);
      buttonPanel.add(load);
      
      scrollPane = new JScrollPane (textArea);
      
      add(scrollPane, "Center");
      add(buttonPanel, "South");
   }
   
   

}