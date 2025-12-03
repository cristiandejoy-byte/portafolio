import pygame

from clases.Botones import Botones
from clases.Baraja2 import Baraja
from clases.Jugador2 import Jugador, Banca
from clases.Boton import Boton

# Configuración de Pygame
pygame.init()
screen = pygame.display.set_mode((1300, 700))
pygame.display.set_caption("Black Jack")
clock = pygame.time.Clock()

# Inicializar la baraja, el jugador y la banca
baraja = Baraja()
jugador1 = Jugador("Jugador", True)
jugador2 = Jugador("Jugador", False)
Crupier = Jugador("Crupier", True)

# Repartir las primeras cartas
jugador1.recibir_carta(baraja.repartir_carta())
jugador1.recibir_carta(baraja.repartir_carta())
jugador2.recibir_carta(baraja.repartir_carta())
jugador2.recibir_carta(baraja.repartir_carta())
Crupier.recibir_carta(baraja.repartir_carta())
Crupier.recibir_carta(baraja.repartir_carta())

# Botones
Boton_Start = Botones("Imagenes/BotonInicio.png", 650, 350)
Boton_Pedir = Botones("Imagenes/Pedir.png", 300, 600)
Boton_Plantarse = Botones("Imagenes/Plantarse.png", 600, 600)

# Textos
TextoJugador1 = Botones("Imagenes/BotonInicio.png", 300, 400)
TextoJugador2 = Botones("Imagenes/BotonInicio.png", 1000, 400)
##TextoCrupier = Botones("Imagenes/BotonInicio.png", 650, 50)

Texto2Jugador1 = Botones("Imagenes/BotonInicio.png", 650, 350)
Texto2Jugador2 = Botones("Imagenes/BotonInicio.png", 650, 350)
Empate = Botones("Imagenes/BotonInicio.png", 650, 350)

def CambiarTurnos():
    if jugador1.turno == True:
        pygame.display.set_caption("Es turno del jugador 1")
    elif jugador2.turno == True:
        pygame.display.set_caption("Es turno del jugador 2")

def TurnoIndividual():
    if jugador1.turno == True:
        jugador1.recibir_carta(baraja.repartir_carta())
        if jugador1.esta_en_bancarrota():
            jugador1.turnoFinalizado()  # Pierde si se pasa de 21
            Texto2Jugador1.mostrar()
    elif jugador2.turno == True:
        jugador2.recibir_carta(baraja.repartir_carta())
        if jugador2.esta_en_bancarrota():
            jugador2.turnoFinalizado()  # Pierde si se pasa de 21
            Texto2Jugador2.mostrar()

running = True

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

        if Boton_Start.visible == True:
            Boton_Pedir.ocultar()
            Boton_Plantarse.ocultar()

        if event.type == pygame.MOUSEBUTTONDOWN:
            if Boton_Start.esPrecionado():
                Boton_Start.ocultar()
                TextoJugador1.mostrar()
                TextoJugador2.mostrar()
                jugador1.mostrar()
                Boton_Pedir.desocultar()
                Boton_Plantarse.desocultar()
                jugador2.mostrar()
                CambiarTurnos();
            elif Boton_Pedir.esPrecionado():
                TurnoIndividual()
            elif Boton_Plantarse.esPrecionado():
                if jugador1.turno:
                    jugador1.turno = False
                    jugador2.turno = True
                    CambiarTurnos();
                    if Boton_Pedir.esPrecionado():
                        TurnoIndividual()
                elif jugador2.turno:
                    if Boton_Plantarse.esPrecionado():
                        if jugador1.puntos == jugador2.puntos:
                            Empate.mostrar()
                        elif jugador1.puntos > jugador2.puntos:
                            Texto2Jugador2.mostrar()
                        elif jugador2.puntos > jugador1.puntos:
                            Texto2Jugador1.mostrar()

                


    screen.fill((57, 157, 131))


    jugador1.dibujar(screen, 200)
    jugador2.dibujar(screen, 900)
    ##Crupier.dibujar2(screen, 450, 200)

    TextoJugador1.escribir_texto(screen, "Player 1", "Black")
    TextoJugador2.escribir_texto(screen, "Player 2", "Black")
    ##TextoCrupier.escribir_texto(screen, "Crupier", "Black")

    Boton_Start.dibujar(screen)
    Boton_Pedir.escalarBoton(screen, 650, 450)
    Boton_Plantarse.escalarBoton(screen, 650, 550)

    Texto2Jugador1.texto_derrota(screen, "El jugador 2 gana", "Black")
    Texto2Jugador2.texto_derrota(screen, "El jugador 1 gana", "Black")
    Empate.texto_derrota(screen, "Empate", "Black")

  
    pygame.display.flip()
    clock.tick(60)

pygame.quit()


   

