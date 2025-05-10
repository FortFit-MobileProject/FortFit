//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.


/*Um jogo bem simples consiste em tentar adivinhar um valor inteiro aleatório
escolhido entre 1 e 100 por um computador. O usuário/jogador terá apenas 5
chances para tentar adivinhar o valor. A cada tentativa do jogador, caso ele não
acerte, o programa deve informar se o valor digitado é maior ou menor que o
valor escolhido pelo computador. E caso o valor digitado pelo jogador tenha
diferença em módulo igual a 1 com o valor correto deverá ser impresso “TÁ
QUENTE!” (por exemplo, o computador escolheu 42 e o jogador digitou 41
ou 43). No final, deverá ser impresso “Parabéns, você ganhou o jogo!”, se o
jogador conseguiu acertar o valor escolhido pelo computador, ou “Game
Over!”, caso contrário.

*/


import java.util.Random;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Random rnd = new Random(); // Inicia Aleatório
        int x = rnd.nextInt(101); // Gera um número aleatório (0 – 101)

        Scanner scanner = new Scanner(System.in);
        System.out.println("___tente adivinhar o numero___");
        System.out.print("Você tem apenas 5 chances: ");
        int tentativasMax = 5;

        boolean acertou = false;

        for (int tentativas = 1; tentativas <= tentativasMax; tentativas++) {
            System.out.print("Tentativa " + tentativas + ": \nDigite um número entre 0 e 100: ");
            int numeroUsuario = scanner.nextInt();

            if (numeroUsuario == x) {
                System.out.println("Parabéns, você ganhou o jogo em: " + tentativas + " tentativas.");
                acertou = true;
                break;
            } else if (Math.abs(numeroUsuario - x) == 1) {
                System.out.println("ta quente");
            } else if (numeroUsuario < x) {
                System.out.println("NUMERO MAIOR");
            } else {
                System.out.println("NUMERO MENOR");
            }
        }

        if (!acertou) {
            System.out.println("Game Over!. O número correto era " + x);
        }

        scanner.close();
    }
}