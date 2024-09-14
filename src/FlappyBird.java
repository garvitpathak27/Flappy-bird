import java.awt.*;
import java.awt.event.*;
import java.awt.geom.AffineTransform;
import java.util.ArrayList;
import java.util.Random;
import javax.swing.*;

public class FlappyBird extends JPanel implements ActionListener, KeyListener {
    int boardWidth = 360;
    int boardHeight = 640;

    // Images
    Image backgroundImage;
    Image birdImage;
    Image topPipe;
    Image bottomPipe;

    // Bird
    int birdX = boardWidth / 5;
    int birdY = boardHeight / 2;  // Centering the bird vertically
    int birdWidth = 50;
    int birdHeight = 50;
    int birdVelocity = 0;  // Velocity of the bird
    final int GRAVITY = 1;  // Gravity effect on the bird
    final int JUMP_STRENGTH = -15;  // Jump strength

    // Background position
    int bgX = 0;
    int bgSpeed = 1;  // Speed of background movement

    // Pipes
    int pipeWidth = 100;
    int pipeHeight = 512;
    int pipeSpacing = 150; // Space between top and bottom pipes
    int pipeSpeed = -4; // Speed of pipes moving left
    ArrayList<Pipe> pipes;
    Timer gameLoop;
    Timer pipeTimer;
    boolean gameOver = false;
    double score = 0;

    class Bird {
        int x = birdX;
        int y = birdY;
        int width = birdWidth;
        int height = birdHeight;
        Image img;

        Bird(Image img) {
            this.img = img;
        }
    }

    class Pipe {
        int x;
        int y;
        int width = pipeWidth;
        int height = pipeHeight;
        Image img;
        boolean passed = false;

        Pipe(Image img, int x, int y) {
            this.img = img;
            this.x = x;
            this.y = y;
        }
    }

    Bird bird;
    Random random = new Random();

    FlappyBird() {
        setPreferredSize(new Dimension(boardWidth, boardHeight));
        backgroundImage = new ImageIcon(getClass().getResource("/background.png")).getImage();
        birdImage = new ImageIcon(getClass().getResource("/flappybirdc.png")).getImage();
        topPipe = new ImageIcon(getClass().getResource("/top.png")).getImage();
        bottomPipe = new ImageIcon(getClass().getResource("/bottom.png")).getImage();

        bird = new Bird(birdImage);
        pipes = new ArrayList<>();

        // Timer to place pipes
        pipeTimer = new Timer(1500, e -> placePipes());
        pipeTimer.start();

        // Game loop timer
        gameLoop = new Timer(1000 / 60, this); // 60 FPS
        gameLoop.start();

        // Add key listener
        addKeyListener(this);
        setFocusable(true);
    }

    private void placePipes() {
        if (gameOver) return; // Avoid placing pipes when game is over

        int openingY = random.nextInt(boardHeight - pipeSpacing - 100) + 50; // Ensure valid range
        pipes.add(new Pipe(topPipe, boardWidth, openingY - pipeHeight));
        pipes.add(new Pipe(bottomPipe, boardWidth, openingY + pipeSpacing));
    }

    @Override
    public void paintComponent(Graphics g) {
        super.paintComponent(g);
        draw(g);
    }

    private void draw(Graphics g) {
        Graphics2D g2d = (Graphics2D) g;

        // Draw background image twice to ensure continuous scrolling
        int panelWidth = getWidth();
        int panelHeight = getHeight();
        int imgWidth = backgroundImage.getWidth(null);
        int imgHeight = backgroundImage.getHeight(null);

        double widthScale = (double) panelWidth / imgWidth;
        double heightScale = (double) panelHeight / imgHeight;

        double scale = Math.max(widthScale, heightScale);

        int newWidth = (int) (imgWidth * scale);
        int newHeight = (int) (imgHeight * scale);

        // Draw the background image in a loop to make scrolling seamless
        g2d.drawImage(backgroundImage, bgX, 0, newWidth, newHeight, this);
        g2d.drawImage(backgroundImage, bgX + newWidth, 0, newWidth, newHeight, this);

        // Draw pipes
        for (Pipe pipe : pipes) {
            g2d.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height, this);
        }

        // Draw bird with rotation
        AffineTransform oldTransform = g2d.getTransform();
        double rotationAngle = getRotationAngle();
        g2d.rotate(rotationAngle, birdX + birdWidth / 2, birdY + birdHeight / 2);
        g2d.drawImage(bird.img, birdX, birdY, birdWidth, birdHeight, this);
        g2d.setTransform(oldTransform);

        // Draw score
        g2d.setColor(Color.WHITE);
        g2d.setFont(new Font("Arial", Font.BOLD, 32)); // Changed to bold for better visibility
        String scoreText = gameOver ? "Game Over: " + (int) score : "Score: " + (int) score;
        FontMetrics fm = g2d.getFontMetrics();
        int textWidth = fm.stringWidth(scoreText);
        g2d.drawString(scoreText, (boardWidth - textWidth) / 2, 35); // Center the score text

        g2d.dispose();
    }

    private double getRotationAngle() {
        // Calculate the rotation angle based on bird's velocity
        return Math.toRadians(Math.min(birdVelocity, 15)); // Limit rotation angle
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (gameOver) return;

        // Update background position
        bgX -= bgSpeed;
        if (bgX <= -getWidth()) {
            bgX = 0;
        }

        // Update bird position
        birdY += birdVelocity;
        birdVelocity += GRAVITY;

        // Prevent the bird from going below the panel
        if (birdY > boardHeight - birdHeight) {
            birdY = boardHeight - birdHeight;
            birdVelocity = 0;
        }

        // Prevent the bird from going above the panel
        if (birdY < 0) {
            birdY = 0;
            birdVelocity = 0;
        }

        // Move pipes
        for (int i = 0; i < pipes.size(); i++) {
            Pipe pipe = pipes.get(i);
            pipe.x += pipeSpeed;

            // Check if pipe is passed
            if (!pipe.passed && birdX > pipe.x + pipe.width) {
                score += 0.5; // Increment score for passing pipes
                pipe.passed = true;
            }

            // Check collision
            if (collision(bird, pipe)) {
                gameOver = true;
                gameLoop.stop(); // Stop the game loop
                pipeTimer.stop(); // Stop pipe placement
            }
        }

        // Remove off-screen pipes
        pipes.removeIf(pipe -> pipe.x + pipe.width < 0);

        // Check if bird falls below the screen
        // if (birdY > boardHeight) {
        //     gameOver = true;
        //     gameLoop.stop(); // Stop the game loop
        //     pipeTimer.stop(); // Stop pipe placement
        // }

        repaint();
    }

    private boolean collision(Bird bird, Pipe pipe) {
        // Check horizontal overlap
        boolean horizontalOverlap = bird.x < pipe.x + pipe.width &&
                                    bird.x + bird.width > pipe.x;
    
        // Check vertical overlap
        boolean verticalOverlap = (bird.y < pipe.y + pipe.height && pipe.y + pipe.height <= bird.y + bird.height) ||
                                  (bird.y + bird.height > pipe.y && bird.y < pipe.y + pipe.height);
    
        return horizontalOverlap && verticalOverlap;
    }

    @Override
    public void keyPressed(KeyEvent e) {
        if (e.getKeyCode() == KeyEvent.VK_SPACE) {
            if (gameOver) {
                // Restart game
                birdY = boardHeight / 2;
                birdVelocity = 0;
                pipes.clear();
                score = 0;
                gameOver = false;
                pipeTimer.start();
                gameLoop.start();
            } else {
                // Make the bird flap (jump)
                birdVelocity = JUMP_STRENGTH;
            }
        }
    }

    @Override
    public void keyReleased(KeyEvent e) {
        // Not used
    }

    @Override
    public void keyTyped(KeyEvent e) {
        // Not used
    }
}
