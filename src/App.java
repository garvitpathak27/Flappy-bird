import javax.swing.*;

public class App {
    public static void main(String[] args) throws Exception {
        int boardWidth = 360;
        int boardHeight = 640;

        JFrame frame = new JFrame("Flappy Bird");
        // frame.setVisible(true);
		frame.setSize(boardWidth, boardHeight);
        frame.setLocationRelativeTo(null);
        frame.setResizable(false);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        FlappyBird flappyBird = new FlappyBird();
        frame.add(flappyBird);
        frame.pack();
        flappyBird.requestFocus();
        frame.setVisible(true);
    }
}


// /*
//  thing that need improovement 
//  * pipe placement is wrong and bird doesnt hit the pipe and then also games get over 
//  * score keeper is uglu 
//  * sound is missing 
//  * game is very jittery need to fix it 
//  * no abrupt stopping when the bird hit 
//  * when bird goes down it just sits at the bottom 
//  * 
//  * 
//  external things that are need to be dont 
//  * menu page for players to play 
//  * highscore keeper 
//  * bird color changer 
//  * pillar color changer 
//  * settings page for sound 
//  * proper exit button 
//  * etc
 
//  */