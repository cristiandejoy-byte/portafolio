import random
from clases.Cartas2 import Cartas

class Baraja:
    def __init__(self):
        self.cartas = [
            Cartas(1, "Picas", "Imagenes/As.png"),
            Cartas(2, "Picas", "Imagenes/2.png"),
            Cartas(3, "Picas", "Imagenes/3.png"),
            Cartas(4, "Picas", "Imagenes/4.png"),
            Cartas(5, "Picas", "Imagenes/5.png"),
            Cartas(6, "Picas", "Imagenes/6.png"),
            Cartas(7, "Picas", "Imagenes/7.png"),
            Cartas(8, "Picas", "Imagenes/8.png"),
            Cartas(9, "Picas", "Imagenes/9.png"),
            Cartas(10, "Picas", "Imagenes/10.png"),
            Cartas(10, "Picas", "Imagenes/J.png"),
            Cartas(10, "Picas", "Imagenes/Q.png"),
            Cartas(10, "Picas", "Imagenes/K.png")
        ]
        random.shuffle(self.cartas)
        self.visible = False

    def repartir_carta(self):
        return self.cartas.pop()
    def mostrar (self):
        self.visible = True
